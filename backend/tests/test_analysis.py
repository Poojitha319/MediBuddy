from unittest.mock import patch, AsyncMock


def test_analyze_no_auth(client):
    response = client.post("/api/analyze")
    assert response.status_code == 403 or response.status_code == 401


def test_get_analyses_empty(client, auth_headers):
    response = client.get("/api/analyses", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


@patch("app.routers.analysis.analyze_medicine_image")
def test_analyze_success(mock_gemini, client, auth_headers):
    mock_gemini.return_value = {
        "formatted_text": "**About:** Paracetamol",
        "plain_text": "About: Paracetamol",
        "raw": "raw response text",
    }

    with open("tests/test_image.jpg", "wb") as f:
        f.write(b"\xff\xd8\xff\xe0" + b"\x00" * 100)

    with open("tests/test_image.jpg", "rb") as f:
        response = client.post(
            "/api/analyze",
            headers=auth_headers,
            files={"file": ("medicine.jpg", f, "image/jpeg")},
            data={"language": "en"},
        )

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["language"] == "en"
    assert "Paracetamol" in data["formatted_text"]


@patch("app.routers.analysis.analyze_medicine_image")
def test_get_analyses_after_upload(mock_gemini, client, auth_headers):
    mock_gemini.return_value = {
        "formatted_text": "**About:** Ibuprofen",
        "plain_text": "About: Ibuprofen",
        "raw": "raw response",
    }

    with open("tests/test_image.jpg", "wb") as f:
        f.write(b"\xff\xd8\xff\xe0" + b"\x00" * 100)

    with open("tests/test_image.jpg", "rb") as f:
        client.post(
            "/api/analyze",
            headers=auth_headers,
            files={"file": ("med.jpg", f, "image/jpeg")},
            data={"language": "en"},
        )

    response = client.get("/api/analyses", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1


@patch("app.routers.analysis.analyze_medicine_image")
def test_delete_analysis(mock_gemini, client, auth_headers):
    mock_gemini.return_value = {
        "formatted_text": "text",
        "plain_text": "text",
        "raw": "raw",
    }

    with open("tests/test_image.jpg", "wb") as f:
        f.write(b"\xff\xd8\xff\xe0" + b"\x00" * 100)

    with open("tests/test_image.jpg", "rb") as f:
        create_resp = client.post(
            "/api/analyze",
            headers=auth_headers,
            files={"file": ("med.jpg", f, "image/jpeg")},
            data={"language": "en"},
        )

    analysis_id = create_resp.json()["id"]
    delete_resp = client.delete(f"/api/analyses/{analysis_id}", headers=auth_headers)
    assert delete_resp.status_code == 204

    get_resp = client.get(f"/api/analyses/{analysis_id}", headers=auth_headers)
    assert get_resp.status_code == 404
