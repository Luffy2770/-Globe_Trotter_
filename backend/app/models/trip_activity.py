from datetime import datetime
from sqlalchemy import Column, Integer, Float, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class TripActivity(Base):
    __tablename__ = "trip_activities"

    id = Column(Integer, primary_key=True, index=True)
    trip_stop_id = Column(Integer, ForeignKey("trip_stops.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index = Column(Integer, default=1, index=True)
    scheduled_date = Column(Date, nullable=True)
    cost_override = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    stop = relationship("TripStop", back_populates="activities")
    activity = relationship("Activity")

    def __repr__(self):
        return f"<TripActivity id={self.id} stop_id={self.trip_stop_id} activity_id={self.activity_id}>"
