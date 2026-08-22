from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    existing_username = db.query(User).filter(User.username == payload.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken. Please choose another username."
        )
    
    existing_email = db.query(User).filter(User.email == payload.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered."
        )
    
    hashed_pwd = get_password_hash(payload.password)
    new_user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hashed_pwd,
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone_number=payload.phone_number,
        photo_url=payload.photo_url,
        city=payload.city,
        country=payload.country,
        additional_info=payload.additional_info,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token(subject=new_user.username)
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        or_(
            User.username == payload.username_or_email,
            User.email == payload.username_or_email
        )
    ).first()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password."
        )
    
    token = create_access_token(subject=user.username)
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.post("/demo-login", response_model=TokenResponse)
def demo_login(db: Session = Depends(get_db)):
    demo_user = db.query(User).filter(User.username == "demo_traveler").first()
    if not demo_user:
        demo_user = User(
            username="demo_traveler",
            email="demo@globetrotter.com",
            password_hash=get_password_hash("password123"),
            first_name="Meet",
            last_name="Kotecha",
            phone_number="+1-555-0199",
            photo_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            city="San Francisco",
            country="USA",
            additional_info="Avid traveler planning a multi-city tour across Europe.",
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        
    token = create_access_token(subject=demo_user.username)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(demo_user)
    )
