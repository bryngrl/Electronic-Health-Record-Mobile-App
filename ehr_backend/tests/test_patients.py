import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_create_patient():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        patient_data = {
            "first_name": "John",
            "last_name": "Doe",
            "age": 30,
            "sex": "Male",
            "admission_date": "2024-03-20",
            "user_id": 1
        }
        response = await ac.post("/patients/", json=patient_data)
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "John"
    assert "patient_id" in data

@pytest.mark.asyncio
async def test_list_patients():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/patients/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
