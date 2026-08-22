from sqlalchemy import Column, Integer, Float, Date, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class TripActivity(Base):
    __tablename__ = "trip_activities"

    id = Column(Integer, primary_key=True, index=True)
    trip_stop_id = Column(Integer, ForeignKey("trip_stops.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id", ondelete="SET NULL"), nullable=True, index=True)
    order_index = Column(Integer, default=1, nullable=False)
    scheduled_date = Column(Date, nullable=True)
    cost_override = Column(Float, nullable=True)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    trip_stop = relationship("TripStop", back_populates="activities")
    activity = relationship("Activity")
