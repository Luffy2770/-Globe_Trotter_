from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_demo_login_flow():
    response = client.post("/api/auth/demo-login")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "demo_traveler"

def test_user_registration_screen2_flow():
    reg_payload = {
        "username": "meetkotecha",
        "email": "meet@example.com",
        "password": "SecurePassword123@",
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
    assert data["user"]["username"] == "meetkotecha"

def test_duplicate_registration_prevention():
    reg_payload = {
        "username": "duplicate_user",
        "email": "dup@example.com",
        "password": "SecurePassword123@"
    }

    res1 = client.post("/api/auth/register", json=reg_payload)
    assert res1.status_code == 201

    res2 = client.post("/api/auth/register", json=reg_payload)
    assert res2.status_code == 400

def test_user_login_screen1_flow():
    reg_payload = {
        "username": "rudra_traveler",
        "email": "rudra@globetrotter.com",
        "password": "MySecurePassword123@",
        "first_name": "Rudra",
        "last_name": "Patel"
    }
    client.post("/api/auth/register", json=reg_payload)

    login_user_res = client.post("/api/auth/login", json={
        "username_or_email": "rudra_traveler",
        "password": "MySecurePassword123@"
    })
    assert login_user_res.status_code == 200
    assert "access_token" in login_user_res.json()

def test_get_current_user_profile():
    reg_payload = {
        "username": "arctic_ape",
        "email": "arctic@example.com",
        "password": "SecurePassword123@",
        "first_name": "Arctic",
        "last_name": "Ape"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["username"] == "arctic_ape"
