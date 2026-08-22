import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import Base, engine
from seed import seed_database

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

@pytest.fixture
def auth_headers():
    login_res = client.post("/api/auth/demo-login")
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_screen4_activity_suggestions_by_city_name():
    res = client.get("/api/activities/suggestions?city_name=Tokyo")
    assert res.status_code == 200
    activities = res.json()
    assert len(activities) > 0
    assert any("Senso-ji" in a["name"] for a in activities)

def test_screen4_create_trip_with_place_selection(auth_headers):
    payload = {
        "title": "Tokyo Explorations 2026",
        "description": "Multi-day visit to Tokyo, Japan.",
        "start_date": "2026-10-10",
        "end_date": "2026-10-18",
        "total_budget": 2800.0,
        "city_name": "Tokyo"
    }
    
    res = client.post("/api/trips", json=payload, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Tokyo Explorations 2026"
    assert data["city_name"] == "Tokyo"
