import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Users, Stethoscope, TrendingUp, HelpCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/config/firebase';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { QueryCard } from '@/components/community/QueryCard';
import { DoctorCard } from '@/components/community/DoctorCard';
import { GlassCard } from '@/components/shared/GlassCard';

const FILTERS = ['All Public', 'Doctors Only', 'My Questions', 'Unanswered'];

export default function Community() {
  const navigate = useNavigate();
  const [queries, setQueries] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filter, setFilter] = useState('All Public');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Load Queries
        const q = query(collection(db, 'queries'), orderBy('createdAt', 'desc'), limit(20));
        const qSnap = await getDocs(q);
        setQueries(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Load Featured Doctors
        const docQ = query(collection(db, 'doctors'), where('isVerified', '==', true), limit(4));
        const docSnap = await getDocs(docQ);
        setDoctors(docSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error loading community data:', err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredQueries = queries.filter(q => {
    if (filter === 'Doctors Only') return q.visibility === 'doctors_only';
    if (filter === 'Unanswered') return (q.answerCount || 0) === 0;
    // 'My Questions' filter would need current user check - simplified for now
    return true;
  }).filter(q => {
    if (!search) return true;
    return q.title?.toLowerCase().includes(search.toLowerCase()) || 
           q.body?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2.5 rounded-xl bg-plum-700/30 text-lavender/50 hover:text-white transition-colors lg:hidden"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="hidden lg:block">
           <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-xs font-body text-lavender/40 hover:text-rose-400 transition-colors mb-1"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Community Q&A</h1>
          <p className="text-lavender/60 font-body text-sm mt-1">Get expert advice and support from the community</p>
        </div>
        <button
          onClick={() => navigate('/community/ask')}
          className="btn-primary flex items-center justify-center gap-2 self-start shadow-glow-rose"
        >
          <Plus size={18} /> New Query
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender/30" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions about PCOD, cycles, fertility..."
                className="w-full bg-plum-700/30 border border-lavender/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-lavender/20 focus:outline-none focus:border-rose/50 transition-colors"
              />
            </div>
            
            <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-body font-medium transition-all whitespace-nowrap ${
                    filter === f 
                    ? 'bg-rose/20 text-rose-300 border border-rose/30' 
                    : 'bg-plum-700/30 text-lavender/50 border border-transparent hover:bg-plum-700/50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Query List */}
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)
            ) : filteredQueries.length > 0 ? (
              filteredQueries.map(query => (
                <QueryCard
                  key={query.id}
                  id={query.id}
                  title={query.title}
                  body={query.body}
                  authorName={query.authorName}
                  authorAvatar={query.authorAvatar}
                  isAnonymous={query.isAnonymous}
                  visibility={query.visibility}
                  tags={query.tags || []}
                  answerCount={query.answerCount || 0}
                  views={query.views || 0}
                  createdAt={query.createdAt}
                />
              ))
            ) : (
              <GlassCard padding="lg" className="text-center py-12">
                <HelpCircle size={48} className="text-lavender/20 mx-auto mb-4" />
                <h3 className="text-lg font-display font-bold text-white mb-2">No questions found</h3>
                <p className="text-sm text-lavender/40 font-body mb-6">Be the first to ask the community!</p>
                <button 
                  onClick={() => navigate('/community/ask')}
                  className="px-6 py-2.5 rounded-xl bg-rose/10 text-rose-300 text-sm font-body font-bold hover:bg-rose/20 transition-all"
                >
                  Ask Now
                </button>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Doctors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-display font-bold text-white flex items-center gap-2">
                <Stethoscope size={16} className="text-teal-400" /> Browse Doctors
              </h2>
              <button 
                onClick={() => navigate('/doctors')}
                className="text-[10px] font-body text-rose-400 font-bold uppercase tracking-widest hover:text-rose-300 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="grid gap-3">
              {doctors.map(doc => (
                <DoctorCard
                  key={doc.id}
                  uid={doc.id}
                  name={doc.name}
                  specialization={doc.specialization}
                  profilePhoto={doc.profilePhoto}
                  isVerified={doc.isVerified}
                  compact
                />
              ))}
            </div>
          </div>

          {/* Trending Tags */}
          <GlassCard padding="md">
            <h2 className="text-sm font-display font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-rose-400" /> Trending Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {['PCOD', 'Irregular Cycles', 'Fertility', 'Mood Swings', 'Nutrition', 'Period Pain', 'Hormones'].map(tag => (
                <button
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-plum-700/50 border border-lavender/5 text-xs text-lavender/60 font-body hover:border-rose/30 hover:text-rose-300 transition-all"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Community Stats */}
          <GlassCard padding="md" className="bg-gradient-to-br from-rose/10 to-plum-700/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose/20 flex items-center justify-center text-rose-400">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] text-lavender/40 font-body uppercase tracking-widest font-bold">Community Members</p>
                <p className="text-xl font-display font-bold text-white">2,480+</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
