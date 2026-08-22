from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)
    
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    city_name = Column(String(100), nullable=False, index=True)
    cover_image_url = Column(String(500), nullable=True)
    duration_days = Column(Integer, default=5)
    estimated_budget = Column(Float, default=1200.0)
    tags = Column(String(250), default="General, Exploration") # e.g. "Foodie, Budget, Solo"
    itinerary_data = Column(Text, nullable=True) # JSON representation of sections/activities
    
    likes_count = Column(Integer, default=0)
    clones_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", backref="community_posts")
    trip = relationship("Trip", backref="community_post")
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("PostComment", back_populates="post", cascade="all, delete-orphan", order_by="PostComment.created_at.desc()")

    def __repr__(self):
        return f"<CommunityPost id={self.id} title='{self.title}' user_id={self.user_id}>"

class PostLike(Base):
    __tablename__ = "post_likes"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    post = relationship("CommunityPost", back_populates="likes")
    user = relationship("User")

class PostComment(Base):
    __tablename__ = "post_comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    post = relationship("CommunityPost", back_populates="comments")
    user = relationship("User")
