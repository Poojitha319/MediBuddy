import pytest
import app.services.triage_agent as triage_agent
from app.services.guardrails import DOCTOR_DISCLAIMER


@pytest.mark.asyncio
async def test_triage_flags_urgent_when_red_flag(monkeypatch):
    monkeypatch.setattr(
        triage_agent, "_assess",
        lambda s, l: {"advice": "Chest pain with breathlessness needs urgent care.", "red_flag": True},
    )
    out = await triage_agent.run_triage("I have chest pain and cannot breathe", "en")
    assert out["red_flag"] is True
    assert triage_agent.URGENT_NOTICE in out["answer"]
    assert DOCTOR_DISCLAIMER in out["answer"]
    assert out["agent"] == "triage"
    assert out["grounded"] is False
    assert out["source"] is None


@pytest.mark.asyncio
async def test_triage_normal_symptoms_no_urgent(monkeypatch):
    monkeypatch.setattr(
        triage_agent, "_assess",
        lambda s, l: {"advice": "Rest, drink fluids, and monitor your temperature.", "red_flag": False},
    )
    out = await triage_agent.run_triage("I have a mild cold", "en")
    assert out["red_flag"] is False
    assert triage_agent.URGENT_NOTICE not in out["answer"]
    assert "fluids" in out["answer"].lower()
    assert DOCTOR_DISCLAIMER in out["answer"]
    assert out["agent"] == "triage"
