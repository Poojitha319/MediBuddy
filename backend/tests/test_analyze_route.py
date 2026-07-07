import io
import app.routers.analysis as analysis_router


def _img():
    return io.BytesIO(b"fake-bytes")


def test_analyze_returns_grounded_report(client, auth_headers, monkeypatch):
    async def fake_agent(image_bytes, mime, language):
        return {
            "is_medicine": True, "drug_name": "Paracetamol", "confidence": 0.9,
            "grounded": True, "source": "openFDA",
            "formatted_text": "report", "plain_text": "report",
        }
    monkeypatch.setattr(analysis_router, "run_medicine_analysis", fake_agent)

    resp = client.post(
        "/api/analyze",
        headers=auth_headers,
        files={"file": ("m.jpg", _img(), "image/jpeg")},
        data={"language": "en"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["grounded"] is True
    assert body["source"] == "openFDA"
    assert body["drug_name"] == "Paracetamol"


def test_analyze_non_medicine_is_not_saved(client, auth_headers, monkeypatch):
    async def fake_agent(image_bytes, mime, language):
        return {
            "is_medicine": False, "drug_name": "", "confidence": 0.9,
            "grounded": False, "source": None,
            "formatted_text": "not a medicine", "plain_text": "not a medicine",
        }
    monkeypatch.setattr(analysis_router, "run_medicine_analysis", fake_agent)

    resp = client.post(
        "/api/analyze",
        headers=auth_headers,
        files={"file": ("m.jpg", _img(), "image/jpeg")},
        data={"language": "en"},
    )
    assert resp.status_code == 200
    assert resp.json()["is_medicine"] is False
    listing = client.get("/api/analyses", headers=auth_headers).json()
    assert listing == []
