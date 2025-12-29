import os
from flask import Flask,request,jsonify,make_response
from flask_bcrypt import Bcrypt
from functools import wraps
from flask_jwt_extended import JWTManager, create_access_token,unset_jwt_cookies, jwt_required, get_jwt_identity,decode_token
from App.models import db, User,LostItem,FoundItem,Match
from dotenv import load_dotenv
from flask_cors import CORS
from src.training import encode_img_and_text
from qdrant_client import QdrantClient
from qdrant_client.http import models
import cloudinary
from cloudinary import uploader 
import warnings
import base64
from io import BytesIO
import threading
from datetime import timedelta
warnings.filterwarnings("ignore", message=".*QuickGELU mismatch.*")


load_dotenv()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_ACCESS_COOKIE_NAME"] = "Token"
app.config["JWT_COOKIE_SAMESITE"] = "None"
app.config["JWT_COOKIE_SECURE"] = False
app.config["JWT_COOKIE_DOMAIN"] = ".localhost"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=3)


qdrant=QdrantClient(
    url=os.getenv("Qdrant_url"),
    api_key=os.getenv("Qdrant_api_key"),
)

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLIENT_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

db.init_app(app)
bcrypt=Bcrypt(app)
jwt=JWTManager(app)
CORS(app, supports_credentials=True, origins=[os.getenv("CLIENT")])
with app.app_context():
    db.create_all()

print('Qdrant connected')
print("Posgres Connected")



def decode_jwt(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token=request.cookies.get("Token")
        if not token:
            print('no token found')
            return jsonify({
                "message":"No Token Found"
            })
        else:
            id=decode_token(token)["sub"]
            print(id)
            return fn(user_id=id, *args, **kwargs)
    return wrapper
    

def upload_img(img):
    return uploader.upload(img, resource_type="image")["secure_url"]    

@app.route('/register',methods=["POST"])
def register():
    try:
        print("received")
        data=request.get_json()
        first_name=data['firstName']
        last_name=data['lastName']
        email=data['email']
        phone=data['phone']
        password=data['password']
        if User.query.filter_by(email=email).first():
            return jsonify({
                "success":False,
                "error":"User Already Exist"
            })
        hashing=bcrypt.generate_password_hash(password).decode("utf-8")
        new_user=User(first_name=first_name,last_name=last_name,email=email,phone=phone,password=hashing)
        db.session.add(new_user)
        db.session.commit()
        token=create_access_token(identity=str(new_user.id), expires_delta=timedelta(days=3))
        res=make_response({
            "success":True,
            "message":"User Registered Successfully",

        })
        res.set_cookie("Token",token,httponly=True,secure=True,samesite="None",max_age=259200,domain=".localhost")
        return res,200
    except Exception as e:
        print(e)
        return jsonify({
                "sucsess":False,
                "message":"Internal Server Error"
            }),400

@app.route("/login",methods=["POST"])
def login():
    try:
        data=request.get_json()
        print(data)
        email=data['email']
        password=data['password']
        user=User.query.filter_by(email=email).first()
        if not user or not bcrypt.check_password_hash(user.password,password):
            return jsonify({
                "sucsess":False,
                "message":"No User Found"
            }),200
        token=create_access_token(identity=str(user.id), expires_delta=timedelta(days=3))
        res=make_response({
            "success":True,
            "message":"User Login Successfully",

            })
        res.set_cookie("Token",token,httponly=True,secure=True,samesite="None",max_age=259200,domain=".localhost")
        return res,200
    except Exception as e:
        print(e)
        return jsonify({
                "sucsess":False,
                "message":"Internal Server Error"
            }),400


@app.route('/logout',methods=["GET"])
def logout():
    res=make_response({
        "success":True,
        "message":"Logout Successfully"
    })
    unset_jwt_cookies(res)
    return res,200

@app.route('/get_user',methods=['GET'])
@decode_jwt
def get_user(user_id):
    user=User.query.get({"id":user_id})
    return jsonify({
        "success":True,
        "user":{"first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone_number": user.phone}
            }), 200


@app.route('/lostItem',methods=['POST'])
@decode_jwt
def lostItem(user_id):
    print('search start')
    try:
        imgs_data=request.files.getlist('item')
        img_urls=[upload_img(img) for img in imgs_data]    
        description=request.form.get('description')
        print(imgs_data, description)
        vector=encode_img_and_text(imgs_data,description)
        lastSeenLocation=request.form.get('lastSeenLocation')
        dateTimeLost=request.form.get('dateTimeLost')
        name=request.form.get('name')
        email=request.form.get('email')
        phone=request.form.get('phone')
        reward=request.form.get('reward')
        additionalNotes=request.form.get('additionalNotes')
        item=LostItem(user_id=user_id,name=name,email=email,phone=phone,description=description,lastSeenLocation=lastSeenLocation,dateTimeLost=dateTimeLost,reward=reward,additionalNotes= additionalNotes,image_url= img_urls)
        db.session.add(item)
        db.session.flush()
        db.session.commit()
        print('db save', len(vector))

        collections = qdrant.get_collections().collections
        existing_names = [c.name for c in collections]
    
        if "lost_items" not in existing_names:
            qdrant.create_collection(
            collection_name="lost_items",
            vectors_config=models.VectorParams(
                size=512,
                distance=models.Distance.COSINE
            )
        )

        qdrant.upsert(
            collection_name="lost_items",
            points=[
                models.PointStruct(id=item.id, vector=vector, payload={"description":description,"status" : "active"})
            ],
        )
        print('vector save')
        return jsonify({
            "success":True
        }),200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "success":False
        }),400


