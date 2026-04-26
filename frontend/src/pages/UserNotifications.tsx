import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { NotificationItem } from '@/components/community/NotificationItem';
import { GlassCard } from '@/components/shared/GlassCard';

export default function UserNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const handleClick = async (notif: any) => {
    if (!user) return;
    if (!notif.isRead) {
      await updateDoc(doc(db, 'users', user.uid, 'notifications', notif.id), { isRead: true });
    }
    navigate(`/community/query/${notif.queryId}`);
  };

  const markAllRead = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.isRead).forEach(n => {
      batch.update(doc(db, 'users', user.uid, 'notifications', n.id), { isRead: true });
    });
    await batch.commit();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-plum-700/30 text-lavender/50 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-display font-bold text-white">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose/15 text-rose-300 text-xs font-body font-medium hover:bg-rose/25 transition-colors"
          >
            <Check size={12} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-1">
          {notifications.map(notif => (
            <NotificationItem
              key={notif.id}
              message={notif.message}
              createdAt={notif.createdAt}
              isRead={notif.isRead}
              fromName={notif.fromDoctorName}
              onClick={() => handleClick(notif)}
            />
          ))}
        </div>
      ) : (
        <GlassCard padding="lg" className="text-center py-16">
          <Bell size={48} className="text-lavender/20 mx-auto mb-4" />
          <h3 className="text-lg font-display font-bold text-white mb-2">No notifications</h3>
          <p className="text-sm text-lavender/40 font-body">You're all caught up!</p>
        </GlassCard>
      )}
    </div>
  );
}
