import { motion } from 'framer-motion';
import { MessageCircle, Eye, Clock, Shield, Globe, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from '@/lib/timeUtils';

interface QueryCardProps {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorAvatar?: string | null;
  isAnonymous: boolean;
  visibility: 'public' | 'doctors_only';
  tags: string[];
  mentionedDoctorNames?: string[];
  answerCount: number;
  views: number;
  createdAt: string;
  isMentioned?: boolean;
  basePath?: string; // '/community' or '/doctor-dashboard'
}

export function QueryCard({
  id, title, body, authorName, authorAvatar, isAnonymous,
  visibility, tags, mentionedDoctorNames = [], answerCount, views,
  createdAt, isMentioned, basePath = '/community',
}: QueryCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => navigate(`${basePath}/query/${id}`)}
      className={`glass-card p-5 cursor-pointer transition-all duration-300 ${
        isMentioned ? 'border-rose/40 shadow-glow-rose' : ''
      }`}
    >
      {/* Top: Author + Badges */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-plum-700/50 flex items-center justify-center overflow-hidden">
            {authorAvatar && !isAnonymous ? (
              <img src={authorAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={14} className="text-lavender/50" />
            )}
          </div>
          <span className="text-xs font-body text-lavender/70">
            {isAnonymous ? 'Anonymous 🌸' : authorName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isMentioned && (
            <span className="px-2 py-0.5 rounded-md bg-rose/15 text-rose-300 text-[10px] font-bold uppercase">
              Mentioned You
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 ${
            visibility === 'doctors_only'
              ? 'bg-teal/15 text-teal-300'
              : 'bg-lavender/10 text-lavender/60'
          }`}>
            {visibility === 'doctors_only' ? <Shield size={10} /> : <Globe size={10} />}
            {visibility === 'doctors_only' ? 'Doctors Only' : 'Public'}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-display font-bold text-white mb-1.5 line-clamp-2">{title}</h3>

      {/* Body preview */}
      <p className="text-xs text-lavender/50 font-body line-clamp-2 mb-3">{body}</p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-plum-700/40 text-[10px] text-lavender/60 font-body">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Mentioned Doctors */}
      {mentionedDoctorNames.length > 0 && (
        <div className="flex items-center gap-1 mb-3">
          <span className="text-[10px] text-teal-400 font-body">Mentioned:</span>
          {mentionedDoctorNames.map(name => (
            <span key={name} className="px-1.5 py-0.5 rounded-md bg-teal/10 text-[10px] text-teal-300 font-body">
              {name}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Stats */}
      <div className="flex items-center gap-4 text-[10px] text-lavender/40 font-body">
        <span className="flex items-center gap-1">
          <MessageCircle size={11} /> {answerCount} answers
        </span>
        <span className="flex items-center gap-1">
          <Eye size={11} /> {views} views
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Clock size={11} /> {formatDistanceToNow(createdAt)}
        </span>
      </div>
    </motion.div>
  );
}

export default QueryCard;
