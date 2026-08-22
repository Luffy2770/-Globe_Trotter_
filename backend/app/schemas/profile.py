from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserResponse
from app.schemas.trip_listing import TripOverviewCard

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    photo_url: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    additional_info: Optional[str] = None

class UserProfilePageResponse(BaseModel):
    user: UserResponse
    preplanned_trips: List[TripOverviewCard] = []
    previous_trips: List[TripOverviewCard] = []

    model_config = ConfigDict(from_attributes=True)
