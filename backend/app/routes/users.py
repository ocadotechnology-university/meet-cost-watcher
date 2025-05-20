from flask_restx import Namespace, Resource, fields
from flask import request, abort
from app.types import CreateUserInput, UpdateUserInput
from app.resolvers.users import (
    create_user_resolver,
    get_users_resolver,
    update_user_resolver,
    delete_user_resolver,
)
from app.auth import auth
from .common import build_return_type
from pip._vendor.pkg_resources import require

api = Namespace("users", description="user operations")

create_user_input = api.model(
    "create_user_input",
    {
        "username": fields.String(required=True, description="Username"),
        "password": fields.String(required=True, description="Password"),
        "role_name": fields.String(required=True, description="Role name"),
        "hourly_cost": fields.Float(required=True, description="Hourly cost"),
        "app_role": fields.String(
            required=True, enum=["admin", "employee"], description="Application role"
        ),
    },
)

update_user_input = api.model(
    "update_user_input",
    {
        "username": fields.String(description="Username"),
        "password": fields.String(description="Password"),
        "role_name": fields.String(description="Role name"),
        "hourly_cost": fields.Float(description="Hourly cost"),
        "app_role": fields.String(
            enum=["admin", "employee"], description="Application role"
        ),
    },
)

user_output = api.model(
    "user_output",
    {
        "status": fields.String(
            enum=["success", "error"], description="Response status"
        ),
        "content": fields.String(description="Response content"),
    },
)

user_list_output = api.model(
    "user_list_output",
    {
        "status": fields.String(
            enum=["success", "error"], description="Response status"
        ),
        "content": fields.List(
            fields.Nested(
                api.model(
                    "user",
                    {
                        "id": fields.Integer(description="User ID"),
                        "username": fields.String(description="Username"),
                        "role_name": fields.String(description="Role name"),
                        "hourly_cost": fields.Float(
                            description="Hourly cost", required=False
                        ),
                        "app_role": fields.String(description="Application role"),
                    },
                )
            )
        ),
    },
)


@api.route("/")
class Users(Resource):
    @api.doc(security="basicAuth")
    @api.expect(create_user_input)
    @api.response(401, "Unauthorized")
    @api.response(200, "OK", user_output)
    @api.response(400, "Invalid request")
    @auth.login_required
    def post(self):
        """Create a new user"""
        user = auth.current_user()
        data = request.get_json()

        try:
            input = CreateUserInput(**data)
        except Exception:
            abort(400, "Invalid input data")

        return create_user_resolver(input=input, current_user=user)

    @api.doc(security="basicAuth")
    @api.response(401, "Unauthorized")
    @api.response(200, "OK", user_list_output)
    @auth.login_required
    def get(self):
        """Get all users"""
        user = auth.current_user()

        return get_users_resolver(current_user=user)


@api.route("/<int:user_id>")
class UserResource(Resource):
    @api.doc(security="basicAuth")
    @api.expect(update_user_input)
    @api.response(401, "Unauthorized")
    @api.response(200, "OK", user_output)
    @api.response(400, "Invalid request")
    @api.response(404, "User not found")
    @auth.login_required
    def put(self, user_id):
        """Update a user"""
        current_user = auth.current_user()
        data = request.get_json()
        try:
            input = UpdateUserInput(id=user_id, **data)
        except Exception:
            abort(400, "Invalid input data")

        return update_user_resolver(input=input, current_user=current_user)

    @api.doc(security="basicAuth")
    @api.response(401, "Unauthorized")
    @api.response(200, "OK", user_output)
    @api.response(404, "User not found")
    @auth.login_required
    def delete(self, user_id):
        """Delete a user"""
        current_user = auth.current_user()

        return delete_user_resolver(user_id=user_id, current_user=current_user)
