from app.services.guardrails import (
    DOCTOR_DISCLAIMER,
    is_medicine_result,
    apply_output_guardrails,
)


def test_is_medicine_true_when_flag_set_and_confident():
    vision = {"is_medicine": True, "confidence": 0.8}
    assert is_medicine_result(vision) is True


def test_is_medicine_false_when_low_confidence():
    vision = {"is_medicine": True, "confidence": 0.2}
    assert is_medicine_result(vision) is False


def test_is_medicine_false_when_flag_false():
    vision = {"is_medicine": False, "confidence": 0.9}
    assert is_medicine_result(vision) is False


def test_output_guardrails_append_disclaimer_once():
    report = {"formatted_text": "Take as directed.", "plain_text": "Take as directed."}
    out = apply_output_guardrails(report)
    assert DOCTOR_DISCLAIMER in out["formatted_text"]
    assert DOCTOR_DISCLAIMER in out["plain_text"]
    out2 = apply_output_guardrails(out)
    assert out2["formatted_text"].count(DOCTOR_DISCLAIMER) == 1
