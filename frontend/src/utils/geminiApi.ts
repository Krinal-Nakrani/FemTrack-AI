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
