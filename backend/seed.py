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
            # Europe (25 cities)
            ("Paris", "France", "Europe", 2.5, 4.9, "City of Light & Eiffel Tower", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600"),
            ("Rome", "Italy", "Europe", 2.1, 4.8, "Colosseum & Vatican City", "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600"),
            ("London", "UK", "Europe", 2.7, 4.8, "Big Ben & Royal Palaces", "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600"),
            ("Barcelona", "Spain", "Europe", 2.2, 4.7, "Sagrada Familia & Beaches", "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600"),
            ("Amsterdam", "Netherlands", "Europe", 2.4, 4.8, "Canals & Van Gogh Museum", "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=600"),
            ("Vienna", "Austria", "Europe", 2.3, 4.7, "Imperial Palaces & Opera", "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600"),
            ("Prague", "Czech Republic", "Europe", 1.9, 4.8, "Gothic Architecture & Castles", "https://images.unsplash.com/photo-1541849546-216549ae216d?w=600"),
            ("Venice", "Italy", "Europe", 2.6, 4.8, "Canal Gondolas & Piazza San Marco", "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=600"),
            ("Berlin", "Germany", "Europe", 2.0, 4.6, "Brandenburg Gate & Street Art", "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600"),
            ("Madrid", "Spain", "Europe", 2.1, 4.7, "Prado Museum & Royal Palace", "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600"),
            ("Florence", "Italy", "Europe", 2.2, 4.9, "Renaissance Art & Duomo", "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=600"),
            ("Athens", "Greece", "Europe", 1.8, 4.7, "Acropolis & Ancient Parthenon", "https://images.unsplash.com/photo-1555993539-1732b0258235?w=600"),
            ("Dublin", "Ireland", "Europe", 2.3, 4.6, "Trinity College & Temple Bar", "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=600"),
            ("Zurich", "Switzerland", "Europe", 3.2, 4.8, "Alpine Lakes & Luxury Watches", "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600"),
            ("Edinburgh", "Scotland", "Europe", 2.3, 4.8, "Edinburgh Castle & Royal Mile", "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600"),
            ("Budapest", "Hungary", "Europe", 1.7, 4.7, "Parliament & Thermal Baths", "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600"),
            ("Lisbon", "Portugal", "Europe", 1.9, 4.8, "Historic Tram 28 & Pastéis", "https://images.unsplash.com/photo-1509839862600-e09c5b52a488?w=600"),
            ("Santorini", "Greece", "Europe", 2.8, 4.9, "White Cycladic Architecture & Sunsets", "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600"),
            ("Dubrovnik", "Croatia", "Europe", 2.2, 4.8, "Medieval City Walls & Adriatic Sea", "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600"),
            ("Reykjavik", "Iceland", "Europe", 2.9, 4.8, "Northern Lights & Blue Lagoon", "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600"),
            ("Stockholm", "Sweden", "Europe", 2.6, 4.7, "Gamla Stan & Archipelagos", "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=600"),
            ("Copenhagen", "Denmark", "Europe", 2.8, 4.7, "Nyhavn Harbor & Tivoli Gardens", "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=600"),
            ("Oslo", "Norway", "Europe", 2.9, 4.6, "Fjords & Viking Ship Museum", "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=600"),
            ("Nice", "France", "Europe", 2.4, 4.7, "French Riviera & Promenade", "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600"),
            ("Seville", "Spain", "Europe", 1.9, 4.8, "Flamenco Dance & Alcazar Palace", "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600"),

            # Asia (25 cities)
            ("Tokyo", "Japan", "Asia", 2.8, 4.9, "Shibuya Crossing & Senso-ji Temple", "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600"),
            ("Kyoto", "Japan", "Asia", 2.3, 4.9, "Fushimi Inari & Golden Pavilion", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600"),
            ("Singapore", "Singapore", "Asia", 2.8, 4.9, "Gardens by the Bay & Marina Bay", "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600"),
            ("Bangkok", "Thailand", "Asia", 1.5, 4.7, "Grand Palace & Floating Markets", "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600"),
            ("Bali", "Indonesia", "Asia", 1.6, 4.9, "Ubud Rice Terraces & Surf Beaches", "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600"),
            ("Seoul", "South Korea", "Asia", 2.2, 4.8, "Gyeongbokgung Palace & K-Pop", "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600"),
            ("Hong Kong", "China", "Asia", 2.7, 4.7, "Victoria Harbour & Peak Tram", "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600"),
            ("Kuala Lumpur", "Malaysia", "Asia", 1.6, 4.6, "Petronas Twin Towers & Batu Caves", "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600"),
            ("Hanoi", "Vietnam", "Asia", 1.3, 4.7, "Ha Long Bay Gateway & Street Food", "https://images.unsplash.com/photo-1528127269322-539801943592?w=600"),
            ("Mumbai", "India", "Asia", 1.4, 4.7, "Gateway of India & Bollywood", "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600"),
            ("Delhi", "India", "Asia", 1.3, 4.6, "Red Fort & Taj Mahal Gateway", "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600"),
            ("Taipei", "Taiwan", "Asia", 1.9, 4.8, "Taipei 101 & Shilin Night Market", "https://images.unsplash.com/photo-1508248467071-086d1400643b?w=600"),
            ("Osaka", "Japan", "Asia", 2.2, 4.8, "Dotonbori Street Food & Osaka Castle", "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=600"),
            ("Chiang Mai", "Thailand", "Asia", 1.2, 4.8, "Mountain Temples & Elephant Sanctuaries", "https://images.unsplash.com/photo-1513415564515-763d91423bdd?w=600"),
            ("Ho Chi Minh City", "Vietnam", "Asia", 1.3, 4.6, "Cu Chi Tunnels & French Colonial Art", "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600"),
            ("Phuket", "Thailand", "Asia", 1.5, 4.7, "Phi Phi Islands & Patong Beach", "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600"),
            ("Jaipur", "India", "Asia", 1.3, 4.8, "Pink City Forts & Palaces", "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600"),
            ("Siem Reap", "Cambodia", "Asia", 1.4, 4.9, "Angkor Wat Temple Complex", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600"),
            ("Manila", "Philippines", "Asia", 1.4, 4.5, "Intramuros Walled City", "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600"),
            ("Shanghai", "China", "Asia", 2.3, 4.7, "The Bund Skyline & Yu Garden", "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab390?w=600"),
            ("Beijing", "China", "Asia", 2.2, 4.8, "Great Wall of China & Forbidden City", "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600"),
            ("Varanasi", "India", "Asia", 1.1, 4.8, "Spiritual Ganges Ghats & Ceremonies", "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600"),
            ("Kathmandu", "Nepal", "Asia", 1.2, 4.7, "Himalayan Basecamp & Durbar Square", "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600"),
            ("Male", "Maldives", "Asia", 3.5, 4.9, "Private Overwater Bungalows", "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600"),
            ("Sapporo", "Japan", "Asia", 2.1, 4.7, "Snow Festival & Hokkaido Skiing", "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600"),

            # Americas (20 cities)
            ("New York", "USA", "Americas", 3.0, 4.9, "Statue of Liberty & Central Park", "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600"),
            ("San Francisco", "USA", "Americas", 3.1, 4.8, "Golden Gate Bridge & Alcatraz", "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600"),
            ("Los Angeles", "USA", "Americas", 2.9, 4.7, "Hollywood Walk of Fame & Beaches", "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=600"),
            ("Vancouver", "Canada", "Americas", 2.6, 4.8, "Stanley Park & Coastal Mountains", "https://images.unsplash.com/photo-1559511260-66a654ae982a?w=600"),
            ("Toronto", "Canada", "Americas", 2.5, 4.7, "CN Tower & Niagara Falls Gateway", "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=600"),
            ("Rio de Janeiro", "Brazil", "Americas", 1.8, 4.8, "Christ the Redeemer & Copacabana", "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600"),
            ("Buenos Aires", "Argentina", "Americas", 1.6, 4.7, "Tango Culture & La Boca", "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=600"),
            ("Cusco", "Peru", "Americas", 1.5, 4.9, "Machu Picchu & Inca Trail", "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600"),
            ("Mexico City", "Mexico", "Americas", 1.6, 4.8, "Frida Kahlo Museum & Teotihuacan", "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?w=600"),
            ("Cancun", "Mexico", "Americas", 2.0, 4.7, "Mayan Riviera & Caribbean Beaches", "https://images.unsplash.com/photo-1510097467424-192d713be8b2?w=600"),

            # Middle East (10 cities)
            ("Dubai", "UAE", "Middle East", 2.9, 4.8, "Burj Khalifa & Desert Safaris", "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600"),
            ("Abu Dhabi", "UAE", "Middle East", 2.8, 4.8, "Sheikh Zayed Grand Mosque", "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600"),
            ("Istanbul", "Turkey", "Middle East", 1.7, 4.9, "Hagia Sophia & Grand Bazaar", "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600"),
            ("Petra", "Jordan", "Middle East", 1.8, 4.9, "Rose Red Ancient Rock City", "https://images.unsplash.com/photo-1579606032821-6c2e3919b5b2?w=600"),
            ("Doha", "Qatar", "Middle East", 2.7, 4.7, "Museum of Islamic Art & Souq Waqif", "https://images.unsplash.com/photo-1578898835028-262193b22b64?w=600"),

            # Africa (10 cities)
            ("Cairo", "Egypt", "Africa", 1.5, 4.6, "Great Pyramids & Egyptian Museum", "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600"),
            ("Cape Town", "South Africa", "Africa", 1.8, 4.9, "Table Mountain & Cape of Good Hope", "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600"),
            ("Marrakech", "Morocco", "Africa", 1.6, 4.8, "Jemaa el-Fnaa & Medina Souks", "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600"),
            ("Nairobi", "Kenya", "Africa", 1.7, 4.7, "Safari National Park & Giraffe Centre", "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600"),
            ("Zanzibar", "Tanzania", "Africa", 1.9, 4.9, "Turquoise Spice Beaches & Stone Town", "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600"),

            # Oceania (10 cities)
            ("Sydney", "Australia", "Oceania", 2.6, 4.8, "Opera House & Bondi Beach", "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600"),
            ("Melbourne", "Australia", "Oceania", 2.5, 4.8, "Coffee Culture & Laneways", "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=600"),
            ("Auckland", "New Zealand", "Oceania", 2.4, 4.7, "City of Sails & Hobbiton Gateway", "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600"),
            ("Queenstown", "New Zealand", "Oceania", 2.7, 4.9, "Adventure Capital & Fjordlands", "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600"),
            ("Fiji", "Fiji", "Oceania", 2.8, 4.9, "Coral Lagoons & Island Resorts", "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600")
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
            {"id": 3, "city_id": 26, "name": "Senso-ji Temple & Asakusa Walk", "category": "Culture", "estimated_cost": 25.0, "duration_minutes": 120, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400"},
            {"id": 4, "city_id": 26, "name": "Paragliding over Mount Fuji foothills", "category": "Adventure", "estimated_cost": 150.0, "duration_minutes": 240, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400"},
            {"id": 5, "city_id": 2, "name": "Colosseum & Ancient Forum Tour", "category": "Sightseeing", "estimated_cost": 50.0, "duration_minutes": 180, "rating": 4.8, "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400"},
            {"id": 6, "city_id": 51, "name": "Statue of Liberty Cruise", "category": "Sightseeing", "estimated_cost": 45.0, "duration_minutes": 210, "rating": 4.8, "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400"},
            {"id": 7, "city_id": 3, "name": "Tower of London & Crown Jewels", "category": "History", "estimated_cost": 35.0, "duration_minutes": 150, "rating": 4.7, "image_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400"},
            {"id": 8, "city_id": 71, "name": "Burj Khalifa Observation Deck", "category": "Sightseeing", "estimated_cost": 75.0, "duration_minutes": 120, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400"},
            {"id": 9, "city_id": 4, "name": "Sagrada Familia Guided Tour", "category": "Culture", "estimated_cost": 48.0, "duration_minutes": 120, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400"},
            {"id": 10, "city_id": 81, "name": "Great Pyramids of Giza Tour", "category": "History", "estimated_cost": 30.0, "duration_minutes": 240, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400"}
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
                city_id=26,
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
