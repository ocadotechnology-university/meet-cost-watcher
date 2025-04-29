import sys
import os
import uuid

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from models import db, User, Meeting, AdditionalCost
from faker import Faker
from app import app
import random
from datetime import datetime, timedelta

if __name__ == "__main__":

    fake = Faker()
    with app.app_context():

        db.create_all()

        users = []
        roles = ["Developer", "Manager", "Designer", "Product Owner", "QA Engineer"]
        for _ in range(50):
            rand_user = User(
                username=fake.user_name(),
                role_name=random.choice(roles),
                hourly_cost=random.uniform(30, 150),
            )
            rand_user.hash_password("123")
            db.session.add(rand_user)
            users.append(rand_user)

        db.session.commit()

        meetings = []
        room_names = [
            "Conference Room A",
            "Meeting Room B",
            "Board Room",
            "Virtual Room",
            "Collaboration Space",
        ]
        for _ in range(25):
            start_time = datetime.now() + timedelta(
                days=random.randint(0, 30),
                hours=random.randint(9, 17),
                minutes=random.randint(0, 59),
            )
            duration = random.randint(30, 180)

            rand_meeting = Meeting(
                name=fake.sentence(nb_words=3),
                start_datetime=start_time,
                duration=duration,
                room_name=random.choice(room_names),
                cost=random.uniform(100, 1000),
                token=str(uuid.uuid4()),
            )
            db.session.add(rand_meeting)
            meetings.append(rand_meeting)

        db.session.commit()

        cost_types = [
            "Catering",
            "Equipment Rental",
            "Travel Expenses",
            "Materials",
            "External Consultant",
        ]
        for meeting in meetings:
            for _ in range(random.randint(0, 3)):
                additional_cost = AdditionalCost(
                    name=random.choice(cost_types),
                    cost=random.uniform(50, 500),
                    meeting_id=meeting.id,
                )
                db.session.add(additional_cost)

        db.session.commit()

        for meeting in meetings:
            meeting_users = random.sample(users, random.randint(2, 5))
            for user in meeting_users:
                meeting.users.append(user)

        db.session.commit()
        print("Database populated")
