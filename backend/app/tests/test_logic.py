from datetime import datetime
import pytest
from unittest.mock import MagicMock
import json

from app.models import User, Meeting, AdditionalCost, meeting_users
from app import create_app, db
from flask_httpauth import HTTPBasicAuth

from app.resolvers.meetings import meetings_all_resolver
from app.types import MeetingsFilters

auth = HTTPBasicAuth()
test_users_num = 10
test_password = "123"
example_token = "abc-mnop-xyz"


# === FIXTURES ==============================================================================

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
def app_context(app):
    """Context manager for the Flask application context."""
    with app.app_context():
        yield

@pytest.fixture()
def mock_users():
    """Creates a list of mock users with different roles and hourly costs."""
    test_users_num = 10
    test_password = "123"
    
    users = []
    for i in range(1, test_users_num + 1):
        user = MagicMock(id=i, username=f"test_user_{i}")
        user.hash_password = MagicMock(return_value=None)
        # Ustawienia ról
        if i == 1:
            user.app_role = "ADMIN"
            user.hourly_cost = 35.0
            user.role_name = "A"
        else:
            user.app_role = "EMPLOYEE"
        if i in [2, 3, 4, 5, 6]:
            user.role_name = "A"
            user.hourly_cost = 45.0
        elif i in [7, 8]:
            user.role_name = "B"
            user.hourly_cost = 15.0 + i
        else:
            user.role_name = "C"
            user.hourly_cost = 10.0 + i * 2
        users.append(user)
    yield users

@pytest.fixture()
def mock_meetings():
    """Returns a list of mock meetings with different costs and participants."""
    return [
        MagicMock(id=1, name="Test Meeting - All Users", cost=100, 
                  token="token1", start_datetime=datetime.utcnow(), 
                  description="Meeting 1", duration=60,
                  room_name="Room 1", created_at=datetime.utcnow(), owner=MagicMock(id=1)),
        MagicMock(id=2, name="Test Meeting - ID 1-6", cost=50, 
                  token="token2", start_datetime=datetime.utcnow(), 
                  description="Meeting 2", duration=60,
                  room_name="Room 2", created_at=datetime.utcnow(), owner=MagicMock(id=1)),
        MagicMock(id=3, name="Test Meeting - B+C", cost=75, 
                  token="token3", start_datetime=datetime.utcnow(), 
                  description="Meeting 3", duration=60,
                  room_name="Room 3", created_at=datetime.utcnow(), owner=MagicMock(id=1))
    ]

@pytest.fixture()
def mock_additional_costs():
    """Returns a list of mock additional costs."""
    return [
        MagicMock(id=1, name="Catering", cost=30, meeting_id=1),
        MagicMock(id=2, name="Equipment", cost=20, meeting_id=2),
        MagicMock(id=3, name="Extra Chairs", cost=50, meeting_id=3),
    ]

@pytest.fixture()
def mock_meeting_users(mock_meetings, mock_users):
    """Returns a dictionary mapping meeting IDs to lists of mock users."""
    return {
        mock_meetings[0].id: mock_users,
        mock_meetings[1].id: [user for user in mock_users if user.role_name == "A"],
        mock_meetings[2].id: [user for user in mock_users if user.role_name in ["B", "C"]]
    }

# === TESTS =======================================================================================

def test_mocked_meetings_cost(app, app_context, monkeypatch, mock_users, mock_meetings, mock_meeting_users, mock_additional_costs):
    """ Test the meetings_all_resolver function with mocked data to ensure it calculates total costs correctly."""
    with app.app_context():
       pass