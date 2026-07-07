def _create(client, auth_headers, **overrides):
    payload = {"medicine_name": "Paracetamol", "dose": "1 tablet", "times": ["09:00", "21:00"], "language": "en"}
    payload.update(overrides)
    return client.post("/api/reminders", headers=auth_headers, json=payload)


def test_create_reminder(client, auth_headers):
    resp = _create(client, auth_headers)
    assert resp.status_code == 201
    body = resp.json()
    assert body["medicine_name"] == "Paracetamol"
    assert body["times"] == ["09:00", "21:00"]
    assert body["active"] is True
    assert "id" in body


def test_list_reminders(client, auth_headers):
    _create(client, auth_headers)
    _create(client, auth_headers, medicine_name="Ibuprofen")
    resp = client.get("/api/reminders", headers=auth_headers)
    assert resp.status_code == 200
    names = [r["medicine_name"] for r in resp.json()]
    assert "Paracetamol" in names and "Ibuprofen" in names


def test_due_filters_by_time(client, auth_headers):
    _create(client, auth_headers, medicine_name="Morning", times=["09:00"])
    _create(client, auth_headers, medicine_name="Night", times=["21:00"])
    resp = client.get("/api/reminders/due?now=09:00", headers=auth_headers)
    assert resp.status_code == 200
    names = [r["medicine_name"] for r in resp.json()]
    assert names == ["Morning"]


def test_delete_reminder(client, auth_headers):
    rid = _create(client, auth_headers).json()["id"]
    resp = client.delete(f"/api/reminders/{rid}", headers=auth_headers)
    assert resp.status_code == 204
    assert client.get("/api/reminders", headers=auth_headers).json() == []


def test_reminders_require_auth(client):
    assert client.get("/api/reminders").status_code in (401, 403)
