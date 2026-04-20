from app.services.gemini import build_analysis_prompt, parse_gemini_response


def test_build_prompt_default_language():
    prompt = build_analysis_prompt("en")
    assert "About the Medicine" in prompt
    assert "Side Effects" in prompt


def test_build_prompt_with_hindi():
    prompt = build_analysis_prompt("hi")
    assert "hi" in prompt


def test_parse_gemini_response_extracts_text():
    mock_response = {
        "candidates": [
            {
                "content": {
                    "parts": [{"text": "**About the Medicine:**\nParacetamol 500mg\n\n**Usage Instructions:**\nTake one tablet every 6 hours"}]
                }
            }
        ]
    }
    result = parse_gemini_response(mock_response)
    assert "Paracetamol" in result["formatted_text"]
    assert "Paracetamol" in result["plain_text"]
    assert "**" not in result["plain_text"]


def test_parse_gemini_response_empty():
    mock_response = {"candidates": []}
    result = parse_gemini_response(mock_response)
    assert result["formatted_text"] == ""
    assert result["plain_text"] == ""
