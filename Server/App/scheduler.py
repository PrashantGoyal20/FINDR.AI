import os
from flask import Flask,request,jsonify,make_response
from flask_bcrypt import Bcrypt
from functools import wraps
from flask_jwt_extended import JWTManager, create_access_token,unset_jwt_cookies, jwt_required, get_jwt_identity,decode_token
from App.models import db, User,LostItem,FoundItem
from dotenv import load_dotenv
from flask_cors import CORS
from qdrant_client import QdrantClient
from qdrant_client.http import models


load_dotenv()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")

qdrant=QdrantClient(
    url=os.getenv("Qdrant_url"),
    api_key=os.getenv("Qdrant_api_key"),
)

db.init_app(app)
CORS(app, supports_credentials=True, origins=[os.getenv("CLIENT")])
with app.app_context():
    db.create_all()

print('Qdrant connected')
print("Posgres Connected")

@app.route("/admin/match-active-lost", methods=["POST"])
def match_active_lost():
    print("Matcher API called")


if __name__ == "__main__":
    app.run(debug=True,port=5000)