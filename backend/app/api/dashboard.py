from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.city import City
from app.models.trip import Trip
from app.models.user import User
from app.schemas.dashboard import DashboardSummaryResponse, BannerInfo
from app.schemas.city import CityResponse
from app.schemas.trip import TripResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    top_cities = db.query(City).order_by(City.popularity_rating.desc()).limit(6).all()
    user_trips = db.query(Trip).filter(Trip.user_id == current_user.id).order_by(Trip.created_at.desc()).limit(10).all()
    
    return DashboardSummaryResponse(
        banner=BannerInfo(),
        top_regional_selections=[CityResponse.model_validate(c) for c in top_cities],
        user_trips=[TripResponse.model_validate(t) for t in user_trips]
    )
