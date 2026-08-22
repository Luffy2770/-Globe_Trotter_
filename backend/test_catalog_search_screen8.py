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

def test_screen8_search_paragliding():
    res = client.get("/api/catalog/search?q=Paragliding")
    assert res.status_code == 200
    data = res.json()
    assert "results" in data
    assert len(data["results"]) > 0
    assert "Paragliding" in data["results"][0]["name"]
    assert data["results"][0]["city_name"] == "Tokyo"

def test_screen8_filter_by_category_and_max_cost():
    res = client.get("/api/catalog/search?category=Culture&max_cost=50")
    assert res.status_code == 200
    data = res.json()
    for item in data["results"]:
        assert item["category"].lower() == "culture"
        assert item["estimated_cost"] <= 50.0

def test_screen8_group_by_category():
    res = client.get("/api/catalog/search?group_by=category")
    assert res.status_code == 200
    data = res.json()
    assert "grouped_results" in data
    grouped = data["grouped_results"]
    assert len(grouped) > 0

def test_screen8_group_by_city():
    res = client.get("/api/catalog/search?group_by=city")
    assert res.status_code == 200
    data = res.json()
    assert "grouped_results" in data
    grouped = data["grouped_results"]
    assert any("Tokyo" in key for key in grouped.keys())
