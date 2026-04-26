import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCycle } from '@/hooks/useCycle';
import { getGreeting } from '@/lib/utils';
import { ParticleBackground } from '@/components/dashboard/ParticleBackground';
import { CycleStatusCard } from '@/components/dashboard/CycleStatusCard';
import { WellnessRing } from '@/components/dashboard/WellnessRing';
import { PCODMeter } from '@/components/dashboard/PCODMeter';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { InsightOfDay } from '@/components/dashboard/InsightOfDay';
import { DashboardSkeleton } from '@/components/shared/SkeletonLoader';

import { MessageSquare, CheckCircle, Users } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { useNavigate } from 'react-router-dom';
import femtrackDB from '@/lib/db';
import { useEffect, useState, useRef } from 'react';
import { Send, Bot, X, MessageCircle } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const { cycleData, loading } = useCycle();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      femtrackDB.profiles.where('odataId').equals(user.uid).first().then(p => {
        if (p?.role === 'partner') {
          navigate('/partner-dashboard', { replace: true });
        }
      });
    }
  }, [user, navigate]);

  const firstName = user?.displayName?.split(' ')[0] || 'there';

  // Calculate how many categories were logged today
  const todayLog = cycleData.todayLog;
  let loggedCount = 0;
  const totalCategories = 5; // flow, symptoms, mood, lifestyle, notes
  if (todayLog) {
    if (todayLog.flowLevel > 0) loggedCount++;
    if (todayLog.symptoms.length > 0) loggedCount++;
    if (todayLog.mood) loggedCount++;
    if (todayLog.sleepHours > 0 || todayLog.stressLevel > 0) loggedCount++;
    if (todayLog.notes) loggedCount++;
  }

  if (loading) {
    return (
      <div className="relative">
        <ParticleBackground />
        <div className="relative z-10">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <ParticleBackground />

      <div className="relative z-10 space-y-6">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
              {getGreeting()}, {firstName} 🌸
            </h1>
            <p className="text-sm text-lavender/60 font-body mt-1">
              Here's your cycle overview
            </p>
          </div>
        </motion.div>

        {/* Cycle Status — large prominent card */}
        <CycleStatusCard
          currentDay={cycleData.currentDay}
          phase={cycleData.phase}
          daysUntilNext={cycleData.daysUntilNext}
          confidenceWindow={cycleData.confidenceWindow}
          avgCycleLength={cycleData.avgCycleLength}
        />

        {/* Wellness Ring + PCOD Meter */}
        <div className="grid grid-cols-2 gap-4">
          <WellnessRing logged={loggedCount} total={totalCategories} />
          <PCODMeter score={(() => { try { const s = JSON.parse(localStorage.getItem('femtrack_pcod_scans') || '[]'); return s.length > 0 ? s[s.length - 1].pcod_risk_score : 25; } catch { return 25; } })()} riskLevel={(() => { try { const s = JSON.parse(localStorage.getItem('femtrack_pcod_scans') || '[]'); return s.length > 0 ? s[s.length - 1].pcod_risk_level : 'low'; } catch { return 'low' as const; } })()} />
        </div>

        {/* Upcoming Events */}
        <UpcomingEvents
          nextPeriod={cycleData.nextPredicted}
          fertileStart={cycleData.fertileWindowStart}
          fertileEnd={cycleData.fertileWindowEnd}
          ovulationDate={cycleData.ovulationDate}
        />

        {/* Insight of the Day */}
        <InsightOfDay phase={cycleData.phase} />
      </div>
      {/* Community Section */}
      <section className="mt-8">
        <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="text-rose-400" size={20} /> Community & Support
        </h2>
        <GlassCard padding="lg" className="bg-gradient-to-br from-rose/10 to-plum-700/50 cursor-pointer" onClick={() => navigate('/community')}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-display font-bold text-white mb-2">Have a question about your health?</h3>
              <p className="text-sm text-lavender/60 font-body max-w-xl">
                Our community is here to support you. Ask questions anonymously or get direct advice from verified gynecologists and specialists.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 text-xs text-lavender/40 font-body">
                  <CheckCircle size={14} className="text-teal-400" /> 10+ Verified Doctors
                </div>
                <div className="flex items-center gap-2 text-xs text-lavender/40 font-body">
                  <Users size={14} className="text-rose-400" /> 2,000+ Members
                </div>
              </div>
            </div>
            <button className="btn-primary self-start md:self-center whitespace-nowrap">
              Explore Community
            </button>
          </div>
        </GlassCard>
      </section>
      <ChatBot />
    </div>
  );
}

export default Dashboard;

// ─── AI CHATBOT WIDGET ───
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hi! 👋 I\'m your FemTrack AI assistant. Ask me anything about periods, PCOD, symptoms, or women\'s health!' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      if (!GEMINI_KEY) throw new Error('No key');
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `You are a warm, knowledgeable women's health assistant for FemTrack AI app. Answer concisely in 2-3 sentences. Be empathetic and supportive. If asked about serious symptoms, always recommend consulting a doctor.\n\nUser: ${userMsg}` }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
          }),
        }
      );
      const json = await res.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text || 'I\'m here to help! Could you rephrase that?';
      setMessages((prev) => [...prev, { role: 'bot', text }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: 'I\'m having trouble connecting right now. Please try again in a moment! 💜' }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-rose flex items-center justify-center shadow-xl shadow-rose-500/30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 glass-card rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: 450 }}
          >
            <div className="px-4 py-3 border-b border-lavender/10 flex items-center gap-2">
              <Bot size={18} className="text-purple-400" />
              <span className="text-sm font-display font-bold text-white">FemTrack AI Assistant</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: 320 }}>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs font-body leading-relaxed ${
                    m.role === 'user' ? 'bg-purple-600/30 text-white' : 'bg-white/5 text-lavender/80'
                  }`}>{m.text}</div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 px-3 py-2 rounded-xl">
                    <div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" /><div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.1s' }} /><div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.2s' }} /></div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="px-3 py-2 border-t border-lavender/10 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask anything..."
                className="flex-1 px-3 py-2 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-xs focus:outline-none focus:border-purple-400/50"
              />
              <button onClick={send} disabled={loading || !input.trim()} className="p-2 rounded-xl bg-purple-600/30 text-purple-300 disabled:opacity-30">
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
