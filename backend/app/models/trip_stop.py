from datetime import datetime
from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class TripStop(Base):
    __tablename__ = "trip_stops"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    city_id = Column(Integer, ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True)
    stop_order = Column(Integer, default=1, index=True)
    arrival_date = Column(Date, nullable=True)
    departure_date = Column(Date, nullable=True)
    stay_cost = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    trip = relationship("Trip", back_populates="stops")
    city = relationship("City")
    activities = relationship("TripActivity", back_populates="stop", cascade="all, delete-orphan", order_by="TripActivity.order_index")

    def __repr__(self):
        return f"<TripStop id={self.id} trip_id={self.trip_id} city_id={self.city_id} order={self.stop_order}>"
