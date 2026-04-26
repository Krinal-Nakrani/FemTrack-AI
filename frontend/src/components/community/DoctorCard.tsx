import { motion } from 'framer-motion';
import { CheckCircle, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DoctorCardProps {
  uid: string;
  name: string;
  specialization: string;
  profilePhoto?: string;
  isVerified?: boolean;
  bio?: string;
  compact?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export function DoctorCard({
  uid, name, specialization, profilePhoto, isVerified,
  bio, compact, actionLabel, onAction,
}: DoctorCardProps) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-plum-700/30 border border-lavender/5 hover:border-teal/20 transition-colors">
        <div className="w-9 h-9 rounded-full bg-teal/10 flex items-center justify-center overflow-hidden shrink-0">
          {profilePhoto ? (
            <img src={profilePhoto} alt={name} className="w-full h-full object-cover" />
          ) : (
            <Stethoscope size={16} className="text-teal-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-body font-medium text-white truncate">{name}</p>
          <p className="text-[10px] text-lavender/50 font-body truncate">{specialization}</p>
        </div>
        {actionLabel && onAction && (
          <button
            onClick={(e) => { e.stopPropagation(); onAction(); }}
            className="px-2.5 py-1 rounded-lg bg-teal/15 text-teal-300 text-[10px] font-bold hover:bg-teal/25 transition-colors shrink-0"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass-card p-5 cursor-pointer"
      onClick={() => navigate(`/doctors/${uid}`)}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center overflow-hidden border-2 border-teal/20">
          {profilePhoto ? (
            <img src={profilePhoto} alt={name} className="w-full h-full object-cover" />
          ) : (
            <Stethoscope size={22} className="text-teal-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-display font-bold text-white">{name}</h3>
            {isVerified && <CheckCircle size={13} className="text-teal-400" />}
          </div>
          <p className="text-xs text-teal-400/80 font-body">{specialization}</p>
        </div>
      </div>

      {bio && (
        <p className="text-xs text-lavender/50 font-body line-clamp-2 mb-3">{bio}</p>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); navigate(`/doctors/${uid}`); }}
        className="w-full py-2 rounded-xl bg-teal/10 text-teal-300 text-xs font-body font-medium hover:bg-teal/20 transition-colors"
      >
        View Profile
      </button>
    </motion.div>
  );
}

export default DoctorCard;
