from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class TripBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_budget: float = Field(0.0, ge=0.0)

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_budget: Optional[float] = None

class TripResponse(TripBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
