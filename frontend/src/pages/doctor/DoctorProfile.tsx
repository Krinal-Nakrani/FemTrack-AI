import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, CheckCircle, Stethoscope, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { GlassCard } from '@/components/shared/GlassCard';
import { LicenseViewer } from '@/components/community/LicenseViewer';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '@/lib/cloudinary';
import { useNavigate } from 'react-router-dom';

const SPECIALIZATIONS = [
  'Gynecologist',
  'Reproductive Endocrinologist',
  'Fertility Specialist',
  'PCOD Specialist',
  'General OB-GYN',
];

export function DoctorProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<any>(null);
  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCerts, setUploadingCerts] = useState(false);
  const [viewingLicense, setViewingLicense] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'doctors', user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setDoctor(data);
        setBio(data.bio || '');
        setSpecialization(data.specialization || '');
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'doctors', user.uid), { bio, specialization });
      setDoctor((prev: any) => ({ ...prev, bio, specialization }));
    } catch (err) {
      console.error('Error saving profile:', err);
    }
    setSaving(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingPhoto(true);
    try {
      const result = await uploadToCloudinary(file, `doctor-photos/${user.uid}`);
      await updateDoc(doc(db, 'doctors', user.uid), { profilePhoto: result.secure_url });
      setDoctor((prev: any) => ({ ...prev, profilePhoto: result.secure_url }));
    } catch (err) {
      console.error('Photo upload error:', err);
    }
    setUploadingPhoto(false);
  };

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user) return;
    setUploadingCerts(true);
    try {
      const results = await uploadMultipleToCloudinary(files, `doctor-certificates/${user.uid}`);
      const urls = results.map(r => r.secure_url);
      const newCerts = [...(doctor?.certificates || []), ...urls];
      await updateDoc(doc(db, 'doctors', user.uid), { certificates: newCerts });
      setDoctor((prev: any) => ({ ...prev, certificates: newCerts }));
    } catch (err) {
      console.error('Certificate upload error:', err);
    }
    setUploadingCerts(false);
  };

  if (!doctor) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/doctor-dashboard')}
          className="p-2.5 rounded-xl bg-teal/10 text-teal-400 hover:bg-teal/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-display font-bold text-white">My Profile</h1>
      </div>

      {/* Profile Card */}
      <GlassCard padding="lg" glow="none" hover={false}>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-teal/10 flex items-center justify-center overflow-hidden border-2 border-teal/20">
              {doctor.profilePhoto ? (
                <img src={doctor.profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <Stethoscope size={32} className="text-teal-400" />
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-teal flex items-center justify-center cursor-pointer hover:bg-teal-500 transition-colors">
              {uploadingPhoto ? <Loader2 size={12} className="text-white animate-spin" /> : <Camera size={12} className="text-white" />}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-display font-bold text-white">{doctor.name}</h2>
              {doctor.isVerified && <CheckCircle size={16} className="text-teal-400" />}
            </div>
            <p className="text-xs text-teal-400/80 font-body">{doctor.specialization}</p>
            <p className="text-[10px] text-lavender/40 font-body">{doctor.email}</p>
          </div>
        </div>

        {/* Specialization */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-body font-medium text-lavender/70">Specialization</label>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white font-body text-sm focus:outline-none focus:border-teal/50 appearance-none"
          >
            {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Bio */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-body font-medium text-lavender/70">Bio ({bio.length}/500)</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 500))}
            rows={4}
            placeholder="Write a short bio..."
            className="w-full px-4 py-3 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm focus:outline-none focus:border-teal/50 resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-teal flex items-center gap-2 text-sm"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </GlassCard>

      {/* License */}
      <GlassCard padding="md" hover={false}>
        <h3 className="text-sm font-display font-semibold text-white mb-3 flex items-center gap-2">
          <FileText size={16} className="text-teal-400" /> License
        </h3>
        <div className="flex items-center justify-between p-3 rounded-xl bg-plum-700/20 border border-lavender/5">
          <div>
            <p className="text-xs font-body text-white">{doctor.licenseNumber}</p>
            <p className="text-[10px] text-lavender/40 font-body">Medical License</p>
          </div>
          {doctor.licenseFileURL && (
            <button
              onClick={() => setViewingLicense(true)}
              className="px-3 py-1.5 rounded-lg bg-teal/15 text-teal-300 text-xs font-body hover:bg-teal/25 transition-colors"
            >
              View Document
            </button>
          )}
        </div>
      </GlassCard>

      {/* Certificates */}
      <GlassCard padding="md" hover={false}>
        <h3 className="text-sm font-display font-semibold text-white mb-3">Certificates</h3>
        <div className="space-y-2 mb-3">
          {(doctor.certificates || []).map((url: string, i: number) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
              className="block p-2 rounded-lg bg-plum-700/20 text-xs text-teal-300 font-body hover:bg-plum-700/30 transition-colors truncate">
              Certificate {i + 1}
            </a>
          ))}
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-plum-700/30 border border-lavender/10 text-xs text-lavender/60 font-body cursor-pointer hover:border-teal/20 transition-colors">
          {uploadingCerts ? <Loader2 size={12} className="animate-spin" /> : '📎'} Add Certificates
          <input type="file" multiple className="hidden" onChange={handleCertUpload} />
        </label>
      </GlassCard>

      {/* View Public Profile */}
      <button
        onClick={() => navigate(`/doctors/${user?.uid}`)}
        className="w-full py-3 rounded-xl bg-plum-700/30 border border-teal/10 text-teal-300 text-sm font-body font-medium hover:bg-plum-700/50 transition-colors"
      >
        View Public Profile →
      </button>

      <LicenseViewer
        url={doctor.licenseFileURL || ''}
        title="Medical License"
        isOpen={viewingLicense}
        onClose={() => setViewingLicense(false)}
      />
    </div>
  );
}

export default DoctorProfilePage;
