from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from app.db.session import get_db
from app.models.trip import Trip
from app.models.trip_stop import TripStop
from app.models.trip_activity import TripActivity
from app.models.activity import Activity
from app.models.user import User
from app.schemas.itinerary import (
    TripStopCreate,
    TripStopUpdate,
    TripStopResponse,
    TripActivityAssignment,
    TripActivityResponse,
    TripBudgetSummaryResponse
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/trips", tags=["Itinerary Builder & Budget"])

def get_user_trip_or_404(trip_id: int, user_id: int, db: Session) -> Trip:
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip

@router.get("/{trip_id}/stops", response_model=List[TripStopResponse])
def get_trip_itinerary_stops(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_trip_or_404(trip_id, current_user.id, db)
    stops = db.query(TripStop).options(
        selectinload(TripStop.activities).selectinload(TripActivity.activity)
    ).filter(TripStop.trip_id == trip_id).order_by(TripStop.stop_order.asc()).all()
    
    return stops

@router.post("/{trip_id}/stops", response_model=TripStopResponse, status_code=status.HTTP_201_CREATED)
def add_city_stop_to_trip(
    trip_id: int,
    payload: TripStopCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_trip_or_404(trip_id, current_user.id, db)
    existing_count = db.query(TripStop).filter(TripStop.trip_id == trip_id).count()

    new_stop = TripStop(
        trip_id=trip_id,
        city_id=payload.city_id,
        stop_order=payload.stop_order or (existing_count + 1),
        arrival_date=payload.arrival_date,
        departure_date=payload.departure_date,
        stay_cost=payload.stay_cost
    )
    db.add(new_stop)
    db.commit()
    db.refresh(new_stop)
    
    return db.query(TripStop).options(
        selectinload(TripStop.activities).selectinload(TripActivity.activity)
    ).filter(TripStop.id == new_stop.id).first()

@router.put("/{trip_id}/stops/{stop_id}", response_model=TripStopResponse)
def update_trip_stop(
    trip_id: int,
    stop_id: int,
    payload: TripStopUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_trip_or_404(trip_id, current_user.id, db)
    stop = db.query(TripStop).filter(TripStop.id == stop_id, TripStop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip stop not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(stop, field, val)

    db.commit()
    db.refresh(stop)
    
    return db.query(TripStop).options(
        selectinload(TripStop.activities).selectinload(TripActivity.activity)
    ).filter(TripStop.id == stop.id).first()

@router.delete("/{trip_id}/stops/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip_stop(
    trip_id: int,
    stop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_trip_or_404(trip_id, current_user.id, db)
    stop = db.query(TripStop).filter(TripStop.id == stop_id, TripStop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip stop not found")

    db.delete(stop)
    db.commit()
    return None

@router.post("/{trip_id}/stops/{stop_id}/activities", response_model=TripActivityResponse, status_code=status.HTTP_201_CREATED)
def assign_catalog_activity_to_stop(
    trip_id: int,
    stop_id: int,
    payload: TripActivityAssignment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_trip_or_404(trip_id, current_user.id, db)
    stop = db.query(TripStop).filter(TripStop.id == stop_id, TripStop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip stop not found")

    activity = db.query(Activity).filter(Activity.id == payload.activity_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catalog activity not found")

    existing_activities_count = db.query(TripActivity).filter(TripActivity.trip_stop_id == stop_id).count()

    assigned_activity = TripActivity(
        trip_stop_id=stop_id,
        activity_id=payload.activity_id,
        order_index=payload.order_index or (existing_activities_count + 1),
        scheduled_date=payload.scheduled_date,
        cost_override=payload.cost_override,
        notes=payload.notes
    )
    db.add(assigned_activity)
    db.commit()
    db.refresh(assigned_activity)

    return db.query(TripActivity).options(
        selectinload(TripActivity.activity)
    ).filter(TripActivity.id == assigned_activity.id).first()

@router.delete("/{trip_id}/stops/{stop_id}/activities/{activity_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_activity_from_stop(
    trip_id: int,
    stop_id: int,
    activity_item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_trip_or_404(trip_id, current_user.id, db)
    assigned_activity = db.query(TripActivity).filter(
        TripActivity.id == activity_item_id,
        TripActivity.trip_stop_id == stop_id
    ).first()
    if not assigned_activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assigned activity not found")

    db.delete(assigned_activity)
    db.commit()
    return None

@router.get("/{trip_id}/budget", response_model=TripBudgetSummaryResponse)
def calculate_trip_budget_summary(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = get_user_trip_or_404(trip_id, current_user.id, db)
    
    # Eager loading with selectinload to solve N+1 on budget calculations
    stops = db.query(TripStop).options(
        selectinload(TripStop.activities).selectinload(TripActivity.activity)
    ).filter(TripStop.trip_id == trip_id).all()

    stay_cost = sum(stop.stay_cost for stop in stops)
    activity_cost = 0.0

    for stop in stops:
        for ta in stop.activities:
            if ta.cost_override is not None:
                activity_cost += ta.cost_override
            elif ta.activity and ta.activity.estimated_cost:
                activity_cost += ta.activity.estimated_cost

    total_cost = stay_cost + activity_cost
    net_balance = trip.total_budget - total_cost
    is_over = total_cost > trip.total_budget

    return TripBudgetSummaryResponse(
        trip_id=trip.id,
        total_budget_target=trip.total_budget,
        calculated_stay_cost=stay_cost,
        calculated_activity_cost=activity_cost,
        total_calculated_cost=total_cost,
        net_balance=net_balance,
        is_over_budget=is_over
    )
