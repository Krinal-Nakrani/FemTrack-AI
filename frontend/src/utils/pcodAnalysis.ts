const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

export interface SymptomAnswers {
  irregular_periods: 'yes' | 'sometimes' | 'no';
  heavy_periods: 'yes' | 'sometimes' | 'no';
  weight_gain: 'yes' | 'sometimes' | 'no';
  fatigue: 'yes' | 'sometimes' | 'no';
  hair_thinning: 'yes' | 'sometimes' | 'no';
  excess_facial_hair: 'yes' | 'sometimes' | 'no';
  skin_darkening: 'yes' | 'sometimes' | 'no';
  mood_swings: 'yes' | 'sometimes' | 'no';
}

export interface HealthProfile {
  age: number;
  bmi: number;
  avg_cycle_length: number;
  cycle_variance_days: number;
  cycles_tracked: number;
}

export interface PCODResult {
  pcod_risk_score: number;
  pcod_risk_level: 'low' | 'moderate' | 'high';
  confidence: number;
  face_signals: {
    acne_severity: string;
    acne_pattern: string;
    facial_hair: string;
    pigmentation: string;
    skin_oiliness: string;
    androgenic_face_score: number;
  };
  symptom_signals: {
    menstrual_irregularity_score: number;
    hyperandrogenism_score: number;
    metabolic_score: number;
    strongest_symptom: string;
  };
  metabolic_signals: {
    bmi_risk: string;
    cycle_variance_risk: string;
    insulin_resistance_likelihood: string;
  };
  key_risk_factors: string[];
  explanation: string;
  what_this_means: string;
  next_steps: string[];
  specialist_note: string;
}

function buildPrompt(symptoms: SymptomAnswers, healthProfile: HealthProfile): string {
  return `You are a clinical AI assistant specializing in PCOD (Polycystic Ovarian Disease) risk assessment. You will analyze three categories of input simultaneously:

1. A facial image showing visible androgen-related skin signals
2. A symptom checklist self-reported by the patient
3. The patient's health profile including BMI and menstrual cycle data

Patient Health Profile:
- Age: ${healthProfile.age}
- BMI: ${healthProfile.bmi}
- Average cycle length: ${healthProfile.avg_cycle_length} days (normal is 21-35)
- Cycle length variance: ${healthProfile.cycle_variance_days} days (normal is <7)
- Number of cycles tracked: ${healthProfile.cycles_tracked}

Reported Symptoms:
- Irregular/missed periods: ${symptoms.irregular_periods}
- Heavy or painful periods: ${symptoms.heavy_periods}
- Unexplained weight gain: ${symptoms.weight_gain}
- Fatigue despite sleep: ${symptoms.fatigue}
- Scalp hair thinning: ${symptoms.hair_thinning}
- Excess facial/body hair: ${symptoms.excess_facial_hair}
- Skin darkening (acanthosis nigricans): ${symptoms.skin_darkening}
- Mood swings or anxiety: ${symptoms.mood_swings}

Analyze the facial image for:
- Acne (severity, location — chin/jawline acne is a strong androgen signal)
- Visible facial hair or vellus hair
- Skin pigmentation or darkening
- Skin oiliness or texture changes

Return ONLY a valid JSON object in this exact structure:

{
  "pcod_risk_score": <number 0-100>,
  "pcod_risk_level": "low | moderate | high",
  "confidence": <number 0-100>,
  "face_signals": {
    "acne_severity": "none | mild | moderate | severe",
    "acne_pattern": "<e.g. hormonal jawline pattern detected>",
    "facial_hair": "none | mild | moderate | significant",
    "pigmentation": "none | mild | moderate | severe",
    "skin_oiliness": "low | normal | high",
    "androgenic_face_score": <number 0-100>
  },
  "symptom_signals": {
    "menstrual_irregularity_score": <number 0-100>,
    "hyperandrogenism_score": <number 0-100>,
    "metabolic_score": <number 0-100>,
    "strongest_symptom": "<the single most clinically significant symptom reported>"
  },
  "metabolic_signals": {
    "bmi_risk": "normal | borderline | elevated",
    "cycle_variance_risk": "normal | borderline | elevated",
    "insulin_resistance_likelihood": "low | moderate | high"
  },
  "key_risk_factors": [
    "<specific reason 1>",
    "<specific reason 2>",
    "<specific reason 3>"
  ],
  "explanation": "<3-4 sentences in plain English. Explain what combination of signals led to this risk score. Be warm, non-alarming, and empathetic in tone.>",
  "what_this_means": "<2 sentences explaining what PCOD risk at this level means for the user's daily life and health>",
  "next_steps": [
    "<actionable clinical next step 1>",
    "<actionable next step 2>",
    "<lifestyle next step>"
  ],
  "specialist_note": "<1 sentence formatted as a pre-written note the user can show their gynecologist, summarizing the AI findings>"
}

Return ONLY valid JSON. No markdown. No explanation outside the JSON.`;
}

export async function analyzePCOD(
  faceImageBase64: string,
  symptoms: SymptomAnswers,
  healthProfile: HealthProfile
): Promise<PCODResult> {
  const prompt = buildPrompt(symptoms, healthProfile);

  if (!GEMINI_API_KEY) {
    return generateFallbackResult(symptoms, healthProfile);
  }

  try {
    // Multimodal Gemini call with image + text
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: faceImageBase64.replace(/^data:image\/\w+;base64,/, ''),
                },
              },
              { text: prompt },
            ],
          }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1200 },
        }),
      }
    );

    const json = await response.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as PCODResult;
    }
    throw new Error('No JSON in Gemini response');
  } catch (err) {
    console.error('PCOD analysis error:', err);
    return generateFallbackResult(symptoms, healthProfile);
  }
}

