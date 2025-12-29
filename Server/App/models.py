from flask_sqlalchemy import SQLAlchemy
import uuid
from sqlalchemy.dialects.postgresql import JSON,ARRAY
from sqlalchemy.ext.mutable import MutableList

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone=db.Column(db.String(15), nullable=False)
    password = db.Column(db.String(200), nullable=False)


class LostItem(db.Model):
    __tablename__="lostItem"
    id = db.Column(db.Integer, primary_key=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"),nullable=False)
    name=db.Column(db.String,nullable=False)
    email=db.Column(db.String,nullable=False)
    phone=db.Column(db.String,nullable=False)
    description = db.Column(db.Text, nullable=False)
    lastSeenLocation = db.Column(db.Text, nullable=False)
    dateTimeLost = db.Column(db.Text, nullable=False)
    reward = db.Column(db.Text)
    additionalNotes  = db.Column(db.Text)
    image_url = db.Column(JSON, nullable=False)
    status=db.Column(db.String,nullable=False,default='active')
    found_items=db.Column(MutableList.as_mutable(ARRAY(db.String)),nullable=False)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.now(),nullable=False)

class FoundItem(db.Model):
    __tablename__="foundItem"
    id = db.Column(db.Integer, primary_key=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"),nullable=False)
    name=db.Column(db.String,nullable=False)
    email=db.Column(db.String,nullable=False)
    phone=db.Column(db.String,nullable=False)
    description = db.Column(db.Text, nullable=False)
    found_near= db.Column(db.Text, nullable=False)
    image_url = db.Column(JSON, nullable=False)
    status=db.Column(db.String,nullable=False,default='active')
    lost_items=db.Column(MutableList.as_mutable(ARRAY(db.String)),nullable=False)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.now(),nullable=False)

class Match(db.Model):
    __tablename__="matches"
    id = db.Column(db.Integer, primary_key=True, index=True)
    lost_item_id = db.Column(db.Integer, db.ForeignKey("lostItem.id"),nullable=False)
    found_item_id = db.Column(db.Integer, db.ForeignKey("foundItem.id"),nullable=False)
    confidence_score=db.Column(db.Float,nullable=False)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.now(),nullable=False)    