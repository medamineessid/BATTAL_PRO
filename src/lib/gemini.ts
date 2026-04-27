const API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_2,
].filter(Boolean);

const MODEL = 'gemini-2.0-flash';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

let currentKeyIndex = 0;

async function callGemini(prompt: string, keyIndex: number): Promise<string> {
  const key = API_KEYS[keyIndex];
  const res = await fetch(`${BASE_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg: string = err?.error?.message ?? `Gemini error: ${res.status}`;
    // Quota or rate limit — try next key
    if ((res.status === 429 || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) && keyIndex + 1 < API_KEYS.length) {
      currentKeyIndex = keyIndex + 1;
      return callGemini(prompt, currentKeyIndex);
    }
    throw new Error(msg);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response';
}

export async function geminiChat(prompt: string): Promise<string> {
  return callGemini(prompt, currentKeyIndex);
}

export async function generateCoverLetter(jobTitle: string, company: string, skills: string[], summary: string): Promise<string> {
  return geminiChat(
    `Write a professional, concise cover letter (3 short paragraphs) for a ${jobTitle} position at ${company}.
Candidate summary: ${summary}
Key skills: ${skills.join(', ')}
Tone: confident, professional. No placeholders. End with "Sincerely,".`
  );
}

export async function generateProfileSummary(firstName: string, skills: string[], experience: string): Promise<string> {
  return geminiChat(
    `Write a compelling 2-3 sentence professional summary for a CV.
Name: ${firstName}
Top skills: ${skills.join(', ')}
Experience: ${experience}
Make it punchy, first-person, ATS-friendly.`
  );
}

export async function explainJobMatch(jobTitle: string, company: string, score: number, matchedSkills: string[], missingSkills: string[]): Promise<string> {
  return geminiChat(
    `Explain in 2-3 sentences why a candidate is a ${score}% match for a ${jobTitle} role at ${company}.
Matched skills: ${matchedSkills.join(', ') || 'none'}.
Missing skills: ${missingSkills.join(', ') || 'none'}.
Be encouraging and specific.`
  );
}
