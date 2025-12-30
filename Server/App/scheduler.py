import os
from flask import Flask,request,jsonify,make_response
from flask_bcrypt import Bcrypt
from functools import wraps
from flask_jwt_extended import JWTManager, create_access_token,unset_jwt_cookies, jwt_required, get_jwt_identity,decode_token
from dotenv import load_dotenv
from flask_cors import CORS
from qdrant_client import QdrantClient
from qdrant_client.http import models
from datetime import datetime, timedelta
from qdrant_client.models import PayloadSchemaType
from supabase import create_client

load_dotenv()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")

db = create_client(os.getenv("DATABASE_URL"),os.getenv("SUPABASE_KEY"))


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
    
    lost_rows = (db.table("lostItem").select("*").eq("status","active").execute())
    lost_items = [
    {
        "id": r.get("id"),
        "user_id": r.get("user_id"),
        "created_at": r.get("created_at")
    }

    
    for r in lost_rows.data
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
                existing_match=db.table("matches").select("lost_item_id","found_item_id").eq("found_item_id", found_supabase_id).eq("lost_item_id", lost_id).limit(1).execute()
                if existing_match:
                    continue
            except Exception as e:
                errors.append({"lost_id": lost_id, "error": f"Database query failed: {str(e)}"})
                continue
            
            
            try:
                match_record = db.table("matches").insert({
                                 "lost_item_id": lost_id,
                                 "found_item_id": found_supabase_id,
                                 "confidence_score": score
                                    }).execute()
                created_matches.append({"lost_id": lost_id, "found_id": found_supabase_id, "similarity": score})
            except Exception as e:
                errors.append({"lost_id": lost_id, "found_id": found_supabase_id, "error": f"Supabase insert failed: {str(e)}"})
    
    matches=(db.table("matches").select("id","lost_item_id","found_item_id","confidence_score").execute()) 

    match_items = [
    {
        "id": r.get("id"),
        "lost_id": int(r.get("lost_item_id")),
        "found_id": int(r.get("found_item_id")),
        "confidence_score": r.get("confidence_score")
    }     
    for r in matches.data
    ]

    for match in match_items:
        already_exist_found=(db.table("lostItem").select("*").eq("user_id", match["lost_id"]).contains("found_items", [str(match["found_id"])]).limit(1).execute()
)
        if already_exist_found:
            continue
        else:
            res=(db.table("lostItem").select("*").eq("id", match["lost_id"]).limit(1).execute()
)
            if not res.data:
                found_item = None
            else:
                found_item = res.data[0]

            current_lost_items = found_item.get("found_items") or []

            if match["found_id"] not in current_lost_items:
                current_lost_items.append(match["found_id"])

            db.table("lostItem").update({"found_items": current_lost_items }).eq("id", match["lost_id"]).execute()  
        
        already_exist_found=( db.table("foundItem").select("*").eq("user_id", match["found_id"]).contains("lost_items", [str(match["lost_id"])]).limit(1).execute()
)
        if already_exist_found:
            continue    
        
        else:
            res=(db.table("foundItem").select("lost_items").eq("id", match["found_id"]).limit(1).execute()
)
            if not res.data:
                found_item = None
            else:
                found_item = res.data[0]

            current_lost_items = found_item.get("lost_items") or []

            if match["lost_id"] not in current_lost_items:
                current_lost_items.append(match["lost_id"])

            db.table("foundItem").update({"lost_items": current_lost_items }).eq("id", match["found_id"]).execute()    


    return jsonify({
        "checked_lost_count": len(lost_rows.data),
        "created_matches_count": len(created_matches),
        "created_matches": created_matches,
        "errors": errors
    }), 200



if __name__ == "__main__":
    app.run(host="0.0.0.0",port=5000)