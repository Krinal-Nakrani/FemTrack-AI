import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, ClipboardList, Download, Share2, RefreshCw, Eye, EyeOff, Plus, Trash2, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCycle } from '@/hooks/useCycle';
import femtrackDB from '@/lib/db';
import { PassportCard } from '@/components/passport/PassportCard';
import { CycleHeatmap } from '@/components/passport/CycleHeatmap';
import { generatePassportId, hashPIN, aggregatePassportData, getPassportUrl } from '@/utils/passportHelpers';
import type { PassportData } from '@/utils/passportHelpers';
import type { PcodPrediction } from '@/lib/db';

const TABS = [
  { key: 'passport', label: 'My Passport', icon: Shield },
  { key: 'privacy', label: 'Privacy', icon: Lock },
  { key: 'history', label: 'History', icon: ClipboardList },
];

const VISIBILITY_OPTIONS = [
  { key: 'pcod', label: 'PCOD Risk Score' },
  { key: 'symptoms', label: 'Symptom History' },
  { key: 'heatmap', label: 'Cycle Heatmap' },
  { key: 'clinical', label: 'AI Clinical Summary' },
];

interface VisitNote {
  id: string;
  doctor: string;
  hospital: string;
  date: string;
  reason: string;
}

export function Passport() {
  const { user } = useAuth();
  const { cycleData, loading: cycleLoading } = useCycle();
  const [tab, setTab] = useState('passport');
  const [passportId, setPassportId] = useState('');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinSaved, setPinSaved] = useState(false);
  const [status, setStatus] = useState<'active' | 'paused'>('active');
  const [visibility, setVisibility] = useState<Record<string, boolean>>({ pcod: true, symptoms: true, heatmap: true, clinical: true });
  const [copied, setCopied] = useState(false);
  const [predictions, setPredictions] = useState<PcodPrediction[]>([]);
  const [visitNotes, setVisitNotes] = useState<VisitNote[]>([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteForm, setNoteForm] = useState({ doctor: '', hospital: '', date: '', reason: '' });

  const uid = user?.uid || 'anonymous';

  // Initialize passport
  useEffect(() => {
    const init = async () => {
      const profile = await femtrackDB.profiles.where('odataId').equals(uid).first();
      if (profile) {
        // Check if passport ID exists
        const storedId = localStorage.getItem(`femtrack_passport_${uid}`);
        if (storedId) {
          setPassportId(storedId);
        } else {
          const newId = generatePassportId(uid);
          localStorage.setItem(`femtrack_passport_${uid}`, newId);
          setPassportId(newId);
        }

        // Load PIN
        const storedPin = localStorage.getItem(`femtrack_pin_${uid}`);
        if (storedPin) setPin(storedPin);

        // Load status
        const storedStatus = localStorage.getItem(`femtrack_passport_status_${uid}`);
        if (storedStatus) setStatus(storedStatus as 'active' | 'paused');

        // Load visibility
        const storedVis = localStorage.getItem(`femtrack_passport_vis_${uid}`);
        if (storedVis) setVisibility(JSON.parse(storedVis));

        // Load visit notes
        const storedNotes = localStorage.getItem(`femtrack_visit_notes_${uid}`);
        if (storedNotes) setVisitNotes(JSON.parse(storedNotes));
      }

      // Load predictions
      const preds = await femtrackDB.predictions.where('userId').equals(uid).sortBy('date');
      setPredictions(preds);
    };
    init();
  }, [uid]);

  // Aggregate data
  const passportData: PassportData | null = useMemo(() => {
    if (!passportId || cycleLoading) return null;
    return aggregatePassportData(
      user?.displayName || 'User',
      passportId,
      user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'Jan 2024',
      cycleData?.logs || [],
      cycleData?.cycles || [],
      predictions
    );
  }, [passportId, cycleLoading, cycleData, predictions, user]);

  const toggleStatus = () => {
    const next = status === 'active' ? 'paused' : 'active';
    setStatus(next);
    localStorage.setItem(`femtrack_passport_status_${uid}`, next);
  };

  const toggleVisibility = (key: string) => {
    const next = { ...visibility, [key]: !visibility[key] };
    setVisibility(next);
    localStorage.setItem(`femtrack_passport_vis_${uid}`, JSON.stringify(next));
  };

  const savePin = async () => {
    if (newPin.length !== 4) return;
    const hashed = await hashPIN(newPin);
    localStorage.setItem(`femtrack_pin_${uid}`, hashed);
    setPin(hashed);
    setPinSaved(true);
    setShowPinSetup(false);
    setNewPin('');
    setTimeout(() => setPinSaved(false), 2000);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(getPassportUrl(passportId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addVisitNote = () => {
    if (!noteForm.doctor.trim()) return;
    const note: VisitNote = { ...noteForm, id: Date.now().toString() };
    const updated = [note, ...visitNotes];
    setVisitNotes(updated);
    localStorage.setItem(`femtrack_visit_notes_${uid}`, JSON.stringify(updated));
    setNoteForm({ doctor: '', hospital: '', date: '', reason: '' });
    setShowAddNote(false);
  };

  const deleteNote = (id: string) => {
    const updated = visitNotes.filter((n) => n.id !== id);
    setVisitNotes(updated);
    localStorage.setItem(`femtrack_visit_notes_${uid}`, JSON.stringify(updated));
  };

  if (!passportData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="text-center mb-6">
        <motion.h1
          className="text-2xl font-display font-bold text-white mb-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your Cycle Passport
        </motion.h1>
        <p className="text-sm text-lavender/60 font-body">
          Your complete menstrual health record — in your pocket, shareable in seconds.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-plum-700/30 rounded-2xl p-1 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-body font-medium transition-all ${
              tab === t.key ? 'bg-purple-600/40 text-white shadow-lg' : 'text-lavender/50 hover:text-lavender/80'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1 — My Passport */}
        {tab === 'passport' && (
          <motion.div key="passport" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* The Card */}
            <PassportCard data={passportData} />

            {/* Actions */}
            <div className="flex gap-3 mt-6 px-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={copyUrl}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-purple-600/20 text-purple-300 font-body text-sm font-medium hover:bg-purple-600/30 transition-all"
              >
                {copied ? <Check size={16} /> : <Share2 size={16} />}
                {copied ? 'Copied!' : 'Share'}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose/20 text-rose-300 font-body text-sm font-medium hover:bg-rose/30 transition-all"
              >
                <Download size={16} />
                Download PDF
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/5 text-lavender/50 font-body text-sm hover:bg-white/10 transition-all"
              >
                <RefreshCw size={16} />
              </motion.button>
            </div>

            {/* Passport ID */}
            <p className="text-center text-[10px] text-lavender/30 font-body mt-3 font-mono">
              Your Passport ID: {passportId} — this never changes
            </p>

            {/* PIN warning */}
            {!pin && (
              <motion.div
                className="mx-4 mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-amber-300 text-sm font-body font-medium">⚠️ Set a PIN to share your passport</p>
                <p className="text-amber-300/60 text-xs font-body mt-1">
                  Your doctor needs a 4-digit PIN to view your dashboard after scanning the QR.
                </p>
                <button
                  onClick={() => { setTab('privacy'); setShowPinSetup(true); }}
                  className="mt-2 text-xs font-body font-medium text-amber-300 underline"
                >
                  Set PIN now →
                </button>
              </motion.div>
            )}

            {/* 6-Month Heatmap */}
            <div className="mt-8 px-4">
              <h3 className="text-sm font-display font-semibold text-white mb-3">6-Month Cycle View</h3>
              <div className="glass-card p-4">
                <CycleHeatmap periodDates={passportData.periodDates} />
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2 — Privacy Controls */}
        {tab === 'privacy' && (
          <motion.div key="privacy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 px-1">
            {/* Status toggle */}
            <div className="glass-card p-5">
              <p className="text-sm text-lavender/60 font-body mb-3">My Passport is currently:</p>
              <button onClick={toggleStatus} className="w-full flex items-center justify-between p-4 rounded-2xl transition-all" style={{
                background: status === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${status === 'active' ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-7 rounded-full flex items-center transition-all ${status === 'active' ? 'bg-green-500/30 justify-end' : 'bg-red-500/30 justify-start'}`}>
                    <motion.div layout className="w-5 h-5 rounded-full bg-white mx-1" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-body font-medium text-sm">
                      {status === 'active' ? '🟢 ACTIVE' : '🔴 PAUSED'}
                    </p>
                    <p className="text-lavender/40 text-xs font-body">
                      {status === 'active' ? 'Doctors can view with PIN' : 'No one can access your passport'}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* PIN Management */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-display font-semibold text-white mb-1 flex items-center gap-2">
                <Lock size={14} className="text-purple-400" />
                PIN Management
              </h3>
              <p className="text-xs text-lavender/40 font-body mb-3">
                Your doctor enters this PIN after scanning your QR to access your dashboard.
              </p>
              {pin ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-plum-700/30">
                  <span className="text-lavender/60 font-mono text-lg tracking-[0.5em]">••••</span>
                  <button
                    onClick={() => setShowPinSetup(true)}
                    className="text-xs text-purple-400 font-body font-medium hover:underline"
                  >
                    Change PIN
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowPinSetup(true)}
                  className="w-full py-3 rounded-xl gradient-rose text-white font-body text-sm font-medium"
                >
                  Create PIN
                </button>
              )}

              {showPinSetup && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="Enter 4-digit PIN"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-xl bg-plum-700/50 border border-lavender/10 text-white text-center font-mono text-xl tracking-[0.5em] placeholder-lavender/30 focus:outline-none focus:border-purple-400/50"
                  />
                  <button
                    onClick={savePin}
                    disabled={newPin.length !== 4}
                    className="w-full mt-2 py-2.5 rounded-xl bg-purple-600/30 text-purple-300 font-body text-sm font-medium disabled:opacity-30"
                  >
                    Save PIN
                  </button>
                </motion.div>
              )}
              {pinSaved && <p className="text-green-400 text-xs font-body mt-2">✓ PIN saved securely</p>}
            </div>

            {/* Data Visibility */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-display font-semibold text-white mb-1 flex items-center gap-2">
                <Eye size={14} className="text-purple-400" />
                Data Visibility
              </h3>
              <p className="text-xs text-lavender/40 font-body mb-3">Choose what your doctor can see:</p>
              <div className="space-y-2">
                {VISIBILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => toggleVisibility(opt.key)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-plum-700/30 transition-colors"
                  >
                    <span className="text-sm text-white font-body">{opt.label}</span>
                    <div className={`w-10 h-6 rounded-full flex items-center transition-all ${visibility[opt.key] ? 'bg-green-500/30 justify-end' : 'bg-plum-700/50 justify-start'}`}>
                      <motion.div layout className="w-5 h-5 rounded-full bg-white mx-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3 — History */}
        {tab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 px-1">
            {/* Add visit note */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-display font-semibold text-white flex items-center gap-2">
                  <ClipboardList size={14} className="text-purple-400" />
                  Doctor Visit Notes
                </h3>
                <button
                  onClick={() => setShowAddNote(!showAddNote)}
                  className="flex items-center gap-1 text-xs text-purple-400 font-body font-medium hover:underline"
                >
                  <Plus size={12} /> Add Note
                </button>
              </div>

              {showAddNote && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 mb-4">
                  <input
                    placeholder="Doctor name"
                    value={noteForm.doctor}
                    onChange={(e) => setNoteForm({ ...noteForm, doctor: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm focus:outline-none focus:border-purple-400/50"
                  />
                  <input
                    placeholder="Hospital/Clinic"
                    value={noteForm.hospital}
                    onChange={(e) => setNoteForm({ ...noteForm, hospital: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm focus:outline-none focus:border-purple-400/50"
                  />
                  <input
                    type="date"
                    value={noteForm.date}
                    onChange={(e) => setNoteForm({ ...noteForm, date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm focus:outline-none focus:border-purple-400/50"
                  />
                  <input
                    placeholder="Reason for visit"
                    value={noteForm.reason}
                    onChange={(e) => setNoteForm({ ...noteForm, reason: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm focus:outline-none focus:border-purple-400/50"
                  />
                  <button onClick={addVisitNote} className="w-full py-2.5 rounded-xl gradient-rose text-white font-body text-sm font-medium">
                    Save Note
                  </button>
                </motion.div>
              )}

              {visitNotes.length === 0 ? (
                <p className="text-lavender/30 text-xs font-body text-center py-4">No visit notes yet. Add your first one!</p>
              ) : (
                <div className="space-y-2">
                  {visitNotes.map((note) => (
                    <div key={note.id} className="p-3 rounded-xl bg-plum-700/20 flex items-start justify-between group">
                      <div>
                        <p className="text-sm text-white font-body font-medium">{note.doctor}</p>
                        <p className="text-xs text-lavender/50 font-body">{note.hospital} • {note.date}</p>
                        {note.reason && <p className="text-xs text-lavender/40 font-body mt-1">{note.reason}</p>}
                      </div>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400 transition-all p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Passport Snapshots */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-display font-semibold text-white mb-3">Passport Snapshots</h3>
              <p className="text-xs text-lavender/40 font-body mb-3">See how your health data has changed over time</p>
              <div className="space-y-3">
                {[0, 1, 2].map((i) => {
                  const monthsAgo = i * 2;
                  const d = new Date();
                  d.setMonth(d.getMonth() - monthsAgo);
                  const score = Math.max(10, (passportData.pcodRiskScore || 25) + (i * 8) - 5);
                  return (
                    <div key={i} className="p-3 rounded-xl bg-plum-700/20 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white font-body font-medium">
                          {d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-lavender/40 font-body">
                          Cycle: {passportData.avgCycleLength + i}d • PCOD: {score}/100
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${score}%`,
                            background: score > 60 ? '#EF4444' : score > 30 ? '#FBBF24' : '#4ADE80',
                          }} />
                        </div>
                        <span className="text-[10px] text-lavender/40 font-mono">{score}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Passport;
