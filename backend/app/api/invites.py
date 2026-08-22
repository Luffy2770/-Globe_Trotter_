from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.models.trip import Trip
from app.models.user import User
from app.models.trip_invite import TripInvite
from app.api.deps import get_current_user

router = APIRouter(prefix="/invites", tags=["Trip Invites"])

class InviteCreate(BaseModel):
    username: str
    role: str = "editor" # "editor" (Co-Planner) or "viewer" (Companion)

class RespondPayload(BaseModel):
    action: str # "accept" or "decline"

@router.post("/trips/{trip_id}", status_code=status.HTTP_201_CREATED)
def invite_user_by_username(
    trip_id: int,
    payload: InviteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify trip exists
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

    clean_username = payload.username.strip().lstrip("@")
    if not clean_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username is required.")

    # Find target user by username OR email
    target_user = db.query(User).filter(
        or_(
            User.username.ilike(clean_username),
            User.email.ilike(clean_username)
        )
    ).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{clean_username}' not found. Valid test users are: zoro, nami, sanji, luffy.")

    if target_user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot invite yourself.")

    # Check if already invited
    existing = db.query(TripInvite).filter(
        TripInvite.trip_id == trip_id,
        TripInvite.invitee_id == target_user.id
    ).first()

    if existing:
        existing.role = payload.role
        existing.status = "pending"
        db.commit()
        db.refresh(existing)
        return {
            "id": existing.id,
            "username": target_user.username,
            "first_name": target_user.first_name,
            "photo_url": target_user.photo_url,
            "role": existing.role,
            "status": existing.status
        }

    new_invite = TripInvite(
        trip_id=trip_id,
        inviter_id=current_user.id,
        invitee_id=target_user.id,
        role=payload.role,
        status="pending"
    )
    db.add(new_invite)
    db.commit()
    db.refresh(new_invite)

    return {
        "id": new_invite.id,
        "username": target_user.username,
        "first_name": target_user.first_name,
        "photo_url": target_user.photo_url,
        "role": new_invite.role,
        "status": new_invite.status
    }

@router.get("/inbox")
def get_user_invite_inbox(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invites = db.query(TripInvite).filter(
        TripInvite.invitee_id == current_user.id
    ).order_by(TripInvite.created_at.desc()).all()

    inbox_items = []
    for inv in invites:
        trip = inv.trip
        inviter = inv.inviter
        if trip and inviter:
            inbox_items.append({
                "id": inv.id,
                "trip_id": trip.id,
                "trip_title": trip.title,
                "city_name": trip.city_name,
                "cover_image_url": trip.cover_image_url,
                "start_date": str(trip.start_date) if trip.start_date else None,
                "end_date": str(trip.end_date) if trip.end_date else None,
                "total_budget": trip.total_budget,
                "role": inv.role, # "editor" or "viewer"
                "status": inv.status, # "pending", "accepted", "declined"
                "created_at": str(inv.created_at),
                "inviter": {
                    "id": inviter.id,
                    "username": inviter.username,
                    "first_name": inviter.first_name or inviter.username,
                    "photo_url": inviter.photo_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
                }
            })

    return inbox_items

@router.post("/{invite_id}/respond")
def respond_to_invite(
    invite_id: int,
    payload: RespondPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invite = db.query(TripInvite).filter(
        TripInvite.id == invite_id,
        TripInvite.invitee_id == current_user.id
    ).first()

    if not invite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found.")

    if payload.action == "accept":
        invite.status = "accepted"
        db.commit()
        db.refresh(invite)
        return {"status": "accepted", "message": "You have joined the trip!"}
    elif payload.action == "decline":
        invite.status = "declined"
        db.commit()
        return {"status": "declined", "message": "Invitation declined."}
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid action. Use 'accept' or 'decline'.")

@router.get("/trips/{trip_id}")
def get_trip_members(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

    owner = db.query(User).filter(User.id == trip.user_id).first()
    invites = db.query(TripInvite).filter(TripInvite.trip_id == trip_id).all()

    members = [
        {
            "id": 0,
            "user_id": owner.id,
            "username": owner.username,
            "first_name": owner.first_name or owner.username,
            "photo_url": owner.photo_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
            "role": "owner",
            "status": "owner"
        }
    ]

    for inv in invites:
        u = inv.invitee
        if u:
            members.append({
                "id": inv.id,
                "user_id": u.id,
                "username": u.username,
                "first_name": u.first_name or u.username,
                "photo_url": u.photo_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
                "role": inv.role,
                "status": inv.status
            })

    return members

@router.delete("/trips/{trip_id}/{invite_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_trip_member(
    trip_id: int,
    invite_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invite = db.query(TripInvite).filter(TripInvite.id == invite_id, TripInvite.trip_id == trip_id).first()
    if not invite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found.")

    db.delete(invite)
    db.commit()
    return None
