from datetime import date
from typing import List, Optional, Union
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import or_
from app.db.session import get_db
from app.models.trip import Trip
from app.models.trip_stop import TripStop
from app.models.trip_activity import TripActivity
from app.models.trip_invite import TripInvite
from app.models.user import User
from app.schemas.trip_listing import (
    TripOverviewCard,
    GroupedTripsResponse,
    FlatTripsListingResponse
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/trips-listing", tags=["User Trip Listing"])

def determine_trip_status(start_date: Optional[date], end_date: Optional[date]) -> str:
    if not start_date or not end_date:
        return "upcoming"
    today = date.today()
    if today < start_date:
        return "upcoming"
    elif start_date <= today <= end_date:
        return "ongoing"
    else:
        return "completed"

def build_trip_overview_card_eager(trip: Trip) -> TripOverviewCard:
    stops = trip.stops or []
    stops_count = len(stops)
    
    stay_sum = sum(s.stay_cost for s in stops if s.stay_cost)
    act_sum = 0.0
    for s in stops:
        for ta in (s.activities or []):
            if ta.cost_override is not None:
                act_sum += ta.cost_override
            elif ta.activity and ta.activity.estimated_cost:
                act_sum += ta.activity.estimated_cost

    total_cost = stay_sum + act_sum
    
    duration_days = 0
    if trip.start_date and trip.end_date:
        duration_days = (trip.end_date - trip.start_date).days + 1
        if duration_days < 0:
            duration_days = 0

    status_str = determine_trip_status(trip.start_date, trip.end_date)

    return TripOverviewCard(
        id=trip.id,
        title=trip.title,
        description=trip.description,
        cover_image_url=trip.cover_image_url,
        city_name=trip.city_name,
        start_date=trip.start_date,
        end_date=trip.end_date,
        duration_days=duration_days,
        status=status_str,
        total_budget=trip.total_budget,
        calculated_total_cost=total_cost,
        stops_count=stops_count,
        created_at=trip.created_at
    )

@router.get("", response_model=Union[GroupedTripsResponse, FlatTripsListingResponse])
def get_user_trip_listing(
    q: Optional[str] = Query(None, description="Search by trip title, city, or description"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: ongoing, upcoming, completed, draft"),
    sort_by: Optional[str] = Query("created_at", description="Sort by: start_date_asc, start_date_desc, created_at, title, budget"),
    group_by_status: bool = Query(True, description="Group results into ongoing, upcoming, completed sections"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Include owned trips + trips where current_user is an accepted companion
    accepted_trip_ids = [
        inv.trip_id for inv in db.query(TripInvite.trip_id).filter(
            TripInvite.invitee_id == current_user.id,
            TripInvite.status == "accepted"
        ).all()
    ]

    query = db.query(Trip).options(
        selectinload(Trip.stops).selectinload(TripStop.activities).selectinload(TripActivity.activity)
    ).filter(
        or_(
            Trip.user_id == current_user.id,
            Trip.id.in_(accepted_trip_ids)
        )
    )

    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Trip.title.ilike(search_pattern),
                Trip.city_name.ilike(search_pattern),
                Trip.description.ilike(search_pattern)
            )
        )

    if sort_by == "start_date_asc":
        query = query.order_by(Trip.start_date.asc().nulls_last())
    elif sort_by == "start_date_desc":
        query = query.order_by(Trip.start_date.desc().nulls_last())
    elif sort_by == "title":
        query = query.order_by(Trip.title.asc())
    elif sort_by == "budget":
        query = query.order_by(Trip.total_budget.desc())
    else:
        query = query.order_by(Trip.created_at.desc())

    trips = query.all()
    overview_cards = [build_trip_overview_card_eager(t) for t in trips]

    if not group_by_status:
        return FlatTripsListingResponse(
            total=len(overview_cards),
            results=overview_cards
        )

    ongoing = [c for c in overview_cards if c.status == "ongoing"]
    upcoming = [c for c in overview_cards if c.status in ("upcoming", "draft")]
    completed = [c for c in overview_cards if c.status == "completed"]

    if status_filter:
        sf = status_filter.lower()
        if sf == "ongoing":
            upcoming = []
            completed = []
        elif sf in ("upcoming", "draft"):
            ongoing = []
            completed = []
        elif sf == "completed":
            ongoing = []
            upcoming = []

    return GroupedTripsResponse(
        ongoing=ongoing,
        upcoming=upcoming,
        completed=completed
    )

@router.get("/{trip_id}/overview")
def get_trip_overview(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    accepted_trip_ids = [
        inv.trip_id for inv in db.query(TripInvite.trip_id).filter(
            TripInvite.invitee_id == current_user.id,
            TripInvite.status == "accepted"
        ).all()
    ]

    trip = db.query(Trip).options(
        selectinload(Trip.stops).selectinload(TripStop.activities).selectinload(TripActivity.activity)
    ).filter(
        Trip.id == trip_id,
        or_(
            Trip.user_id == current_user.id,
            Trip.id.in_(accepted_trip_ids)
        )
    ).first()

    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

    card = build_trip_overview_card_eager(trip)

    stops_data = []
    for s in (trip.stops or []):
        activities_data = []
        for ta in (s.activities or []):
            activities_data.append({
                "id": ta.id,
                "cost_override": ta.cost_override,
                "activity": {
                    "id": ta.activity.id,
                    "name": ta.activity.name,
                    "estimated_cost": ta.activity.estimated_cost,
                    "category": ta.activity.category
                } if ta.activity else None
            })
        stops_data.append({
            "id": s.id,
            "city": {"name": s.city.name} if s.city else None,
            "stay_cost": s.stay_cost,
            "activities": activities_data
        })

    return {
        "trip": card,
        "stops": stops_data
    }
