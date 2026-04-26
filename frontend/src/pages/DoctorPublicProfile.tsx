import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle, Stethoscope, Mail, 
  FileText, MessageCircle, Star, Calendar, Shield
} from 'lucide-react';
import { db } from '@/config/firebase';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { GlassCard } from '@/components/shared/GlassCard';
import { LicenseViewer } from '@/components/community/LicenseViewer';
import { QueryCard } from '@/components/community/QueryCard';

export default function DoctorPublicProfile() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState<any>(null);
  const [recentAnswers, setRecentAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingDoc, setViewingDoc] = useState(false);

  useEffect(() => {
    async function loadDoctorData() {
      if (!doctorId) return;
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'doctors', doctorId));
        if (docSnap.exists()) {
          setDoctor(docSnap.data());
          
          // Load recent answers
          // This requires a collection group query or we check /queries/*/answers where authorId == doctorId
          // For simplicity in the hackathon, we'll just show the profile for now or pull from a simplified subcollection
          // if we had one. Let's just focus on the profile details.
        }
      } catch (err) {
        console.error('Error loading doctor profile:', err);
      }
      setLoading(false);
    }
    loadDoctorData();
  }, [doctorId]);

  if (loading) return <div className="skeleton h-[400px] rounded-3xl" />;
  if (!doctor) return <div className="text-center py-20 text-white">Doctor not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl bg-plum-700/30 text-lavender/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-sm font-body text-lavender/40">Doctor Profile</span>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Action */}
        <div className="space-y-6">
          <GlassCard padding="lg" hover={false} className="text-center">
            <div className="w-32 h-32 rounded-full gradient-teal p-1 mx-auto mb-6 relative">
              <div className="w-full h-full rounded-full bg-plum overflow-hidden">
                {doctor.profilePhoto ? (
                  <img src={doctor.profilePhoto} alt={doctor.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-teal-400/20">
                    <Stethoscope size={64} />
                  </div>
                )}
              </div>
              {doctor.isVerified && (
                <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-teal flex items-center justify-center text-white border-4 border-plum">
                  <CheckCircle size={14} fill="currentColor" />
                </div>
              )}
            </div>
            
            <h1 className="text-xl font-display font-bold text-white mb-1">{doctor.name}</h1>
            <p className="text-xs text-teal-400 font-body mb-6">{doctor.specialization}</p>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate(`/community/ask?mention=${doctorId}`)}
                className="w-full btn-teal py-3 flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle size={16} /> Ask Her a Question
              </button>
              <div className="flex items-center justify-center gap-2 text-[10px] text-lavender/40 font-body">
                <Shield size={10} /> Verified Professional
              </div>
            </div>
          </GlassCard>

          <GlassCard padding="md" hover={false}>
            <h3 className="text-xs font-body font-bold text-white uppercase tracking-widest mb-4">Credentials</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-plum-700/50 flex items-center justify-center text-teal-400">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-lavender/40 font-body uppercase">License Number</p>
                  <p className="text-xs text-white font-body">{doctor.licenseNumber}</p>
                </div>
              </div>
              {doctor.licenseFileURL && (
                <button 
                  onClick={() => setViewingDoc(true)}
                  className="w-full py-2.5 rounded-xl border border-teal/20 text-teal-300 text-[10px] font-bold uppercase hover:bg-teal/5 transition-all"
                >
                  View Verified License
                </button>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Bio & Content */}
        <div className="md:col-span-2 space-y-6">
          <GlassCard padding="lg" hover={false}>
            <h2 className="text-lg font-display font-bold text-white mb-4">About the Doctor</h2>
            <p className="text-sm text-lavender/70 font-body leading-relaxed whitespace-pre-wrap">
              {doctor.bio || 'This doctor has not provided a bio yet.'}
            </p>
          </GlassCard>

          {doctor.certificates && doctor.certificates.length > 0 && (
            <GlassCard padding="lg" hover={false}>
              <h2 className="text-lg font-display font-bold text-white mb-4">Certifications</h2>
              <div className="grid grid-cols-2 gap-4">
                {doctor.certificates.map((cert: string, i: number) => (
                  <a 
                    key={i} 
                    href={cert} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-plum-700/30 border border-lavender/5 flex items-center gap-3 hover:border-teal/30 transition-all group"
                  >
                    <Star size={18} className="text-yellow-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-lavender/60 font-body">Certificate {i+1}</span>
                  </a>
                ))}
              </div>
            </GlassCard>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-display font-bold text-white">Clinical Insights</h2>
            <GlassCard padding="lg" className="bg-gradient-to-br from-teal/10 to-plum-700/50">
              <p className="text-sm text-lavender/60 font-body text-center py-6 italic">
                "Early diagnosis of hormonal imbalances can significantly improve quality of life. Don't hesitate to ask questions about your health."
              </p>
            </GlassCard>
          </div>
        </div>
      </div>

      <LicenseViewer 
        isOpen={viewingDoc} 
        onClose={() => setViewingDoc(false)} 
        url={doctor.licenseFileURL} 
        title={`${doctor.name}'s License`}
      />
    </div>
  );
}
