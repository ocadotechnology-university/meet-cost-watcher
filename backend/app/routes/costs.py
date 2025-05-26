from flask_restx import Namespace, Resource, fields
from flask import request, abort
from app.types import CreateAdditionalCostInput, UpdateAdditionalCostInput
from app.resolvers.costs import (
    create_additonal_cost_resolver,
    delete_additonal_cost_resolver,
    update_additonal_cost_resolver,
)
from app.auth import auth
from .common import build_return_type

api = Namespace("additional costs", description="additional cost operations")

create_additonal_cost_input = api.model(
    "create_additional_cost_input",
    {
        "meeting_id": fields.Integer(description="Cost's meeting ID", required=True),
        "name": fields.String(description="Cost name", required=True),
        "cost": fields.Float(description="Cost amount", required=True),
    },
)

delete_additonal_cost_input = api.model(
    "delete_additional_cost_input",
    {
        "id": fields.Integer(description="ID of additonal cost to delete", required=True
                             ),
    },
)

update_additonal_cost_input = api.model(
    "update_additional_cost_input",
    {
        "id": fields.Integer(description="ID of additonal cost to modify", required=True
                             ),
        "name": fields.String(description="Cost name", required=True),
        "cost": fields.Float(description="Cost amount", required=True),
    },
)

additional_cost_output = api.model(
    "additional_cost_output",
    {
        "status": fields.String(
            enum=["success", "error"],
            description="Indicates the status of response",
            required=True,
        ),
        "content": fields.String(
            description="Empty if success", required=True
        ),
    },
)

additional_cost_output1 = api.model(
    "additional_cost_output1",
    {
        "status": fields.String(
            enum=["success", "error"],
            description="Indicates the status of response",
            required=True,
        ),
        "content": fields.Integer(
            description="id of added additional cost", required=True
        ),
    },
)


@api.route("/")
class AdditionalCosts(Resource):

    @api.doc(security="basicAuth")
    @api.expect(create_additonal_cost_input)
    @api.response(401, "Unauthorized")
    @api.response(200, "OK", additional_cost_output1)
    @api.response(400, "Invalid request")
    @auth.login_required
    def post(self):
        """Create additonal cost"""
        user = auth.current_user()
        data = request.get_json()

        try:
            input = CreateAdditionalCostInput(**data)
        except Exception:
            abort(400)

        return create_additonal_cost_resolver(input=input, user=user)

    @api.doc(security="basicAuth")
    @api.expect(delete_additonal_cost_input)
    @api.response(401, "Unauthorized")
    @api.response(200, "OK", additional_cost_output)
    @api.response(400, "Invalid request")
    @auth.login_required
    def delete(self):
        "Delete given additional cost object"
        user = auth.current_user()
        data = request.get_json()

        if not (id := data.get("id")):
            abort(400)

        return delete_additonal_cost_resolver(id=id, user=user)

    @api.doc(security="basicAuth")
    @api.expect(update_additonal_cost_input)
    @api.response(401, "Unauthorized")
    @api.response(200, "OK", additional_cost_output)
    @api.response(400, "Invalid request")
    @auth.login_required
    def put(self):
        "Modify given additional cost object"
        user = auth.current_user()
        data = request.get_json()

        try:
            input = UpdateAdditionalCostInput(**data)
        except Exception:
            abort(400)

        try:
            return update_additonal_cost_resolver(input=input, user=user)
        except Exception as e:
            abort(400)
