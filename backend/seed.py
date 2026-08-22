from app.db.session import SessionLocal, engine, Base
from app.models.city import City
from app.models.user import User
from app.models.trip import Trip
from app.models.activity import Activity
from app.models.trip_stop import TripStop
from app.models.trip_activity import TripActivity
from app.core.security import get_password_hash
from datetime import date

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
            {"id": 4, "city_id": 2, "name": "Tsukiji Food Tasting", "category": "Food", "estimated_cost": 45.0, "duration_minutes": 90, "rating": 4.8, "image_url": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400"}
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

        sample_trip1 = db.query(Trip).filter(Trip.user_id == demo_user.id).first()
        if not sample_trip1:
            sample_trip1 = Trip(
                user_id=demo_user.id,
                title="European Summer Gateway 2026",
                description="Multi-city tour covering Paris and Rome.",
                cover_image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
                start_date=date(2026, 7, 1),
                end_date=date(2026, 7, 14),
                total_budget=3500.0,
                city_id=1,
                city_name="Paris"
            )
            db.add(sample_trip1)
            db.flush()

        stop1 = db.query(TripStop).filter(TripStop.trip_id == sample_trip1.id, TripStop.stop_order == 1).first()
        if not stop1:
            stop1 = TripStop(
                trip_id=sample_trip1.id,
                city_id=1,
                stop_order=1,
                arrival_date=date(2026, 7, 1),
                departure_date=date(2026, 7, 7),
                stay_cost=1200.0
            )
            db.add(stop1)
            db.flush()

            ta1 = TripActivity(
                trip_stop_id=stop1.id,
                activity_id=1,
                order_index=1,
                scheduled_date=date(2026, 7, 2),
                cost_override=65.0,
                notes="Sunset ticket included."
            )
            ta2 = TripActivity(
                trip_stop_id=stop1.id,
                activity_id=2,
                order_index=2,
                scheduled_date=date(2026, 7, 3),
                notes="Guided highlights tour."
            )
            db.add(ta1)
            db.add(ta2)

        stop2 = db.query(TripStop).filter(TripStop.trip_id == sample_trip1.id, TripStop.stop_order == 2).first()
        if not stop2:
            stop2 = TripStop(
                trip_id=sample_trip1.id,
                city_id=3,
                stop_order=2,
                arrival_date=date(2026, 7, 7),
                departure_date=date(2026, 7, 14),
                stay_cost=950.0
            )
            db.add(stop2)

        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
