from datetime import datetime, date, timedelta
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.db.session import get_db
from app.models.community import CommunityPost, PostLike, PostComment
from app.models.trip import Trip
from app.models.trip_stop import TripStop
from app.models.city import City
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/community", tags=["Community Travel Plans"])

class CommunityPostCreate(BaseModel):
    trip_id: Optional[int] = None
    title: str
    description: str
    city_name: str
    cover_image_url: Optional[str] = None
    duration_days: int = 5
    estimated_budget: float = 1200.0
    tags: str = "General, Exploration"
    itinerary_data: Optional[str] = None

class CommentCreate(BaseModel):
    content: str

@router.get("/posts")
def get_community_posts(
    q: Optional[str] = Query(None, description="Search by title, description, or city"),
    city: Optional[str] = Query(None, description="Filter by city"),
    tag: Optional[str] = Query(None, description="Filter by tag (e.g. Foodie, Backpacking, Luxury)"),
    sort_by: Optional[str] = Query("popular", description="popular, latest, budget_asc, duration_desc"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    query = db.query(CommunityPost)

    if q:
        pat = f"%{q.strip()}%"
        query = query.filter(
            or_(
                CommunityPost.title.ilike(pat),
                CommunityPost.description.ilike(pat),
                CommunityPost.city_name.ilike(pat),
                CommunityPost.tags.ilike(pat)
            )
        )

    if city and city != "All":
        query = query.filter(CommunityPost.city_name.ilike(f"%{city.strip()}%"))

    if tag and tag != "All":
        query = query.filter(CommunityPost.tags.ilike(f"%{tag.strip()}%"))

    if sort_by == "latest":
        query = query.order_by(desc(CommunityPost.created_at))
    elif sort_by == "budget_asc":
        query = query.order_by(CommunityPost.estimated_budget.asc())
    elif sort_by == "duration_desc":
        query = query.order_by(desc(CommunityPost.duration_days))
    else: # default: popular
        query = query.order_by(desc(CommunityPost.likes_count), desc(CommunityPost.created_at))

    posts = query.all()

    # Check user liked posts
    user_liked_post_ids = set()
    if current_user:
        user_likes = db.query(PostLike.post_id).filter(PostLike.user_id == current_user.id).all()
        user_liked_post_ids = {l[0] for l in user_likes}

    results = []
    for p in posts:
        author = p.user
        comments_cnt = db.query(PostComment).filter(PostComment.post_id == p.id).count()
        results.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "city_name": p.city_name,
            "cover_image_url": p.cover_image_url or "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
            "duration_days": p.duration_days,
            "estimated_budget": p.estimated_budget,
            "tags": [t.strip() for t in p.tags.split(",") if t.strip()],
            "likes_count": p.likes_count,
            "clones_count": p.clones_count,
            "comments_count": comments_cnt,
            "has_liked": p.id in user_liked_post_ids,
            "created_at": str(p.created_at),
            "author": {
                "id": author.id,
                "username": author.username,
                "first_name": author.first_name or author.username,
                "photo_url": author.photo_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
                "city": author.city,
                "country": author.country
            } if author else None
        })

    return results

@router.post("/posts", status_code=status.HTTP_201_CREATED)
def publish_community_post(
    payload: CommunityPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cover_img = payload.cover_image_url
    if not cover_img and payload.trip_id:
        source_trip = db.query(Trip).filter(Trip.id == payload.trip_id).first()
        if source_trip:
            cover_img = source_trip.cover_image_url

    new_post = CommunityPost(
        user_id=current_user.id,
        trip_id=payload.trip_id,
        title=payload.title.strip(),
        description=payload.description.strip(),
        city_name=payload.city_name.strip(),
        cover_image_url=cover_img or "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
        duration_days=payload.duration_days,
        estimated_budget=payload.estimated_budget,
        tags=payload.tags,
        itinerary_data=payload.itinerary_data
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return {
        "id": new_post.id,
        "title": new_post.title,
        "message": "Custom trip plan published to the community!"
    }

@router.post("/posts/{post_id}/like")
def toggle_like_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")

    existing_like = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == current_user.id
    ).first()

    if existing_like:
        db.delete(existing_like)
        post.likes_count = max(0, post.likes_count - 1)
        db.commit()
        return {"liked": False, "likes_count": post.likes_count}
    else:
        new_like = PostLike(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        post.likes_count += 1
        db.commit()
        return {"liked": True, "likes_count": post.likes_count}

@router.get("/posts/{post_id}/comments")
def get_post_comments(
    post_id: int,
    db: Session = Depends(get_db)
):
    comments = db.query(PostComment).filter(PostComment.post_id == post_id).order_by(desc(PostComment.created_at)).all()
    return [
        {
            "id": c.id,
            "content": c.content,
            "created_at": str(c.created_at),
            "user": {
                "id": c.user.id,
                "username": c.user.username,
                "first_name": c.user.first_name or c.user.username,
                "photo_url": c.user.photo_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
            } if c.user else None
        }
        for c in comments
    ]

@router.post("/posts/{post_id}/comments", status_code=status.HTTP_201_CREATED)
def add_post_comment(
    post_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")

    if not payload.content.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Comment content cannot be empty.")

    comment = PostComment(
        post_id=post_id,
        user_id=current_user.id,
        content=payload.content.strip()
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {
        "id": comment.id,
        "content": comment.content,
        "created_at": str(comment.created_at),
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "first_name": current_user.first_name or current_user.username,
            "photo_url": current_user.photo_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
        }
    }

@router.post("/posts/{post_id}/clone", status_code=status.HTTP_201_CREATED)
def clone_community_plan_to_my_trips(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")

    # Match target city
    target_city = db.query(City).filter(City.name.ilike(post.city_name.strip())).first()
    city_id_val = target_city.id if target_city else None

    today = date.today() + timedelta(days=14)
    end_d = today + timedelta(days=post.duration_days)

    # Create new personal trip for current_user
    cloned_trip = Trip(
        user_id=current_user.id,
        title=f"{post.title} (Cloned)",
        description=f"Cloned from @{post.user.username}'s community plan: {post.description}",
        cover_image_url=post.cover_image_url,
        start_date=today,
        end_date=end_d,
        total_budget=post.estimated_budget,
        city_id=city_id_val,
        city_name=post.city_name
    )
    db.add(cloned_trip)
    db.flush()

    if city_id_val:
        stop = TripStop(
            trip_id=cloned_trip.id,
            city_id=city_id_val,
            stop_order=1,
            arrival_date=today,
            departure_date=end_d,
            stay_cost=min(post.estimated_budget * 0.45, 900.0)
        )
        db.add(stop)

    # Increment clone count
    post.clones_count += 1
    db.commit()
    db.refresh(cloned_trip)

    return {
        "id": cloned_trip.id,
        "title": cloned_trip.title,
        "message": f"Successfully cloned '{post.title}' to your personal trips!"
    }
