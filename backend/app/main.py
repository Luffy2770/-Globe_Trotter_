from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base
from app.api.auth import router as auth_router
from app.api.cities import router as cities_router
from app.api.trips import router as trips_router
from app.api.dashboard import router as dashboard_router
from app.api.activities import router as activities_router
from app.api.itinerary import router as itinerary_router
from app.api.trip_listing import router as trip_listing_router
from app.api.profile import router as profile_router
from app.api.catalog_search import router as catalog_search_router
from app.api.invites import router as invites_router
from app.api.community import router as community_router
from seed import seed_database

Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for GlobeTrotter Personalized Travel Planning",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(cities_router, prefix="/api")
app.include_router(trips_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(activities_router, prefix="/api")
app.include_router(itinerary_router, prefix="/api")
app.include_router(trip_listing_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(catalog_search_router, prefix="/api")
app.include_router(invites_router, prefix="/api")
app.include_router(community_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "GlobeTrotter API is running",
        "status": "healthy",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "GlobeTrotter API"}
