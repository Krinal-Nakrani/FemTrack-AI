import type { CyclePhase } from '@/lib/utils';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnail: string;
  category: 'yoga' | 'breathing' | 'stretching' | 'walking' | 'strength' | 'meditation';
  intensity: 'gentle' | 'moderate' | 'active';
  phases: CyclePhase[];
  goodForSymptoms: string[];
  goodForPcod: boolean;
  reasoning: string;
}

export const EXERCISES: Exercise[] = [
  // MENSTRUAL PHASE — gentle, restorative
  {
    id: 'child-pose-flow',
    title: "Child's Pose Flow",
    description: 'Gentle restorative yoga focusing on hip opening and lower back relief. Perfect for period days.',
    duration: '8 min',
    videoUrl: 'https://www.youtube.com/embed/2MJGg-dUKh0',
    thumbnail: '🧘‍♀️',
    category: 'yoga',
    intensity: 'gentle',
    phases: ['menstrual'],
    goodForSymptoms: ['cramps', 'back_pain', 'fatigue', 'pelvic_pain'],
    goodForPcod: true,
    reasoning: "Gentle hip openers help relieve menstrual cramps by relaxing the pelvic floor muscles.",
  },
  {
    id: 'deep-breathing',
    title: 'Deep Belly Breathing',
    description: '4-7-8 breathing technique to ease anxiety, reduce cramp intensity, and promote relaxation.',
    duration: '5 min',
    videoUrl: 'https://www.youtube.com/embed/YRPh_GaiL8s',
    thumbnail: '🌬️',
    category: 'breathing',
    intensity: 'gentle',
    phases: ['menstrual', 'luteal'],
    goodForSymptoms: ['cramps', 'anxious', 'insomnia', 'mood_swings'],
    goodForPcod: true,
    reasoning: "Deep breathing activates your parasympathetic nervous system, reducing cortisol and easing cramps.",
  },
  {
    id: 'period-yoga',
    title: 'Period Comfort Yoga',
    description: 'Supine twists, supported bridge, and butterfly pose for menstrual comfort.',
    duration: '12 min',
    videoUrl: 'https://www.youtube.com/embed/nMjEv07Kyxk',
    thumbnail: '🌺',
    category: 'yoga',
    intensity: 'gentle',
    phases: ['menstrual'],
    goodForSymptoms: ['cramps', 'bloating', 'back_pain', 'fatigue'],
    goodForPcod: true,
    reasoning: "These poses improve blood circulation in the pelvic area, naturally easing menstrual discomfort.",
  },

  // FOLLICULAR PHASE — building energy
  {
    id: 'sun-salutation',
    title: 'Sun Salutation Flow',
    description: 'Energizing vinyasa flow to match your rising estrogen and growing energy levels.',
    duration: '15 min',
    videoUrl: 'https://www.youtube.com/embed/73sjOu0g58M',
    thumbnail: '☀️',
    category: 'yoga',
    intensity: 'moderate',
    phases: ['follicular'],
    goodForSymptoms: ['fatigue', 'brain_fog'],
    goodForPcod: true,
    reasoning: "Your estrogen is rising — this is the best time for dynamic movement that builds strength.",
  },
  {
    id: 'hiit-light',
    title: 'Low-Impact HIIT',
    description: 'Moderate intensity intervals to boost metabolism and energy without joint stress.',
    duration: '20 min',
    videoUrl: 'https://www.youtube.com/embed/ml6cT4AZdqI',
    thumbnail: '🏃‍♀️',
    category: 'strength',
    intensity: 'active',
    phases: ['follicular', 'ovulation'],
    goodForSymptoms: ['weight_gain', 'fatigue'],
    goodForPcod: true,
    reasoning: "HIIT improves insulin sensitivity — crucial for PCOD management. Your body handles intensity best now.",
  },
  {
    id: 'core-strength',
    title: 'Core Strength Builder',
    description: 'Pilates-inspired core exercises to build functional strength during your high-energy phase.',
    duration: '12 min',
    videoUrl: 'https://www.youtube.com/embed/sFOxOxCSsOs',
    thumbnail: '💪',
    category: 'strength',
    intensity: 'moderate',
    phases: ['follicular'],
    goodForSymptoms: ['back_pain', 'weight_gain'],
    goodForPcod: true,
    reasoning: "Strong core muscles support your pelvis and reduce back pain in later cycle phases.",
  },

  // OVULATION — peak energy
  {
    id: 'power-yoga',
    title: 'Power Yoga Session',
    description: 'Challenge yourself with this dynamic power yoga — your energy is at its peak!',
    duration: '25 min',
    videoUrl: 'https://www.youtube.com/embed/9kOCY0KNByw',
    thumbnail: '🔥',
    category: 'yoga',
    intensity: 'active',
    phases: ['ovulation'],
    goodForSymptoms: ['weight_gain'],
    goodForPcod: true,
    reasoning: "You're at peak energy and confidence. Push your limits safely — your body can handle it!",
  },
  {
    id: 'dance-cardio',
    title: 'Dance Cardio Party',
    description: 'Fun, high-energy dance workout. Perfect for your most social and energetic days.',
    duration: '20 min',
    videoUrl: 'https://www.youtube.com/embed/ZWk19OVon2k',
    thumbnail: '💃',
    category: 'strength',
    intensity: 'active',
    phases: ['ovulation'],
    goodForSymptoms: ['fatigue', 'weight_gain'],
    goodForPcod: true,
    reasoning: "Cardio during ovulation maximizes endorphin release. You'll feel amazing!",
  },

  // LUTEAL PHASE — winding down
  {
    id: 'yin-yoga',
    title: 'Yin Yoga for PMS',
    description: 'Slow, deep stretches held for 3-5 minutes. Calms the nervous system before your period.',
    duration: '20 min',
    videoUrl: 'https://www.youtube.com/embed/4pKly2JojMw',
    thumbnail: '🌙',
    category: 'yoga',
    intensity: 'gentle',
    phases: ['luteal'],
    goodForSymptoms: ['mood_swings', 'anxious', 'insomnia', 'breast_tenderness'],
    goodForPcod: true,
    reasoning: "Yin yoga calms progesterone-driven anxiety and helps with PMS symptoms.",
  },
  {
    id: 'walking-meditation',
    title: 'Mindful Walking',
    description: 'Gentle 15-minute walk with mindfulness cues. Low impact, high benefits.',
    duration: '15 min',
    videoUrl: 'https://www.youtube.com/embed/CHhOE0_UJBI',
    thumbnail: '🚶‍♀️',
    category: 'walking',
    intensity: 'gentle',
    phases: ['luteal', 'menstrual'],
    goodForSymptoms: ['bloating', 'mood_swings', 'cravings', 'constipation'],
    goodForPcod: true,
    reasoning: "Walking aids digestion and reduces bloating while keeping cortisol low.",
  },
  {
    id: 'stress-relief-stretch',
    title: 'Stress Relief Stretching',
    description: 'Full body stretching routine focusing on tension areas — neck, shoulders, hips.',
    duration: '10 min',
    videoUrl: 'https://www.youtube.com/embed/g_tea8ZNk5A',
    thumbnail: '🧘',
    category: 'stretching',
    intensity: 'gentle',
    phases: ['luteal'],
    goodForSymptoms: ['headache', 'back_pain', 'joint_pain'],
    goodForPcod: false,
    reasoning: "Stretching releases physical tension that builds up from progesterone changes.",
  },
  {
    id: 'body-scan-meditation',
    title: 'Body Scan Meditation',
    description: 'Guided body scan to reconnect with your body and release stored tension.',
    duration: '10 min',
    videoUrl: 'https://www.youtube.com/embed/QS2yDmWk0vs',
    thumbnail: '🧠',
    category: 'meditation',
    intensity: 'gentle',
    phases: ['luteal', 'menstrual'],
    goodForSymptoms: ['insomnia', 'anxious', 'mood_swings', 'brain_fog'],
    goodForPcod: true,
    reasoning: "Meditation reduces cortisol levels, which directly helps with hormonal balance.",
  },

  // PCOD-SPECIFIC
  {
    id: 'pcod-yoga',
    title: 'PCOD Management Yoga',
    description: 'Targeted poses for hormonal balance — butterfly, cobbler, and pelvic tilts.',
    duration: '18 min',
    videoUrl: 'https://www.youtube.com/embed/FmfEXKH6W18',
    thumbnail: '🎯',
    category: 'yoga',
    intensity: 'moderate',
    phases: ['follicular', 'ovulation', 'luteal'],
    goodForSymptoms: ['weight_gain', 'acne', 'hair_loss'],
    goodForPcod: true,
    reasoning: "These specific poses stimulate ovarian function and improve insulin sensitivity — both critical for PCOD.",
  },
  {
    id: 'hormone-balance-breath',
    title: 'Hormone Balance Breathwork',
    description: 'Alternate nostril breathing (Nadi Shodhana) to balance hormones naturally.',
    duration: '8 min',
    videoUrl: 'https://www.youtube.com/embed/8VwufJrUhic',
    thumbnail: '🌈',
    category: 'breathing',
    intensity: 'gentle',
    phases: ['menstrual', 'follicular', 'ovulation', 'luteal'],
    goodForSymptoms: ['hot_flashes', 'mood_swings', 'anxious'],
    goodForPcod: true,
    reasoning: "Nadi Shodhana activates both hemispheres of the brain and regulates the endocrine system.",
  },
];

