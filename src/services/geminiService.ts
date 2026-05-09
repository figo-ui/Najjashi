// ─── Najjashi Gemini AI Service ───
// Client-side Gemini API integration for smart features:
// recitation coaching tips, contextual dua suggestions, hadith explanations

import { ENV } from '../config/env';

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${ENV.GEMINI_MODEL}:generateContent`;

// ─── Types ───

interface GeminiResponse {
  candidates?: Array<{
    content: { parts: Array<{ text: string }> };
    finishReason: string;
  }>;
  error?: { message: string };
}

export interface RecitationTip {
  tip: string;
  pronunciation: string;
  commonMistake: string;
  practiceAdvice: string;
}

export interface DuaSuggestion {
  dua: string;
  arabic: string;
  translation: string;
  context: string;
  reference: string;
}

export interface HadithExplanation {
  explanation: string;
  lesson: string;
  application: string;
}

// ─── Core API Call ───

async function callGemini(prompt: string, temperature = 0.7): Promise<string> {
  const apiKey = ENV.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const url = `${GEMINI_API_URL}?key=${apiKey}`;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: 2048,
      topP: 0.9,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json() as GeminiResponse;

  if (data.error) {
    throw new Error(data.error.message);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');

  return text;
}

// ─── Recitation Coaching ───

export async function getRecitationTip(
  surahName: string,
  ayahRange: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
): Promise<RecitationTip> {
  const prompt = `You are an Islamic recitation coach. A student at ${difficulty} level is practicing Surah ${surahName}, ayah ${ayahRange}.

Provide a JSON object with these fields:
- "tip": A specific tajweed tip for this passage
- "pronunciation": A tricky word and how to pronounce it correctly
- "commonMistake": The most common mistake reciters make here
- "practiceAdvice": A practice exercise to improve

Only output valid JSON, no markdown.`;

  const response = await callGemini(prompt, 0.5);

  try {
    const cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as RecitationTip;
  } catch {
    return {
      tip: response.slice(0, 200),
      pronunciation: '',
      commonMistake: '',
      practiceAdvice: '',
    };
  }
}

// ─── Contextual Dua Suggestions ───

export async function getDuaSuggestion(
  context: 'after_prayer' | 'morning' | 'evening' | 'before_sleep' | 'before_eating' | 'traveling' | 'anxiety' | 'gratitude' | 'forgiveness',
): Promise<DuaSuggestion> {
  const contextMap: Record<string, string> = {
    after_prayer: 'after completing prayer',
    morning: 'morning adhkar time',
    evening: 'evening adhkar time',
    before_sleep: 'before going to sleep',
    before_eating: 'before eating a meal',
    traveling: 'while traveling',
    anxiety: 'feeling anxious or worried',
    gratitude: 'expressing gratitude to Allah',
    forgiveness: 'seeking forgiveness (istighfar)',
  };

  const prompt = `You are an Islamic knowledge assistant. Suggest a dua for someone who is ${contextMap[context] || context}.

Provide a JSON object with these fields:
- "dua": Short name of the dua in English
- "arabic": The dua text in Arabic
- "translation": English translation
- "context": When/why this dua is recommended
- "reference": Hadith or Quran reference if known

Only output valid JSON, no markdown.`;

  const response = await callGemini(prompt, 0.6);

  try {
    const cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as DuaSuggestion;
  } catch {
    return {
      dua: response.slice(0, 100),
      arabic: '',
      translation: response.slice(0, 200),
      context: contextMap[context] || context,
      reference: '',
    };
  }
}

// ─── Hadith Explanation ───

export async function getHadithExplanation(
  hadithText: string,
  narrator?: string,
): Promise<HadithExplanation> {
  const narratorInfo = narrator ? ` narrated by ${narrator}` : '';

  const prompt = `You are an Islamic scholar. Explain this hadith${narratorInfo}:

"${hadithText}"

Provide a JSON object with these fields:
- "explanation": Clear explanation of the hadith's meaning (2-3 sentences)
- "lesson": The main lesson or principle we can derive
- "application": How a Muslim can apply this in daily life

Only output valid JSON, no markdown.`;

  const response = await callGemini(prompt, 0.5);

  try {
    const cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as HadithExplanation;
  } catch {
    return {
      explanation: response.slice(0, 300),
      lesson: '',
      application: '',
    };
  }
}

// ─── Smart Greeting ───

export async function getSmartGreeting(
  timeOfDay: 'morning' | 'afternoon' | 'evening',
  spiritualLevel: number,
  userName?: string,
): Promise<string> {
  const name = userName ? ` ${userName}` : '';
  const levelDesc = spiritualLevel >= 4 ? 'devoted' : spiritualLevel >= 2 ? 'growing' : 'beginner';

  const prompt = `Generate a short (1-2 sentence) warm Islamic greeting for a ${levelDesc} Muslim${name} in the ${timeOfDay}.
Include a relevant Quran verse reference or short dua.
Be encouraging but not preachy. No JSON, just the greeting text.`;

  return callGemini(prompt, 0.8);
}

// ─── Weekly Insight ───

export async function getWeeklyInsight(
  completionRate: number,
  spiritualLevel: number,
  strugglingArea?: string,
): Promise<string> {
  const struggle = strugglingArea ? ` They struggle most with ${strugglingArea}.` : '';

  const prompt = `A Muslim has a ${(completionRate * 100).toFixed(0)}% prayer completion rate this week and is at spiritual level ${spiritualLevel}.${struggle}

Write a 2-3 sentence personalized encouragement that:
1. Acknowledges their effort
2. Gives one specific, actionable suggestion
3. Ends with a relevant Quran/Hadith reference

No JSON, just the insight text.`;

  return callGemini(prompt, 0.7);
}
