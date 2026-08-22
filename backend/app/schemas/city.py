from typing import Optional
from pydantic import BaseModel, ConfigDict

class CityBase(BaseModel):
    name: str
    country: str
    region: str
    cost_index: float = 1.0
    popularity_rating: float = 4.5
    description: Optional[str] = None
    image_url: Optional[str] = None
    banner_url: Optional[str] = None
    is_featured: bool = False

class CityCreate(CityBase):
    pass

class CityResponse(CityBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
