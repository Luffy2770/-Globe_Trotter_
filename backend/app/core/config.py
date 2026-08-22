import os
from pydantic import ConfigDict
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "GlobeTrotter API"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "globetrotter-super-secret-key-2026-hackathon")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./globetrotter.db")

    model_config = ConfigDict(case_sensitive=True)

settings = Settings()