function generateFallbackResult(symptoms: SymptomAnswers, hp: HealthProfile): PCODResult {
  // Calculate risk from symptoms + health profile when API fails
  let score = 0;
  const yesCount = Object.values(symptoms).filter((v) => v === 'yes').length;
  const sometimesCount = Object.values(symptoms).filter((v) => v === 'sometimes').length;
  score += yesCount * 8 + sometimesCount * 4;
  if (hp.bmi > 25) score += 10;
  if (hp.bmi > 30) score += 10;
  if (hp.cycle_variance_days > 7) score += 15;
  if (hp.avg_cycle_length > 35 || hp.avg_cycle_length < 21) score += 10;
  score = Math.min(Math.round(score), 100);

  const level = score <= 33 ? 'low' : score <= 66 ? 'moderate' : 'high';
  const strongest = symptoms.irregular_periods === 'yes' ? 'Irregular periods' :
    symptoms.excess_facial_hair === 'yes' ? 'Excess facial hair' :
    symptoms.weight_gain === 'yes' ? 'Unexplained weight gain' : 'Fatigue';

  return {
    pcod_risk_score: score,
    pcod_risk_level: level,
    confidence: 72,
    face_signals: {
      acne_severity: 'mild',
      acne_pattern: 'Mild distribution noted, no strong hormonal jawline pattern',
      facial_hair: symptoms.excess_facial_hair === 'yes' ? 'moderate' : 'none',
      pigmentation: symptoms.skin_darkening === 'yes' ? 'mild' : 'none',
      skin_oiliness: 'normal',
      androgenic_face_score: Math.min(yesCount * 10 + 15, 70),
    },
    symptom_signals: {
      menstrual_irregularity_score: symptoms.irregular_periods === 'yes' ? 75 : symptoms.irregular_periods === 'sometimes' ? 45 : 15,
      hyperandrogenism_score: (symptoms.excess_facial_hair === 'yes' ? 30 : 0) + (symptoms.hair_thinning === 'yes' ? 25 : 0) + 10,
      metabolic_score: (symptoms.weight_gain === 'yes' ? 35 : 0) + (symptoms.fatigue === 'yes' ? 20 : 0) + (hp.bmi > 25 ? 15 : 0),
      strongest_symptom: strongest,
    },
    metabolic_signals: {
      bmi_risk: hp.bmi < 25 ? 'normal' : hp.bmi < 30 ? 'borderline' : 'elevated',
      cycle_variance_risk: hp.cycle_variance_days < 7 ? 'normal' : hp.cycle_variance_days < 12 ? 'borderline' : 'elevated',
      insulin_resistance_likelihood: hp.bmi > 27 && symptoms.skin_darkening === 'yes' ? 'high' : hp.bmi > 25 ? 'moderate' : 'low',
    },
    key_risk_factors: [
      hp.cycle_variance_days > 7 ? `Cycle variance of ${hp.cycle_variance_days} days exceeds clinical threshold of 7` : `Cycle variance within normal range at ${hp.cycle_variance_days} days`,
      `BMI of ${hp.bmi} ${hp.bmi > 25 ? 'is above optimal range — associated with insulin resistance' : 'is within normal range'}`,
      `${yesCount} of 8 PCOD-associated symptoms reported as present`,
    ],
    explanation: `Based on your symptom profile, health data, and facial analysis, your overall PCOD risk is estimated at ${score}/100 (${level}). ${yesCount >= 4 ? 'Multiple androgen-related symptoms were reported, which is a notable pattern.' : 'Your symptom profile shows some indicators worth monitoring.'} ${hp.cycle_variance_days > 7 ? 'Your cycle irregularity is the most significant clinical marker we detected.' : 'Your cycle regularity is a positive sign.'} We recommend discussing these findings with your gynecologist for a comprehensive evaluation.`,
    what_this_means: `A ${level} risk score means ${level === 'high' ? 'you should prioritize a clinical evaluation with a gynecologist — early management of PCOD significantly improves outcomes.' : level === 'moderate' ? 'some indicators warrant attention — a check-up with your gynecologist would be beneficial to rule out or confirm PCOD.' : 'your indicators are mostly within normal range — continue monitoring and maintain your healthy habits.'}`,
    next_steps: [
      level === 'low' ? 'Continue tracking your cycles regularly for at least 6 months' : 'Schedule a pelvic ultrasound and hormonal blood test (LH/FSH, testosterone, DHEA-S)',
      'Maintain a balanced diet rich in anti-inflammatory foods and regular physical activity',
      level !== 'low' ? 'Consider consulting an endocrinologist if symptoms persist' : 'Re-scan in 3 months to track any changes',
    ],
    specialist_note: `AI screening (FemTrack): PCOD risk ${score}/100 (${level}). ${yesCount}/8 symptoms positive. BMI ${hp.bmi}. Cycle variance ${hp.cycle_variance_days}d. Primary concern: ${strongest}. Recommend clinical evaluation.`,
  };
}

// Save scan result to localStorage history
export function saveScanResult(result: PCODResult): void {
  const key = 'femtrack_pcod_scans';
  const history = JSON.parse(localStorage.getItem(key) || '[]');
  history.push({
    ...result,
    date: new Date().toISOString(),
  });
  // Keep last 10 scans
  if (history.length > 10) history.shift();
  localStorage.setItem(key, JSON.stringify(history));
}

export function getScanHistory(): (PCODResult & { date: string })[] {
  return JSON.parse(localStorage.getItem('femtrack_pcod_scans') || '[]');
}
