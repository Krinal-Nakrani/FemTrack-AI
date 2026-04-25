# FemTrack AI — Smart Period Tracking & PCOD Risk Prediction PWA

A production-quality, fully responsive Progressive Web App built with React 18 + Vite + TypeScript (frontend) and FastAPI + scikit-learn (backend). Designed to surpass Flo, Clue, and Glow in UI/UX quality.

## User Review Required

> [!IMPORTANT]
> **Firebase Configuration**: You'll need to provide Firebase project credentials (API key, auth domain, project ID, etc.) or I can set up placeholder config that you replace later.

> [!IMPORTANT]
> **Tech Stack Confirmation**: The spec requests both "Vanilla CSS" (design guidelines) and "Tailwind CSS + shadcn/ui" (tech stack section). I will follow the **explicit tech stack section** and use **Tailwind CSS + shadcn/ui** as specified. Please confirm.

> [!WARNING]
> **Scope**: This is an extremely large project (~80+ files, ~15,000+ lines). I'll build it in 10 phases as specified, delivering a fully functional system. Each phase builds on the previous one. Estimated build time: significant. I'll work through it systematically.

## Open Questions

1. **Firebase credentials** — Do you have an existing Firebase project, or should I create placeholder config?
2. **FastAPI deployment** — Should the backend run locally on `localhost:8000`, or do you need deployment config (Docker, etc.)?
3. **Push notifications** — These require a Firebase Cloud Messaging (FCM) setup with VAPID keys. Should I scaffold this with placeholders?

---

## Project Structure

```
d:\antigravity projects\FemTrack AI\
├── frontend/                          # React + Vite + TypeScript
│   ├── public/
│   │   ├── manifest.json             # PWA manifest
│   │   ├── sw.js                     # Service worker (generated)
│   │   ├── icons/                    # PWA icons (lotus/moon motif)
│   │   └── splash/                   # Splash screens
│   ├── src/
│   │   ├── main.tsx                  # App entry point
│   │   ├── App.tsx                   # Root component + Router
│   │   ├── vite-env.d.ts
│   │   ├── config/
│   │   │   ├── firebase.ts          # Firebase initialization
│   │   │   └── constants.ts         # App constants
│   │   ├── lib/
│   │   │   ├── db.ts                # Dexie.js IndexedDB setup
│   │   │   ├── encryption.ts        # crypto-js AES helpers
│   │   │   ├── sync.ts              # Offline-online sync logic
│   │   │   ├── pdf-export.ts        # jsPDF + html2canvas export
│   │   │   └── utils.ts             # Shared utilities
│   │   ├── hooks/
│   │   │   ├── useAuth.ts           # Auth context hook
│   │   │   ├── useCycle.ts          # Cycle data hook
│   │   │   ├── useTheme.ts          # Dark/light mode
│   │   │   └── useOnlineStatus.ts   # Online/offline detection
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx       # Desktop sidebar nav
│   │   │   │   ├── BottomNav.tsx     # Mobile bottom nav
│   │   │   │   ├── AppLayout.tsx     # Responsive layout wrapper
│   │   │   │   └── Header.tsx        # Top header bar
│   │   │   ├── dashboard/
│   │   │   │   ├── CycleStatusCard.tsx
│   │   │   │   ├── WellnessRing.tsx
│   │   │   │   ├── PCODMeter.tsx
│   │   │   │   ├── UpcomingEvents.tsx
│   │   │   │   ├── InsightOfDay.tsx
│   │   │   │   └── ParticleBackground.tsx
│   │   │   ├── log/
│   │   │   │   ├── CycleStatusStep.tsx
│   │   │   │   ├── FlowIntensityStep.tsx
│   │   │   │   ├── SymptomsStep.tsx
│   │   │   │   ├── MoodStep.tsx
│   │   │   │   ├── LifestyleStep.tsx
│   │   │   │   ├── NotesStep.tsx
│   │   │   │   └── Confetti.tsx
│   │   │   ├── calendar/
│   │   │   │   ├── CalendarGrid.tsx
│   │   │   │   └── DayDetail.tsx
│   │   │   ├── insights/
│   │   │   │   ├── CycleLengthChart.tsx
│   │   │   │   ├── SymptomHeatmap.tsx
│   │   │   │   ├── MoodRadar.tsx
│   │   │   │   ├── FlowChart.tsx
│   │   │   │   └── RegularityScore.tsx
│   │   │   ├── pcod/
│   │   │   │   ├── RiskGauge.tsx
│   │   │   │   ├── FactorBreakdown.tsx
│   │   │   │   ├── RiskTrend.tsx
│   │   │   │   └── DoctorCTA.tsx
│   │   │   └── shared/
│   │   │       ├── GlassCard.tsx
│   │   │       ├── FloatingActionButton.tsx
│   │   │       ├── SkeletonLoader.tsx
│   │   │       └── ThemeToggle.tsx
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Auth.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Log.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── Insights.tsx
│   │   │   ├── PCOD.tsx
│   │   │   └── Profile.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   └── styles/
│   │       └── index.css             # Global styles + Tailwind
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                           # FastAPI + scikit-learn
│   ├── main.py                       # FastAPI app entry
│   ├── models/
│   │   ├── pcod_model.py             # RandomForest PCOD predictor
│   │   ├── cycle_predictor.py        # Linear regression cycle prediction
│   │   └── anomaly_detector.py       # Isolation forest
│   ├── routes/
│   │   ├── prediction.py             # /api/predict-pcod, /api/predict-next-cycle
│   │   └── health.py                 # /api/health
│   ├── schemas/
│   │   └── requests.py               # Pydantic request/response models
│   ├── data/
│   │   └── generate_synthetic.py     # Synthetic training data generator
│   ├── requirements.txt
│   └── train_model.py                # Script to train and save models
│
└── README.md
```

