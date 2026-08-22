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

def test_screen6_grouped_trips_listing(auth_headers):
    res = client.get("/api/trips-listing", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    
    assert "ongoing" in data
    assert "upcoming" in data
    assert "completed" in data
    assert len(data["ongoing"]) > 0
    assert len(data["upcoming"]) > 0
    assert len(data["completed"]) > 0
    assert data["ongoing"][0]["status"] == "ongoing"
    assert data["upcoming"][0]["status"] == "upcoming"
    assert data["completed"][0]["status"] == "completed"

def test_screen6_status_filtering(auth_headers):
    res = client.get("/api/trips-listing?status=ongoing", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["ongoing"]) > 0
    assert len(data["upcoming"]) == 0
    assert len(data["completed"]) == 0

def test_screen6_search_bar(auth_headers):
    res = client.get("/api/trips-listing?q=Italian", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["completed"]) > 0
    assert "Italian" in data["completed"][0]["title"]

def test_screen6_flat_listing_mode(auth_headers):
    res = client.get("/api/trips-listing?group_by_status=false", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "trips" in data
    assert data["total"] >= 3
