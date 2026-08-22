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

def test_screen7_get_profile_page(auth_headers):
    res = client.get("/api/profile", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    
    assert "user" in data
    assert "preplanned_trips" in data
    assert "previous_trips" in data
    assert data["user"]["username"] == "demo_traveler"
    assert len(data["preplanned_trips"]) > 0
    assert len(data["previous_trips"]) > 0

def test_screen7_update_profile_info(auth_headers):
    payload = {
        "first_name": "Meet",
        "last_name": "Kotecha Updated",
        "city": "Tokyo",
        "country": "Japan",
        "additional_info": "World traveler & itinerary designer."
    }
    
    res = client.put("/api/profile", json=payload, headers=auth_headers)
    assert res.status_code == 200
    updated_user = res.json()
    assert updated_user["last_name"] == "Kotecha Updated"
    assert updated_user["city"] == "Tokyo"
    assert updated_user["additional_info"] == "World traveler & itinerary designer."

    me_res = client.get("/api/auth/me", headers=auth_headers)
    assert me_res.status_code == 200
    assert me_res.json()["last_name"] == "Kotecha Updated"
