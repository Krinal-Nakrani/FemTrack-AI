export const APP_NAME = 'FemTrack AI';
export const APP_TAGLINE = 'Smart Period Tracking & PCOD Risk Prediction';
export const API_BASE_URL = '/api';

export const SYMPTOMS = [
  { id: 'cramps', label: 'Cramps', emoji: '😣' },
  { id: 'bloating', label: 'Bloating', emoji: '🫧' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'acne', label: 'Acne', emoji: '😤' },
  { id: 'hair_loss', label: 'Hair Loss', emoji: '💇' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'breast_tenderness', label: 'Breast Tenderness', emoji: '🩹' },
  { id: 'back_pain', label: 'Back Pain', emoji: '🔙' },
  { id: 'nausea', label: 'Nausea', emoji: '🤢' },
  { id: 'insomnia', label: 'Insomnia', emoji: '🌙' },
  { id: 'mood_swings', label: 'Mood Swings', emoji: '🎭' },
  { id: 'cravings', label: 'Cravings', emoji: '🍫' },
] as const;

export const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡' },
  { id: 'anxious', label: 'Anxious', emoji: '😰' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'irritable', label: 'Irritable', emoji: '😤' },
  { id: 'tired', label: 'Tired', emoji: '😩' },
  { id: 'loving', label: 'Loving', emoji: '🥰' },
] as const;

export const FLOW_LEVELS = [
  { level: 1, label: 'Spotting', color: '#FFB6C1' },
  { level: 2, label: 'Light', color: '#FF94B8' },
  { level: 3, label: 'Medium', color: '#FF6B9D' },
  { level: 4, label: 'Heavy', color: '#C94B8A' },
  { level: 5, label: 'Very Heavy', color: '#8E2D5E' },
] as const;

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;

export const CYCLE_PHASES = {
  menstrual: { label: 'Menstrual Phase', color: '#C94B8A', days: '1–5' },
  follicular: { label: 'Follicular Phase', color: '#B39DDB', days: '6–13' },
  ovulation: { label: 'Ovulation', color: '#FFD700', days: '14–16' },
  luteal: { label: 'Luteal Phase', color: '#FF6B9D', days: '17–28' },
} as const;

export const RISK_LEVELS = {
  low: { label: 'Low Risk', color: '#4ADE80', range: '0–30' },
  moderate: { label: 'Moderate Risk', color: '#FBBF24', range: '31–60' },
  high: { label: 'High Risk', color: '#EF4444', range: '61–100' },
} as const;
