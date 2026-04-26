import Dexie, { type EntityTable } from 'dexie';

export interface DailyLog {
  id?: number;
  date: string; // YYYY-MM-DD
  userId: string;
  periodStatus: 'started' | 'ongoing' | 'ended' | 'none';
  flowLevel: number; // 0-5
  symptoms: string[];
  mood: string;
  sleepHours: number;
  stressLevel: number; // 1-5
  waterIntake: number; // glasses
  notes: string;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CycleRecord {
  id?: number;
  cycleId: string;
  userId: string;
  startDate: string;
  endDate: string | null;
  length: number | null;
  periodLength: number | null;
  predictedNext: string | null;
  synced: boolean;
}

export interface UserProfile {
  id?: number;
  odataId: string;
  name: string;
  email: string;
  dob: string | null;
  avgCycleLength: number;
  avgPeriodLength: number;
  inviteCode?: string;
  partnerPermissions?: Record<string, boolean>;
  role: 'user' | 'partner';
  linkedUserId?: string;
  onboarded: boolean;
  synced: boolean;
}

export interface PcodPrediction {
  id?: number;
  userId: string;
  date: string;
  riskScore: number;
  riskLevel: 'low' | 'moderate' | 'high';
  factors: Record<string, number>;
  synced: boolean;
}

const femtrackDB = new Dexie('FemTrackAI') as Dexie & {
  logs: EntityTable<DailyLog, 'id'>;
  cycles: EntityTable<CycleRecord, 'id'>;
  profiles: EntityTable<UserProfile, 'id'>;
  predictions: EntityTable<PcodPrediction, 'id'>;
};

femtrackDB.version(3).stores({
  logs: '++id, date, userId, [userId+date], synced',
  cycles: '++id, cycleId, userId, startDate, synced',
  profiles: '++id, odataId, inviteCode, linkedUserId, synced',
  predictions: '++id, userId, date, synced',
});

export { femtrackDB };
export default femtrackDB;
