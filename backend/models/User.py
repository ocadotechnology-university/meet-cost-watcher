from flask_sqlalchemy import SQLAlchemy
from . import db
from passlib.apps import custom_app_context as pwd_context


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), index=True)
    password_hash = db.Column(db.String(128))
    role_name = db.Column(db.String(64))
    hourly_cost = db.Column(db.Float)
    
    meetings = db.relationship('Meeting', secondary='meeting_users', backref=db.backref('users', lazy='dynamic'))

    def hash_password(self, password: str) -> None:
        self.password_hash = pwd_context.encrypt(password)

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.password_hash)

    def __repr__(self) -> str:
        return f'<User {self.username}>'
