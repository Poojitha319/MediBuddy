import app.services.grounding as grounding


def test_lookup_returns_structured_label_on_hit(monkeypatch):
    fake_api = {
        "results": [{
            "openfda": {"generic_name": ["ACETAMINOPHEN"]},
            "purpose": ["For the temporary relief of minor aches and pains."],
            "dosage_and_administration": ["Adults: 2 tablets every 6 hours."],
            "warnings": ["Liver warning: do not exceed recommended dose."],
        }]
    }
    monkeypatch.setattr(grounding, "_fetch_openfda", lambda name: fake_api)
    result = grounding.lookup_drug_label("paracetamol")
    assert result is not None
    assert result["source"] == "openFDA"
    assert "aches" in result["purpose"]
    assert "6 hours" in result["dosage"]
    assert "Liver" in result["warnings"]


def test_lookup_returns_none_on_miss(monkeypatch):
    monkeypatch.setattr(grounding, "_fetch_openfda", lambda name: {"results": []})
    assert grounding.lookup_drug_label("nonexistentdrugxyz") is None


def test_lookup_returns_none_on_empty_name():
    assert grounding.lookup_drug_label("") is None
