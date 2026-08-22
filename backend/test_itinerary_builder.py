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

@pytest.fixture
def sample_trip_id(auth_headers):
    trips_res = client.get("/api/trips", headers=auth_headers)
    trips = trips_res.json()
    trip = next(t for t in trips if t["title"] == "European Summer Gateway 2026")
    return trip["id"]

def test_relational_itinerary_stops_and_activities(auth_headers, sample_trip_id):
    res = client.get(f"/api/trips/{sample_trip_id}/stops", headers=auth_headers)
    assert res.status_code == 200
    stops = res.json()
    assert len(stops) >= 2
    
    stop1 = stops[0]
    assert stop1["city"]["name"] == "Paris"
    assert len(stop1["activities"]) >= 1
    assert stop1["activities"][0]["activity"]["name"] == "Eiffel Tower Summit & Seine Cruise"

def test_add_stop_and_assign_catalog_activity(auth_headers, sample_trip_id):
    stop_payload = {
        "city_id": 2,
        "arrival_date": "2026-07-15",
        "departure_date": "2026-07-20",
        "stay_cost": 800.0,
        "stop_order": 3
    }
    stop_res = client.post(f"/api/trips/{sample_trip_id}/stops", json=stop_payload, headers=auth_headers)
    assert stop_res.status_code == 201
    created_stop = stop_res.json()
    assert created_stop["city"]["name"] == "Tokyo"
    assert created_stop["stay_cost"] == 800.0

    act_payload = {
        "activity_id": 3,
        "scheduled_date": "2026-07-16",
        "cost_override": 30.0,
        "notes": "Morning visit."
    }
    act_res = client.post(f"/api/trips/{sample_trip_id}/stops/{created_stop['id']}/activities", json=act_payload, headers=auth_headers)
    assert act_res.status_code == 201
    assigned_act = act_res.json()
    assert assigned_act["activity"]["name"] == "Senso-ji Temple & Asakusa Walk"
    assert assigned_act["effective_cost"] == 30.0

def test_dynamic_budget_engine_calculation(auth_headers, sample_trip_id):
    budget_res = client.get(f"/api/trips/{sample_trip_id}/budget", headers=auth_headers)
    assert budget_res.status_code == 200
    budget_data = budget_res.json()
    
    assert budget_data["total_budget_target"] == 3500.0
    assert budget_data["calculated_stay_cost"] == 2150.0
    assert budget_data["calculated_activity_cost"] == 65.0
    assert budget_data["total_calculated_cost"] == 2215.0
    assert budget_data["net_balance"] == 1285.0
    assert budget_data["is_over_budget"] is False
