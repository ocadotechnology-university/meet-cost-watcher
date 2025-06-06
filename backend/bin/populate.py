import sys
import os
import uuid

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.models import User, Meeting, AdditionalCost, AppRoles
from app.extensions import db
from faker import Faker
from app import create_app
import random
from datetime import datetime, timedelta

if __name__ == "__main__":

    fake = Faker()
    with create_app().app_context():
        db.drop_all()
        db.create_all()

        users = []
        roles = ["Developer", "Manager", "Designer", "Product Owner", "QA Engineer"]
        for _ in range(50):
            rand_user = User(
                username=fake.user_name(),
                role_name=random.choice(roles),
                hourly_cost=random.uniform(30, 150),
                app_role=random.choice(list(AppRoles)),
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

            creation_time = datetime.now() - timedelta(
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
                created_at=creation_time,
                description=fake.sentence(nb_words=random.uniform(5, 50)),
                owner_id=random.choice(users).id,
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
            meeting.owner_id = meeting_users[0].id
            for user in meeting_users:
                meeting.users.append(user)

        db.session.commit()
        print("Database populated")