@app.route('/foundItem',methods=['POST'])
@decode_jwt
def foundItem(user_id):
    print('search start')
    try:
        imgs_data=request.files.getlist('item')
        img_urls=[upload_img(img) for img in imgs_data]    
        description=request.form.get('description')
        print(imgs_data, description)
        vector=encode_img_and_text(imgs_data,description)
        found_near=request.form.get('found_near')
        name=request.form.get('name')
        email=request.form.get('email')
        phone=request.form.get('phone')
        item=FoundItem(user_id=user_id,name=name,email=email,phone=phone,description=description,found_near=found_near,image_url= img_urls)
        db.session.add(item)
        db.session.flush()
        db.session.commit()
        print('db save', len(vector))

        collections = qdrant.get_collections().collections
        existing_names = [c.name for c in collections]
    
        if "found_items" not in existing_names:
            qdrant.create_collection(
            collection_name="found_items",
            vectors_config=models.VectorParams(
                size=512,
                distance=models.Distance.COSINE
            )
        )

        qdrant.upsert(
            collection_name="found_items",
            points=[
                models.PointStruct(id=item.id, vector=vector, payload={"description":description,"status" : "active"})
            ],
        )
        print('vector save')
        return jsonify({
            "success":True
        }),200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "success":False
        }),200

@app.route('/allLostItems',methods=['GET'])
@decode_jwt
def allLostItems(user_id):
    
        items = LostItem.query.filter(LostItem.user_id==user_id).all()
        output = []
        for item in items:
            output.append({
            "id": item.id,
            "name": item.name,
            "email": item.email,
            "phone": item.phone,
            "description": item.description,
            "lastSeenLocation": item.lastSeenLocation,
            "dateTimeLost": item.dateTimeLost,
            "reward": item.reward,
            "additionalNotes": item.additionalNotes,
            "image_url": item.image_url,
            "status": item.status,
            "created_at": item.created_at
        })
        return jsonify({
            "success":True,
            "lostItems":output
        }),200

@app.route('/matchLost/<lost_id>',methods=['GET'])
def matchLost(lost_id):
    items = LostItem.query.filter(LostItem.id==lost_id).first()
    found_items=[]
    if not items.found_items:
        return jsonify({
            "success":False,
            "message":"No Lost Item Found"
        }),400
    for ids in items.found_items:
        found_item=FoundItem.query.filter(FoundItem.id==int(ids)).first()
        if found_item:
            found_items.append({
                "id": found_item.id,
                "name": found_item.name,
                "email": found_item.email,
                "phone": found_item.phone,
                "description": found_item.description,
                "found_near": found_item.found_near,
                "image_url": found_item.image_url,
                "status": found_item.status,
                "created_at": found_item.created_at
            })   
    
    return jsonify({
            "success":True,
            "foundItems": found_items
        }),200



@app.route('/matchFound/<lost_id>',methods=['GET'])
def matchFound(lost_id):
    items = FoundItem.query.filter(FoundItem.id==lost_id).first()

    found_items=[]
    if not items.lost_items:
        return jsonify({
            "success":False,
            "message":"No Found Item Found"
        }),200
    for ids in items.lost_items:
        found_item=LostItem.query.filter(LostItem.id==int(ids)).first()
        if found_item:
            found_items.append({
                "id": found_item.id,
                "name": found_item.name,
                "email": found_item.email,
                "phone": found_item.phone,
                "description": found_item.description,
                "found_near": found_item.lastSeenLocation,
                "image_url": found_item.image_url,
                "status": found_item.status,
                "created_at": found_item.created_at
            })
    
    return jsonify({
            "success":True,
            "foundItems": found_items
        }),200


@app.route('/lostMatchDetail/<lost_id>',methods=['GET'])
def lostMatchDetail(lost_id):
    found_item = LostItem.query.filter(LostItem.id==lost_id).first()
    print(lost_id)
    found_items=[]
    if not found_item:
        return jsonify({
            "success":False,
            "message":"No Found Item Found"
        }),400
    
    found_items.append({
                "id": found_item.id,
                "name": found_item.name,
                "email": found_item.email,
                "phone": found_item.phone,
                "description": found_item.description,
                "found_near": found_item.lastSeenLocation,
                "image_url": found_item.image_url,
                "status": found_item.status,
                "date_lost":found_item.dateTimeLost,
                "reward":found_item.reward,
                "additional_notes":found_item.additionalNotes,
                "created_at": found_item.created_at
    })

    
    return jsonify({
            "success":True,
            "foundItems": found_items
        }),200


@app.route('/allFoundItems',methods=['GET'])
@decode_jwt
def allFoundItems(user_id):
    items = FoundItem.query.filter(FoundItem.user_id==user_id).all()
    output = []
    for item in items:
            output.append({
            "id": item.id,
            "name": item.name,
            "email": item.email,
            "phone": item.phone,
            "description": item.description,
            "found_near": item.found_near,
            "image_url": item.image_url,
            "status": item.status,
            "created_at": item.created_at
        })
    return jsonify({
            "success":True,
            "foundItems":output
        }),200

@app.route('/foundMatchDetail/<lost_id>',methods=['GET'])
def foundMatchDetail(lost_id):
    found_item = FoundItem.query.filter(FoundItem.id==lost_id).first()
    print(lost_id)
    found_items=[]
    if not found_item:
        return jsonify({
            "success":False,
            "message":"No Found Item Found"
        }),400
    
    found_items.append({
                "id": found_item.id,
                "name": found_item.name,
                "email": found_item.email,
                "phone": found_item.phone,
                "description": found_item.description,
                "found_near": found_item.found_near,
                "image_url": found_item.image_url,
                "status": found_item.status,
                "created_at": found_item.created_at
    })
    
    
    return jsonify({
            "success":True,
            "foundItems": found_items
        }),200
    
if __name__ == "__main__":
    app.run(debug=True,port=8000)