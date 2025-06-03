from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from enum import Enum


class MeetingSortFields(Enum):
    NAME = "name"
    COST = "cost"
    DURATION = "duration"
    START = "start"


class SortingOrder(Enum):
    ASC = "asc"
    DESC = "desc"


@dataclass
class MeetingsSorting:
    field: MeetingSortFields
    order: SortingOrder


@dataclass
class MeetingsFilters:
    page: int
    per_page: int
    name: Optional[str] = None
    duration_min: Optional[int] = None
    duration_max: Optional[int] = None
    cost_min: Optional[int] = None
    cost_max: Optional[int] = None
    participant_ids: Optional[list[int]] = None
    start_min: Optional[datetime] = None
    start_max: Optional[datetime] = None
    sort_by: Optional[MeetingsSorting] = None

    def __post_init__(self):

        if self.start_min and isinstance(self.start_min, str):
            self.start_min = datetime.fromisoformat(
                self.start_min.replace("Z", "+00:00")
            )

        if isinstance(self.sort_by, dict):
            self.sort_by = MeetingsSorting(**self.sort_by)


@dataclass
class CreateAdditionalCostInput:
    meeting_id: int
    name: str
    cost: float


@dataclass
class UpdateAdditionalCostInput:
    id: int
    name: str
    cost: float


@dataclass
class CreateUserInput:
    username: str
    password: str
    role_name: str
    hourly_cost: float
    app_role: str


@dataclass
class UpdateUserInput:
    id: int
    username: Optional[str] = None
    password: Optional[str] = None
    role_name: Optional[str] = None
    hourly_cost: Optional[float] = None
    app_role: Optional[str] = None
