import pytest
import app.services.agent_router as agent_router


@pytest.mark.asyncio
async def test_router_sends_symptoms_to_triage(monkeypatch):
    monkeypatch.setattr(agent_router, "_classify", lambda q, l: "symptom")

    async def fake_triage(q, l):
        return {"answer": "triage says rest", "grounded": False, "source": None,
                "red_flag": False, "agent": "triage"}
    monkeypatch.setattr(agent_router, "run_triage", fake_triage)

    out = await agent_router.route("I feel dizzy", "en")
    assert out["route"] == "symptom"
    assert out["agent"] == "triage"
    assert "rest" in out["answer"]


@pytest.mark.asyncio
async def test_router_sends_medicine_to_ask(monkeypatch):
    monkeypatch.setattr(agent_router, "_classify", lambda q, l: "medicine")

    async def fake_ask(q, l):
        return {"answer": "paracetamol is for pain", "grounded": True, "source": "openFDA"}
    monkeypatch.setattr(agent_router, "run_ask", fake_ask)

    out = await agent_router.route("what is paracetamol", "en")
    assert out["route"] == "medicine"
    assert out["agent"] == "medicine"
    assert out["grounded"] is True


@pytest.mark.asyncio
async def test_router_general_question_uses_ask(monkeypatch):
    monkeypatch.setattr(agent_router, "_classify", lambda q, l: "general")

    async def fake_ask(q, l):
        return {"answer": "hello there", "grounded": False, "source": None}
    monkeypatch.setattr(agent_router, "run_ask", fake_ask)

    out = await agent_router.route("hi", "en")
    assert out["route"] == "general"
    assert out["agent"] == "general"


def test_classify_falls_back_to_general_on_unknown_label(monkeypatch):
    class FakeResp:
        text = "banana"

    class FakeModel:
        def generate_content(self, prompt):
            return FakeResp()

    monkeypatch.setattr(agent_router, "model", FakeModel())
    assert agent_router._classify("weird input", "en") == "general"
