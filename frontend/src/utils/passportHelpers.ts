import type { DailyLog, CycleRecord, PcodPrediction } from '@/lib/db';

// Generate permanent passport ID — never changes
export function generatePassportId(uid: string): string {
  const prefix = uid.slice(0, 4).toUpperCase();
  const suffix = Date.now().toString(36).toUpperCase();
  return `FT-${prefix}-${suffix}`;
}

// SHA-256 hash PIN — never store plain text
export async function hashPIN(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'femtrack_salt_2024');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Aggregate all user data into passport display format
export interface PassportData {
  name: string;
  email: string;
  age: string;
  bloodGroup: string;
  passportId: string;
  memberSince: string;
  avgCycleLength: number;
  cycleVariance: number;
  cyclesTracked: number;
  pcodRiskScore: number;
  pcodRiskLevel: 'low' | 'moderate' | 'high';
  pcodTrend: 'improving' | 'stable' | 'worsening';
  topSymptoms: string[];
  currentPhase: string;
  lastUpdated: string;
  cycleLengths: number[];
  periodDates: string[];
  riskHistory: number[];
}

export function aggregatePassportData(
  name: string,
  email: string,
  age: string,
  bloodGroup: string,
  passportId: string,
  memberSince: string,
  logs: DailyLog[],
  cycles: CycleRecord[],
  predictions: PcodPrediction[],
  currentPhaseInput?: string
): PassportData {
  // Cycle stats
  const validCycles = cycles.filter((c) => c.length && c.length > 0);
  const lengths = validCycles.map((c) => c.length!);
  const avgLen = lengths.length > 0 ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : 28;
  const variance = lengths.length > 1
    ? Math.round(Math.sqrt(lengths.reduce((sum, l) => sum + Math.pow(l - avgLen, 2), 0) / lengths.length))
    : 3;

  // Top symptoms
  const symptomCount: Record<string, number> = {};
  logs.forEach((log) => {
    log.symptoms.forEach((s) => {
      symptomCount[s] = (symptomCount[s] || 0) + 1;
    });
  });
  const topSymptoms = Object.entries(symptomCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([s]) => s.replace(/_/g, ' '));

  // PCOD
  const sortedPreds = [...predictions].sort((a, b) => a.date.localeCompare(b.date));
  const latestPcod = sortedPreds[sortedPreds.length - 1];
  const prevPcod = sortedPreds[sortedPreds.length - 2];
  let pcodTrend: 'improving' | 'stable' | 'worsening' = 'stable';
  if (latestPcod && prevPcod) {
    const diff = latestPcod.riskScore - prevPcod.riskScore;
    pcodTrend = diff < -5 ? 'improving' : diff > 5 ? 'worsening' : 'stable';
  }

  // Also check localStorage PCOD scan results
  const localScans = JSON.parse(localStorage.getItem('femtrack_pcod_scans') || '[]');
  let pcodScore = latestPcod?.riskScore || 25;
  let pcodLevel: 'low' | 'moderate' | 'high' = latestPcod?.riskLevel || 'low';
  if (localScans.length > 0) {
    const latest = localScans[localScans.length - 1];
    pcodScore = latest.pcod_risk_score || pcodScore;
    pcodLevel = latest.pcod_risk_level || pcodLevel;
  }

  // Period dates for heatmap
  const periodDates = logs
    .filter((l) => l.periodStatus === 'started' || l.periodStatus === 'ongoing')
    .map((l) => l.date);

  const riskHist = sortedPreds.slice(-6).map((p) => p.riskScore);
  if (localScans.length > 0 && riskHist.length === 0) {
    localScans.slice(-6).forEach((s: any) => riskHist.push(s.pcod_risk_score));
  }

  return {
    name,
    email,
    age,
    bloodGroup,
    passportId,
    memberSince,
    avgCycleLength: avgLen,
    cycleVariance: variance,
    cyclesTracked: validCycles.length || cycles.length,
    pcodRiskScore: pcodScore,
    pcodRiskLevel: pcodLevel,
    pcodTrend,
    topSymptoms: topSymptoms.length > 0 ? topSymptoms : [],
    currentPhase: currentPhaseInput || 'follicular',
    lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    cycleLengths: lengths.length > 0 ? lengths.slice(-6) : [],
    periodDates,
    riskHistory: riskHist,
  };
}

// Get passport public URL
export function getPassportUrl(passportId: string): string {
  return `${window.location.origin}/passport/${passportId}`;
}
