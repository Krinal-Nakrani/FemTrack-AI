# FemTrack AI 🌸

**Smart Period Tracking & PCOD Risk Prediction System**

A production-quality Progressive Web App with AI-powered cycle predictions, PCOD risk assessment, and beautiful, responsive UI.

---

## 🚀 Quick Start

### 1. Clone & Setup Environment

```bash
git clone https://github.com/YOUR_USERNAME/FemTrack-AI.git
cd FemTrack-AI
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env          # Copy and fill in your Firebase credentials
npm install
npm run dev
```

Open http://localhost:5173

### 3. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt

# Train the ML model (run once)
python train_model.py

# Start the API server
python main.py
# or: uvicorn main:app --reload --port 8000
```

API available at http://localhost:8000  
API docs at http://localhost:8000/docs

---

## 🔑 Environment Variables

### Frontend (`frontend/.env`)

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | Firebase Console → Project Settings → General |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain | Same as above |
| `VITE_FIREBASE_PROJECT_ID` | Project ID | Same as above |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket | Same as above |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID | Same as above |
| `VITE_FIREBASE_APP_ID` | App ID | Same as above |
| `VITE_FIREBASE_VAPID_KEY` | Web Push VAPID key | Firebase Console → Cloud Messaging → Web Push Certificates |
| `VITE_ENCRYPTION_KEY` | AES encryption key (64 hex chars) | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `VITE_ADMIN_EMAIL_1` | Primary Admin Email | Define in your private `.env` |
| `VITE_ADMIN_PASS_1` | Primary Admin Password | Define in your private `.env` |
| `VITE_ADMIN_EMAIL_2` | Secondary Admin Email | Define in your private `.env` |
| `VITE_ADMIN_PASS_2` | Secondary Admin Password | Define in your private `.env` |

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173` |
| `MODEL_DIR` | Trained model directory | `./saved_models` |

> **⚠️ Never commit `.env` files.** Only `.env.example` files are tracked in git.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| PWA | vite-plugin-pwa + Workbox |
| Offline DB | Dexie.js (IndexedDB) |
| Auth + Cloud | Firebase v10 |
| Encryption | crypto-js (AES-256) |
| PDF Export | jsPDF + html2canvas |
| Backend | FastAPI + scikit-learn |
| Data Fetching | TanStack Query v5 |
| Routing | React Router v6 |
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion.
- **Backend**: Python (FastAPI), Uvicorn.
- **Database**: 
    - **Local**: Dexie.js (IndexedDB) for primary health data.
    - **Cloud**: Firebase Firestore for invitation management and role-based access.
- **Auth**: Firebase Authentication.
- **Email**: Resend API for secure automated invitations.
- **Machine Learning**: Scikit-learn (Random Forest) for PCOD risk prediction.

---

## 📱 Features

- 🛡️ **Central Command Admin Dashboard** — Full-access management portal to manage Users, Partners, and Medical Professionals with complete CRUD operations.
- 📅 **Smart Cycle Tracking** — Log flow, symptoms, mood, and lifestyle with AI predictions and anomaly detection.
- 🌸 **Personalized Onboarding** — New users can seed their dashboard with last cycle dates and average stats for immediate, accurate predictions.
- 🤝 **Partner Sharing** — Invite your partner with a secure code to view your dashboard via a dedicated, single-page portal.
- 🩺 **Doctor Ecosystem** — Verified gynecologists can access patient dashboards and answer queries within the community thread.
- 🤖 **PCOD Risk Prediction** — ML-powered hormonal health assessment (Random Forest model).
- 📊 **Deep Insights** — 5 interactive chart types: cycle length, symptoms, mood, flow, and regularity.
- ☁️ **Hybrid Storage** — Offline-first IndexedDB with seamless cloud sync to Firebase Firestore.
- 📱 **PWA Ready** — Installable, offline-capable, and optimized with a "More" drawer for mobile navigation.
- 📄 **Professional Reports** — Export doctor-ready PDF health reports with one click.
- 🔒 **Privacy First** — Client-side AES-256 encryption for sensitive health data.
---

## 🤖 ML Models

