# do poprawy  żeby wyciągał też participantów itp
from app.models import User, Meeting, AdditionalCost, meeting_users, AppRoles
from app.extensions import db
from typing import Optional
from app.types import MeetingsFilters, SortingOrder
from sqlalchemy import asc, desc
from .common import jsonify_return


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
        "date": meeting.start_datetime.isoformat(),
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

    if user.app_role == AppRoles.EMPLOYEE:
        query = query.filter(
            (meeting_users.c.user_id == user.id) | (meeting_users.c.user_id == None)
        )

    if filters:
        for name, value in filters.__dict__.items():

            if value is None:
                continue

            if name == "participant_ids":
                query = query.filter(meeting_users.c.user_id.in_(value))
                continue

            column = getattr(
                Meeting, name.replace("_min", "").replace("_max", ""), None
            )
            if column is None:
                continue

            if "_min" in name:
                query = query.filter(column >= value)
            elif "_max" in name:
                query = query.filter(column <= value)
            else:
                query = query.filter(column=value)

        if sort := filters.sort_by:
            column = getattr(Meeting, sort.field)
            if sort.order == SortingOrder.ASC.value:
                query = query.order_by(asc(column))
            else:
                query = query.order_by(desc(column))
        else:
            query = query.order_by(asc(Meeting.created_at))

    meetings = []
    total_cost = 0

    pagination_result = db.paginate(
        query.distinct(Meeting.id),
        page=filters.page,
        per_page=filters.per_page,
        max_per_page=200,
    )
    for meeting in pagination_result.items:
        meeting_json = {
            "id": meeting.id,
            "token": meeting.token,
            "title": meeting.name,
            "date": meeting.start_datetime.isoformat(),
            "duration": meeting.duration,
            "room_name": meeting.room_name,
            "cost": meeting.cost,
            "owner": {"id": meeting.owner.id, "username": meeting.owner.username},
            "participants": [],
            "additional_costs": [],
        }

        total_cost += meeting.cost

        for cost in meeting.additional_costs.all():
            meeting_json["additional_costs"].append(
                {"id": cost.id, "name": cost.name, "cost": cost.cost}
            )

            total_cost += cost.cost

        for participant in meeting.users.all():
            meeting_json["participants"].append(
                {
                    "id": participant.id,
                    "username": participant.username,
                    "role_name": participant.role_name,
                    "hourly_cost": participant.hourly_cost,
                }
            )

        meetings.append(meeting_json)

    return {"total_cost": round(total_cost, 2), "meetings": meetings}
