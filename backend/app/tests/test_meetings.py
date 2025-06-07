import pytest
from app import create_app,  db
from app.models import User, Meeting
from datetime import datetime
from flask_httpauth import HTTPBasicAuth
import base64
import json

auth = HTTPBasicAuth()
test_username = "test_user"
test_password = "123"

example_token = "abc-mnop-xyz"

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

@pytest.fixture()
def test_meeting(app):
    """Creating a test meeting in the database."""
    with app.app_context():
        # Test meeting
        meeting = Meeting(
            token=example_token,
            name="Test title",
            start_datetime=datetime(2025, 6, 5, 11, 29, 11),           # Data spotkania
            duration=60, 
            # description="Test description",
            # room_name="Testing room",                        # Nazwa sali
            # cost=42,                                         # Koszt spotkania
            # created_at=datetime(2025, 5, 28, 8, 27, 11),     # Data utworzenia rekordu
            owner_id=1                             # Liczba uczestników (jeśli masz takie pole)
        )
        db.session.add(meeting)
        db.session.commit()
    yield meeting
    # Remove the test meeting after tests
    with app.app_context():
        db.session.delete(meeting)
        db.session.commit()

# === AUTHENTICATION HEADERS ======================================================================

def auth_headers(username=test_username, password=test_password):
    """Headers for basic authentication."""
    credentials = f"{username}:{password}"
    token = base64.b64encode(credentials.encode()).decode() 
    return {
        "Authorization": f"Basic {token}"
    }


# === TESTS =======================================================================================

# --- meetings_all ---

def test_meetings_all_success(client, app_context, test_user):
    """Test successful of multiple meetings."""
    payload = {
        "per_page": 2,
        "page": 1
    }
    response = client.post(
        "/meetings/all",
        json=payload,
        headers=auth_headers()
    )
    assert response.status_code == 200
    # assert "meetings" in response.json["value"]


def test_meetings_all_invalid_filters(client, app_context, test_user):
    """Test handling of invalid filter values."""
    # pass # TODO
    payload = {
        "per_page": "nie_liczba",
        "page": "nie_liczba"
    }
    response = client.post(
        "/meetings/all",
        json=payload,
        headers=auth_headers()
    )
    assert response.status_code == 400


def test_meetings_all_unauthorized(client, app_context):
    """Test that an unauthorized request returns a 401 status code."""
    payload = {
        "per_page": 10,
        "page": 1
    }
    response = client.post(
        "/meetings/all",
        json=payload
    )
    assert response.status_code == 401


# --- meetings_single ---

def test_meetings_single_success(client, app_context, test_user, test_meeting):
    """Test successful of a single meeting."""
    response = client.post(
        f"/meetings/single/{example_token}",
        headers=auth_headers()
    )
    assert response.status_code == 200
    assert response.json["value"]["title"] == "Test title"
    assert response.json["value"]["token"] == example_token
    assert "id" in response.json["value"]


# def test_meetings_single_not_found(client, app_context, test_user, test_meeting):
#     """Test response when requesting a non-existent meeting."""
#     response = client.post(
#         "/meetings/single/non-existent-token",
#         headers=auth_headers()
#     )
#     assert response.status_code == 404

# def test_meetings_single_unauthorized(client, app_context):
#     """Test that an unauthorized request returns a 401 status code."""
#     response = client.post(
#         f"/meetings/single/{example_token}"
#     )
#     assert response.status_code == 401