---

## Proposed Changes

### Phase 1: Project Scaffolding + Design System

#### [NEW] Frontend Vite project
- Scaffold with `npx -y create-vite@latest ./ --template react-ts`
- Install all dependencies: tailwindcss, shadcn/ui, framer-motion, recharts, react-router-dom, firebase, dexie, crypto-js, jspdf, html2canvas, @tanstack/react-query, lucide-react, vite-plugin-pwa
- Configure Tailwind with custom feminine color palette:
  - `plum: #1A0A2E` (dark bg)
  - `rose: #C94B8A` (primary)
  - `lavender: #B39DDB` (secondary)
  - `cream: #F8F0FF` (light surface)
  - `coral: #FF6B9D` (highlight)
- Set up Google Fonts (Playfair Display + Inter)
- Global CSS with glassmorphism utilities, glow shadows, particle animations

#### [NEW] `tailwind.config.ts`
- Extended theme with all custom colors, fonts, border-radius defaults (16px min)
- Custom animations: float, pulse-glow, slide-up, fade-in

#### [NEW] `src/styles/index.css`
- Tailwind directives
- CSS custom properties for theme colors
- Glassmorphism card classes
- Particle background keyframes
- Dark/light mode variables

---

### Phase 2: Auth Flow

#### [NEW] `src/config/firebase.ts`
- Firebase app initialization with config (placeholder keys)
- Auth, Firestore exports

#### [NEW] `src/contexts/AuthContext.tsx`
- Firebase Auth state management
- Sign in with email/password
- Google OAuth sign-in
- Sign out, onAuthStateChanged listener

#### [NEW] `src/pages/Auth.tsx`
- Beautiful split-screen auth page
- Login/Signup toggle with animated transition
- Email + password fields with validation
- Google OAuth button
- Glassmorphism card design

#### [NEW] `src/pages/Landing.tsx`
- Hero section with gradient background + flowing shapes
- Feature highlights (6 features in grid)
- CTA buttons to sign up
- Testimonial section
- Footer

---

### Phase 3: Layout + Dashboard

#### [NEW] `src/components/layout/AppLayout.tsx`
- Responsive layout: sidebar on desktop (≥1024px), bottom nav on mobile
- Framer Motion page transitions

#### [NEW] `src/components/layout/Sidebar.tsx`
- Vertical nav with icons + labels
- Active state highlighting
- User avatar at top

#### [NEW] `src/components/layout/BottomNav.tsx`
- 5-tab bottom bar: Home, Log, Calendar, Insights, PCOD
- Active tab indicator animation
- Minimum 44px tap targets

#### [NEW] `src/pages/Dashboard.tsx`
- Greeting header with time-of-day awareness
- CycleStatusCard: current day, phase, prediction
- WellnessRing: circular SVG progress
- PCODMeter: animated semi-circle gauge
- UpcomingEvents: horizontal scroll strip
- InsightOfDay: context-aware tip card
- ParticleBackground: animated blob/particle canvas
- FloatingActionButton linked to /log

