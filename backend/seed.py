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

            # Japan (All Major Cities)
            ("Tokyo", "Japan", "Asia", 2.8, 4.9, "Shibuya Crossing, Senso-ji temple, Akihabara, and neon lights.", "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800"),
            ("Kyoto", "Japan", "Asia", 2.3, 4.9, "Fushimi Inari shrine gates, Arashiyama bamboo, and geisha tea houses.", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800"),
            ("Osaka", "Japan", "Asia", 2.2, 4.8, "Dotonbori food district, Osaka Castle, and Universal Studios Japan.", "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800"),
            ("Sapporo", "Japan", "Asia", 2.0, 4.7, "Hokkaido snow festival, ramen alley, and Odori park.", "https://images.unsplash.com/photo-1578637387939-43c525550085?w=800"),
            ("Hiroshima", "Japan", "Asia", 1.9, 4.8, "Peace Memorial Park and Itsukushima Floating Torii shrine.", "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800"),
            ("Nara", "Japan", "Asia", 1.8, 4.8, "Todai-ji Giant Buddha and friendly free-roaming sacred deer park.", "https://images.unsplash.com/photo-1528164344705-47542687990d?w=800"),
            ("Fukuoka", "Japan", "Asia", 1.9, 4.7, "Yatai open-air food stalls, Hakata ramen, and seaside tower.", "https://images.unsplash.com/photo-1578637387939-43c525550085?w=800"),
            ("Nagoya", "Japan", "Asia", 2.0, 4.6, "Nagoya Castle, Toyota Techno Museum, and Atsuta Shrine.", "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800"),
            ("Yokohama", "Japan", "Asia", 2.3, 4.7, "Minato Mirai skyline, Cup Noodle Museum, and Chinatown.", "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800"),

            # Americas (All Major US & American Cities)
            ("New York", "USA", "Americas", 3.0, 4.9, "Statue of Liberty, Times Square, Broadway, and Central Park.", "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800"),
            ("San Francisco", "USA", "Americas", 3.1, 4.8, "Golden Gate Bridge, cable cars, and Alcatraz Island.", "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800"),
            ("Los Angeles", "USA", "Americas", 2.9, 4.7, "Hollywood Walk of Fame, Santa Monica Pier, and Venice Beach.", "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800"),
            ("Chicago", "USA", "Americas", 2.6, 4.8, "Millennium Park Bean statue, Willis Tower skydeck, and deep dish pizza.", "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800"),
            ("Miami", "USA", "Americas", 2.8, 4.8, "South Beach Art Deco district, Little Havana, and Biscayne Bay.", "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=800"),
            ("Las Vegas", "USA", "Americas", 2.7, 4.7, "The Strip resorts, Bellagio fountains, and Fremont Street experience.", "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=800"),
            ("Washington D.C.", "USA", "Americas", 2.5, 4.8, "The White House, National Mall, and Smithsonian Museums.", "https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=800"),
            ("Boston", "USA", "Americas", 2.6, 4.7, "Freedom Trail, Harvard University, and Fenway Park.", "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800"),
            ("Seattle", "USA", "Americas", 2.7, 4.8, "Space Needle, Pike Place Market, and Puget Sound views.", "https://images.unsplash.com/photo-1502175371642-14a743578918?w=800"),
            ("Toronto", "Canada", "Americas", 2.5, 4.7, "CN Tower, Royal Ontario Museum, and waterfront islands.", "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800"),
            ("Montreal", "Canada", "Americas", 2.2, 4.8, "Old Montreal cobblestone streets, Notre-Dame Basilica, and culinary scene.", "https://images.unsplash.com/photo-1519178614-68693b05f61c?w=800"),
            ("Mexico City", "Mexico", "Americas", 1.6, 4.8, "Zocalo square, Frida Kahlo Museum, and ancient Teotihuacan pyramids.", "https://images.unsplash.com/photo-1518659267384-51103b812ae0?w=800"),
            ("Buenos Aires", "Argentina", "Americas", 1.5, 4.8, "Tango dancing in La Boca, Recoleta district, and Argentine steak.", "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800"),

            # Middle East
            ("Dubai", "UAE", "Middle East", 2.9, 4.8, "Burj Khalifa, Palm Jumeirah, and desert safaris.", "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800"),
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
            {"id": 3, "city_id": 7, "name": "Senso-ji Temple & Asakusa Walk", "category": "Culture", "estimated_cost": 25.0, "duration_minutes": 120, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400"},
            {"id": 4, "city_id": 7, "name": "Shibuya Sky Observation Deck", "category": "Sightseeing", "estimated_cost": 30.0, "duration_minutes": 90, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400"},
            {"id": 5, "city_id": 2, "name": "Colosseum & Ancient Forum Tour", "category": "Sightseeing", "estimated_cost": 50.0, "duration_minutes": 180, "rating": 4.8, "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400"},
            {"id": 6, "city_id": 16, "name": "Statue of Liberty & Ellis Island", "category": "Sightseeing", "estimated_cost": 45.0, "duration_minutes": 210, "rating": 4.8, "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400"},
            {"id": 7, "city_id": 29, "name": "Burj Khalifa At The Top Lounge", "category": "Sightseeing", "estimated_cost": 85.0, "duration_minutes": 120, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400"}
        ]

        for act in activities_data:
            existing_act = db.query(Activity).filter(Activity.id == act["id"]).first()
            if not existing_act:
                db.add(Activity(**act))

        db.flush()

        # Seed Luffy User Account
        luffy_user = db.query(User).filter(User.username == "luffy").first()
        if not luffy_user:
            luffy_user = User(
                username="luffy",
                email="luffy@tripyfy.com",
                password_hash=get_password_hash("password123"),
                first_name="Luffy",
                last_name="Monkey",
                city="Tokyo",
                country="Japan",
                photo_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
                additional_info="World traveler exploring iconic cities across the seven seas."
            )
            db.add(luffy_user)
            db.flush()

        today = date.today()

        # Completely NON-OVERLAPPING trip date ranges!
        # Trip 1: Tokyo (Today to Today + 5 Days)
        t1 = db.query(Trip).filter(Trip.user_id == luffy_user.id, Trip.title == "Tokyo Anime & Cultural Expedition").first()
        if not t1:
            t1 = Trip(
                user_id=luffy_user.id,
                title="Tokyo Anime & Cultural Expedition",
                description="Ongoing exploration in Tokyo covering Senso-ji temple and Shibuya Sky.",
                cover_image_url="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
                start_date=today,
                end_date=today + timedelta(days=5),
                total_budget=3200.0,
                city_id=7,
                city_name="Tokyo"
            )
            db.add(t1)
            db.flush()

            stop1 = TripStop(
                trip_id=t1.id,
                city_id=7,
                stop_order=1,
                arrival_date=t1.start_date,
                departure_date=t1.end_date,
                stay_cost=1400.0
            )
            db.add(stop1)
            db.flush()

            ta1 = TripActivity(
                trip_stop_id=stop1.id,
                activity_id=3,
                order_index=1,
                scheduled_date=stop1.arrival_date + timedelta(days=1),
                cost_override=25.0
            )
            db.add(ta1)

        # Trip 2: Paris (Today + 10 Days to Today + 17 Days)
        t2 = db.query(Trip).filter(Trip.user_id == luffy_user.id, Trip.title == "European Renaissance & Grand Tour").first()
        if not t2:
            t2 = Trip(
                user_id=luffy_user.id,
                title="European Renaissance & Grand Tour",
                description="Upcoming summer vacation across Paris and Rome.",
                cover_image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
                start_date=today + timedelta(days=10),
                end_date=today + timedelta(days=17),
                total_budget=4500.0,
                city_id=1,
                city_name="Paris"
            )
            db.add(t2)
            db.flush()

            stop2 = TripStop(
                trip_id=t2.id,
                city_id=1,
                stop_order=1,
                arrival_date=t2.start_date,
                departure_date=t2.end_date,
                stay_cost=1800.0
            )
            db.add(stop2)
            db.flush()

            ta3 = TripActivity(
                trip_stop_id=stop2.id,
                activity_id=1,
                order_index=1,
                scheduled_date=stop2.arrival_date + timedelta(days=1),
                cost_override=65.0
            )
            db.add(ta3)

        # Trip 3: New York (Today - 20 Days to Today - 14 Days)
        t3 = db.query(Trip).filter(Trip.user_id == luffy_user.id, Trip.title == "New York Skyline & Broadway Escape").first()
        if not t3:
            t3 = Trip(
                user_id=luffy_user.id,
                title="New York Skyline & Broadway Escape",
                description="Completed getaway exploring Manhattan and Statue of Liberty.",
                cover_image_url="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
                start_date=today - timedelta(days=20),
                end_date=today - timedelta(days=14),
                total_budget=2800.0,
                city_id=16,
                city_name="New York"
            )
            db.add(t3)
            db.flush()

        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
