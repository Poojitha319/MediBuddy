import pytest
import app.services.ask_agent as ask_agent
from app.services.guardrails import DOCTOR_DISCLAIMER


@pytest.mark.asyncio
async def test_ask_returns_guarded_answer(monkeypatch):
    monkeypatch.setattr(ask_agent, "_generate", lambda q, l: {"answer": "Drink water and rest.", "drug_name": ""})
    out = await ask_agent.run_ask("I have a mild headache", "en")
    assert "rest" in out["answer"].lower()
    assert DOCTOR_DISCLAIMER in out["answer"]
    assert out["grounded"] is False
    assert out["source"] is None


@pytest.mark.asyncio
async def test_ask_grounds_when_drug_mentioned(monkeypatch):
    monkeypatch.setattr(ask_agent, "_generate", lambda q, l: {"answer": "It helps with pain.", "drug_name": "Paracetamol"})
    monkeypatch.setattr(ask_agent, "lookup_drug_label", lambda name: {
        "source": "openFDA", "purpose": "aches", "dosage": "2 tabs", "warnings": "Liver warning",
    })
    out = await ask_agent.run_ask("what is paracetamol for", "en")
    assert out["grounded"] is True
    assert out["source"] == "openFDA"
    assert "Liver warning" in out["answer"]
    assert DOCTOR_DISCLAIMER in out["answer"]
