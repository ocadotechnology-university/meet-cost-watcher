from app.types import CreateAdditionalCostInput, UpdateAdditionalCostInput
from app.models import AdditionalCost
from app.extensions import db


def create_additonal_cost_resolver(input: CreateAdditionalCostInput) -> None:

    db.session.add(
        AdditionalCost(meeting_id=input.meeting_id, name=input.name, cost=input.cost)
    )
    db.session.commit()


def delete_additonal_cost_resolver(id: int) -> None:
    additonal_cost = AdditionalCost.query.filter_by(id=id).first()
    db.session.delete(additonal_cost)
    db.session.commit()


def update_additonal_cost_resolver(input: UpdateAdditionalCostInput) -> None:
    additonal_cost = AdditionalCost.query.filter_by(id=input.id).first()

    additonal_cost.cost = input.cost
    additonal_cost.name = input.name
    db.session.commit()
