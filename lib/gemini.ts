import { GoogleGenAI } from '@google/genai';
import { Idea } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY! });

const MODEL = 'gemini-2.0-flash';

const SYSTEM_CONTEXT = `You are an expert content strategist for a financial literacy educator targeting immigrant communities in the United States.
Your role is to help create educational, culturally sensitive, and actionable financial content.

Focus on:
- Practical, accessible advice for people new to the US financial system
- Cultural sensitivity across diverse immigrant experiences
- Breaking down complex concepts into simple, relatable terms
- Real immigrant scenarios: remittances, building credit from scratch, US banking, taxes for non-citizens, ITIN, dual taxation, sending money home
- Multilingual audience awareness (many viewers may be watching in a second language)

Always provide specific, actionable talking points a content creator can use directly in a video, podcast, or post.`;

export async function generateSpeakerPoints(idea: Idea): Promise<string[]> {
  const prompt = `${SYSTEM_CONTEXT}

Generate 6 specific speaker points for this content idea:
Title: "${idea.title}"
Theme: ${idea.theme ?? 'financial literacy'}
Description: ${idea.description ?? ''}
Target community: ${idea.community_tags?.join(', ') ?? 'immigrant communities in the US'}
${idea.holiday_link ? `Tied to: ${idea.holiday_link}` : ''}

Return ONLY a valid JSON array of strings — no markdown, no explanation, no extra text.
Example format: ["Point one", "Point two", "Point three"]`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  const text = response.text?.trim() ?? '';

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as string[];
  } catch {
    return text
      .split('\n')
      .map(line => line.replace(/^[-•*\d.]+\s*/, '').trim())
      .filter(Boolean);
  }
}

export async function sendChat(
  ideaContext: Idea,
  history: Array<{ role: 'user' | 'model'; text: string }>,
  userMessage: string
): Promise<string> {
  const systemPrompt = `${SYSTEM_CONTEXT}

You are helping develop content for this specific idea:
Title: "${ideaContext.title}"
Theme: ${ideaContext.theme ?? 'financial literacy'}
Target community: ${ideaContext.community_tags?.join(', ') ?? 'immigrant communities'}
${ideaContext.description ? `Description: ${ideaContext.description}` : ''}

Help the creator with speaker points, statistics, cultural examples, hooks, and outlines.`;

  const contents = [
    { role: 'user' as const, parts: [{ text: systemPrompt }] },
    { role: 'model' as const, parts: [{ text: `Ready to help develop "${ideaContext.title}". What would you like to work on — talking points, cultural examples, a hook, or a full outline?` }] },
    ...history.map(m => ({
      role: m.role as 'user' | 'model',
      parts: [{ text: m.text }],
    })),
    { role: 'user' as const, parts: [{ text: userMessage }] },
  ];

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: { temperature: 0.8, maxOutputTokens: 1024 },
  });

  return response.text ?? '';
}
