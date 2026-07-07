from app.services.gemini import build_structured_prompt, parse_structured_response


def test_structured_prompt_requests_json_and_language():
    prompt = build_structured_prompt("te")
    assert "JSON" in prompt
    assert "is_medicine" in prompt
    assert "te" in prompt


def test_parse_structured_response_reads_fenced_json():
    raw = '''Here you go:
```json
{"is_medicine": true, "drug_name": "Paracetamol", "confidence": 0.9,
 "formatted_text": "**About:** pain relief", "plain_text": "About: pain relief"}
```'''
    out = parse_structured_response(raw)
    assert out["is_medicine"] is True
    assert out["drug_name"] == "Paracetamol"
    assert out["confidence"] == 0.9
    assert "pain relief" in out["plain_text"]


def test_parse_structured_response_bad_json_returns_safe_default():
    out = parse_structured_response("not json at all")
    assert out["is_medicine"] is False
    assert out["drug_name"] == ""
    assert out["confidence"] == 0.0
