<<<<<<< HEAD
from flask import Flask, request, jsonify
=======
from flask import Flask, request
>>>>>>> 683ea01 (added endpoint for all meetings)
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv
from flask_httpauth import HTTPBasicAuth
<<<<<<< HEAD
from models import db, User, Meeting
from flask_cors import CORS
=======
from models import db, User, Meeting, AdditionalCost, meeting_users
from flask.json import jsonify
from sqlalchemy import asc, desc

from models.meeting_types import MeetingsSorting, MeetingsFilters, MeetingSortFields, SortingOrder
>>>>>>> 683ea01 (added endpoint for all meetings)

load_dotenv()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f'mysql+pymysql://{os.getenv("DB_USER", "")}:{os.getenv("DB_PASSWORD", "")}@{os.getenv("DB_HOST", "")}/{os.getenv("DB_NAME", "")}'
)
CORS(app)
db.init_app(app)
auth = HTTPBasicAuth()


@auth.verify_password
def verify_password(username, password):
    user = User.query.filter_by(username=username).first()
    if not user or not user.verify_password(password):
        return False
    return user


@app.route("/test", methods=["GET", "POST"])
@auth.login_required
def index():
    return jsonify({"message": "Login successful"}), 200


@app.route("/meets", methods=["POST"])
@auth.login_required
def meetings_all():

    user = auth.current_user()
    data = request.get_json()

    if data and not (filters_dict := data.get("filters")):
        return jsonify({"error": "provided json filter data does not have 'filters' field"}), 400
    
    try:
        filters = MeetingsFilters(**filters_dict)
    except Exception:
        return jsonify({"error": "provided filter data in wrong format"}), 400

    # TODO: later introduce user roles filter

    query = db.select(Meeting)

    for name, value in filters.__dict__.items():

        if value is None:
            continue

        column = getattr(Meeting, name.replace("_min", "").replace("_max", ""), None)
        if column is None:
            continue 

        if "_min" in name:
            query = query.filter(column>=value)
        elif "_max" in name:
            query = query.filter(column <= value)
        else:
            query = query.filter(column=value)

        # TODO: add participant_ids

    if sort:=filters.sort_by:
        column = getattr(Meeting, sort.field)
        if sort.order == SortingOrder.ASC.value:
            query = query.order_by(asc(column))
        else:
            query = query.order_by(desc(column))

    query = query.join(AdditionalCost, Meeting.id == AdditionalCost.meeting_id)
    query = query.join(meeting_users, Meeting.id == meeting_users.c.meeting_id)
    query = query.join(User, meeting_users.c.user_id == User.id)

    meetings = []
    total_cost = 0
    for meeting in db.session.execute(query).all():
        meeting_json = {
            "id": meeting.Meeting.id,
            "token": meeting.Meeting.token,
            "title": meeting.Meeting.name,
            "date": meeting.Meeting.start_datetime.isoformat(),
            "duration": meeting.Meeting.duration,
            "room_name": meeting.Meeting.room_name,
            "cost": meeting.Meeting.cost,
            "participants": [],
            "additional_costs": []
        }

        total_cost += meeting.Meeting.cost

        for cost in meeting.Meeting.additional_costs.all():
            meeting_json["additional_costs"].append({
                "id": cost.id,
                "name": cost.name,
                "cost": cost.cost
            })

            total_cost += cost.cost

        for participant in meeting.Meeting.users.all():
            meeting_json["participants"].append({
                "id": participant.id,
                "username": participant.username,
                "role_name": participant.role_name,
                "hourly_cost": participant.hourly_cost
            })

        meetings.append(meeting_json)
    

    return jsonify({"total_cost": round(total_cost,2), "meetings": meetings})


@app.route("/meet/<token>", methods=["POST"])
def meet_single(token: str):
    return jsonify(Meeting.query.filter_by(token=token).first_or_404().to_dict())


if __name__ == "__main__":
    app.run(debug=True)
