from app.types import CreateUserInput, UpdateUserInput
from app.models import User, AppRoles, meeting_users
from app.extensions import db
from .common import jsonify_return


@jsonify_return
def create_user_resolver(input: CreateUserInput, current_user: User) -> str:

    if current_user.app_role != AppRoles.ADMIN:
        raise Exception("Only admins can create users")

    new_user = User(
        username=input.username,
        role_name=input.role_name,
        hourly_cost=input.hourly_cost,
        app_role=AppRoles(input.app_role),
    )
    new_user.hash_password(input.password)
    db.session.add(new_user)
    db.session.commit()
    return f"User {new_user.username} created successfully"


@jsonify_return
def get_users_resolver(current_user: User) -> list:
    users = User.query.all()

    return [
        {
            "id": user.id,
            "username": user.username,
            "role_name": user.role_name,
            "hourly_cost": (
                user.hourly_cost if current_user.app_role == AppRoles.ADMIN else None
            ),
            "app_role": user.app_role.value,
        }
        for user in users
    ]


@jsonify_return
def update_user_resolver(input: UpdateUserInput, current_user: User) -> str:

    if current_user.app_role != AppRoles.ADMIN:
        raise Exception("Only admins can update users")

    user = User.query.get_or_404(input.id)

    if input.username is not None:
        user.username = input.username
    if input.password is not None:
        user.hash_password(input.password)
    if input.role_name is not None:
        user.role_name = input.role_name
    if input.hourly_cost is not None:
        user.hourly_cost = input.hourly_cost
    if input.app_role is not None:
        user.app_role = AppRoles(input.app_role)

    db.session.commit()
    return f"User {user.username} updated successfully"


@jsonify_return
def delete_user_resolver(user_id: int, current_user: User) -> str:

    if current_user.app_role != AppRoles.ADMIN:
        raise Exception("Only admins can delete users")

    if current_user.id == user_id:
        raise Exception("Cannot delete oneself")

    user = User.query.get_or_404(user_id)
    username = user.username

    db.session.execute(meeting_users.delete().where(meeting_users.c.user_id == user_id))

    db.session.delete(user)
    db.session.commit()

    return f"User {username} deleted successfully"
