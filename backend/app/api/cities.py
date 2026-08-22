from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.models.city import City
from app.schemas.city import CityResponse

router = APIRouter(prefix="/cities", tags=["Cities"])

@router.get("", response_model=List[CityResponse])
def search_and_list_cities(
    q: Optional[str] = Query(None, description="Search term for city name or country"),
    region: Optional[str] = Query(None, description="Filter by region (e.g. Europe, Asia, Americas)"),
    sort_by: Optional[str] = Query("popularity", description="Sort by: popularity, cost_low, cost_high, name"),
    featured_only: bool = Query(False, description="Filter featured destinations only"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(City)
    
    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            or_(
                City.name.ilike(search_pattern),
                City.country.ilike(search_pattern),
                City.description.ilike(search_pattern)
            )
        )
        
    if region:
        query = query.filter(City.region.ilike(region))
        
    if featured_only:
        query = query.filter(City.is_featured == True)
        
    if sort_by == "popularity":
        query = query.order_by(City.popularity_rating.desc())
    elif sort_by == "cost_low":
        query = query.order_by(City.cost_index.asc())
    elif sort_by == "cost_high":
        query = query.order_by(City.cost_index.desc())
    elif sort_by == "name":
        query = query.order_by(City.name.asc())
    else:
        query = query.order_by(City.popularity_rating.desc())
        
    return query.offset(offset).limit(limit).all()

@router.get("/{city_id}", response_model=CityResponse)
def get_city_by_id(city_id: int, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="City not found")
    return city
