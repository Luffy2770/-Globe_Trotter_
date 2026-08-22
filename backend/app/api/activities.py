from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.activity import Activity
from app.models.city import City
from app.schemas.activity import ActivityResponse

router = APIRouter(prefix="/activities", tags=["Activities"])

@router.get("", response_model=List[ActivityResponse])
def search_and_list_activities(
    city_id: Optional[int] = Query(None, description="Filter by city ID"),
    city_name: Optional[str] = Query(None, description="Filter by city name"),
    category: Optional[str] = Query(None, description="Filter by category (Sightseeing, Food, Adventure, Culture)"),
    max_cost: Optional[float] = Query(None, description="Filter activities under maximum cost"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Activity)
    
    if city_id:
        query = query.filter(Activity.city_id == city_id)
    elif city_name:
        city = db.query(City).filter(City.name.ilike(f"%{city_name}%")).first()
        if city:
            query = query.filter(Activity.city_id == city.id)
        else:
            return []
            
    if category:
        query = query.filter(Activity.category.ilike(category))
        
    if max_cost is not None:
        query = query.filter(Activity.estimated_cost <= max_cost)
        
    return query.order_by(Activity.rating.desc()).offset(offset).limit(limit).all()

@router.get("/suggestions", response_model=List[ActivityResponse])
def get_activity_suggestions(
    city_id: Optional[int] = Query(None),
    city_name: Optional[str] = Query(None),
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db)
):
    query = db.query(Activity)
    if city_id:
        query = query.filter(Activity.city_id == city_id)
    elif city_name and city_name.strip():
        city = db.query(City).filter(City.name.ilike(f"%{city_name.strip()}%")).first()
        if city:
            query = query.filter(Activity.city_id == city.id)
            
    return query.order_by(Activity.rating.desc()).limit(limit).all()

@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity_details(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity
