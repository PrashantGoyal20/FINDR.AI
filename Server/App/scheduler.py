import os
from flask import Flask,request,jsonify,make_response
from flask_bcrypt import Bcrypt
from functools import wraps
from flask_jwt_extended import JWTManager, create_access_token,unset_jwt_cookies, jwt_required, get_jwt_identity,decode_token
from App.models import db, User,LostItem,FoundItem,Match
from dotenv import load_dotenv
from flask_cors import CORS
from qdrant_client import QdrantClient
from qdrant_client.http import models
from datetime import datetime, timedelta
from sqlalchemy import select,create_engine
from sqlalchemy.orm import sessionmaker
from qdrant_client.models import PayloadSchemaType


load_dotenv()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")

engine = create_engine(os.getenv("DATABASE_URL"))

SessionLocal = sessionmaker(bind=engine)

session = SessionLocal()

qdrant=QdrantClient(
    url=os.getenv("Qdrant_url"),
    api_key=os.getenv("Qdrant_api_key"),
)
qdrant.create_payload_index(
    collection_name="found_items",
    field_name="status",
    field_schema=PayloadSchemaType.KEYWORD
)

DEFAULT_MIN_AGE_MINUTES = 60
DEFAULT_CONFIDENCE = 0.78
DEFAULT_TOP_K = 5

db.init_app(app)
CORS(app, supports_credentials=True, origins=[os.getenv("CLIENT")])

print('Qdrant connected')
print("Posgres Connected")


def iso_now_minus(minutes):
    return (datetime.utcnow() - timedelta(minutes=minutes)).isoformat()


@app.route("/admin/match-active-lost", methods=["POST"])
def match_active_lost():
    body = request.get_json(silent=True) or {}
    min_age_minutes = int(body.get("min_age_minutes", DEFAULT_MIN_AGE_MINUTES))
    confidence_threshold = float(body.get("confidence_threshold", DEFAULT_CONFIDENCE))
    top_k = int(body.get("top_k", DEFAULT_TOP_K))

    cutoff = iso_now_minus(min_age_minutes)

    stmt = (
    select(LostItem.id, LostItem.user_id, LostItem.created_at)
    .where(
        LostItem.status == "active",
        )
    )
    
    lost_rows = session.execute(stmt).all()
    lost_items = [
    {
        "id": r.id,
        "user_id": r.user_id,
        "created_at": r.created_at
    }

    
    for r in lost_rows
    ]
    if not lost_items:
        return jsonify({"message": "No eligible lost items found", "checked": 0}), 200
    
    created_matches = []
    errors = []

    for lost in lost_items:
        lost_id=int(lost["id"])
        lost_user_id=str(lost["user_id"])
        try:
            point=qdrant.retrieve(collection_name="lost_items", ids=[lost_id], with_vectors=True)
            if not point:
                errors.append({"lost_id": lost_id, "error": "No vector found in Qdrant for this lost item"})
                continue
            lost_vector = point[0].vector
        except Exception as e:
            errors.append({"lost_id": lost_id, "error": f"Qdrant get_point failed: {str(e)}"})
            continue

        qfilter = models.Filter(
            must=[models.FieldCondition(key="status", match=models.MatchValue(value="active"))]
        )    

        try:
            results = qdrant.search(
                collection_name="found_items",
                query_vector=lost_vector,
                limit=top_k,
                query_filter=qfilter
            )
        except Exception as e:
            errors.append({"lost_id": lost_id, "error": f"Qdrant search failed: {str(e)}"})
            continue

        for r in results:
            score = float(r.score) if r.score is not None else None
            if score is None:
                continue
            if score < confidence_threshold:
                continue

            found_point_payload = r.payload or {}
            found_supabase_id = found_point_payload.get("id") or r.id
            
            if lost_user_id == str(found_point_payload.get("user_id")):
                continue

            try:
                lost_stmt=(select(Match.lost_item_id,Match.found_item_id).where(Match.found_item_id==found_supabase_id,Match.lost_item_id==lost_id).limit(1))
                existing_match=session.execute(lost_stmt).first()
                if existing_match:
                    continue
            except Exception as e:
                errors.append({"lost_id": lost_id, "error": f"Database query failed: {str(e)}"})
                continue
            
            
            try:
                match_record = Match(lost_item_id=lost_id, found_item_id=found_supabase_id, confidence_score=score)
                db.session.add(match_record)
                db.session.flush()
                db.session.commit()
                created_matches.append({"lost_id": lost_id, "found_id": found_supabase_id, "similarity": score})
            except Exception as e:
                errors.append({"lost_id": lost_id, "found_id": found_supabase_id, "error": f"Supabase insert failed: {str(e)}"})
    
    all_matches=(select(Match.id,Match.lost_item_id,Match.found_item_id,Match.confidence_score))
    matches=session.execute(all_matches).all()   

    match_items = [
    {
        "id": r.id,
        "lost_id": int(r.lost_item_id),
        "found_id": int(r.found_item_id),
        "confidence_score": r.confidence_score
    }     
    for r in matches
    ]

    for match in match_items:
        already_exist_found=LostItem.query.filter(LostItem.user_id==match["lost_id"] ,str(match["found_id"])== db.any_(LostItem.found_items)).first()
        if already_exist_found:
            continue
        else:
            lost_item=LostItem.query.filter_by(id=match["lost_id"]).first()
            if lost_item.found_items:
                lost_item.found_items.append(match["found_id"])
            else:
                lost_item.found_items=[match["found_id"]]
            db.session.commit()
        already_exist_found=FoundItem.query.filter(FoundItem.user_id==match["found_id"] ,str(match["lost_id"])== db.any_(FoundItem.lost_items)).first()
        if already_exist_found:
            continue    
        
        else:
            found_item=FoundItem.query.filter_by(id=match["found_id"]).first()
            if found_item.lost_items:
                found_item.lost_items.append(match["lost_id"])
            else:
                found_item.lost_items=[match["lost_id"]]
            db.session.commit()    


    return jsonify({
        "checked_lost_count": len(lost_rows),
        "created_matches_count": len(created_matches),
        "created_matches": created_matches,
        "errors": errors
    }), 200


if __name__ == "__main__":
    app.run(debug=True,port=5000)