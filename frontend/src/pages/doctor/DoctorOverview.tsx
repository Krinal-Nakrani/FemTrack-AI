import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, MessageCircle, Bell, Eye, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getGreeting } from '@/lib/utils';
import { GlassCard } from '@/components/shared/GlassCard';
import { QueryCard } from '@/components/community/QueryCard';
import { useNavigate } from 'react-router-dom';

interface DoctorData {
  name: string;
  specialization: string;
  profilePhoto?: string;
  isVerified: boolean;
  notificationCount: number;
}

export function DoctorOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [mentionedQueries, setMentionedQueries] = useState<any[]>([]);
  const [unansweredQueries, setUnansweredQueries] = useState<any[]>([]);
  const [stats, setStats] = useState({ answered: 0, mentions: 0, unread: 0 });

  useEffect(() => {
    if (!user) return;

    async function load() {
      // Load doctor profile
      const docSnap = await getDoc(doc(db, 'doctors', user!.uid));
      if (docSnap.exists()) {
        setDoctor(docSnap.data() as DoctorData);
      }

      // Load queries that mention this doctor
      try {
        const mentionQ = query(
          collection(db, 'queries'),
          where('mentionedDoctors', 'array-contains', user!.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const mentionSnap = await getDocs(mentionQ);
        setMentionedQueries(mentionSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setStats(prev => ({ ...prev, mentions: mentionSnap.size }));
      } catch (err) {
        console.error('Error loading mentions:', err);
      }

      // Load unanswered queries
      try {
        const unansQ = query(
          collection(db, 'queries'),
          where('answerCount', '==', 0),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const unansSnap = await getDocs(unansQ);
        setUnansweredQueries(unansSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error loading unanswered:', err);
      }

      // Count notifications
      try {
        const notifQ = query(
          collection(db, 'doctors', user!.uid, 'notifications'),
          where('isRead', '==', false)
        );
        const notifSnap = await getDocs(notifQ);
        setStats(prev => ({ ...prev, unread: notifSnap.size }));
      } catch (err) {}
    }

    load();
  }, [user]);

  const firstName = doctor?.name?.split(' ').slice(1).join(' ') || user?.displayName || 'Doctor';

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
          {getGreeting()}, {firstName} 🩺
        </h1>
        <p className="text-sm text-teal-400/60 font-body mt-1">Your clinical overview</p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Mentions', value: stats.mentions, color: 'text-rose-400' },
          { label: 'Unanswered', value: unansweredQueries.length, color: 'text-yellow-400' },
          { label: 'Unread Alerts', value: stats.unread, color: 'text-teal-400' },
          { label: 'Status', value: doctor?.isVerified ? '✅ Verified' : '⏳ Pending', color: 'text-lavender' },
        ].map((stat, i) => (
          <GlassCard key={i} hover={false} padding="sm">
            <p className="text-[10px] text-lavender/50 font-body uppercase tracking-wider">{stat.label}</p>
            <p className={`text-xl font-display font-bold ${stat.color} mt-1`}>{stat.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Recent Mentions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-display font-bold text-white">Recent Mentions</h2>
          <button
            onClick={() => navigate('/doctor-dashboard/queries')}
            className="text-[10px] text-teal-400 font-body flex items-center gap-1 hover:text-teal-300 transition-colors"
          >
            View All <ArrowRight size={10} />
          </button>
        </div>
        {mentionedQueries.length > 0 ? (
          <div className="space-y-3">
            {mentionedQueries.map(q => (
              <QueryCard
                key={q.id}
                id={q.id}
                title={q.title}
                body={q.body}
                authorName={q.authorName}
                isAnonymous={q.isAnonymous}
                visibility={q.visibility}
                tags={q.tags || []}
                mentionedDoctorNames={q.mentionedDoctorNames || []}
                answerCount={q.answerCount || 0}
                views={q.views || 0}
                createdAt={q.createdAt}
                isMentioned
                basePath="/doctor-dashboard"
              />
            ))}
          </div>
        ) : (
          <GlassCard hover={false} padding="md">
            <p className="text-xs text-lavender/40 font-body text-center py-4">
              No mentions yet. When patients tag you in questions, they'll appear here.
            </p>
          </GlassCard>
        )}
      </div>

      {/* Unanswered Queries */}
      <div>
        <h2 className="text-sm font-display font-bold text-white mb-3">Unanswered Questions</h2>
        {unansweredQueries.length > 0 ? (
          <div className="space-y-3">
            {unansweredQueries.slice(0, 3).map(q => (
              <QueryCard
                key={q.id}
                id={q.id}
                title={q.title}
                body={q.body}
                authorName={q.authorName}
                isAnonymous={q.isAnonymous}
                visibility={q.visibility}
                tags={q.tags || []}
                answerCount={0}
                views={q.views || 0}
                createdAt={q.createdAt}
                basePath="/doctor-dashboard"
              />
            ))}
          </div>
        ) : (
          <GlassCard hover={false} padding="md">
            <p className="text-xs text-lavender/40 font-body text-center py-4">
              All questions have been answered! 🎉
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

export default DoctorOverview;
