const GEMINI_API_KEY = 'AIzaSyCsXUu2CxK7ZnPbfaugJQqQA1ROjDpPHiU'
const GEMINI_MODEL = 'gemini-1.5-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1] || reader.result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function analyzeMedicineImage(imageFile, language = 'en') {
  if (!GEMINI_API_KEY) throw new Error('Missing Gemini API key.')
  if (!(imageFile instanceof File)) throw new Error('Invalid file type.')

  const base64Image = await fileToBase64(imageFile)

  const prompt = `
You are provided an image of a medicine package. Extract all visible information and generate a concise summary.

Respond in the user's preferred language: **${language}**.

Use the format below. Avoid repetition. Only fabricate info when allowed.

---

About the Medicine:
Summarize main ingredients or purpose.

Form & Packaging Type:
State form (tablet, syrup, etc.) and packaging.

Usage Instructions:
Copy if visible; else say "Use as directed by a healthcare provider."

Possible Side Effects:
Use visible info or common ones for this type.

Recommended Age Group:
Use visible info or infer responsibly.

Expiry Information:
Only clearly visible expiry like "EXP: Nov 2026."

Primary Purpose:
Summarize intended medical use.

Useful For:
List people or age groups it's meant for.

Treats:
List relevant symptoms or conditions.

Storage Instructions:
Use visible info or say "Store in a cool, dry place."

Warnings / Precautions:
Visible warnings or standard safety notes.

Prescription Required:
Only state this if clearly visible.

Manufacturer Information:
Company name & location (only if visible).

---
Return the above content in:
1. Well-formatted markdown (for screen display)
2. Plain, readable summary (for voice assistant)
  `

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Image
            }
          }
        ]
      }
    ]
  }

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  })

  const result = await response.json()
  if (result.error) {
    throw new Error(result.error.message || 'Gemini API error')
  }

  const fullText =
    result?.candidates?.[0]?.content?.parts?.[0]?.text ||
    result?.candidates?.[0]?.content?.text
  if (!fullText) throw new Error('No result text from Gemini.')

  // Optional: Extract a plain-text version for voice playback
  const plainText = fullText
    .replace(/(?:^|\n)([A-Za-z ]+):\s*/g, '\n\n$1:\n') // Clean headings
    .replace(/\*\*/g, '') // Remove markdown bold if present

  return {
    formattedText: fullText,
    plainText,
    raw: result
  }
}
