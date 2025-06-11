import pytest
from datetime import datetime, timedelta
from app.models import User, Meeting, AdditionalCost, AppRoles
from app.resolvers.meetings import meetings_single_resolver, meetings_all_resolver
from app.types import MeetingsFilters, SortingOrder
from app.extensions import db
from app import create_app


@pytest.fixture
def app():
    app = create_app()
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def sample_user(app):
    user = User(
        username="testuser",
        role_name="Developer",
        hourly_cost=100,
        app_role=AppRoles.EMPLOYEE,
    )
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def sample_admin():
    admin = User(
        username="admin", role_name="Admin", hourly_cost=150, app_role=AppRoles.ADMIN
    )
    db.session.add(admin)
    db.session.commit()
    return admin


@pytest.fixture
def sample_meeting(sample_user):
    meeting = Meeting(
        token="test-token-123",
        name="Test Meeting",
        start_datetime=datetime.now(),
        duration=60,
        room_name="Room 1",
        cost=100,
        owner=sample_user,
    )
    db.session.add(meeting)
    meeting.users.append(sample_user)
    db.session.commit()
    return meeting


@pytest.fixture
def sample_additional_cost(sample_meeting):
    cost = AdditionalCost(name="Coffee", cost=50, meeting_id=sample_meeting.id)
    db.session.add(cost)
    db.session.commit()
    return cost


@pytest.fixture
def other_user(app):
    user = User(
        username="otheruser",
        role_name="Designer",
        hourly_cost=120,
        app_role=AppRoles.EMPLOYEE,
    )
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def third_user(app):
    user = User(
        username="thirduser",
        role_name="Product Manager",
        hourly_cost=130,
        app_role=AppRoles.EMPLOYEE,
    )
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def multiple_meetings(sample_user, other_user, third_user):
    # Meeting 1: Only sample_user
    meeting1 = Meeting(
        token="test-token-1",
        name="Test Meeting 1",
        start_datetime=datetime.now(),
        duration=60,
        room_name="Room 1",
        cost=100,
        owner=sample_user,
    )
    meeting1.users.append(sample_user)

    # Meeting 2: sample_user and other_user
    meeting2 = Meeting(
        token="test-token-2",
        name="Test Meeting 2",
        start_datetime=datetime.now() + timedelta(hours=2),
        duration=90,
        room_name="Room 2",
        cost=150,
        owner=other_user,
    )
    meeting2.users.extend([sample_user, other_user])

    # Meeting 3: other_user and third_user (sample_user not included)
    meeting3 = Meeting(
        token="test-token-3",
        name="Test Meeting 3",
        start_datetime=datetime.now() + timedelta(hours=4),
        duration=120,
        room_name="Room 3",
        cost=200,
        owner=third_user,
    )
    meeting3.users.extend([other_user, third_user])

    db.session.add_all([meeting1, meeting2, meeting3])
    db.session.commit()

    return [meeting1, meeting2, meeting3]


# def test_meetings_single_resolver_success(
#     sample_meeting, sample_user, sample_additional_cost
# ):
#     result = meetings_single_resolver(sample_meeting.token).get_json()["value"]
#     assert result["token"] == sample_meeting.token
#     assert result["title"] == sample_meeting.name
#     assert result["duration"] == sample_meeting.duration
#     assert result["room_name"] == sample_meeting.room_name
#     assert result["cost"] == sample_meeting.cost
#     assert len(result["participants"]) == 1
#     assert len(result["additional_costs"]) == 1

#     participant = result["participants"][0]
#     assert participant["username"] == sample_user.username
#     assert participant["role_name"] == sample_user.role_name
#     assert participant["hourly_cost"] == sample_user.hourly_cost

#     additional_cost = result["additional_costs"][0]
#     assert additional_cost["name"] == sample_additional_cost.name
#     assert additional_cost["cost"] == sample_additional_cost.cost


# def test_meetings_single_resolver_not_found(
#     sample_meeting, sample_user, sample_additional_cost
# ):
#     response = meetings_single_resolver("non-existent-token").get_json()
#     assert response["code"] == "error"
#     assert response["value"] == "Not Found"


# def test_meetings_all_resolver_permissions(
#     sample_user, sample_admin, multiple_meetings
# ):
#     filters = MeetingsFilters(page=1, per_page=10)

#     result = meetings_all_resolver(sample_user, filters).get_json()["value"]

#     assert len(result["meetings"]) == 2

#     meeting_tokens = [m["token"] for m in result["meetings"]]
#     assert "test-token-1" in meeting_tokens
#     assert "test-token-2" in meeting_tokens
#     assert "test-token-3" not in meeting_tokens

#     expected_total_cost = multiple_meetings[0].cost + multiple_meetings[1].cost
#     assert result["total_cost"] == expected_total_cost

#     result = meetings_all_resolver(sample_admin, filters).get_json()["value"]
#     assert len(result["meetings"]) == 3
#     expected_total_cost = (
#         multiple_meetings[0].cost
#         + multiple_meetings[1].cost
#         + multiple_meetings[2].cost
#     )
#     assert result["total_cost"] == expected_total_cost


# def test_meetings_all_resolver_with_filters(
#     sample_user, sample_admin, multiple_meetings
# ):
#     filters = MeetingsFilters(
#         page=1,
#         per_page=10,
#         duration_min=89,
#         duration_max=120,
#     )

#     result = meetings_all_resolver(sample_admin, filters).get_json()["value"]
#     assert len(result["meetings"]) == 2


def test_meetings_all_resolver_pagination(sample_user, sample_admin, multiple_meetings):

    filters = MeetingsFilters(page=1, per_page=2)

    result = meetings_all_resolver(sample_admin, filters).get_json()["value"]
    assert len(result["meetings"]) == 2

    filters.page = 2
    result = meetings_all_resolver(sample_admin, filters).get_json()["value"]
    assert len(result["meetings"]) == 1

    filters.page = 3
    result = meetings_all_resolver(sample_admin, filters).get_json()["value"]
    assert len(result["meetings"]) == 0
