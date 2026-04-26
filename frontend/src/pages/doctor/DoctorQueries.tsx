import { useState, useEffect } from 'react';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { QueryCard } from '@/components/community/QueryCard';
import { GlassCard } from '@/components/shared/GlassCard';
import { useNavigate } from 'react-router-dom';

const FILTERS = ['All', 'Mentioned Me', 'Unanswered', 'PCOD', 'Irregular Cycle', 'General'];

export function DoctorQueries() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [queries, setQueries] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueries();
  }, [user]);

  async function loadQueries() {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'queries'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setQueries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error loading queries:', err);
    }
    setLoading(false);
  }

  const filtered = queries.filter(q => {
    if (filter === 'Mentioned Me') return q.mentionedDoctors?.includes(user?.uid);
    if (filter === 'Unanswered') return (q.answerCount || 0) === 0;
    if (filter !== 'All') return q.tags?.includes(filter);
    return true;
  }).filter(q => {
    if (!search) return true;
    const s = search.toLowerCase();
    return q.title?.toLowerCase().includes(s) || q.body?.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/doctor-dashboard')}
          className="p-2.5 rounded-xl bg-teal/10 text-teal-400 hover:bg-teal/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-display font-bold text-white">All Queries</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender/40" />
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm focus:outline-none focus:border-teal/50 transition-colors"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all ${
              filter === f
                ? 'bg-teal/20 text-teal-300 border border-teal/30'
                : 'bg-plum-700/30 text-lavender/50 hover:text-lavender/80 border border-transparent'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(q => (
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
              isMentioned={q.mentionedDoctors?.includes(user?.uid)}
              basePath="/doctor-dashboard"
            />
          ))}
        </div>
      ) : (
        <GlassCard hover={false} padding="lg">
          <p className="text-sm text-lavender/40 font-body text-center">
            No queries found matching your filter.
          </p>
        </GlassCard>
      )}
    </div>
  );
}

export default DoctorQueries;
