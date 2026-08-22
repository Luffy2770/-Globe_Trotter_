import re
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    phone_number: Optional[str] = Field(None, max_length=20)
    photo_url: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    additional_info: Optional[str] = Field(None, max_length=1000)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter (A-Z).")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number (0-9).")
        if not re.search(r"[@$!%*?&#]", v):
            raise ValueError("Password must contain at least one special character (e.g. @, $, #, !).")
        return v

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    photo_url: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    additional_info: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Alias for TokenResponse
TokenResponse = Token
