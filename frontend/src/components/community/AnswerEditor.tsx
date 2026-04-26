import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { collection, addDoc, doc, updateDoc, increment, setDoc } from 'firebase/firestore';

interface AnswerEditorProps {
  queryId: string;
  queryAuthorId: string;
  isDoctor?: boolean;
  doctorSpecialization?: string;
  onAnswerPosted?: () => void;
}

export function AnswerEditor({
  queryId, queryAuthorId, isDoctor, doctorSpecialization, onAnswerPosted,
}: AnswerEditorProps) {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!user || !body.trim()) return;
    setPosting(true);

    try {
      // 1. Add answer
      const answerRef = await addDoc(collection(db, 'queries', queryId, 'answers'), {
        authorId: user.uid,
        authorName: user.displayName || 'User',
        authorType: isDoctor ? 'doctor' : 'user',
        authorAvatar: user.photoURL || null,
        doctorSpecialization: isDoctor ? doctorSpecialization : null,
        body: body.trim(),
        createdAt: new Date().toISOString(),
        isAccepted: false,
        likes: 0,
      });

      // 2. Increment answer count on query
      await updateDoc(doc(db, 'queries', queryId), {
        answerCount: increment(1),
      });

      // 3. Notify query author (if it's not the same person)
      if (queryAuthorId !== user.uid) {
        const notifId = `${queryId}-${answerRef.id}`;
        const notifPath = isDoctor
          ? `users/${queryAuthorId}/notifications/${notifId}`
          : `users/${queryAuthorId}/notifications/${notifId}`;

        await setDoc(doc(db, notifPath), {
          queryId,
          answerId: answerRef.id,
          message: isDoctor
            ? `Dr. ${user.displayName} answered your question`
            : `${user.displayName} replied to your question`,
          fromDoctorId: isDoctor ? user.uid : null,
          fromDoctorName: isDoctor ? user.displayName : null,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }

      setBody('');
      onAnswerPosted?.();
    } catch (err) {
      console.error('Error posting answer:', err);
    }
    setPosting(false);
  };

  return (
    <div className="glass-card p-4 space-y-3">
      <h4 className="text-xs font-body font-bold text-lavender/70 uppercase tracking-wider">
        {isDoctor ? '🩺 Post Your Answer' : 'Add Your Reply'}
      </h4>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your answer..."
        rows={4}
        className="w-full px-4 py-3 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm focus:outline-none focus:border-teal/50 transition-colors resize-none"
      />
      <div className="flex justify-end">
        <button
          onClick={handlePost}
          disabled={posting || !body.trim()}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-body text-sm font-medium transition-all ${
            isDoctor ? 'btn-teal' : 'btn-primary'
          } disabled:opacity-30`}
        >
          {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {posting ? 'Posting...' : 'Post Answer'}
        </button>
      </div>
    </div>
  );
}

export default AnswerEditor;
