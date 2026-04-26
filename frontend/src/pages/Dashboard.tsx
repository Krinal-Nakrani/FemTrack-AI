import { motion } from 'framer-motion';
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

import { MessageSquare, CheckCircle, Users, Bot, Send, X } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { useNavigate } from 'react-router-dom';
import femtrackDB from '@/lib/db';
import { useEffect, useState } from 'react';

export function Dashboard() {
  const { user } = useAuth();
  const { cycleData, loading } = useCycle();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string; text: string}[]>([
    { role: 'bot', text: 'Hi! I\'m your FemTrack AI assistant. Ask me anything about periods, PCOD, cycle tracking, or women\'s health. 💜' },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

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
          <PCODMeter score={(() => { const h = JSON.parse(localStorage.getItem('femtrack_pcod_scans') || '[]'); return h.length > 0 ? h[h.length - 1].pcod_risk_score : 25; })()} riskLevel={(() => { const h = JSON.parse(localStorage.getItem('femtrack_pcod_scans') || '[]'); return h.length > 0 ? h[h.length - 1].pcod_risk_level : 'low'; })()} />
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

      {/* AI Chatbot FAB + Panel */}
      <motion.button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-24 lg:bottom-8 right-6 z-50 w-14 h-14 rounded-full gradient-rose flex items-center justify-center shadow-lg shadow-rose/30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {chatOpen ? <X size={22} className="text-white" /> : <Bot size={22} className="text-white" />}
      </motion.button>

      {chatOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-40 lg:bottom-24 right-6 z-50 w-[340px] max-h-[420px] glass-card rounded-2xl overflow-hidden flex flex-col"
        >
          <div className="px-4 py-3 border-b border-lavender/10 flex items-center gap-2">
            <Bot size={16} className="text-purple-400" />
            <span className="text-sm font-body font-semibold text-white">FemTrack AI Assistant</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[280px]">
            {chatHistory.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs font-body leading-relaxed ${m.role === 'user' ? 'bg-purple-600/30 text-white' : 'bg-plum-700/50 text-lavender/80'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl bg-plum-700/50 text-lavender/60 text-xs">Thinking...</div>
              </div>
            )}
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!chatMsg.trim() || chatLoading) return;
            const userMsg = chatMsg.trim();
            setChatMsg('');
            setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
            setChatLoading(true);
            try {
              const key = import.meta.env.VITE_GEMINI_API_KEY || '';
              if (!key) {
                setChatHistory(prev => [...prev, { role: 'bot', text: 'I can help with questions about periods, PCOD, cycle tracking, and women\'s health. Please configure the Gemini API key for full responses.' }]);
                setChatLoading(false);
                return;
              }
              const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: `You are FemTrack AI, a warm and knowledgeable women's health assistant. Answer questions about periods, menstrual health, PCOD/PCOS, cycle tracking, and general women's wellness. Be empathetic, accurate, and concise (2-3 sentences max). Always remind users to consult a doctor for medical concerns. User question: ${userMsg}` }] }],
                  generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
                }),
              });
              const json = await res.json();
              const answer = json.candidates?.[0]?.content?.parts?.[0]?.text || 'I\'m not sure about that. Please consult your doctor for medical advice.';
              setChatHistory(prev => [...prev, { role: 'bot', text: answer }]);
            } catch {
              setChatHistory(prev => [...prev, { role: 'bot', text: 'Sorry, I couldn\'t process that. Try again later!' }]);
            }
            setChatLoading(false);
          }} className="p-2 border-t border-lavender/10 flex gap-2">
            <input
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              placeholder="Ask about periods, PCOD..."
              className="flex-1 px-3 py-2 rounded-lg bg-plum-700/50 border border-lavender/10 text-white font-body text-xs placeholder-lavender/30 focus:outline-none focus:border-purple-400/50"
            />
            <button type="submit" disabled={chatLoading} className="px-3 py-2 rounded-lg bg-purple-600/30 text-purple-300 disabled:opacity-30">
              <Send size={14} />
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}

export default Dashboard;
