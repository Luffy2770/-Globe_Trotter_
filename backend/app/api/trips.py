from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.trip import Trip
from app.models.city import City
from app.models.trip_stop import TripStop
from app.models.user import User
from app.schemas.trip import TripCreate, TripResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.get("", response_model=List[TripResponse])
def get_user_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Trip).filter(Trip.user_id == current_user.id).order_by(Trip.created_at.desc()).all()

@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_user_trip(
    payload: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_city = None
    if payload.city_name:
        target_city = db.query(City).filter(City.name.ilike(payload.city_name.strip())).first()
    elif payload.city_id:
        target_city = db.query(City).filter(City.id == payload.city_id).first()

    city_id_val = target_city.id if target_city else payload.city_id
    city_name_val = target_city.name if target_city else payload.city_name

    new_trip = Trip(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        cover_image_url=payload.cover_image_url or (target_city.image_url if target_city else None),
        start_date=payload.start_date,
        end_date=payload.end_date,
        total_budget=payload.total_budget,
        city_id=city_id_val,
        city_name=city_name_val
    )
    db.add(new_trip)
    db.flush()

    # Automatically create the first TripStop for the primary destination city
    if city_id_val:
        initial_stop = TripStop(
            trip_id=new_trip.id,
            city_id=city_id_val,
            stop_order=1,
            arrival_date=payload.start_date,
            departure_date=payload.end_date,
            stay_cost=min(payload.total_budget * 0.4, 800.0)
        )
        db.add(initial_stop)

    db.commit()
    db.refresh(new_trip)
    return new_trip
