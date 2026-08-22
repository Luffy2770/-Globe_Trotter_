from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class ActivityBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    category: str = Field(..., max_length=50)
    estimated_cost: float = Field(0.0, ge=0.0)
    duration_minutes: int = Field(60, ge=1)
    rating: float = Field(4.5, ge=0.0, le=5.0)
    description: Optional[str] = None
    image_url: Optional[str] = None

class ActivityCreate(ActivityBase):
    city_id: int

class ActivityResponse(ActivityBase):
    id: int
    city_id: int

    model_config = ConfigDict(from_attributes=True)