---

### Phase 4: Log Page

#### [NEW] `src/pages/Log.tsx`
- Multi-step swipeable form (6 steps)
- Progress indicator at top
- Framer Motion AnimatePresence for step transitions
- Each step as a separate component
- Save to Dexie.js + Firestore
- Confetti animation on save

#### [NEW] Step components (6 files)
- CycleStatusStep: animated Yes/No/Still going toggles
- FlowIntensityStep: 5-level visual selector with droplet icons
- SymptomsStep: pill chip grid (tappable, multi-select)
- MoodStep: 8 emoji faces with names
- LifestyleStep: sleep slider, stress visual, water intake
- NotesStep: textarea with character count

---

### Phase 5: Calendar

#### [NEW] `src/pages/Calendar.tsx`
- Full monthly grid view
- Color-coded days per spec (period=rose, predicted=lavender, fertile=pink, ovulation=gold)
- Month navigation with slide animation
- Cycle summary strip below calendar
- Bottom sheet drawer on day click showing logged data

---

### Phase 6: Insights

#### [NEW] `src/pages/Insights.tsx`
- Recharts-based dashboard
- CycleLengthChart: line chart with confidence band
- SymptomHeatmap: frequency grid
- MoodRadar: radar/spider chart by phase
- FlowChart: bar chart per cycle
- RegularityScore: big animated number
- Mobile carousel layout, desktop grid
- PDF export button

---

### Phase 7: PCOD Risk Page

#### [NEW] `src/pages/PCOD.tsx`
- RiskGauge: animated arc 0-100
- FactorBreakdown: progress bars with explanations
- Risk trend line chart (6 months)
- "What this means" section
- Doctor CTA when score > 60
- Disclaimer footer
- PDF export button
- Calls FastAPI backend

---

### Phase 8: FastAPI ML Backend

#### [NEW] `backend/main.py`
- FastAPI app with CORS
- Two prediction endpoints

#### [NEW] `backend/models/pcod_model.py`
- RandomForestClassifier trained on synthetic data
- 6 features: cycle_variance, avg_gap, symptom_score, acne_flag, hair_loss_flag, flow_irregularity
- Returns risk_score, risk_level, factor importance weights

#### [NEW] `backend/models/cycle_predictor.py`
- Linear regression + rolling mean
- Predicts next cycle start/end with confidence interval

#### [NEW] `backend/models/anomaly_detector.py`
- Isolation Forest for cycle pattern anomalies

#### [NEW] `backend/data/generate_synthetic.py`
- Generates synthetic training dataset
- Realistic PCOD feature distributions

#### [NEW] `backend/train_model.py`
- Trains and saves models to pickle files

---

### Phase 9: PWA Configuration

#### [NEW] `vite.config.ts` updates
- vite-plugin-pwa configuration
- Workbox runtime caching strategies
- Precache manifest

#### [NEW] `public/manifest.json`
- App name, icons, theme color, background color
- Display: standalone
- Lotus/moon motif icons (generated)

#### [NEW] Service worker config
- Cache-first for static assets
- Network-first for API calls
- Offline fallback page

---

### Phase 10: Offline Data + PDF Export + Polish

#### [NEW] `src/lib/db.ts`
- Dexie.js database schema
- Tables: logs, cycles, profile, predictions

#### [NEW] `src/lib/sync.ts`
- Online/offline detection
- Queue changes while offline
- Sync to Firestore when back online

#### [NEW] `src/lib/encryption.ts`
- AES encryption/decryption helpers
- Encrypt before Firestore write

#### [NEW] `src/lib/pdf-export.ts`
- jsPDF + html2canvas
- Doctor report template
- Branded header, disclaimer footer

---

## Verification Plan

### Automated Tests
- `npm run build` — Ensure zero TypeScript/build errors
- `npm run dev` — Verify dev server starts and all routes load
- Lighthouse audit target: PWA score 95+
- Backend: `uvicorn main:app` — Verify API endpoints return correct responses
- Test both prediction endpoints with sample payloads

### Manual Verification
- Browser testing at 375px, 768px, 1024px, 1440px viewports
- PWA install prompt verification
- Offline mode: disable network, verify app loads from cache
- Dark/light mode toggle
- Full logging flow: all 6 steps + confetti
- Calendar navigation and day detail drawer
- Charts render with sample data
- PCOD prediction flow end-to-end
- PDF export generates valid document