| Model | Algorithm | Purpose |
|-------|-----------|---------|
| PCOD Risk | RandomForestClassifier | 6-feature risk scoring (0–100) |
| Cycle Prediction | Linear Regression + Rolling Mean | Next period prediction with confidence |
| Anomaly Detection | Isolation Forest | Irregular cycle pattern detection |

---

## 📂 Project Structure

```
FemTrack-AI/
├── frontend/
│   ├── public/              # PWA icons, manifest
│   ├── src/
│   │   ├── components/      # 17 reusable components
│   │   ├── pages/           # 8 pages (Landing → Profile)
│   │   ├── contexts/        # Auth + Theme providers
│   │   ├── hooks/           # useCycle, useOnlineStatus
│   │   ├── lib/             # DB, encryption, sync, PDF
│   │   ├── config/          # Firebase, constants
│   │   └── styles/          # Global CSS + Tailwind
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── models/              # ML models (PCOD, cycle, anomaly)
│   ├── schemas/             # Pydantic request/response
│   ├── data/                # Synthetic data generator
│   ├── main.py              # FastAPI app
│   ├── train_model.py       # Model training script
│   ├── .env.example
│   └── requirements.txt
├── .gitignore
└── README.md
```

---

## 🚀 Push to GitHub — Step-by-Step

### First-Time Setup

```bash
# 1. Navigate to your project
cd "d:\antigravity projects\FemTrack AI"

# 2. Initialize git repository
git init

# 3. Create your .env files (DO NOT commit these!)
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
# → Edit both .env files with your actual credentials

# 4. Stage all files
git add .

# 5. Verify .gitignore is working (these should NOT appear):
#    - .env files
#    - node_modules/
#    - __pycache__/
#    - saved_models/
git status

# 6. Create initial commit
git commit -m "feat: initial commit — FemTrack AI PWA with ML backend"

# 7. Create the GitHub repo (choose ONE method):

# METHOD A — Using GitHub CLI (if installed):
gh repo create FemTrack-AI --public --source=. --remote=origin --push

# METHOD B — Manual:
#   a. Go to https://github.com/new
#   b. Repo name: FemTrack-AI
#   c. Description: Smart Period Tracking & PCOD Risk Prediction PWA
#   d. Public or Private → Create
#   e. Then run:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/FemTrack-AI.git
git push -u origin main
```

### Adding a Contributor

```bash
# METHOD 1 — Via GitHub Web UI (Recommended)
# 1. Go to: https://github.com/YOUR_USERNAME/FemTrack-AI/settings/access
# 2. Click "Add people"
# 3. Search by GitHub username or email
# 4. Select role: "Write" (can push) or "Admin" (full access)
# 5. Click "Add to repository"
# → They will receive an email invitation to accept

# METHOD 2 — Using GitHub CLI
gh api repos/YOUR_USERNAME/FemTrack-AI/collaborators/CONTRIBUTOR_USERNAME \
  -X PUT -f permission=push
```

### After Adding Contributor — They Should Run:

```bash
# 1. Accept the invitation (email or https://github.com/notifications)

# 2. Clone the repo
git clone https://github.com/YOUR_USERNAME/FemTrack-AI.git
cd FemTrack-AI

# 3. Set up their own .env files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
# → Edit with their own Firebase credentials (or shared project credentials)

# 4. Install dependencies
cd frontend && npm install && cd ..
cd backend && pip install -r requirements.txt && python train_model.py && cd ..

# 5. Start developing
cd frontend && npm run dev
# In another terminal: cd backend && python main.py
```

### Daily Git Workflow

```bash
# Pull latest changes
git pull origin main

# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes, then:
git add .
git commit -m "feat: describe your change"
git push origin feature/your-feature-name

# Create a Pull Request on GitHub for review
# After merge, switch back:
git checkout main
git pull origin main
```

---

## 👥 Contributors

<!-- Add contributors here -->
| Avatar | Name | Role | GitHub |
|--------|------|------|--------|
| 🌸 | Krinal Nakrani | Lead Developer | [@Krinal-Nakrani](https://github.com/Krinal-Nakrani) |
| 🌸 | Sanika Ghadage | Developer | [@sanika-ghadage](https://github.com/sanika-ghadage) |

---

## 📄 License

MIT © 2026 FemTrack AI

---

> **Disclaimer:** FemTrack AI is not a medical device. The PCOD risk assessment provides estimates based on self-reported data and statistical models. Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment.
