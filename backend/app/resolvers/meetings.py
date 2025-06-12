# do poprawy  żeby wyciągał też participantów itp
from app.models import User, Meeting, AdditionalCost, meeting_users, AppRoles
from app.extensions import db
from typing import Optional
from app.types import MeetingsFilters, SortingOrder
from sqlalchemy import asc, desc
from .common import jsonify_return
from sqlalchemy import func
from datetime import timezone


@jsonify_return
def meetings_single_resolver(token: str):

    meeting = (
        Meeting.query.filter_by(token=token)
        .outerjoin(AdditionalCost, Meeting.id == AdditionalCost.meeting_id)
        .outerjoin(meeting_users, Meeting.id == meeting_users.c.meeting_id)
        .outerjoin(User, meeting_users.c.user_id == User.id)
        .first()
    )

    if not meeting:
        raise Exception("Not Found")

    meeting_json = {
        "id": meeting.id,
        "token": meeting.token,
        "title": meeting.name,
        "date": meeting.start_datetime.astimezone(timezone.utc).isoformat(),
        "duration": meeting.duration,
        "room_name": meeting.room_name,
        "cost": meeting.cost,
        "participants": [],
        "additional_costs": [],
    }

    for cost in meeting.additional_costs.all():
        meeting_json["additional_costs"].append(
            {"id": cost.id, "name": cost.name, "cost": cost.cost}
        )

    for participant in meeting.users.all():
        meeting_json["participants"].append(
            {
                "id": participant.id,
                "username": participant.username,
                "role_name": participant.role_name,
                "hourly_cost": participant.hourly_cost,
            }
        )

    return meeting_json


@jsonify_return
def meetings_all_resolver(user: User, filters: Optional[MeetingsFilters] = None):
    query = (
        db.select(Meeting)
        .distinct()
        .outerjoin(AdditionalCost, Meeting.id == AdditionalCost.meeting_id)
        .outerjoin(meeting_users, Meeting.id == meeting_users.c.meeting_id)
        .outerjoin(User, meeting_users.c.user_id == User.id)
    )

    cost_query = (
        db.session.query(
            func.coalesce(func.sum(Meeting.cost), 0)
            + func.coalesce(func.sum(AdditionalCost.cost), 0)
        )
        .select_from(Meeting)
        .outerjoin(AdditionalCost, Meeting.id == AdditionalCost.meeting_id)
    )

    if user.app_role == AppRoles.EMPLOYEE:
        query = query.filter(
            (meeting_users.c.user_id == user.id) | (meeting_users.c.user_id == None)
        )
        cost_query = cost_query.join(
            meeting_users, Meeting.id == meeting_users.c.meeting_id
        ).filter(meeting_users.c.user_id == user.id)
    if filters:
        for name, value in filters.__dict__.items():

            if value is None or value == "":
                continue
            if name == "name":
                query = query.filter(Meeting.name.ilike(f"%{value}%"))

            if name == "duration_min":
                query = query.filter(Meeting.duration >= value)
                cost_query = cost_query.filter(Meeting.duration >= value)

            if name == "duration_max":
                query = query.filter(Meeting.duration <= value)
                cost_query = cost_query.filter(Meeting.duration <= value)

            if name == "cost_min":
                query = query.filter(Meeting.cost >= value)
                cost_query = cost_query.filter(Meeting.cost >= value)

            if name == "cost_max":
                query = query.filter(Meeting.cost <= value)
                cost_query = cost_query.filter(Meeting.cost <= value)

            if name == "start_min":
                query = query.filter(Meeting.start_datetime >= value)
                cost_query = cost_query.filter(Meeting.start_datetime >= value)

            if name == "start_max":
                query = query.filter(Meeting.start_datetime <= value)
                cost_query = cost_query.filter(Meeting.start_datetime <= value)

            if name == "participant_ids":
                query = query.filter(meeting_users.c.user_id.in_(value))
                cost_query = cost_query.filter(meeting_users.c.user_id.in_(value))

        if sort := filters.sort_by:
            column = getattr(Meeting, sort.field)
            if sort.order == SortingOrder.ASC.value:
                query = query.order_by(asc(column))
            else:
                query = query.order_by(desc(column))
        else:
            query = query.order_by(asc(Meeting.created_at))

    meetings = []
    total_cost = cost_query.scalar() or 0

    try:
        pagination_result = db.paginate(
            query.distinct(Meeting.id),
            page=filters.page,
            per_page=filters.per_page,
            max_per_page=200,
        )
    except Exception as e:
        return {"total_cost": round(total_cost, 2), "meetings": []}

    for meeting in pagination_result.items:
        meeting_json = {
            "id": meeting.id,
            "token": meeting.token,
            "title": meeting.name,
            "date": meeting.start_datetime.astimezone(timezone.utc).isoformat(),
            "description": meeting.description,
            "duration": meeting.duration,
            "room_name": meeting.room_name,
            "cost": meeting.cost,
            "participants": [],
            "additional_costs": [],
        }

        for cost in meeting.additional_costs.all():
            meeting_json["additional_costs"].append(
                {"id": cost.id, "name": cost.name, "cost": cost.cost}
            )

        owner_id = meeting.owner.id

        for participant in meeting.users.all():
            meeting_json["participants"].append(
                {
                    "id": participant.id,
                    "username": participant.username,
                    "role_name": participant.role_name,
                    "hourly_cost": participant.hourly_cost,
                    "is_owner": participant.id == owner_id,
                }
            )

        meetings.append(meeting_json)

    return {"total_cost": round(total_cost, 2), "meetings": meetings}
