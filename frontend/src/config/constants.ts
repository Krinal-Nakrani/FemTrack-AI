export const APP_NAME = 'FemTrack AI';
export const APP_TAGLINE = 'Smart Period Tracking & PCOD Risk Prediction';
export const API_BASE_URL = '/api';

export const SYMPTOMS = [
  { id: 'cramps', label: 'Cramps', emoji: '😣', category: 'pain' },
  { id: 'bloating', label: 'Bloating', emoji: '🫧', category: 'digestive' },
  { id: 'headache', label: 'Headache', emoji: '🤕', category: 'pain' },
  { id: 'acne', label: 'Acne', emoji: '😤', category: 'skin' },
  { id: 'hair_loss', label: 'Hair Loss', emoji: '💇', category: 'hormonal' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴', category: 'energy' },
  { id: 'breast_tenderness', label: 'Breast Tenderness', emoji: '🩹', category: 'pain' },
  { id: 'back_pain', label: 'Back Pain', emoji: '🔙', category: 'pain' },
  { id: 'nausea', label: 'Nausea', emoji: '🤢', category: 'digestive' },
  { id: 'insomnia', label: 'Insomnia', emoji: '🌙', category: 'sleep' },
  { id: 'mood_swings', label: 'Mood Swings', emoji: '🎭', category: 'emotional' },
  { id: 'cravings', label: 'Cravings', emoji: '🍫', category: 'appetite' },
  // New symptoms
  { id: 'dizziness', label: 'Dizziness', emoji: '💫', category: 'neurological' },
  { id: 'hot_flashes', label: 'Hot Flashes', emoji: '🔥', category: 'hormonal' },
  { id: 'joint_pain', label: 'Joint Pain', emoji: '🦴', category: 'pain' },
  { id: 'weight_gain', label: 'Weight Change', emoji: '⚖️', category: 'hormonal' },
  { id: 'appetite_change', label: 'Appetite Change', emoji: '🍽️', category: 'appetite' },
  { id: 'constipation', label: 'Constipation', emoji: '😫', category: 'digestive' },
  { id: 'diarrhea', label: 'Diarrhea', emoji: '💨', category: 'digestive' },
  { id: 'spotting', label: 'Spotting', emoji: '🩸', category: 'flow' },
  { id: 'pelvic_pain', label: 'Pelvic Pain', emoji: '⚡', category: 'pain' },
  { id: 'heavy_bleeding', label: 'Heavy Bleeding', emoji: '🔴', category: 'flow' },
  { id: 'dry_skin', label: 'Dry Skin', emoji: '🧴', category: 'skin' },
  { id: 'brain_fog', label: 'Brain Fog', emoji: '🌫️', category: 'neurological' },
] as const;

export const SYMPTOM_CATEGORIES = [
  { id: 'pain', label: 'Pain', emoji: '🤕' },
  { id: 'digestive', label: 'Digestive', emoji: '🫧' },
  { id: 'hormonal', label: 'Hormonal', emoji: '⚖️' },
  { id: 'skin', label: 'Skin', emoji: '🧴' },
  { id: 'energy', label: 'Energy', emoji: '⚡' },
  { id: 'emotional', label: 'Emotional', emoji: '🎭' },
  { id: 'appetite', label: 'Appetite', emoji: '🍽️' },
  { id: 'sleep', label: 'Sleep', emoji: '🌙' },
  { id: 'neurological', label: 'Neurological', emoji: '🧠' },
  { id: 'flow', label: 'Flow', emoji: '🩸' },
] as const;

export const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊', energy: 'high' },
  { id: 'calm', label: 'Calm', emoji: '😌', energy: 'medium' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡', energy: 'high' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', energy: 'medium' },
  { id: 'sad', label: 'Sad', emoji: '😢', energy: 'low' },
  { id: 'irritable', label: 'Irritable', emoji: '😤', energy: 'medium' },
  { id: 'tired', label: 'Tired', emoji: '😩', energy: 'low' },
  { id: 'loving', label: 'Loving', emoji: '🥰', energy: 'medium' },
  // New moods
  { id: 'focused', label: 'Focused', emoji: '🎯', energy: 'high' },
  { id: 'creative', label: 'Creative', emoji: '🎨', energy: 'high' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😵', energy: 'low' },
  { id: 'grateful', label: 'Grateful', emoji: '🙏', energy: 'medium' },
  { id: 'sensitive', label: 'Sensitive', emoji: '🥺', energy: 'low' },
  { id: 'indifferent', label: 'Indifferent', emoji: '😐', energy: 'low' },
  { id: 'confident', label: 'Confident', emoji: '💪', energy: 'high' },
  { id: 'romantic', label: 'Romantic', emoji: '💕', energy: 'medium' },
] as const;

export const ENERGY_LEVELS = [
  { level: 1, label: 'Very Low', emoji: '🪫', color: '#EF4444' },
  { level: 2, label: 'Low', emoji: '😴', color: '#FBBF24' },
  { level: 3, label: 'Medium', emoji: '😊', color: '#4ADE80' },
  { level: 4, label: 'High', emoji: '⚡', color: '#60A5FA' },
  { level: 5, label: 'Very High', emoji: '🚀', color: '#A78BFA' },
] as const;

export const LIBIDO_LEVELS = [
  { id: 'none', label: 'None', emoji: '😶' },
  { id: 'low', label: 'Low', emoji: '🙂' },
  { id: 'medium', label: 'Medium', emoji: '😊' },
  { id: 'high', label: 'High', emoji: '🔥' },
] as const;

export const DISCHARGE_TYPES = [
  { id: 'none', label: 'None', emoji: '⭕' },
  { id: 'dry', label: 'Dry', emoji: '🏜️' },
  { id: 'sticky', label: 'Sticky', emoji: '🫧' },
  { id: 'creamy', label: 'Creamy', emoji: '🥛' },
  { id: 'watery', label: 'Watery', emoji: '💧' },
  { id: 'egg_white', label: 'Egg White', emoji: '🥚' },
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

// Partner permission defaults
export const PARTNER_PERMISSIONS = {
  phase: { label: 'Cycle Phase', default: true, description: 'Current phase of cycle' },
  mood: { label: 'Mood', default: true, description: 'Current mood and energy' },
  symptoms: { label: 'Symptoms', default: false, description: 'Logged symptoms' },
  flow: { label: 'Flow Details', default: false, description: 'Flow intensity' },
  pcod: { label: 'PCOD Risk', default: false, description: 'PCOD risk score' },
  exercise: { label: 'Exercise', default: true, description: 'Exercise recommendations' },
  predictions: { label: 'Predictions', default: true, description: 'Next period & fertile window' },
} as const;
