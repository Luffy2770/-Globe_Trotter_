from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    estimated_cost = Column(Float, default=0.0)
    duration_minutes = Column(Integer, default=60)
    rating = Column(Float, default=4.5)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)

    city = relationship("City", backref="activities")

    def __repr__(self):
        return f"<Activity id={self.id} name='{self.name}' city_id={self.city_id}>"
