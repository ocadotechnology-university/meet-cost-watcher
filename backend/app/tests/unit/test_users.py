import pytest
from app.models import User, AppRoles
from app.resolvers.users import (
    create_user_resolver,
    get_users_resolver,
    update_user_resolver,
    delete_user_resolver,
)
from app.types import CreateUserInput, UpdateUserInput
from app.extensions import db
from app import create_app


@pytest.fixture
def app():
    app = create_app()
    app.config.update(
        {"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"}
    )
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def admin_user(app):
    admin = User(
        username="admin",
        role_name="Administrator",
        hourly_cost=150.0,
        app_role=AppRoles.ADMIN,
    )
    admin.hash_password("admin123")
    db.session.add(admin)
    db.session.commit()
    return admin


@pytest.fixture
def regular_user(app):
    user = User(
        username="employee",
        role_name="Developer",
        hourly_cost=100.0,
        app_role=AppRoles.EMPLOYEE,
    )
    user.hash_password("employee123")
    db.session.add(user)
    db.session.commit()
    return user


def test_create_user_resolver_success(app, admin_user):
    with app.app_context():
        input_data = CreateUserInput(
            username="newuser",
            password="newpass123",
            role_name="Designer",
            hourly_cost=120.0,
            app_role="employee",
        )

        result = create_user_resolver(input_data, admin_user).get_json()["value"]
        assert "User newuser created successfully" in result

        created_user = User.query.filter_by(username="newuser").first()
        assert created_user is not None
        assert created_user.role_name == "Designer"
        assert created_user.hourly_cost == 120.0
        assert created_user.app_role == AppRoles.EMPLOYEE


def test_create_user_resolver_unauthorized(app, regular_user):
    with app.app_context():
        input_data = CreateUserInput(
            username="newuser",
            password="newpass123",
            role_name="Designer",
            hourly_cost=120.0,
            app_role="employee",
        )

        result = create_user_resolver(input_data, regular_user).get_json()["value"]
        assert "Only admins can create users" in result


def test_get_users_resolver_admin(app, admin_user, regular_user):
    with app.app_context():
        result = get_users_resolver(admin_user).get_json()["value"]

        assert len(result) == 2
        admin_data = next(user for user in result if user["username"] == "admin")
        employee_data = next(user for user in result if user["username"] == "employee")

        assert admin_data["hourly_cost"] == 150.0  # Admin can see costs
        assert employee_data["hourly_cost"] == 100.0


def test_get_users_resolver_employee(app, regular_user, admin_user):
    with app.app_context():
        result = get_users_resolver(regular_user).get_json()["value"]

        assert len(result) == 2
        admin_data = next(user for user in result if user["username"] == "admin")
        employee_data = next(user for user in result if user["username"] == "employee")

        assert admin_data["hourly_cost"] is None  # Employee cannot see costs
        assert employee_data["hourly_cost"] is None


def test_update_user_resolver_success(app, admin_user):
    with app.app_context():
        input_data = UpdateUserInput(
            id=1,
            username="updateduser",
            role_name="Senior Developer",
            hourly_cost=130.0,
            app_role="employee",
        )

        result = update_user_resolver(input_data, admin_user).get_json()["value"]
        assert "User updateduser updated successfully" in result

        updated_user = User.query.get(1)
        assert updated_user.username == "updateduser"
        assert updated_user.role_name == "Senior Developer"
        assert updated_user.hourly_cost == 130.0


def test_update_user_resolver_unauthorized(app, regular_user):
    with app.app_context():
        input_data = UpdateUserInput(1, username="updateduser")

        result = update_user_resolver(input_data, regular_user).get_json()["value"]
        assert "Only admins can update users" in result


def test_delete_user_resolver_success(app, admin_user, regular_user):
    with app.app_context():
        result = delete_user_resolver(regular_user.id, admin_user).get_json()["value"]
        assert "User employee deleted successfully" in result

        deleted_user = User.query.get(regular_user.id)
        assert deleted_user is None


def test_delete_user_resolver_unauthorized(app, regular_user):
    with app.app_context():
        result = delete_user_resolver(admin_user.id, regular_user).get_json()["value"]
        assert "Only admins can delete users" in result


def test_delete_user_resolver_self_deletion(app, admin_user):
    with app.app_context():
        result = delete_user_resolver(admin_user.id, admin_user).get_json()["value"]
        assert "Cannot delete oneself" in result
