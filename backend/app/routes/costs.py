from flask_restx import Namespace, Resource, fields
from flask.json import jsonify
from flask import request, abort
from app.types import CreateAdditionalCostInput, UpdateAdditionalCostInput
from app.resolvers.costs import (
    create_additonal_cost_resolver,
    delete_additonal_cost_resolver,
    update_additonal_cost_resolver,
)
from app.auth import auth

api = Namespace("additional costs", description="additional cost operations")

create_additonal_cost_model = api.model(
    "CreateAdditonalCostModel",
    {
        "meeting_id": fields.Integer(description="Cost's meeting ID"),
        "name": fields.String(description="Cost name"),
        "cost": fields.Float(description="Cost amount"),
    },
)

delete_additonal_cost_model = api.model(
    "DeleteAdditonalCostModel",
    {
        "id": fields.Integer(description="ID of additonal cost to delete"),
    },
)

update_additonal_cost_model = api.model(
    "DeleteAdditonalCostModel",
    {
        "id": fields.Integer(description="ID of additonal cost to modify"),
        "name": fields.String(description="Cost name"),
        "cost": fields.Float(description="Cost amount"),
    },
)


@api.route("/")
class AdditionalCosts(Resource):

    @api.doc(security="basicAuth")
    @api.expect(create_additonal_cost_model)
    @api.response(401, "Unauthorized")
    @api.response(200, "OK")
    @api.response(400, "Invalid request")
    @auth.login_required
    def post(self):
        """Create additonal cost"""
        # later check if user has permissions to add smth to this meeting
        user = auth.current_user()
        data = request.get_json()

        try:
            input = CreateAdditionalCostInput(**data)
        except Exception:
            abort(400)

        return create_additonal_cost_resolver(input=input)

    @api.doc(security="basicAuth")
    @api.expect(delete_additonal_cost_model)
    @api.response(401, "Unauthorized")
    @api.response(200, "OK")
    @api.response(400, "Invalid request")
    @auth.login_required
    def delete(self):
        "Delete given additional cost object"
        # later check if user has permissions to add smth to this meeting
        user = auth.current_user()
        data = request.get_json()

        if not (id := data.get("id")):
            abort(400)

        return delete_additonal_cost_resolver(id=id)

    @api.doc(security="basicAuth")
    @api.expect(update_additonal_cost_model)
    @api.response(401, "Unauthorized")
    @api.response(200, "OK")
    @api.response(400, "Invalid request")
    @auth.login_required
    def put(self):
        "Modify given additional cost object"
        # later check if user has permissions to add smth to this meeting
        user = auth.current_user()
        data = request.get_json()

        try:
            input = UpdateAdditionalCostInput(**data)
        except Exception:
            abort(400)

        return update_additonal_cost_resolver(input=input)