/**
 * AI-powered exercise recommender
 * Selects the best exercise based on current phase, symptoms, and PCOD score
 */
export function getRecommendedExercises(
  phase: CyclePhase,
  symptoms: string[],
  pcodScore: number,
  mood: string,
  energyLevel: number = 3,
): { exercise: Exercise; reasoning: string }[] {
  // Filter exercises for this phase
  let candidates = EXERCISES.filter((e) => e.phases.includes(phase));

  // If PCOD score is high, prioritize PCOD-friendly exercises
  if (pcodScore > 50) {
    candidates = candidates.sort((a, b) => (b.goodForPcod ? 1 : 0) - (a.goodForPcod ? 1 : 0));
  }

  // Adjust for energy level
  if (energyLevel <= 2) {
    candidates = candidates.filter((e) => e.intensity === 'gentle');
  } else if (energyLevel >= 4 && phase !== 'menstrual') {
    candidates = candidates.sort((a, b) => {
      const order = { active: 0, moderate: 1, gentle: 2 };
      return order[a.intensity] - order[b.intensity];
    });
  }

  // Score by symptom match
  const scored = candidates.map((exercise) => {
    let score = 0;
    symptoms.forEach((s) => {
      if (exercise.goodForSymptoms.includes(s)) score += 2;
    });
    if (exercise.goodForPcod && pcodScore > 40) score += 3;
    // Energy matching
    if (energyLevel <= 2 && exercise.intensity === 'gentle') score += 2;
    if (energyLevel >= 4 && exercise.intensity === 'active') score += 2;

    // Build personalized reasoning
    const matchedSymptoms = symptoms.filter((s) => exercise.goodForSymptoms.includes(s));
    let reasoning = exercise.reasoning;
    if (matchedSymptoms.length > 0) {
      reasoning += ` This is especially helpful for your ${matchedSymptoms.join(', ').replace(/_/g, ' ')}.`;
    }
    if (exercise.goodForPcod && pcodScore > 40) {
      reasoning += ' Recommended for PCOD management.';
    }

    return { exercise, score, reasoning };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map(({ exercise, reasoning }) => ({ exercise, reasoning }));
}
