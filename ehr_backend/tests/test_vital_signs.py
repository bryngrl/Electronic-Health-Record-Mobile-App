import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_create_vital_signs_normal():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        vs_data = {
            "patient_id": 1,
            "date": "2024-03-20",
            "time": "08:00:00",
            "temperature": "37.0",
            "hr": "75",
            "rr": "16",
            "bp": "120/80",
            "spo2": "98"
        }
        response = await ac.post("/vital-signs/", json=vs_data)
    assert response.status_code == 200
    data = response.json()
    assert "✓ All vital signs within normal range" in data["assessment_alert"]

@pytest.mark.asyncio
async def test_create_vital_signs_critical_fever():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        vs_data = {
            "patient_id": 1,
            "date": "2024-03-20",
            "time": "09:00:00",
            "temperature": "40.0",
            "hr": "110",
            "rr": "22",
            "bp": "130/85",
            "spo2": "96"
        }
        response = await ac.post("/vital-signs/", json=vs_data)
    assert response.status_code == 200
    data = response.json()
    assert "🔴 CRITICAL HYPERTHERMIA" in data["assessment_alert"]
    assert "🟠 Tachycardia" in data["assessment_alert"]
