from app.db.session import SessionLocal, engine, Base
from app.models.city import City
from app.models.user import User
from app.models.trip import Trip
from app.core.security import get_password_hash
from datetime import date

Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    try:
        if db.query(City).count() > 0:
            return

        cities_data = [
            {
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
                "name": "New York City",
                "country": "USA",
                "region": "Americas",
                "cost_index": 3.0,
                "popularity_rating": 4.8,
                "description": "Global hub of culture, finance, Broadway shows, and Central Park.",
                "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600",
                "banner_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200",
                "is_featured": True
            },
            {
                "name": "Barcelona",
                "country": "Spain",
                "region": "Europe",
                "cost_index": 1.9,
                "popularity_rating": 4.7,
                "description": "Mediterranean coastal city famous for Gaudi architecture and tapas.",
                "image_url": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600",
                "banner_url": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200",
                "is_featured": True
            },
            {
                "name": "Kyoto",
                "country": "Japan",
                "region": "Asia",
                "cost_index": 2.2,
                "popularity_rating": 4.7,
                "description": "Cultural heart of Japan with classical Buddhist temples and bamboo groves.",
                "image_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600",
                "banner_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200",
                "is_featured": False
            },
            {
                "name": "Cape Town",
                "country": "South Africa",
                "region": "Africa",
                "cost_index": 1.5,
                "popularity_rating": 4.6,
                "description": "Stunning port city underneath dramatic Table Mountain.",
                "image_url": "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600",
                "banner_url": "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1200",
                "is_featured": False
            },
            {
                "name": "Sydney",
                "country": "Australia",
                "region": "Oceania",
                "cost_index": 2.6,
                "popularity_rating": 4.7,
                "description": "Iconic harbor city home to the Opera House and Bondi Beach.",
                "image_url": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600",
                "banner_url": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200",
                "is_featured": True
            }
        ]

        for city_item in cities_data:
            db.add(City(**city_item))
            
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

        sample_trip1 = Trip(
            user_id=demo_user.id,
            title="European Summer Gateway 2026",
            description="Multi-city tour covering Paris, Rome, and Barcelona.",
            cover_image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
            start_date=date(2026, 7, 1),
            end_date=date(2026, 7, 14),
            total_budget=3500.0
        )

        sample_trip2 = Trip(
            user_id=demo_user.id,
            title="Asian Culture & Culinary Quest",
            description="Exploring Tokyo and Kyoto across 10 immersive days.",
            cover_image_url="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
            start_date=date(2026, 9, 10),
            end_date=date(2026, 9, 20),
            total_budget=4200.0
        )

        db.add(sample_trip1)
        db.add(sample_trip2)

        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
