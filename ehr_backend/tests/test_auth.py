import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_root():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "EHR backend is running"}

@pytest.mark.asyncio
async def test_login_invalid_credentials():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/auth/login",
            json={"email": "wrong@example.com", "password": "wrongpassword"}
        )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"

@pytest.mark.asyncio
async def test_login_success():
    # Note: This assumes the database has been initialized with the default users
    # as seen in app/main.py: init_db()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/auth/login",
            json={"email": "nurse@example.com", "password": "password"}
        )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "nurse"
