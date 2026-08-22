import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import Base, engine

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

def test_user_registration_screen2_flow():
    reg_payload = {
        "username": "meetkotecha",
        "email": "meet@example.com",
        "password": "securepassword123",
        "first_name": "Meet",
        "last_name": "Kotecha",
        "phone_number": "+1-555-0199",
        "photo_url": "https://example.com/photos/meet.jpg",
        "city": "Mumbai",
        "country": "India",
        "additional_info": "Travel enthusiast planning multi-city European trip."
    }
    
    response = client.post("/api/auth/register", json=reg_payload)
    assert response.status_code == 201, response.text
    data = response.json()
    
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    user = data["user"]
    assert user["username"] == "meetkotecha"
    assert user["email"] == "meet@example.com"
    assert user["first_name"] == "Meet"
    assert user["last_name"] == "Kotecha"
    assert user["phone_number"] == "+1-555-0199"
    assert user["city"] == "Mumbai"
    assert user["country"] == "India"
    assert user["additional_info"] == "Travel enthusiast planning multi-city European trip."

def test_duplicate_registration_prevention():
    reg_payload = {
        "username": "duplicate_user",
        "email": "dup@example.com",
        "password": "password123"
    }
    
    res1 = client.post("/api/auth/register", json=reg_payload)
    assert res1.status_code == 201
    
    res2 = client.post("/api/auth/register", json={**reg_payload, "email": "other@example.com"})
    assert res2.status_code == 400
    assert "Username is already taken" in res2.json()["detail"]
    
    res3 = client.post("/api/auth/register", json={**reg_payload, "username": "other_username"})
    assert res3.status_code == 400
    assert "Email address is already registered" in res3.json()["detail"]

def test_user_login_screen1_flow():
    reg_payload = {
        "username": "rudra_traveler",
        "email": "rudra@globetrotter.com",
        "password": "mypassword123",
        "first_name": "Rudra",
        "last_name": "Patel"
    }
    client.post("/api/auth/register", json=reg_payload)
    
    login_user_res = client.post("/api/auth/login", json={
        "username_or_email": "rudra_traveler",
        "password": "mypassword123"
    })
    assert login_user_res.status_code == 200
    assert "access_token" in login_user_res.json()
    
    login_email_res = client.post("/api/auth/login", json={
        "username_or_email": "rudra@globetrotter.com",
        "password": "mypassword123"
    })
    assert login_email_res.status_code == 200
    assert "access_token" in login_email_res.json()
    
    bad_pwd_res = client.post("/api/auth/login", json={
        "username_or_email": "rudra_traveler",
        "password": "wrongpassword"
    })
    assert bad_pwd_res.status_code == 401

def test_get_current_user_profile():
    reg_payload = {
        "username": "arctic_ape",
        "email": "arctic@example.com",
        "password": "password123",
        "first_name": "Arctic",
        "last_name": "Ape"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]
    
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["username"] == "arctic_ape"
