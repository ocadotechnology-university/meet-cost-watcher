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
        if isinstance(self.sort_by, dict):
            self.sort_by = MeetingsSorting(**self.sort_by) 
