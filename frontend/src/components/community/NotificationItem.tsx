import { Bell, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/timeUtils';

interface NotificationItemProps {
  message: string;
  createdAt: string;
  isRead: boolean;
  onClick: () => void;
  fromName?: string;
  fromAvatar?: string;
}

export function NotificationItem({
  message, createdAt, isRead, onClick, fromName, fromAvatar,
}: NotificationItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-4 rounded-xl transition-colors text-left ${
        isRead ? 'hover:bg-plum-700/20' : 'bg-teal/5 hover:bg-teal/10 border border-teal/10'
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
        isRead ? 'bg-plum-700/30' : 'bg-teal/15'
      }`}>
        {fromAvatar ? (
          <img src={fromAvatar} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          <MessageCircle size={16} className={isRead ? 'text-lavender/40' : 'text-teal-400'} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-body leading-relaxed ${isRead ? 'text-lavender/60' : 'text-white'}`}>
          {message}
        </p>
        <p className="text-[10px] text-lavender/40 font-body mt-1">
          {formatDistanceToNow(createdAt)}
        </p>
      </div>
      {!isRead && (
        <div className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0" />
      )}
    </button>
  );
}

export default NotificationItem;
