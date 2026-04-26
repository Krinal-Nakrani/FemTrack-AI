const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

export async function generateClinicalSummary(data: {
  avgCycleLength: number;
  cycleVariance: number;
  pcodRiskScore: number;
  pcodTrend: string;
  topSymptoms: string[];
  cyclesTracked: number;
  bmi?: number;
}): Promise<string> {
  if (!GEMINI_API_KEY) {
    return `Patient presents with ${data.cyclesTracked} tracked cycles averaging ${data.avgCycleLength} days (±${data.cycleVariance} days). PCOD risk score is ${data.pcodRiskScore}/100 (${data.pcodTrend}). Primary symptoms include ${data.topSymptoms.join(', ')}. Consider baseline hormonal panel (LH/FSH ratio, testosterone, DHEA-S) if cycle irregularity persists.`;
  }

  const prompt = `You are a clinical AI assistant. Generate a brief, professional gynecologist-ready clinical summary based on this patient data:

- Average cycle length: ${data.avgCycleLength} days
- Cycle variance: ±${data.cycleVariance} days
- PCOD risk score: ${data.pcodRiskScore}/100
- PCOD risk trend: ${data.pcodTrend}
- Top symptoms: ${data.topSymptoms.join(', ')}
- BMI: ${data.bmi || 'Not recorded'}
- Cycles tracked: ${data.cyclesTracked}

Write a 3-4 sentence clinical summary a gynecologist would find useful before a consultation. Use professional medical language. Do not make a diagnosis. End with one suggested clinical investigation based on the data.

Return plain text only. No JSON. No markdown.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 300 },
        }),
      }
    );
    const json = await response.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate summary.';
  } catch {
    return `Patient presents with ${data.cyclesTracked} tracked cycles averaging ${data.avgCycleLength} days. PCOD risk: ${data.pcodRiskScore}/100. Top symptoms: ${data.topSymptoms.join(', ')}. Consider hormonal panel evaluation.`;
  }
}

export async function generateProductRecommendation(ageGroup: string, answers: Record<string, string>): Promise<any> {
  if (!GEMINI_API_KEY) {
    return {
      primary_recommendation: { product: 'Ultra-thin Pad', reason: 'Based on your answers, this is the most comfortable and widely available option for you.', tip: 'Try a few brands to find the one that fits best.' },
      also_consider: [{ product: 'Cloth Pad', reason: 'Eco-friendly and budget-friendly long-term.' }, { product: 'Panty Liner', reason: 'Great for light flow days.' }],
      avoid_for_now: { product: 'Menstrual Disc', reason: 'May be complex for beginners.' },
      monthly_savings_tip: '',
      encouragement: 'You\'re doing great by exploring your options! 💜',
    };
  }

  const prompt = `You are a warm, knowledgeable menstrual health educator helping a user find their ideal period product.

User age group: ${ageGroup}
User answers:
- Flow: ${answers.flow}
- Activity level: ${answers.activity}
- Internal product comfort: ${answers.internal_comfort || "not applicable"}
- Top priority: ${answers.priority}
- Skin sensitivity: ${answers.skin}
- Change frequency preference: ${answers.frequency}
- Monthly budget: ${answers.budget}

STRICT RULES:
- If age group is "under-15", NEVER recommend tampons, menstrual cups, menstrual discs, or period underwear
- If age group is "under-15", keep all language simple, warm, and age-appropriate
- If age group is "15-17", you may suggest tampons or cups but frame them as "when you feel ready"
- If age group is "under-15" or "15-17", do not reference sexual activity in any way

Return ONLY valid JSON:
{
  "primary_recommendation": {
    "product": "<product name>",
    "reason": "<2 sentences warm personal explaining why this matches her>",
    "tip": "<one practical getting-started tip age-appropriate>"
  },
  "also_consider": [
    { "product": "<product name>", "reason": "<1 sentence>" },
    { "product": "<product name>", "reason": "<1 sentence>" }
  ],
  "avoid_for_now": {
    "product": "<product name>",
    "reason": "<gentle non-judgmental 1 sentence>"
  },
  "monthly_savings_tip": "<if reusable product recommended calculate annual savings in INR vs disposables. Empty string otherwise.>",
  "encouragement": "<1 warm sentence celebrating her for exploring her options age-appropriate tone>"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
      }
    );
    const json = await response.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON in response');
  } catch {
    return {
      primary_recommendation: { product: 'Ultra-thin Pad', reason: 'A comfortable, widely available option that works well for most flow types.', tip: 'Start with a medium absorbency and adjust based on your flow.' },
      also_consider: [{ product: 'Cloth Pad', reason: 'Eco-friendly and saves money long-term.' }, { product: 'Overnight Pad', reason: 'Extra protection for heavy flow nights.' }],
      avoid_for_now: { product: 'Menstrual Disc', reason: 'Takes practice — better to try after you\'re comfortable with other options.' },
      monthly_savings_tip: '',
      encouragement: 'Every girl deserves to know her options. You\'re amazing for exploring! 💜',
    };
  }
}

export interface AIExercise {
  title: string;
  description: string;
  duration: string;
  intensity: 'gentle' | 'moderate' | 'active';
  youtube_search: string;
  why: string;
  emoji: string;
}

export async function generateExercisePlan(phase: string, symptoms: string[], pcodScore: number, mood: string): Promise<AIExercise[]> {
  const fallback: AIExercise[] = [
    { title: 'Gentle Yoga Flow', description: 'Restorative poses for your current phase', duration: '10 min', intensity: 'gentle', youtube_search: 'gentle yoga for period cramps', why: 'Helps ease tension and improve blood flow', emoji: '🧘' },
    { title: 'Deep Breathing', description: '4-7-8 breathing for calm and relaxation', duration: '5 min', intensity: 'gentle', youtube_search: '4-7-8 breathing technique relaxation', why: 'Reduces cortisol and eases discomfort', emoji: '🌬️' },
    { title: 'Light Stretching', description: 'Full body stretch targeting tight areas', duration: '8 min', intensity: 'gentle', youtube_search: 'light stretching routine morning', why: 'Improves flexibility and reduces stiffness', emoji: '🤸' },
  ];

  if (!GEMINI_API_KEY) return fallback;

  const prompt = `You are a certified yoga instructor specializing in women's health and menstrual cycle-aware fitness.

User's current state:
- Menstrual cycle phase: ${phase}
- Today's symptoms: ${symptoms.length > 0 ? symptoms.join(', ') : 'none reported'}
- PCOD risk score: ${pcodScore}/100
- Current mood: ${mood || 'not specified'}

Generate exactly 4 personalized yoga/exercise recommendations. Each must be a real, specific yoga pose or routine that exists on YouTube.

Return ONLY a JSON array:
[
  {
    "title": "<specific exercise name>",
    "description": "<1 sentence what it does>",
    "duration": "<e.g. 8 min>",
    "intensity": "gentle | moderate | active",
    "youtube_search": "<exact YouTube search query to find this video>",
    "why": "<1 sentence why this helps their specific condition>",
    "emoji": "<relevant emoji>"
  }
]

Rules:
- If menstrual phase: only gentle/restorative. No inversions.
- If follicular: moderate energy OK.
- If ovulation: active exercises OK.
- If luteal: gentle to moderate, focus on mood.
- If PCOD score > 50: include insulin-sensitizing exercises (brisk walking, strength)
- If cramps reported: include hip openers, child's pose
- If fatigue: include energizing but gentle flows
- Return ONLY valid JSON array.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 600 },
        }),
      }
    );
    const json = await response.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error('No JSON array');
  } catch {
    return fallback;
  }
}
