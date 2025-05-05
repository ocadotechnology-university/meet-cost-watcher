from flask_restx import Namespace, Resource, fields
from flask_httpauth import HTTPBasicAuth
from app.models import User
from app.resolvers.meetings import meetings_all_resolver, meetings_single_resolver
from flask.json import jsonify
from flask import request
from app.types import MeetingsFilters as MeetingsFilterParser

api = Namespace("meetings", description="meeting operations")
auth = HTTPBasicAuth()
from flask import abort

# docs types
# --------------------------------------------------------------------------------------------
error_model = api.model("Error", {"error": fields.String(description="Error message")})

meetings_sorting_model = api.model(
    "MeetingsSorting",
    {
        "field": fields.String(
            enum=["name", "cost", "duration", "start"], description="Field to sort by"
        ),
        "order": fields.String(enum=["asc", "desc"], description="Sorting order"),
    },
)

meetings_filters_model = api.model(
    "MeetingsFilters",
    {
        "name": fields.String(description="Filter by meeting name", required=False),
        "duration_min": fields.Integer(
            description="Minimum meeting duration in minutes", required=False
        ),
        "duration_max": fields.Integer(
            description="Maximum meeting duration in minutes", required=False
        ),
        "cost_min": fields.Float(description="Minimum meeting cost", required=False),
        "cost_max": fields.Float(description="Maximum meeting cost", required=False),
        "participant_ids": fields.List(
            fields.Integer, description="Filter by participant IDs", required=False
        ),
        "start_min": fields.DateTime(
            description="Earliest meeting start date", required=False
        ),
        "start_max": fields.DateTime(
            description="Latest meeting start date", required=False
        ),
        "sort_by": fields.Nested(
            meetings_sorting_model, description="Sorting criteria", required=False
        ),
    },
)

# Define models for Swagger documentation
meeting_model = api.model(
    "Meeting",
    {
        "id": fields.Integer(description="Meeting ID"),
        "token": fields.String(description="Meeting token"),
        "title": fields.String(description="Meeting title"),
        "date": fields.DateTime(description="Meeting start date"),
        "duration": fields.Integer(description="Meeting duration in minutes"),
        "room_name": fields.String(description="Meeting room name"),
        "cost": fields.Float(description="Meeting cost"),
        "participants": fields.List(
            fields.Nested(
                api.model(
                    "Participant",
                    {
                        "id": fields.Integer(description="User ID"),
                        "username": fields.String(description="Username"),
                        "role_name": fields.String(description="User role"),
                        "hourly_cost": fields.Float(description="User hourly cost"),
                    },
                )
            )
        ),
        "additional_costs": fields.List(
            fields.Nested(
                api.model(
                    "AdditionalCost",
                    {
                        "id": fields.Integer(description="Additional cost ID"),
                        "name": fields.String(description="Cost name"),
                        "cost": fields.Float(description="Cost amount"),
                    },
                )
            )
        ),
    },
)


meetings_all_output = api.model(
    "MeetingsResponse",
    {
        "total_cost": fields.Float(description="Total cost of all meetings"),
        "meetings": fields.List(fields.Nested(meeting_model)),
    },
)
# --------------------------------------------------------------------------------------------


@auth.verify_password
def verify_password(username, password):
    user = User.query.filter_by(username=username).first()
    if not user or not user.verify_password(password):
        return False
    return user


@api.route("/all")
class MeetingsAll(Resource):

    @api.doc(security="basicAuth")
    @api.expect(meetings_filters_model)
    @api.response(200, "Success", meetings_all_output)
    @api.response(400, "Invalid filters", error_model)
    @api.response(401, "Unauthorized")
    @auth.login_required
    def post(self):
        """Get all meetings with optional filtering"""

        user = auth.current_user()
        data = request.get_json()
        filters = None

        if data:
            try:
                filters = MeetingsFilterParser(**data)
            except Exception:
                return jsonify({"error": "provided filter data in wrong format"}), 400

        return jsonify(meetings_all_resolver(filters=filters))


@api.route("/single/<string:token>")
class MeetingsSingle(Resource):

    @api.doc(security="basicAuth")
    @api.response(200, "Success", meeting_model)
    @api.response(400, "Invalid request", error_model)
    @api.response(404, "Meeting not found")
    def post(self, token):
        """Get a single meeting by token"""
        try:
            return jsonify(meetings_single_resolver(token=token))
        except Exception:
            abort(404)
