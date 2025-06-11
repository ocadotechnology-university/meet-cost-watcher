from flask_restx import Namespace, Resource, fields
from app.resolvers.meetings import meetings_all_resolver, meetings_single_resolver
from flask import request
from app.types import MeetingsFilters as MeetingsFilterParser
from flask import abort
from app.auth import auth
from .common import build_return_type

api = Namespace("meetings", description="meeting operations")


# docs types
# --------------------------------------------------------------------------------------------
meetings_sorting_model = api.model(
    "MeetingsSorting",
    {
        "field": fields.String(
            enum=["name", "cost", "duration", "start"],
            description="Field to sort by",
            required=False,
        ),
        "order": fields.String(
            enum=["asc", "desc"], description="Sorting order", required=False
        ),
    },
)

meetings_all_input = api.model(
    "MeetingsFilters",
    {
        "per_page": fields.Integer(
            description="how much per pagination page is returned records",
            required=True,
        ),
        "page": fields.Integer(
            description="number of requested pagination page", required=True
        ),
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

meeting_model = api.model(
    "Meeting",
    {
        "id": fields.Integer(description="Meeting ID"),
        "token": fields.String(description="Meeting token"),
        "title": fields.String(description="Meeting title"),
        "date": fields.DateTime(description="Meeting start date"),
        "duration": fields.Integer(description="Meeting duration in minutes"),
        "description": fields.String(description="meeting description if exists"),
        "owner": fields.Nested(
            api.model(
                "Owner",
                {
                    "id": fields.Integer(description="User ID"),
                    "username": fields.String(description="Username"),
                },
            )
        ),
        "room_name": fields.String(description="Meeting room name", required=True),
        "cost": fields.Float(description="Meeting cost", required=True),
        "participants": fields.List(
            fields.Nested(
                api.model(
                    "Participant",
                    {
                        "id": fields.Integer(description="User ID", required=True),
                        "username": fields.String(
                            description="Username", required=True
                        ),
                        "role_name": fields.String(
                            description="User role", required=True
                        ),
                        "hourly_cost": fields.Float(
                            description="User hourly cost", required=True
                        ),
                        "is_owner": fields.Boolean(
                            description="Is owner", required=True
                        ),
                    },
                )
            )
        ),
        "additional_costs": fields.List(
            fields.Nested(
                api.model(
                    "AdditionalCost",
                    {
                        "id": fields.Integer(
                            description="Additional cost ID", required=True
                        ),
                        "name": fields.String(description="Cost name", required=True),
                        "cost": fields.Float(description="Cost amount", required=True),
                    },
                )
            )
        ),
    },
)


meetings_all_output = api.model(
    "MeetingsResponse",
    {
        "total_cost": fields.Float(
            description="Total cost of all meetings", required=True
        ),
        "meetings": fields.List(fields.Nested(meeting_model)),
    },
)
# --------------------------------------------------------------------------------------------


@api.route("/all")
class MeetingsAll(Resource):

    @api.doc(security="basicAuth")
    @api.expect(meetings_all_input)
    @api.response(
        200,
        "Success",
        build_return_type(api, "meetings_all_response", meetings_all_output),
    )
    @api.response(400, "Invalid filters")
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
                abort(400)
        else:
            try:
                filters = MeetingsFilterParser(
                    page=data.get("page"), per_page=data.get("per_page")
                )
            except Exception:
                abort(400)
        # if filters is None:
        #     filters = MeetingsFilterParser()
        return meetings_all_resolver(filters=filters, user=user)


@api.route("/single/<string:token>")
class MeetingsSingle(Resource):

    @api.response(
        200,
        "Success",
        build_return_type(api, "meetings_single_response", meeting_model),
    )
    @api.response(400, "Invalid request")
    @api.response(404, "Meeting not found")
    def post(self, token):
        """Get a single meeting by token"""
        try:
            return meetings_single_resolver(token=token)
        except Exception:
            abort(404)
