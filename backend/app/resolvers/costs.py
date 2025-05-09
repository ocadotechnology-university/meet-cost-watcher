from app.types import CreateAdditionalCostInput, UpdateAdditionalCostInput
from app.models import AdditionalCost, User, AppRoles, Meeting, meeting_users
from app.extensions import db
from .common import jsonify_return


def __validate_additional_cost(id: int, user: User) -> AdditionalCost:
    query = (
        db.select(AdditionalCost)
        .join(Meeting, Meeting.id == AdditionalCost.meeting_id)
        .outerjoin(meeting_users, Meeting.id == meeting_users.c.meeting_id)
        .outerjoin(User, meeting_users.c.user_id == User.id)
        .filter(AdditionalCost.id == id)
    )

    additional_cost = db.session.execute(query).first()

    if not additional_cost:
        raise Exception("Couldn't find provided additional cost")

    additional_cost = additional_cost[0]

    if (
        user.app_role != AppRoles.ADMIN
        and user not in additional_cost.meeting.users.all()
    ):
        raise Exception("You dont have permission to delete this additional cost")

    return additional_cost


@jsonify_return
def create_additonal_cost_resolver(input: CreateAdditionalCostInput, user: User) -> int:

    if user.app_role != AppRoles.ADMIN:
        query = (
            db.select(Meeting)
            .outerjoin(AdditionalCost, Meeting.id == AdditionalCost.meeting_id)
            .outerjoin(meeting_users, Meeting.id == meeting_users.c.meeting_id)
            .filter(Meeting.id == input.meeting_id)
            .filter(meeting_users.c.user_id == user.id)
        )

        if not db.session.execute(query).first():
            raise Exception(
                "You dont have permission to add additional cost to this meeting"
            )
    cost = AdditionalCost(meeting_id=input.meeting_id, name=input.name, cost=input.cost)
    db.session.add(cost)
    db.session.commit()
    return cost.id


@jsonify_return
def delete_additonal_cost_resolver(id: int, user: User) -> str:

    additional_cost = __validate_additional_cost(id=id, user=user)
    db.session.delete(additional_cost)
    db.session.commit()
    return ""


@jsonify_return
def update_additonal_cost_resolver(input: UpdateAdditionalCostInput, user: User) -> str:

    additional_cost = __validate_additional_cost(id=input.id, user=user)
    additional_cost.cost = input.cost
    additional_cost.name = input.name
    db.session.commit()
    return ""
