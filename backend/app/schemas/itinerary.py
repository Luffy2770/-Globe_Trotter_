from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.city import CityResponse
from app.schemas.activity import ActivityResponse

class TripActivityCreate(BaseModel):
    activity_id: int
    scheduled_date: Optional[date] = None
    cost_override: Optional[float] = Field(None, ge=0.0)
    notes: Optional[str] = None
    order_index: Optional[int] = None

class TripActivityUpdate(BaseModel):
    scheduled_date: Optional[date] = None
    cost_override: Optional[float] = Field(None, ge=0.0)
    notes: Optional[str] = None
    order_index: Optional[int] = None

class TripActivityResponse(BaseModel):
    id: int
    trip_stop_id: int
    activity_id: int
    order_index: int
    scheduled_date: Optional[date] = None
    cost_override: Optional[float] = None
    effective_cost: float
    notes: Optional[str] = None
    created_at: datetime
    activity: ActivityResponse

    model_config = ConfigDict(from_attributes=True)

class TripStopCreate(BaseModel):
    city_id: int
    arrival_date: Optional[date] = None
    departure_date: Optional[date] = None
    stay_cost: float = Field(0.0, ge=0.0)
    stop_order: Optional[int] = None

class TripStopUpdate(BaseModel):
    arrival_date: Optional[date] = None
    departure_date: Optional[date] = None
    stay_cost: Optional[float] = Field(None, ge=0.0)
    stop_order: Optional[int] = None

class TripStopResponse(BaseModel):
    id: int
    trip_id: int
    city_id: int
    stop_order: int
    arrival_date: Optional[date] = None
    departure_date: Optional[date] = None
    stay_cost: float
    created_at: datetime
    city: CityResponse
    activities: List[TripActivityResponse] = []

    model_config = ConfigDict(from_attributes=True)

class TripBudgetSummaryResponse(BaseModel):
    trip_id: int
    total_budget_target: float
    calculated_stay_cost: float
    calculated_activity_cost: float
    total_calculated_cost: float
    net_balance: float
    is_over_budget: bool
