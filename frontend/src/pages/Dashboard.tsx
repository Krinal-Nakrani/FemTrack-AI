import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCycle } from '@/hooks/useCycle';
import { getGreeting, getPhaseLabel, getPhaseEmoji, getPhaseColor } from '@/lib/utils';
import { ParticleBackground } from '@/components/dashboard/ParticleBackground';
import { CycleStatusCard } from '@/components/dashboard/CycleStatusCard';
import { WellnessRing } from '@/components/dashboard/WellnessRing';
import { PCODMeter } from '@/components/dashboard/PCODMeter';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { InsightOfDay } from '@/components/dashboard/InsightOfDay';
import { DashboardSkeleton } from '@/components/shared/SkeletonLoader';

import { MessageSquare, CheckCircle, Users, Bot, Send, X, Sparkles, Activity, Dumbbell, Shield, Calendar, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { useNavigate } from 'react-router-dom';
import femtrackDB from '@/lib/db';
import { useEffect, useState, useRef } from 'react';

export function Dashboard() {
  const { user } = useAuth();
  const { cycleData, loading } = useCycle();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string; text: string}[]>([
    { role: 'bot', text: 'Hi! I\'m your FemTrack AI assistant 💜 Ask me anything about periods, PCOD, cycle tracking, yoga, or women\'s health!' },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (user) {
      femtrackDB.profiles.where('odataId').equals(user.uid).first().then(p => {
        if (p?.role === 'partner') navigate('/partner-dashboard', { replace: true });
      });
    }
  }, [user, navigate]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const firstName = user?.displayName?.split(' ')[0] || 'there';
  const phaseColor = getPhaseColor(cycleData.phase);
  const pcodHistory = JSON.parse(localStorage.getItem('femtrack_pcod_scans') || '[]');
  const pcodScore = pcodHistory.length > 0 ? pcodHistory[pcodHistory.length - 1].pcod_risk_score : 25;
  const pcodLevel = pcodHistory.length > 0 ? pcodHistory[pcodHistory.length - 1].pcod_risk_level : 'low';

  const todayLog = cycleData.todayLog;
  let loggedCount = 0;
  const totalCategories = 5;
  if (todayLog) {
    if (todayLog.flowLevel > 0) loggedCount++;
    if (todayLog.symptoms.length > 0) loggedCount++;
    if (todayLog.mood) loggedCount++;
    if (todayLog.sleepHours > 0 || todayLog.stressLevel > 0) loggedCount++;
    if (todayLog.notes) loggedCount++;
  }

  const sendChat = async (msg: string) => {
    if (!msg.trim() || chatLoading) return;
    setChatMsg('');
    setChatHistory(prev => [...prev, { role: 'user', text: msg.trim() }]);
    setChatLoading(true);
    try {
      const key = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (!key) {
        setChatHistory(prev => [...prev, { role: 'bot', text: 'Please configure the Gemini API key for AI responses.' }]);
        setChatLoading(false);
        return;
      }
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are FemTrack AI, a warm and knowledgeable women's health assistant. You specialize in menstrual health, PCOD/PCOS, cycle tracking, yoga, nutrition, and general women's wellness. Be empathetic, accurate, and concise (2-4 sentences). Always remind users to consult a doctor for medical concerns. If asked non-health questions, politely redirect to health topics.\n\nUser's context: Cycle day ${cycleData.currentDay}, ${getPhaseLabel(cycleData.phase)} phase, PCOD score ${pcodScore}/100.\n\nUser question: ${msg.trim()}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 250 },
        }),
      });
      const json = await res.json();
      const answer = json.candidates?.[0]?.content?.parts?.[0]?.text || 'I\'m not sure. Please consult your doctor.';
      setChatHistory(prev => [...prev, { role: 'bot', text: answer }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'bot', text: 'Sorry, couldn\'t process that. Try again!' }]);
    }
    setChatLoading(false);
  };

  if (loading) {
    return (<div className="relative"><ParticleBackground /><div className="relative z-10"><DashboardSkeleton /></div></div>);
  }

  return (
    <div className="relative pb-20">
      <ParticleBackground />

      <div className="relative z-10 space-y-6">
        {/* Hero Greeting */}
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
              {getGreeting()}, {firstName} 🌸
            </h1>
            <p className="text-sm text-lavender/60 font-body mt-1">Here's your wellness overview</p>
          </div>
          <motion.div
            className="px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer"
            style={{ background: `${phaseColor}15`, border: `1px solid ${phaseColor}30` }}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/calendar')}
          >
            <span className="text-sm">{getPhaseEmoji(cycleData.phase)}</span>
            <span className="text-xs font-body font-medium" style={{ color: phaseColor }}>{getPhaseLabel(cycleData.phase)}</span>
          </motion.div>
        </motion.div>

        {/* Cycle Ring */}
        <CycleStatusCard
          currentDay={cycleData.currentDay}
          phase={cycleData.phase}
          daysUntilNext={cycleData.daysUntilNext}
          confidenceWindow={cycleData.confidenceWindow}
          avgCycleLength={cycleData.avgCycleLength}
        />

        {/* Wellness + PCOD */}
        <div className="grid grid-cols-2 gap-4">
          <WellnessRing logged={loggedCount} total={totalCategories} />
          <PCODMeter score={pcodScore} riskLevel={pcodLevel} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Activity, label: 'PCOD Scan', path: '/pcod-scan', color: '#EF4444' },
            { icon: Dumbbell, label: 'Exercise', path: '/exercise', color: '#4ADE80' },
            { icon: Shield, label: 'Passport', path: '/passport', color: '#60A5FA' },
            { icon: Calendar, label: 'Calendar', path: '/calendar', color: '#A78BFA' },
          ].map((action) => (
            <motion.button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="glass-card p-3 flex flex-col items-center gap-2 hover:border-lavender/20 transition-all group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${action.color}15` }}>
                <action.icon size={18} style={{ color: action.color }} />
              </div>
              <span className="text-[10px] text-lavender/60 font-body font-medium group-hover:text-white transition">{action.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Upcoming Events */}
        <UpcomingEvents
          nextPeriod={cycleData.nextPredicted}
          fertileStart={cycleData.fertileWindowStart}
          fertileEnd={cycleData.fertileWindowEnd}
          ovulationDate={cycleData.ovulationDate}
        />

        {/* AI Insight */}
        <InsightOfDay phase={cycleData.phase} />

        {/* Community */}
        <section>
          <h2 className="text-lg font-display font-bold text-white mb-3 flex items-center gap-2">
            <MessageSquare className="text-rose-400" size={18} /> Community & Support
          </h2>
          <GlassCard padding="md" className="bg-gradient-to-br from-rose/5 to-plum-700/30 cursor-pointer group" onClick={() => navigate('/community')}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-display font-semibold text-white mb-1">Have a health question?</h3>
                <p className="text-xs text-lavender/50 font-body">Ask anonymously or get advice from verified doctors</p>
                <div className="flex gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[10px] text-lavender/40 font-body"><CheckCircle size={10} className="text-teal-400" /> 10+ Doctors</span>
                  <span className="flex items-center gap-1 text-[10px] text-lavender/40 font-body"><Users size={10} className="text-rose-400" /> 2K+ Members</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-rose/10 text-rose-400 group-hover:bg-rose/20 transition">
                <ArrowRight size={18} />
              </div>
            </div>
          </GlassCard>
        </section>
      </div>

      {/* AI Chatbot FAB */}
      <motion.button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-24 lg:bottom-8 right-6 z-50 w-14 h-14 rounded-full gradient-rose flex items-center justify-center shadow-xl shadow-rose/30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ boxShadow: chatOpen ? '0 0 0 0 transparent' : ['0 0 0 0 rgba(201,75,138,0.4)', '0 0 0 12px rgba(201,75,138,0)', '0 0 0 0 rgba(201,75,138,0.4)'] }}
        transition={{ duration: 2, repeat: chatOpen ? 0 : Infinity }}
      >
        {chatOpen ? <X size={22} className="text-white" /> : <Bot size={22} className="text-white" />}
      </motion.button>

      {/* Chatbot Panel */}
      {chatOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-40 lg:bottom-24 right-4 z-50 w-[350px] glass-card rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          style={{ maxHeight: 440 }}
        >
          <div className="px-4 py-3 border-b border-lavender/10 flex items-center gap-2 bg-gradient-to-r from-purple-600/10 to-rose/10">
            <div className="w-7 h-7 rounded-full gradient-rose flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-body font-semibold text-white">FemTrack AI</span>
              <span className="text-[10px] text-green-400 font-body ml-2">● Online</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: 300 }}>
            {chatHistory.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs font-body leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-purple-600/30 text-white rounded-br-md'
                    : 'bg-plum-700/50 text-lavender/80 rounded-bl-md'
                }`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl bg-plum-700/50 text-lavender/50 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions */}
          {chatHistory.length <= 2 && (
            <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto">
              {['What is PCOD?', 'Period pain tips', 'Best yoga for cramps'].map(q => (
                <button key={q} onClick={() => sendChat(q)} className="flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-purple-600/15 text-purple-300 font-body hover:bg-purple-600/25 transition">
                  {q}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); sendChat(chatMsg); }} className="p-2 border-t border-lavender/10 flex gap-2">
            <input
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              placeholder="Ask about periods, PCOD, yoga..."
              className="flex-1 px-3 py-2.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white font-body text-xs placeholder-lavender/30 focus:outline-none focus:border-purple-400/40"
            />
            <button type="submit" disabled={chatLoading || !chatMsg.trim()} className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600/40 to-rose/30 text-white disabled:opacity-30 transition">
              <Send size={14} />
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}

export default Dashboard;
