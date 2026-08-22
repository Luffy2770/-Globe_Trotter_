from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict
from app.schemas.activity import ActivityResponse

class CatalogSearchResultItem(ActivityResponse):
    city_name: str
    country_name: str

    model_config = ConfigDict(from_attributes=True)

class GroupedCatalogSearchResponse(BaseModel):
    grouped_results: Dict[str, List[CatalogSearchResultItem]]

class FlatCatalogSearchResponse(BaseModel):
    total: int
    results: List[CatalogSearchResultItem]
