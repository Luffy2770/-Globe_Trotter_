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
        raw_destinations = [
            # Europe
            ("Paris", "France", "Europe", 2.5, 4.9, "City of Light featuring Eiffel Tower, Louvre, and cafes.", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800"),
            ("Rome", "Italy", "Europe", 2.1, 4.8, "Eternal City featuring the ancient Colosseum and Vatican.", "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800"),
            ("London", "UK", "Europe", 2.7, 4.8, "Big Ben, Tower Bridge, and royal palaces.", "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800"),
            ("Barcelona", "Spain", "Europe", 2.2, 4.7, "Gaudi architecture, Sagrada Familia, and Mediterranean beaches.", "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800"),
            ("Amsterdam", "Netherlands", "Europe", 2.4, 4.8, "Historic canal system, Rijksmuseum, and Van Gogh art.", "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800"),
            ("Vienna", "Austria", "Europe", 2.3, 4.7, "Imperial Habsburg palaces, Opera house, and classical music.", "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800"),
            ("Prague", "Czech Republic", "Europe", 1.9, 4.8, "Charles Bridge, Old Town Square, and Gothic castles.", "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800"),
            ("Venice", "Italy", "Europe", 2.6, 4.8, "Romantic canal gondola rides and St. Mark's Basilica.", "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800"),
            ("Berlin", "Germany", "Europe", 2.0, 4.6, "Brandenburg Gate, Berlin Wall art, and techno culture.", "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800"),
            ("Madrid", "Spain", "Europe", 2.1, 4.7, "Prado Museum art collection and Royal Palace.", "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800"),
            ("Florence", "Italy", "Europe", 2.2, 4.9, "Renaissance masterworks, Uffizi Gallery, and Duomo dome.", "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=800"),
            ("Athens", "Greece", "Europe", 1.8, 4.7, "Acropolis citadel, Parthenon, and ancient Greek history.", "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800"),
            ("Dublin", "Ireland", "Europe", 2.3, 4.6, "Trinity College Library, pub culture, and historic castles.", "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=800"),
            ("Zurich", "Switzerland", "Europe", 3.2, 4.8, "Alpine lake scenery, chocolate making, and luxury watches.", "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800"),

            # Asia
            ("Tokyo", "Japan", "Asia", 2.8, 4.9, "Shibuya Crossing, Senso-ji temple, and neon lights.", "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800"),
            ("Kyoto", "Japan", "Asia", 2.3, 4.9, "Fushimi Inari shrine gates, bamboo groves, and geisha districts.", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800"),
            ("Singapore", "Singapore", "Asia", 2.8, 4.9, "Gardens by the Bay Supertrees and Marina Bay Sands.", "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800"),
            ("Bangkok", "Thailand", "Asia", 1.5, 4.7, "Grand Palace temples, floating markets, and street food.", "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800"),
            ("Bali", "Indonesia", "Asia", 1.6, 4.9, "Ubud rice terraces, Hindu sea temples, and tropical surfing.", "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800"),
            ("Seoul", "South Korea", "Asia", 2.2, 4.8, "Gyeongbokgung Palace, N Seoul Tower, and K-Culture.", "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800"),
            ("Hong Kong", "China", "Asia", 2.7, 4.7, "Victoria Harbour skyline, Peak Tram, and dim sum dining.", "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800"),
            ("Mumbai", "India", "Asia", 1.4, 4.7, "Gateway of India waterfront and Bollywood film capital.", "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800"),
            ("Delhi", "India", "Asia", 1.3, 4.6, "Red Fort, Qutub Minar, and Taj Mahal gateway.", "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800"),

            # Americas
            ("New York", "USA", "Americas", 3.0, 4.9, "Statue of Liberty, Times Square, and Central Park.", "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800"),
            ("San Francisco", "USA", "Americas", 3.1, 4.8, "Golden Gate Bridge, cable cars, and Alcatraz Island.", "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800"),
            ("Los Angeles", "USA", "Americas", 2.9, 4.7, "Hollywood Sign, Santa Monica Pier, and beaches.", "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800"),
            ("Vancouver", "Canada", "Americas", 2.6, 4.8, "Stanley Park seawall and Pacific coastal mountains.", "https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800"),
            ("Rio de Janeiro", "Brazil", "Americas", 1.8, 4.8, "Christ the Redeemer statue and Copacabana beach.", "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800"),
            ("Cusco", "Peru", "Americas", 1.5, 4.9, "Machu Picchu citadel and Sacred Valley of the Incas.", "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800"),

            # Middle East
            ("Dubai", "UAE", "Middle East", 2.9, 4.8, "Burj Khalifa, Palm Jumeirah, and desert safaris.", "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800"),
            ("Abu Dhabi", "UAE", "Middle East", 2.8, 4.8, "Sheikh Zayed Grand Mosque and Louvre Abu Dhabi.", "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800"),
            ("Istanbul", "Turkey", "Middle East", 1.7, 4.9, "Hagia Sophia, Blue Mosque, and Grand Bazaar.", "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800"),

            # Africa
            ("Cairo", "Egypt", "Africa", 1.5, 4.6, "Great Pyramids of Giza, Sphinx, and Nile River.", "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800"),
            ("Cape Town", "South Africa", "Africa", 1.8, 4.9, "Table Mountain cableway and Cape Peninsula.", "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800"),

            # Oceania
            ("Sydney", "Australia", "Oceania", 2.6, 4.8, "Sydney Opera House, Harbour Bridge, and Bondi Beach.", "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800"),
            ("Auckland", "New Zealand", "Oceania", 2.4, 4.7, "Sky Tower skyline and Hobbiton movie set gateway.", "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800")
        ]

        for i, (name, country, region, cost, rating, desc, img) in enumerate(raw_destinations, 1):
            city_obj = db.query(City).filter(City.id == i).first()
            if not city_obj:
                city_obj = City(id=i)
                db.add(city_obj)
            
            city_obj.name = name
            city_obj.country = country
            city_obj.region = region
            city_obj.cost_index = cost
            city_obj.popularity_rating = rating
            city_obj.description = desc
            city_obj.image_url = img
            city_obj.is_featured = True

        db.flush()

        activities_data = [
            {"id": 1, "city_id": 1, "name": "Eiffel Tower Summit & Seine Cruise", "category": "Sightseeing", "estimated_cost": 65.0, "duration_minutes": 180, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400"},
            {"id": 2, "city_id": 1, "name": "Louvre Museum Priority Entry", "category": "Culture", "estimated_cost": 40.0, "duration_minutes": 180, "rating": 4.8, "image_url": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400"},
            {"id": 3, "city_id": 15, "name": "Senso-ji Temple & Asakusa Walk", "category": "Culture", "estimated_cost": 25.0, "duration_minutes": 120, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400"},
            {"id": 4, "city_id": 15, "name": "Paragliding over Mount Fuji foothills", "category": "Adventure", "estimated_cost": 150.0, "duration_minutes": 240, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400"},
            {"id": 5, "city_id": 2, "name": "Colosseum & Ancient Forum Tour", "category": "Sightseeing", "estimated_cost": 50.0, "duration_minutes": 180, "rating": 4.8, "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400"},
            {"id": 6, "city_id": 24, "name": "Statue of Liberty Cruise", "category": "Sightseeing", "estimated_cost": 45.0, "duration_minutes": 210, "rating": 4.8, "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400"},
            {"id": 7, "city_id": 3, "name": "Tower of London & Crown Jewels", "category": "History", "estimated_cost": 35.0, "duration_minutes": 150, "rating": 4.7, "image_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400"},
            {"id": 8, "city_id": 30, "name": "Burj Khalifa Observation Deck", "category": "Sightseeing", "estimated_cost": 75.0, "duration_minutes": 120, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400"},
            {"id": 9, "city_id": 4, "name": "Sagrada Familia Guided Tour", "category": "Culture", "estimated_cost": 48.0, "duration_minutes": 120, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400"},
            {"id": 10, "city_id": 33, "name": "Great Pyramids of Giza Tour", "category": "History", "estimated_cost": 30.0, "duration_minutes": 240, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400"}
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
                email="demo@tripyfy.com",
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
                city_id=15,
                city_name="Tokyo"
            )
            db.add(t_ongoing)
            db.flush()

        t_completed = db.query(Trip).filter(Trip.user_id == demo_user.id, Trip.title == "Italian Renaissance Discovery").first()
        if not t_completed:
            t_completed = Trip(
                user_id=demo_user.id,
                title="Italian Renaissance Discovery",
                description="Completed vacation exploring Rome.",
                cover_image_url="https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
                start_date=today - timedelta(days=60),
                end_date=today - timedelta(days=50),
                total_budget=2200.0,
                city_id=2,
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

        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
