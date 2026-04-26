import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, AlertCircle, Loader2, 
  HelpCircle, Sparkles, Stethoscope, User 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { collection, addDoc, doc, setDoc, getDocs, query, where, limit } from 'firebase/firestore';
import { GlassCard } from '@/components/shared/GlassCard';
import { VisibilityToggle } from '@/components/community/VisibilityToggle';
import { MentionSearch } from '@/components/community/MentionSearch';
import { useEffect } from 'react';

const TAG_OPTIONS = ['PCOD', 'Irregular Cycle', 'Hormones', 'Pain', 'Mood', 'Fertility', 'General'];

export default function AskQuestion() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'anonymous' | 'doctors_only'>('public');
  const [selectedDoctors, setSelectedDoctors] = useState<any[]>([]);
  const [featuredDoctors, setFeaturedDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDocs() {
      try {
        const q = query(collection(db, 'doctors'), where('isVerified', '==', true), limit(6));
        const snap = await getDocs(q);
        setFeaturedDoctors(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoadingDoctors(false);
      }
    }
    fetchDocs();
  }, []);

  const toggleDoctor = (docInfo: any) => {
    const isSelected = selectedDoctors.find(d => d.uid === docInfo.uid);
    if (isSelected) {
      setSelectedDoctors(prev => prev.filter(d => d.uid !== docInfo.uid));
    } else {
      setSelectedDoctors(prev => [...prev, docInfo]);
    }
  };

  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !body.trim()) {
      setError('Please fill in both the title and details of your question.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const queryId = `query-${Date.now()}`;
      const queryData = {
        authorId: user.uid,
        authorName: visibility === 'anonymous' ? 'Anonymous' : (user.displayName || 'User'),
        authorAvatar: visibility === 'anonymous' ? null : (user.photoURL || null),
        visibility,
        isAnonymous: visibility === 'anonymous',
        title: title.trim(),
        body: body.trim(),
        tags,
        mentionedDoctors: selectedDoctors.map(d => d.uid),
        mentionedDoctorNames: selectedDoctors.map(d => d.name),
        createdAt: new Date().toISOString(),
        answerCount: 0,
        views: 0
      };

      const queryRef = await addDoc(collection(db, 'queries'), queryData);

      // Create notifications for mentioned doctors
      for (const docInfo of selectedDoctors) {
        const notifId = `notif-${Date.now()}-${docInfo.uid}`;
        await setDoc(doc(db, 'doctors', docInfo.uid, 'notifications', notifId), {
          queryId: queryRef.id,
          message: visibility === 'anonymous' 
            ? `An anonymous user mentioned you in a question` 
            : `${user.displayName} mentioned you in a question`,
          fromUserId: user.uid,
          fromUserName: visibility === 'anonymous' ? 'Anonymous' : (user.displayName || 'User'),
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }

      navigate('/community');
    } catch (err: any) {
      setError('Failed to post question. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/community')}
          className="p-2.5 rounded-xl bg-plum-700/30 text-lavender/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Ask the Community</h1>
          <p className="text-xs text-lavender/60 font-body">Share your concerns or ask for expert medical advice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassCard padding="lg" hover={false}>
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-body font-medium text-lavender/70 uppercase tracking-wider">Question Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What is your main concern?"
                className="w-full bg-plum-700/30 border border-lavender/10 rounded-xl py-3 px-4 text-white placeholder:text-lavender/20 focus:outline-none focus:border-rose/50 transition-colors font-display text-lg"
                required
              />
            </div>

            {/* Details */}
            <div className="space-y-2">
              <label className="text-xs font-body font-medium text-lavender/70 uppercase tracking-wider">Details</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                placeholder="Describe your symptoms, concerns, or history in detail..."
                className="w-full bg-plum-700/30 border border-lavender/10 rounded-xl py-3 px-4 text-white placeholder:text-lavender/20 focus:outline-none focus:border-rose/50 transition-colors font-body text-sm resize-none"
                required
              />
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <label className="text-xs font-body font-medium text-lavender/70 uppercase tracking-wider">Select Relevant Tags</label>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-xl text-xs font-body transition-all ${
                      tags.includes(tag)
                        ? 'bg-rose/20 text-rose-300 border border-rose-500/30'
                        : 'bg-plum-700/30 text-lavender/50 border border-lavender/5 hover:bg-plum-700/50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Visibility */}
        <GlassCard padding="lg" hover={false}>
          <VisibilityToggle value={visibility} onChange={setVisibility} />
        </GlassCard>

        {/* Mentions */}
        <GlassCard padding="lg" hover={false}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-body font-medium text-lavender/70 uppercase tracking-wider">Quick Select Doctors</label>
              <button 
                type="button"
                onClick={() => navigate('/doctors')}
                className="text-[10px] text-teal-400 hover:text-teal-300 font-body transition-colors"
              >
                View All Doctors
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {loadingDoctors ? (
                [1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-plum-700/30 animate-pulse" />)
              ) : (
                featuredDoctors.map(docInfo => {
                  const isSelected = selectedDoctors.find(d => d.uid === docInfo.uid);
                  return (
                    <button
                      key={docInfo.uid}
                      type="button"
                      onClick={() => toggleDoctor(docInfo)}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left ${
                        isSelected 
                          ? 'border-teal/40 bg-teal/10 shadow-glow-teal' 
                          : 'border-lavender/5 bg-plum-700/20 hover:border-lavender/20'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center overflow-hidden shrink-0 border border-teal/20">
                        {docInfo.profilePhoto ? (
                          <img src={docInfo.profilePhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Stethoscope size={14} className="text-teal-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[10px] font-body font-bold truncate ${isSelected ? 'text-teal-300' : 'text-white'}`}>
                          {docInfo.name.split(' ').slice(0, 2).join(' ')}
                        </p>
                        <p className="text-[8px] text-lavender/40 font-body truncate">{docInfo.specialization}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-lavender/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-plum px-2 text-lavender/20 font-body">Or search specifically</span>
              </div>
            </div>

            <MentionSearch 
              selected={selectedDoctors}
              onSelect={(doc) => setSelectedDoctors(prev => [...prev, doc])}
              onRemove={(uid) => setSelectedDoctors(prev => prev.filter(d => d.uid !== uid))}
            />
          </div>
          <div className="mt-4 p-4 rounded-xl bg-teal/5 border border-teal/10 flex items-start gap-3">
            <Sparkles className="text-teal-400 shrink-0" size={18} />
            <p className="text-[11px] text-teal-400/80 font-body leading-relaxed">
              Mentioning a doctor will send them a direct notification. Verified doctors typically respond within 24-48 hours.
            </p>
          </div>
        </GlassCard>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-body">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-4 flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Post Question
            </>
          )}
        </button>
      </form>
    </div>
  );
}
