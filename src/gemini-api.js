// ===== GEMINI API =====
async function callGemini(prompt) {
  const apiKey = getApiKey();
  const model = getModel();
  const ctx = getPersonalContext();
  if (ctx) prompt = `=== ABOUT ME (use this as background for every response) ===\n${ctx}\n=== END ABOUT ME ===\n\n${prompt}`;

  if (!apiKey) {
    throw new Error('No API key configured. Go to Settings to add your Gemini API key.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 4000, temperature: 0.3 }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from Gemini. Try again.');
  return text;
}
