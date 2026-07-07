import io
import app.routers.analysis as analysis_router


# ── helpers ──────────────────────────────────────────────────────────────────

def _medicine_agent(drug_name="Paracetamol", formatted="**About:** Paracetamol",
                    plain="About: Paracetamol"):
    """Return a fake run_medicine_analysis coroutine that mimics a medicine hit."""
    async def fake(image_bytes, mime_type, language):
        return {
            "is_medicine": True,
            "drug_name": drug_name,
            "confidence": 0.95,
            "grounded": True,
            "source": "openFDA",
            "formatted_text": formatted,
            "plain_text": plain,
        }
    return fake


def _img():
    return io.BytesIO(b"\xff\xd8\xff\xe0" + b"\x00" * 100)


# ── auth guard ───────────────────────────────────────────────────────────────

def test_analyze_no_auth(client):
    response = client.post("/api/analyze")
    assert response.status_code == 403 or response.status_code == 401


# ── empty listing ─────────────────────────────────────────────────────────────

def test_get_analyses_empty(client, auth_headers):
    response = client.get("/api/analyses", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


# ── successful medicine upload ────────────────────────────────────────────────

def test_analyze_success(client, auth_headers, monkeypatch):
    monkeypatch.setattr(analysis_router, "run_medicine_analysis",
                        _medicine_agent(formatted="**About:** Paracetamol",
                                        plain="About: Paracetamol"))

    response = client.post(
        "/api/analyze",
        headers=auth_headers,
        files={"file": ("medicine.jpg", _img(), "image/jpeg")},
        data={"language": "en"},
    )

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["is_medicine"] is True
    assert data["language"] == "en"
    assert "Paracetamol" in data["formatted_text"]
    assert data["grounded"] is True
    assert data["source"] == "openFDA"
    assert data["drug_name"] == "Paracetamol"


# ── listing after upload ──────────────────────────────────────────────────────

def test_get_analyses_after_upload(client, auth_headers, monkeypatch):
    monkeypatch.setattr(analysis_router, "run_medicine_analysis",
                        _medicine_agent(drug_name="Ibuprofen",
                                        formatted="**About:** Ibuprofen",
                                        plain="About: Ibuprofen"))

    client.post(
        "/api/analyze",
        headers=auth_headers,
        files={"file": ("med.jpg", _img(), "image/jpeg")},
        data={"language": "en"},
    )

    response = client.get("/api/analyses", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1


# ── delete flow ───────────────────────────────────────────────────────────────

def test_delete_analysis(client, auth_headers, monkeypatch):
    monkeypatch.setattr(analysis_router, "run_medicine_analysis",
                        _medicine_agent(formatted="text", plain="text"))

    create_resp = client.post(
        "/api/analyze",
        headers=auth_headers,
        files={"file": ("med.jpg", _img(), "image/jpeg")},
        data={"language": "en"},
    )

    analysis_id = create_resp.json()["id"]
    delete_resp = client.delete(f"/api/analyses/{analysis_id}", headers=auth_headers)
    assert delete_resp.status_code == 204

    get_resp = client.get(f"/api/analyses/{analysis_id}", headers=auth_headers)
    assert get_resp.status_code == 404
