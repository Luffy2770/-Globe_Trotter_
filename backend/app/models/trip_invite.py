from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class TripInvite(Base):
    __tablename__ = "trip_invites"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    inviter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    invitee_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(30), default="editor") # "editor" (Co-Planner) or "viewer" (Companion)
    status = Column(String(20), default="accepted") # "pending", "accepted", "declined"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    trip = relationship("Trip", backref="invites")
    inviter = relationship("User", foreign_keys=[inviter_id], backref="sent_invites")
    invitee = relationship("User", foreign_keys=[invitee_id], backref="received_invites")

    def __repr__(self):
        return f"<TripInvite id={self.id} trip_id={self.trip_id} invitee_id={self.invitee_id} role='{self.role}'>"
