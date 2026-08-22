from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.trip import Trip
from app.schemas.user import UserResponse
from app.schemas.profile import ProfileUpdate, UserProfilePageResponse
from app.api.trip_listing import build_trip_overview_card
from app.api.deps import get_current_user

router = APIRouter(prefix="/profile", tags=["User Profile"])

@router.get("", response_model=UserProfilePageResponse)
def get_user_profile_page(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_trips = db.query(Trip).filter(Trip.user_id == current_user.id).order_by(Trip.created_at.desc()).all()
    overview_cards = [build_trip_overview_card(t, db) for t in user_trips]

    preplanned = [c for c in overview_cards if c.status in ("upcoming", "ongoing", "draft")]
    previous = [c for c in overview_cards if c.status == "completed"]

    return UserProfilePageResponse(
        user=UserResponse.model_validate(current_user),
        preplanned_trips=preplanned,
        previous_trips=previous
    )

@router.put("", response_model=UserResponse)
def update_user_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(current_user, field, val)

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
