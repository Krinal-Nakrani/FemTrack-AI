import { useState, useEffect } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '@/config/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { NotificationItem } from '@/components/community/NotificationItem';
import { GlassCard } from '@/components/shared/GlassCard';

interface Notification {
  id: string;
  queryId: string;
  message: string;
  fromUserId?: string;
  fromUserName?: string;
  isRead: boolean;
  createdAt: string;
}

export function DoctorNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'doctors', user.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
    });
    return () => unsub();
  }, [user]);

  const handleClick = async (notif: Notification) => {
    if (!user || notif.isRead) {
      navigate(`/doctor-dashboard/query/${notif.queryId}`);
      return;
    }
    // Mark as read
    await updateDoc(doc(db, 'doctors', user.uid, 'notifications', notif.id), { isRead: true });
    navigate(`/doctor-dashboard/query/${notif.queryId}`);
  };

  const markAllRead = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.isRead).forEach(n => {
      batch.update(doc(db, 'doctors', user.uid, 'notifications', n.id), { isRead: true });
    });
    await batch.commit();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/doctor-dashboard')}
            className="p-2.5 rounded-xl bg-teal/10 text-teal-400 hover:bg-teal/20 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-display font-bold text-white">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal/15 text-teal-300 text-xs font-body font-medium hover:bg-teal/25 transition-colors"
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
              fromName={notif.fromUserName}
              onClick={() => handleClick(notif)}
            />
          ))}
        </div>
      ) : (
        <GlassCard hover={false} padding="lg">
          <p className="text-sm text-lavender/40 font-body text-center py-8">
            No notifications yet. When patients mention you, alerts appear here instantly.
          </p>
        </GlassCard>
      )}
    </div>
  );
}

export default DoctorNotifications;
