import pytest
from app.models import User
from app.auth import verify_password
from app import create_app, db
from flask_httpauth import HTTPBasicAuth

auth = HTTPBasicAuth()
test_username = "test_user"
test_password = "123"


# === FIXTURES ====================================================================================

@pytest.fixture()
def app_context(app):
    """Context manager for the Flask application context."""
    with app.app_context():
        yield


@pytest.fixture()
def app():
    """Create and configure a new Flask application instance for testing."""
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"
    })
    with app.app_context():
        db.create_all()
    yield app


@pytest.fixture()
def client(app):
    """Create a test client using the Flask application instance."""
    return app.test_client()

# === DATABASE SETUP ==============================================================================

@pytest.fixture()
def test_user(app):
    """Adding a test user to database"""
    with app.app_context():
        user = User(username=test_username)
        user.hash_password(test_password) 
        db.session.add(user)
        db.session.commit()
    yield user
    with app.app_context():
        db.session.delete(user)
        db.session.commit()

# === TESTS =======================================================================================

def test_verify_password_valid_user(test_user, app_context):
    """Test authentication if user is correctly authenticated with valid credentials."""
    with db.session.begin():
        test_user = db.session.merge(test_user)
    assert verify_password("test_user", test_password) == test_user


def test_verify_password_invalid_user(app_context):
    """Test authentication with a non-existent user."""
    assert verify_password("non_existent_user", "random_password") == False


def test_verify_password_invalid_password(test_user, app_context):
    """Test authentication with a valid user but incorrect password."""
    assert verify_password("test_user", "very_wrong_password") == False
