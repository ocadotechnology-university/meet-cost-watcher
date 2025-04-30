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
from flask_restx import Api, Resource, fields

from models.meeting_types import MeetingsSorting, MeetingsFilters, MeetingSortFields, SortingOrder
>>>>>>> 683ea01 (added endpoint for all meetings)

load_dotenv()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f'mysql+pymysql://{os.getenv("DB_USER", "")}:{os.getenv("DB_PASSWORD", "")}@{os.getenv("DB_HOST", "")}/{os.getenv("DB_NAME", "")}'
)
CORS(app)
db.init_app(app)
<<<<<<< HEAD
=======

# Initialize Flask-RESTX
api = Api(app, version='1.0', title='Meet Cost Watcher API',
          description='API for tracking meeting costs and participants')

>>>>>>> 7dce7e4 (openapi)
auth = HTTPBasicAuth()

# Define error response models
error_model = api.model('Error', {
    'error': fields.String(description='Error message')
})

# Define sorting and filtering models
sorting_order_model = api.model('SortingOrder', {
    'value': fields.String(description='Sorting order', enum=['asc', 'desc'])
})

meeting_sort_fields_model = api.model('MeetingSortFields', {
    'value': fields.String(description='Field to sort by', enum=['name', 'cost', 'duration', 'start'])
})

meetings_sorting_model = api.model('MeetingsSorting', {
    'field': fields.Nested(meeting_sort_fields_model, description='Field to sort by'),
    'order': fields.Nested(sorting_order_model, description='Sorting order')
})

meetings_filters_model = api.model('MeetingsFilters', {
    'name': fields.String(description='Filter by meeting name', required=False),
    'duration_min': fields.Integer(description='Minimum meeting duration in minutes', required=False),
    'duration_max': fields.Integer(description='Maximum meeting duration in minutes', required=False),
    'cost_min': fields.Float(description='Minimum meeting cost', required=False),
    'cost_max': fields.Float(description='Maximum meeting cost', required=False),
    'participant_ids': fields.List(fields.Integer, description='Filter by participant IDs', required=False),
    'start_min': fields.DateTime(description='Earliest meeting start date', required=False),
    'start_max': fields.DateTime(description='Latest meeting start date', required=False),
    'sort_by': fields.Nested(meetings_sorting_model, description='Sorting criteria', required=False)
})

# Define models for Swagger documentation
meeting_model = api.model('Meeting', {
    'id': fields.Integer(description='Meeting ID'),
    'token': fields.String(description='Meeting token'),
    'title': fields.String(description='Meeting title'),
    'date': fields.DateTime(description='Meeting start date'),
    'duration': fields.Integer(description='Meeting duration in minutes'),
    'room_name': fields.String(description='Meeting room name'),
    'cost': fields.Float(description='Meeting cost'),
    'participants': fields.List(fields.Nested(api.model('Participant', {
        'id': fields.Integer(description='User ID'),
        'username': fields.String(description='Username'),
        'role_name': fields.String(description='User role'),
        'hourly_cost': fields.Float(description='User hourly cost')
    }))),
    'additional_costs': fields.List(fields.Nested(api.model('AdditionalCost', {
        'id': fields.Integer(description='Additional cost ID'),
        'name': fields.String(description='Cost name'),
        'cost': fields.Float(description='Cost amount')
    })))
})

filters_model = api.model('MeetingsFilters', {
    'filters': fields.Nested(meetings_filters_model, description='Filter criteria for meetings')
})

response_model = api.model('MeetingsResponse', {
    'total_cost': fields.Float(description='Total cost of all meetings'),
    'meetings': fields.List(fields.Nested(meeting_model))
})

@auth.verify_password
def verify_password(username, password):
    user = User.query.filter_by(username=username).first()
    if not user or not user.verify_password(password):
        return False
    return user

<<<<<<< HEAD

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

=======
@api.route('/test')
class TestResource(Resource):
    @api.doc(security='basicAuth')
    @api.response(200, 'Success')
    @api.response(401, 'Unauthorized')
    @auth.login_required
    def get(self):
        """Test endpoint"""
        return "Hello World"

    @api.doc(security='basicAuth')
    @api.response(200, 'Success')
    @api.response(401, 'Unauthorized')
    @auth.login_required
    def post(self):
        """Test endpoint"""
        return "Hello World"

@api.route('/meets')
class MeetingsResource(Resource):
    @api.doc(security='basicAuth')
    @api.expect(filters_model)
    @api.response(200, 'Success', response_model)
    @api.response(400, 'Invalid filters', error_model)
    @api.response(401, 'Unauthorized')
    @auth.login_required
    def post(self):
        """Get all meetings with optional filtering"""
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

@api.route('/meet/<string:token>')
class SingleMeetingResource(Resource):
    @api.doc(security='basicAuth')
    @api.response(200, 'Success', meeting_model)
    @api.response(400, 'Invalid request', error_model)
    @api.response(404, 'Meeting not found')
    @api.response(401, 'Unauthorized')
    def post(self, token):
        """Get a single meeting by token"""
        return jsonify(Meeting.query.filter_by(token=token).first_or_404().to_dict())
>>>>>>> 7dce7e4 (openapi)

if __name__ == "__main__":
    app.run(debug=True)
