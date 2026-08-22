from app.db.session import SessionLocal, engine, Base
from app.models.city import City
from app.models.user import User
from app.models.trip import Trip
from app.models.activity import Activity
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
            },
            {
                "id": 4,
                "name": "New York City",
                "country": "USA",
                "region": "Americas",
                "cost_index": 3.0,
                "popularity_rating": 4.8,
                "description": "Global hub of culture, finance, Broadway shows, and Central Park.",
                "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600",
                "banner_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200",
                "is_featured": True
            }
        ]

        for city_item in cities_data:
            existing = db.query(City).filter(City.id == city_item["id"]).first()
            if not existing:
                db.add(City(**city_item))

        db.flush()

        activities_data = [
            {"city_id": 2, "name": "Senso-ji Temple & Asakusa Walking Tour", "category": "Culture", "estimated_cost": 25.0, "duration_minutes": 120, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400"},
            {"city_id": 2, "name": "Tsukiji Outer Market Food Tasting", "category": "Food", "estimated_cost": 45.0, "duration_minutes": 90, "rating": 4.8, "image_url": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400"},
            {"city_id": 2, "name": "Shibuya Crossing & Harajuku Youth Culture Walk", "category": "Sightseeing", "estimated_cost": 15.0, "duration_minutes": 150, "rating": 4.8, "image_url": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400"},
            {"city_id": 1, "name": "Eiffel Tower Summit Access & Seine River Cruise", "category": "Sightseeing", "estimated_cost": 65.0, "duration_minutes": 180, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400"},
            {"city_id": 3, "name": "Colosseum, Roman Forum & Palatine Hill Priority Access", "category": "Sightseeing", "estimated_cost": 50.0, "duration_minutes": 180, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400"}
        ]

        if db.query(Activity).count() == 0:
            for act in activities_data:
                db.add(Activity(**act))

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

        if db.query(Trip).filter(Trip.user_id == demo_user.id).count() == 0:
            sample_trip1 = Trip(
                user_id=demo_user.id,
                title="European Summer Gateway 2026",
                description="Multi-city tour covering Paris, Rome, and Barcelona.",
                cover_image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
                start_date=date(2026, 7, 1),
                end_date=date(2026, 7, 14),
                total_budget=3500.0,
                city_id=1,
                city_name="Paris"
            )

            sample_trip2 = Trip(
                user_id=demo_user.id,
                title="Asian Culture & Culinary Quest",
                description="Exploring Tokyo and Kyoto across 10 immersive days.",
                cover_image_url="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
                start_date=date(2026, 9, 10),
                end_date=date(2026, 9, 20),
                total_budget=4200.0,
                city_id=2,
                city_name="Tokyo"
            )

            db.add(sample_trip1)
            db.add(sample_trip2)

        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
