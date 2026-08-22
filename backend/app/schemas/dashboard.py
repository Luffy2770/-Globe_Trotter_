from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.city import CityResponse
from app.schemas.trip import TripResponse

class BannerInfo(BaseModel):
    title: str = "Explore The World with GlobeTrotter"
    subtitle: str = "Discover handpicked destinations, design multi-city itineraries, and budget effortlessly."
    image_url: str = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200"

class DashboardSummaryResponse(BaseModel):
    banner: BannerInfo
    top_regional_selections: List[CityResponse]
    user_trips: List[TripResponse]

    model_config = ConfigDict(from_attributes=True)
