from typing import List, Optional, Union
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.models.activity import Activity
from app.models.city import City
from app.schemas.catalog_search import (
    CatalogSearchResultItem,
    GroupedCatalogSearchResponse,
    FlatCatalogSearchResponse
)

router = APIRouter(prefix="/catalog/search", tags=["Catalog Search"])

def build_catalog_item(act: Activity) -> CatalogSearchResultItem:
    c_name = act.city.name if act.city else "Unknown City"
    cnt_name = act.city.country if act.city else "Unknown Country"
    return CatalogSearchResultItem(
        id=act.id,
        city_id=act.city_id,
        name=act.name,
        category=act.category,
        estimated_cost=act.estimated_cost,
        duration_minutes=act.duration_minutes,
        rating=act.rating,
        description=act.description,
        image_url=act.image_url,
        city_name=c_name,
        country_name=cnt_name
    )

@router.get("", response_model=Union[GroupedCatalogSearchResponse, FlatCatalogSearchResponse])
def search_catalog_options(
    q: Optional[str] = Query(None, description="Search term for activity name, description, category, or city"),
    category: Optional[str] = Query(None, description="Filter by category (Sightseeing, Culture, Food, Adventure)"),
    city_id: Optional[int] = Query(None, description="Filter by specific city ID"),
    region: Optional[str] = Query(None, description="Filter by region (Europe, Asia, Americas, Africa, Oceania)"),
    max_cost: Optional[float] = Query(None, description="Filter options under maximum cost"),
    min_rating: Optional[float] = Query(None, description="Filter options with minimum rating"),
    sort_by: Optional[str] = Query("rating_desc", description="Sort by: rating_desc, cost_low, cost_high, name"),
    group_by: Optional[str] = Query("none", description="Group by: category, city, none"),
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Activity).join(City, Activity.city_id == City.id)

    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Activity.name.ilike(search_pattern),
                Activity.description.ilike(search_pattern),
                Activity.category.ilike(search_pattern),
                City.name.ilike(search_pattern),
                City.country.ilike(search_pattern)
            )
        )

    if category:
        query = query.filter(Activity.category.ilike(category))

    if city_id:
        query = query.filter(Activity.city_id == city_id)

    if region:
        query = query.filter(City.region.ilike(region))

    if max_cost is not None:
        query = query.filter(Activity.estimated_cost <= max_cost)

    if min_rating is not None:
        query = query.filter(Activity.rating >= min_rating)

    if sort_by == "cost_low":
        query = query.order_by(Activity.estimated_cost.asc())
    elif sort_by == "cost_high":
        query = query.order_by(Activity.estimated_cost.desc())
    elif sort_by == "name":
        query = query.order_by(Activity.name.asc())
    else:
        query = query.order_by(Activity.rating.desc())

    activities = query.offset(offset).limit(limit).all()
    results = [build_catalog_item(a) for a in activities]

    if group_by == "category":
        grouped = {}
        for item in results:
            cat = item.category
            grouped.setdefault(cat, []).append(item)
        return GroupedCatalogSearchResponse(grouped_results=grouped)

    elif group_by == "city":
        grouped = {}
        for item in results:
            c_key = f"{item.city_name}, {item.country_name}"
            grouped.setdefault(c_key, []).append(item)
        return GroupedCatalogSearchResponse(grouped_results=grouped)

    return FlatCatalogSearchResponse(
        total=len(results),
        results=results
    )
