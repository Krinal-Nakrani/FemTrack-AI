import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Shield, User, CheckCircle, Clock, ThumbsUp, Stethoscope, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { GlassCard } from '@/components/shared/GlassCard';
import { AnswerEditor } from '@/components/community/AnswerEditor';
import { formatDistanceToNow } from '@/lib/timeUtils';
import { useUserType } from '@/hooks/useUserType';

interface QueryData {
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  isAnonymous: boolean;
  visibility: 'public' | 'doctors_only';
  title: string;
  body: string;
  tags: string[];
  mentionedDoctorNames: string[];
  answerCount: number;
  views: number;
  createdAt: string;
}

interface AnswerData {
  id: string;
  authorId: string;
  authorName: string;
  authorType: 'doctor' | 'user';
  authorAvatar?: string;
  doctorSpecialization?: string;
  body: string;
  createdAt: string;
  isAccepted: boolean;
  likes: number;
}

export function QueryThread() {
  const { queryId } = useParams<{ queryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userType } = useUserType();
  const [queryData, setQueryData] = useState<QueryData | null>(null);
  const [answers, setAnswers] = useState<AnswerData[]>([]);
  const [doctorSpec, setDoctorSpec] = useState('');

  useEffect(() => {
    if (!queryId) return;

    // Load query
    getDoc(doc(db, 'queries', queryId)).then(snap => {
      if (snap.exists()) {
        setQueryData(snap.data() as QueryData);
        // Increment view count
        updateDoc(doc(db, 'queries', queryId), { views: increment(1) }).catch(() => {});
      }
    });

    // Load doctor specialization if doctor
    if (user && userType === 'doctor') {
      getDoc(doc(db, 'doctors', user.uid)).then(snap => {
        if (snap.exists()) setDoctorSpec(snap.data().specialization || '');
      });
    }

    // Real-time answers
    const q = query(collection(db, 'queries', queryId, 'answers'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setAnswers(snap.docs.map(d => ({ id: d.id, ...d.data() } as AnswerData)));
    });
    return () => unsub();
  }, [queryId, user, userType]);

  if (!queryData) {
    return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl bg-plum-700/30 text-lavender/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-sm font-body text-lavender/40">Question Details</span>
      </div>

      {/* Question */}
      <GlassCard padding="lg" hover={false}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-plum-700/50 flex items-center justify-center overflow-hidden">
            {queryData.authorAvatar && !queryData.isAnonymous ? (
              <img src={queryData.authorAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-lavender/50" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-body font-medium text-white">
              {queryData.isAnonymous ? 'Anonymous 🌸' : queryData.authorName}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-lavender/40 font-body">
              <Clock size={10} /> {formatDistanceToNow(queryData.createdAt)}
              <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                queryData.visibility === 'doctors_only' ? 'bg-teal/15 text-teal-300' : 'bg-lavender/10 text-lavender/50'
              }`}>
                {queryData.visibility === 'doctors_only' ? '🩺 Doctors Only' : '🌍 Public'}
              </span>
            </div>
          </div>
        </div>

        <h1 className="text-lg font-display font-bold text-white mb-3">{queryData.title}</h1>
        <p className="text-sm text-lavender/70 font-body leading-relaxed whitespace-pre-wrap mb-4">{queryData.body}</p>

        {/* Tags */}
        {queryData.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {queryData.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-plum-700/40 text-[10px] text-lavender/60 font-body">{tag}</span>
            ))}
          </div>
        )}

        {/* Mentioned Doctors */}
        {queryData.mentionedDoctorNames?.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-teal-400 font-body">
            <Stethoscope size={11} /> Mentioned: {queryData.mentionedDoctorNames.join(', ')}
          </div>
        )}
      </GlassCard>

      {/* Answers */}
      <div>
        <h2 className="text-sm font-display font-bold text-white mb-3">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {answers.length > 0 ? (
          <div className="space-y-3">
            {answers.map(ans => (
              <GlassCard key={ans.id} padding="md" hover={false}
                className={ans.authorType === 'doctor' ? 'border-teal/20' : ''}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${
                    ans.authorType === 'doctor' ? 'bg-teal/15' : 'bg-plum-700/50'
                  }`}>
                    {ans.authorAvatar ? (
                      <img src={ans.authorAvatar} alt="" className="w-full h-full object-cover" />
                    ) : ans.authorType === 'doctor' ? (
                      <Stethoscope size={14} className="text-teal-400" />
                    ) : (
                      <User size={14} className="text-lavender/50" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-body font-medium text-white">{ans.authorName}</span>
                      {ans.authorType === 'doctor' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-teal/15 text-teal-300 font-bold flex items-center gap-1">
                          <CheckCircle size={8} /> Doctor
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-lavender/40 font-body">
                      {ans.doctorSpecialization && `${ans.doctorSpecialization} · `}
                      {formatDistanceToNow(ans.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-lavender/80 font-body leading-relaxed whitespace-pre-wrap">{ans.body}</p>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard hover={false} padding="md">
            <p className="text-xs text-lavender/40 font-body text-center py-4">
              No answers yet. Be the first to respond!
            </p>
          </GlassCard>
        )}
      </div>

      {/* Answer Editor */}
      {user && queryId && (
        <AnswerEditor
          queryId={queryId}
          queryAuthorId={queryData.authorId}
          isDoctor={userType === 'doctor'}
          doctorSpecialization={doctorSpec}
        />
      )}
    </div>
  );
}

export default QueryThread;
