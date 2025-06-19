from . import db
from datetime import datetime


class Meeting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    token = db.Column(db.String(128), nullable=True, unique=False)
    start_datetime = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    duration = db.Column(db.Integer, nullable=False)  # Duration in minutes
    room_name = db.Column(db.String(64))
    cost = db.Column(db.Float)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    description = db.Column(db.String(1000), nullable=True)

    owner_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    owner = db.relationship("User", backref=db.backref("meeting", lazy=True))

    # Relationship with additional costs
    additional_costs = db.relationship(
        "AdditionalCost", backref="meeting", lazy="dynamic"
    )

    def __repr__(self) -> str:
        return f"<Meeting {self.name}>"

    def to_dict(self):
        return {
            "id": self.id,
            "token": self.token,
            "title": self.name,
            "date": self.start_datetime.isoformat(),
        }


meeting_users = db.Table(
    "meeting_users",
    db.Column("meeting_id", db.Integer, db.ForeignKey("meeting.id"), primary_key=True),
    db.Column("user_id", db.Integer, db.ForeignKey("user.id"), primary_key=True),
)
