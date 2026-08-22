import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def auth_headers():
    login_res = client.post("/api/auth/demo-login")
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_cities_search_filter_and_sort():
    res = client.get("/api/cities")
    assert res.status_code == 200
    cities = res.json()
    assert len(cities) > 0

    res_europe = client.get("/api/cities?region=Europe")
    assert res_europe.status_code == 200
    for city in res_europe.json():
        assert city["region"].lower() == "europe"

    res_search = client.get("/api/cities?q=Tokyo")
    assert res_search.status_code == 200
    assert any(c["name"] == "Tokyo" for c in res_search.json())

    res_sort = client.get("/api/cities?sort_by=cost_low")
    assert res_sort.status_code == 200
    sorted_cities = res_sort.json()
    assert sorted_cities[0]["cost_index"] <= sorted_cities[-1]["cost_index"]

def test_dashboard_summary_endpoint(auth_headers):
    res = client.get("/api/dashboard/summary", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    
    assert "banner" in data
    assert "top_regional_selections" in data
    assert "user_trips" in data
    assert len(data["top_regional_selections"]) > 0
    assert len(data["user_trips"]) > 0

def test_plan_new_trip_creation(auth_headers):
    trip_payload = {
        "title": "Weekend Gateway in Tokyo",
        "description": "Short weekend break visiting Shibuya and Shinjuku.",
        "cover_image_url": "https://example.com/tokyo.jpg",
        "start_date": "2026-10-01",
        "end_date": "2026-10-04",
        "total_budget": 1500.0
    }
    
    res = client.post("/api/trips", json=trip_payload, headers=auth_headers)
    assert res.status_code == 201
    created_trip = res.json()
    assert created_trip["title"] == "Weekend Gateway in Tokyo"
    assert created_trip["total_budget"] == 1500.0

    trips_res = client.get("/api/trips", headers=auth_headers)
    assert trips_res.status_code == 200
    assert any(t["id"] == created_trip["id"] for t in trips_res.json())
