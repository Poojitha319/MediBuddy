import pytest
import app.services.medicine_agent as agent
from app.services.guardrails import DOCTOR_DISCLAIMER


@pytest.mark.asyncio
async def test_agent_rejects_non_medicine(monkeypatch):
    monkeypatch.setattr(agent, "_vision", lambda b, m, l: {
        "is_medicine": False, "drug_name": "", "confidence": 0.9,
        "formatted_text": "not a medicine", "plain_text": "not a medicine",
    })
    out = await agent.run_medicine_analysis(b"x", "image/jpeg", "en")
    assert out["is_medicine"] is False
    assert out["grounded"] is False


@pytest.mark.asyncio
async def test_agent_grounds_and_adds_disclaimer(monkeypatch):
    monkeypatch.setattr(agent, "_vision", lambda b, m, l: {
        "is_medicine": True, "drug_name": "Paracetamol", "confidence": 0.9,
        "formatted_text": "About: pain relief", "plain_text": "About: pain relief",
    })
    monkeypatch.setattr(agent, "lookup_drug_label", lambda name: {
        "source": "openFDA", "purpose": "aches", "dosage": "2 tabs / 6h", "warnings": "Liver warning",
    })
    out = await agent.run_medicine_analysis(b"x", "image/jpeg", "en")
    assert out["is_medicine"] is True
    assert out["grounded"] is True
    assert out["source"] == "openFDA"
    assert "Liver warning" in out["formatted_text"]
    assert DOCTOR_DISCLAIMER in out["plain_text"]


@pytest.mark.asyncio
async def test_agent_marks_unverified_on_grounding_miss(monkeypatch):
    monkeypatch.setattr(agent, "_vision", lambda b, m, l: {
        "is_medicine": True, "drug_name": "RareDrug", "confidence": 0.9,
        "formatted_text": "About: something", "plain_text": "About: something",
    })
    monkeypatch.setattr(agent, "lookup_drug_label", lambda name: None)
    out = await agent.run_medicine_analysis(b"x", "image/jpeg", "en")
    assert out["grounded"] is False
    assert out["source"] is None
    assert DOCTOR_DISCLAIMER in out["formatted_text"]
