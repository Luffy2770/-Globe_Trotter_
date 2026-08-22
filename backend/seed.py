from app.db.session import SessionLocal, engine, Base
from app.models.city import City
from app.models.user import User
from app.models.trip import Trip
from app.models.activity import Activity
from app.models.trip_stop import TripStop
from app.models.trip_activity import TripActivity
from app.core.security import get_password_hash
from datetime import date, timedelta

Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    try:
        cities_data = [
            {
                "id": 1,
                "name": "Paris",
                "country": "France",
                "region": "Europe",
                "cost_index": 2.5,
                "popularity_rating": 4.9,
                "description": "The City of Light, famous for the Eiffel Tower, Louvre, and cafe culture.",
                "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600",
                "banner_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200",
                "latitude": 48.8566,
                "longitude": 2.3522,
                "is_featured": True
            },
            {
                "id": 2,
                "name": "Tokyo",
                "country": "Japan",
                "region": "Asia",
                "cost_index": 2.8,
                "popularity_rating": 4.9,
                "description": "Ultra-modern metropolis blending neon skyscrapers with historic temples.",
                "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600",
                "banner_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200",
                "latitude": 35.6762,
                "longitude": 139.6503,
                "is_featured": True
            },
            {
                "id": 3,
                "name": "Rome",
                "country": "Italy",
                "region": "Europe",
                "cost_index": 2.1,
                "popularity_rating": 4.8,
                "description": "Eternal City with ancient ruins, Colosseum, and vibrant piazza life.",
                "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600",
                "banner_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200",
                "latitude": 41.9028,
                "longitude": 12.4964,
                "is_featured": True
            },
            {
                "id": 4,
                "name": "New York",
                "country": "USA",
                "region": "Americas",
                "cost_index": 3.0,
                "popularity_rating": 4.9,
                "description": "The city that never sleeps, with Times Square, Central Park, and Broadway.",
                "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600",
                "banner_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "is_featured": True
            },
            {
                "id": 5,
                "name": "London",
                "country": "UK",
                "region": "Europe",
                "cost_index": 2.7,
                "popularity_rating": 4.8,
                "description": "Historic capital featuring Big Ben, Tower Bridge, and world-class museums.",
                "image_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600",
                "banner_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200",
                "latitude": 51.5074,
                "longitude": -0.1278,
                "is_featured": True
            },
            {
                "id": 6,
                "name": "Dubai",
                "country": "UAE",
                "region": "Middle East",
                "cost_index": 2.9,
                "popularity_rating": 4.8,
                "description": "Futuristic skyline with Burj Khalifa, desert safaris, and luxury shopping.",
                "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600",
                "banner_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200",
                "latitude": 25.2048,
                "longitude": 55.2708,
                "is_featured": True
            },
            {
                "id": 7,
                "name": "Barcelona",
                "country": "Spain",
                "region": "Europe",
                "cost_index": 2.2,
                "popularity_rating": 4.7,
                "description": "Mediterranean vibe with Sagrada Familia, beaches, and tapas culture.",
                "image_url": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600",
                "banner_url": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200",
                "latitude": 41.3879,
                "longitude": 2.1699,
                "is_featured": True
            },
            {
                "id": 8,
                "name": "Sydney",
                "country": "Australia",
                "region": "Oceania",
                "cost_index": 2.6,
                "popularity_rating": 4.8,
                "description": "Iconic Opera House, Harbour Bridge, and famous Bondi Beach.",
                "image_url": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600",
                "banner_url": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200",
                "latitude": -33.8688,
                "longitude": 151.2093,
                "is_featured": True
            },
            {
                "id": 9,
                "name": "Singapore",
                "country": "Singapore",
                "region": "Asia",
                "cost_index": 2.8,
                "popularity_rating": 4.9,
                "description": "Garden city with Marina Bay Sands, Gardens by the Bay, and street food.",
                "image_url": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600",
                "banner_url": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200",
                "latitude": 1.3521,
                "longitude": 103.8198,
                "is_featured": True
            },
            {
                "id": 10,
                "name": "Cairo",
                "country": "Egypt",
                "region": "Africa",
                "cost_index": 1.5,
                "popularity_rating": 4.6,
                "description": "Ancient civilization gateway featuring the Pyramids of Giza and the Nile.",
                "image_url": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600",
                "banner_url": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200",
                "latitude": 30.0444,
                "longitude": 31.2357,
                "is_featured": True
            }
        ]

        for city_item in cities_data:
            existing = db.query(City).filter(City.id == city_item["id"]).first()
            if not existing:
                db.add(City(**city_item))

        db.flush()

        activities_data = [
            {"id": 1, "city_id": 1, "name": "Eiffel Tower Summit & Seine Cruise", "category": "Sightseeing", "estimated_cost": 65.0, "duration_minutes": 180, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400"},
            {"id": 2, "city_id": 1, "name": "Louvre Museum Priority Entry", "category": "Culture", "estimated_cost": 40.0, "duration_minutes": 180, "rating": 4.8, "image_url": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400"},
            {"id": 3, "city_id": 2, "name": "Senso-ji Temple & Asakusa Walk", "category": "Culture", "estimated_cost": 25.0, "duration_minutes": 120, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400"},
            {"id": 4, "city_id": 2, "name": "Paragliding over Mount Fuji foothills", "category": "Adventure", "estimated_cost": 150.0, "duration_minutes": 240, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400"},
            {"id": 5, "city_id": 3, "name": "Colosseum & Ancient Forum Tour", "category": "Sightseeing", "estimated_cost": 50.0, "duration_minutes": 180, "rating": 4.8, "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400"},
            {"id": 6, "city_id": 4, "name": "Statue of Liberty & Ellis Island Cruise", "category": "Sightseeing", "estimated_cost": 45.0, "duration_minutes": 210, "rating": 4.8, "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400"},
            {"id": 7, "city_id": 5, "name": "Tower of London & Crown Jewels", "category": "History", "estimated_cost": 35.0, "duration_minutes": 150, "rating": 4.7, "image_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400"},
            {"id": 8, "city_id": 6, "name": "Burj Khalifa At The Top Observation Deck", "category": "Sightseeing", "estimated_cost": 75.0, "duration_minutes": 120, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400"},
            {"id": 9, "city_id": 7, "name": "Sagrada Familia Guided Fast Track", "category": "Culture", "estimated_cost": 48.0, "duration_minutes": 120, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400"},
            {"id": 10, "city_id": 10, "name": "Great Pyramids of Giza & Sphinx Tour", "category": "History", "estimated_cost": 30.0, "duration_minutes": 240, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400"}
        ]

        for act in activities_data:
            existing_act = db.query(Activity).filter(Activity.id == act["id"]).first()
            if not existing_act:
                db.add(Activity(**act))

        db.flush()

        demo_user = db.query(User).filter(User.username == "demo_traveler").first()
        if not demo_user:
            demo_user = User(
                username="demo_traveler",
                email="demo@globetrotter.com",
                password_hash=get_password_hash("password123"),
                first_name="Meet",
                last_name="Kotecha",
                city="San Francisco",
                country="USA"
            )
            db.add(demo_user)
            db.flush()

        today = date.today()

        t_upcoming = db.query(Trip).filter(Trip.user_id == demo_user.id, Trip.title == "European Summer Gateway 2026").first()
        if not t_upcoming:
            t_upcoming = Trip(
                user_id=demo_user.id,
                title="European Summer Gateway 2026",
                description="Multi-city tour covering Paris and Rome.",
                cover_image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
                start_date=today + timedelta(days=30),
                end_date=today + timedelta(days=44),
                total_budget=3500.0,
                city_id=1,
                city_name="Paris"
            )
            db.add(t_upcoming)
            db.flush()

        t_ongoing = db.query(Trip).filter(Trip.user_id == demo_user.id, Trip.title == "Asian Cultural Expedition").first()
        if not t_ongoing:
            t_ongoing = Trip(
                user_id=demo_user.id,
                title="Asian Cultural Expedition",
                description="Active travel exploration in Tokyo.",
                cover_image_url="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
                start_date=today - timedelta(days=2),
                end_date=today + timedelta(days=5),
                total_budget=2800.0,
                city_id=2,
                city_name="Tokyo"
            )
            db.add(t_ongoing)
            db.flush()

        t_completed = db.query(Trip).filter(Trip.user_id == demo_user.id, Trip.title == "Italian Renaissance Discovery").first()
        if not t_completed:
            t_completed = Trip(
                user_id=demo_user.id,
                title="Italian Renaissance Discovery",
                description="Completed vacation exploring Rome and Florence.",
                cover_image_url="https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
                start_date=today - timedelta(days=60),
                end_date=today - timedelta(days=50),
                total_budget=2200.0,
                city_id=3,
                city_name="Rome"
            )
            db.add(t_completed)
            db.flush()

        stop1 = db.query(TripStop).filter(TripStop.trip_id == t_upcoming.id, TripStop.city_id == 1).first()
        if not stop1:
            stop1 = TripStop(
                trip_id=t_upcoming.id,
                city_id=1,
                stop_order=1,
                arrival_date=t_upcoming.start_date,
                departure_date=t_upcoming.start_date + timedelta(days=6),
                stay_cost=1200.0
            )
            db.add(stop1)
            db.flush()

            ta1 = TripActivity(
                trip_stop_id=stop1.id,
                activity_id=1,
                order_index=1,
                scheduled_date=stop1.arrival_date + timedelta(days=1),
                cost_override=65.0,
                notes="Sunset ticket included."
            )
            db.add(ta1)

        stop2 = db.query(TripStop).filter(TripStop.trip_id == t_upcoming.id, TripStop.city_id == 3).first()
        if not stop2:
            stop2 = TripStop(
                trip_id=t_upcoming.id,
                city_id=3,
                stop_order=2,
                arrival_date=t_upcoming.start_date + timedelta(days=7),
                departure_date=t_upcoming.end_date,
                stay_cost=950.0
            )
            db.add(stop2)

        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
