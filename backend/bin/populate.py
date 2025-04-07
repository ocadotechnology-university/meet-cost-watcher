import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from models import db, User
from faker import Faker
from app import app

if __name__ == '__main__':

    fake = Faker()
    with app.app_context():
        db.create_all()
        for _ in range(50):
            rand_user = User(username=fake.user_name())
            rand_user.hash_password("123")
            db.session.add(rand_user)
        db.session.commit()
