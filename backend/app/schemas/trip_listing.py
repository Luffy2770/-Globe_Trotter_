from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class TripOverviewCard(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    city_name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_days: int = 0
    status: str
    total_budget: float = 0.0
    calculated_total_cost: float = 0.0
    stops_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GroupedTripsResponse(BaseModel):
    ongoing: List[TripOverviewCard] = []
    upcoming: List[TripOverviewCard] = []
    completed: List[TripOverviewCard] = []
    draft: List[TripOverviewCard] = []

class FlatTripsListingResponse(BaseModel):
    total: int
    trips: List[TripOverviewCard]
