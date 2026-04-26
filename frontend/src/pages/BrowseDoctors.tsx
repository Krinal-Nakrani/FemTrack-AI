import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Stethoscope, Loader2, ArrowLeft } from 'lucide-react';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { DoctorCard } from '@/components/community/DoctorCard';
import { GlassCard } from '@/components/shared/GlassCard';
import { useNavigate } from 'react-router-dom';

const SPECIALIZATIONS = [
  'All Specializations',
  'Gynecologist',
  'Reproductive Endocrinologist',
  'Fertility Specialist',
  'PCOD Specialist',
  'General OB-GYN',
];

export default function BrowseDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All Specializations');

  useEffect(() => {
    async function loadDoctors() {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'doctors'),
          where('isVerified', '==', true)
        );
        const snap = await getDocs(q);
        const docsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by name on client side to avoid needing a composite index
        docsData.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
        setDoctors(docsData);
      } catch (err) {
        console.error('Error loading doctors:', err);
      }
      setLoading(false);
    }
    loadDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name?.toLowerCase().includes(search.toLowerCase()) || 
                          doc.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All Specializations' || doc.specialization === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/community')}
          className="p-2.5 rounded-xl bg-plum-700/30 text-lavender/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Find a Doctor</h1>
          <p className="text-lavender/60 font-body text-sm mt-1">Connect with verified gynecologists and specialists</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender/30" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor name or expertise..."
            className="w-full bg-plum-700/30 border border-lavender/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-lavender/20 focus:outline-none focus:border-teal/50 transition-colors"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender/30" size={18} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-plum-700/30 border border-lavender/10 rounded-2xl py-3.5 pl-12 pr-4 text-white appearance-none focus:outline-none focus:border-teal/50 transition-colors font-body text-sm"
          >
            {SPECIALIZATIONS.map(s => (
              <option key={s} value={s} className="bg-plum text-white">{s}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doc => (
            <DoctorCard
              key={doc.id}
              uid={doc.id}
              name={doc.name}
              specialization={doc.specialization}
              profilePhoto={doc.profilePhoto}
              isVerified={doc.isVerified}
              bio={doc.bio}
            />
          ))}
        </div>
      ) : (
        <GlassCard padding="lg" className="text-center py-16">
          <Stethoscope size={48} className="text-lavender/20 mx-auto mb-4" />
          <h3 className="text-lg font-display font-bold text-white mb-2">No doctors found</h3>
          <p className="text-sm text-lavender/40 font-body">Try adjusting your search or filters.</p>
        </GlassCard>
      )}
    </div>
  );
}
