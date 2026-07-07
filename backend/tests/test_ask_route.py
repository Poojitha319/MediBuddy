import app.routers.ask as ask_router


def test_ask_route_returns_answer(client, auth_headers, monkeypatch):
    async def fake_route(question, language):
        return {"answer": "Stay hydrated. Always confirm with your doctor before taking any medicine.",
                "grounded": False, "source": None, "agent": "triage", "route": "symptom"}
    monkeypatch.setattr(ask_router, "route", fake_route)
    resp = client.post("/api/ask", headers=auth_headers, json={"question": "headache?", "language": "en"})
    assert resp.status_code == 200
    body = resp.json()
    assert "hydrated" in body["answer"]
    assert body["agent"] == "triage"
    assert body["route"] == "symptom"


def test_ask_route_rejects_empty(client, auth_headers):
    resp = client.post("/api/ask", headers=auth_headers, json={"question": "   ", "language": "en"})
    assert resp.status_code == 400


def test_ask_route_requires_auth(client):
    resp = client.post("/api/ask", json={"question": "hi", "language": "en"})
    assert resp.status_code in (401, 403)
