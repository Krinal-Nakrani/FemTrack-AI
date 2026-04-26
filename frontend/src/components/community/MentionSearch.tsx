import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { DoctorCard } from './DoctorCard';

interface MentionedDoctor {
  uid: string;
  name: string;
  specialization: string;
  profilePhoto?: string;
}

interface MentionSearchProps {
  selected: MentionedDoctor[];
  onSelect: (doctor: MentionedDoctor) => void;
  onRemove: (uid: string) => void;
  maxMentions?: number;
}

export function MentionSearch({ selected, onSelect, onRemove, maxMentions = 5 }: MentionSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<MentionedDoctor[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const q = query(
        collection(db, 'doctors'),
        where('isVerified', '==', true),
        where('name', '>=', term),
        where('name', '<=', term + '\uf8ff'),
        limit(8)
      );
      const snap = await getDocs(q);
      const docs: MentionedDoctor[] = [];
      snap.forEach(d => {
        const data = d.data();
        if (!selected.find(s => s.uid === d.id)) {
          docs.push({
            uid: d.id,
            name: data.name,
            specialization: data.specialization,
            profilePhoto: data.profilePhoto,
          });
        }
      });
      setResults(docs);
    } catch (err) {
      console.error('Doctor search error:', err);
    }
    setSearching(false);
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-body font-medium text-lavender/70 uppercase tracking-wider">
        Mention Doctors (up to {maxMentions})
      </label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(doc => (
            <span key={doc.uid} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal/15 border border-teal/20 text-xs text-teal-300 font-body">
              {doc.name}
              <button onClick={() => onRemove(doc.uid)} className="hover:text-white transition-colors">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      {selected.length < maxMentions && (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender/40" />
          <input
            type="text"
            placeholder="Search doctors by name..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm focus:outline-none focus:border-teal/50 transition-colors"
          />
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {results.map(doc => (
            <DoctorCard
              key={doc.uid}
              uid={doc.uid}
              name={doc.name}
              specialization={doc.specialization}
              profilePhoto={doc.profilePhoto}
              compact
              actionLabel="+ Mention"
              onAction={() => {
                onSelect(doc);
                setSearchTerm('');
                setResults([]);
              }}
            />
          ))}
        </div>
      )}

      {searching && (
        <p className="text-[10px] text-lavender/40 font-body">Searching...</p>
      )}
    </div>
  );
}

export default MentionSearch;
