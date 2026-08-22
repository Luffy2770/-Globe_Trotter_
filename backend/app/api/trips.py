from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.trip import Trip
from app.models.city import City
from app.models.user import User
from app.schemas.trip import TripCreate, TripResponse, TripUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.get("", response_model=List[TripResponse])
def get_user_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Trip).filter(Trip.user_id == current_user.id).order_by(Trip.created_at.desc()).all()

@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(
    payload: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    selected_city_id = payload.city_id
    selected_city_name = payload.city_name
    
    if payload.city_name and not selected_city_id:
        c = db.query(City).filter(City.name.ilike(payload.city_name)).first()
        if c:
            selected_city_id = c.id
            selected_city_name = c.name

    new_trip = Trip(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        cover_image_url=payload.cover_image_url,
        start_date=payload.start_date,
        end_date=payload.end_date,
        total_budget=payload.total_budget,
        city_id=selected_city_id,
        city_name=selected_city_name
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip

@router.get("/{trip_id}", response_model=TripResponse)
def get_trip_details(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip
