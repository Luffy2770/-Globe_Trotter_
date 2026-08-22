from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
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
    TripActivityCreate,
    TripActivityResponse,
    TripBudgetSummaryResponse
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/trips/{trip_id}", tags=["Itinerary Builder"])

def verify_trip_owner(trip_id: int, user_id: int, db: Session) -> Trip:
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found or access unauthorized"
        )
    return trip

def build_stop_response(stop: TripStop) -> TripStopResponse:
    activities_list = []
    for ta in stop.activities:
        eff_cost = ta.cost_override if ta.cost_override is not None else (ta.activity.estimated_cost if ta.activity else 0.0)
        activities_list.append(
            TripActivityResponse(
                id=ta.id,
                trip_stop_id=ta.trip_stop_id,
                activity_id=ta.activity_id,
                order_index=ta.order_index,
                scheduled_date=ta.scheduled_date,
                cost_override=ta.cost_override,
                effective_cost=eff_cost,
                notes=ta.notes,
                created_at=ta.created_at,
                activity=ta.activity
            )
        )
    return TripStopResponse(
        id=stop.id,
        trip_id=stop.trip_id,
        city_id=stop.city_id,
        stop_order=stop.stop_order,
        arrival_date=stop.arrival_date,
        departure_date=stop.departure_date,
        stay_cost=stop.stay_cost,
        created_at=stop.created_at,
        city=stop.city,
        activities=activities_list
    )

@router.get("/stops", response_model=List[TripStopResponse])
def get_trip_stops(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_trip_owner(trip_id, current_user.id, db)
    stops = db.query(TripStop).filter(TripStop.trip_id == trip_id).order_by(TripStop.stop_order.asc()).all()
    return [build_stop_response(s) for s in stops]

@router.post("/stops", response_model=TripStopResponse, status_code=status.HTTP_201_CREATED)
def add_trip_stop(
    trip_id: int,
    payload: TripStopCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_trip_owner(trip_id, current_user.id, db)
    
    if payload.stop_order is None:
        count = db.query(TripStop).filter(TripStop.trip_id == trip_id).count()
        next_order = count + 1
    else:
        next_order = payload.stop_order

    new_stop = TripStop(
        trip_id=trip_id,
        city_id=payload.city_id,
        stop_order=next_order,
        arrival_date=payload.arrival_date,
        departure_date=payload.departure_date,
        stay_cost=payload.stay_cost
    )
    db.add(new_stop)
    db.commit()
    db.refresh(new_stop)
    return build_stop_response(new_stop)

@router.put("/stops/{stop_id}", response_model=TripStopResponse)
def update_trip_stop(
    trip_id: int,
    stop_id: int,
    payload: TripStopUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_trip_owner(trip_id, current_user.id, db)
    stop = db.query(TripStop).filter(TripStop.id == stop_id, TripStop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip stop not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(stop, field, val)

    db.commit()
    db.refresh(stop)
    return build_stop_response(stop)

@router.delete("/stops/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip_stop(
    trip_id: int,
    stop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_trip_owner(trip_id, current_user.id, db)
    stop = db.query(TripStop).filter(TripStop.id == stop_id, TripStop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip stop not found")

    db.delete(stop)
    db.commit()
    return None

@router.post("/stops/{stop_id}/activities", response_model=TripActivityResponse, status_code=status.HTTP_201_CREATED)
def assign_activity_to_stop(
    trip_id: int,
    stop_id: int,
    payload: TripActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_trip_owner(trip_id, current_user.id, db)
    stop = db.query(TripStop).filter(TripStop.id == stop_id, TripStop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip stop not found")

    activity = db.query(Activity).filter(Activity.id == payload.activity_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found in catalog")

    if payload.order_index is None:
        idx_count = db.query(TripActivity).filter(TripActivity.trip_stop_id == stop_id).count()
        next_idx = idx_count + 1
    else:
        next_idx = payload.order_index

    new_ta = TripActivity(
        trip_stop_id=stop_id,
        activity_id=payload.activity_id,
        order_index=next_idx,
        scheduled_date=payload.scheduled_date,
        cost_override=payload.cost_override,
        notes=payload.notes
    )
    db.add(new_ta)
    db.commit()
    db.refresh(new_ta)

    eff_cost = new_ta.cost_override if new_ta.cost_override is not None else activity.estimated_cost
    return TripActivityResponse(
        id=new_ta.id,
        trip_stop_id=new_ta.trip_stop_id,
        activity_id=new_ta.activity_id,
        order_index=new_ta.order_index,
        scheduled_date=new_ta.scheduled_date,
        cost_override=new_ta.cost_override,
        effective_cost=eff_cost,
        notes=new_ta.notes,
        created_at=new_ta.created_at,
        activity=activity
    )

@router.delete("/stops/{stop_id}/activities/{activity_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_activity_from_stop(
    trip_id: int,
    stop_id: int,
    activity_item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_trip_owner(trip_id, current_user.id, db)
    ta = db.query(TripActivity).filter(TripActivity.id == activity_item_id, TripActivity.trip_stop_id == stop_id).first()
    if not ta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assigned activity item not found")

    db.delete(ta)
    db.commit()
    return None

@router.get("/budget", response_model=TripBudgetSummaryResponse)
def calculate_trip_budget_summary(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = verify_trip_owner(trip_id, current_user.id, db)
    stops = db.query(TripStop).filter(TripStop.trip_id == trip_id).all()

    stay_cost_sum = sum(s.stay_cost for s in stops)
    activity_cost_sum = 0.0

    for s in stops:
        for ta in s.activities:
            if ta.cost_override is not None:
                activity_cost_sum += ta.cost_override
            elif ta.activity and ta.activity.estimated_cost:
                activity_cost_sum += ta.activity.estimated_cost

    total_calc = stay_cost_sum + activity_cost_sum
    net_balance = trip.total_budget - total_calc
    is_over = total_calc > trip.total_budget

    return TripBudgetSummaryResponse(
        trip_id=trip.id,
        total_budget_target=trip.total_budget,
        calculated_stay_cost=stay_cost_sum,
        calculated_activity_cost=activity_cost_sum,
        total_calculated_cost=total_calc,
        net_balance=net_balance,
        is_over_budget=is_over
    )
