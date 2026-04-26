import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, Mail, Lock, User, CheckCircle, 
  Upload, FileText, Loader2, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { GlassCard } from '@/components/shared/GlassCard';

export default function DoctorRegister() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1: Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseFile) {
      setError('Please upload your medical license document');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. Create Auth Account
      await signUp(email, password, name);
      // Note: useAuth signUp usually logs the user in automatically
      
      // We need the UID, but useAuth doesn't return it directly in the helper.
      // However, the auth state will update. For the document creation, we'll wait for the user to be available
      // or we can use the firebase auth directly if needed. 
      // Let's assume the user is signed in now.
      const currentUser = (await import('@/config/firebase')).auth.currentUser;
      if (!currentUser) throw new Error('Auth failed');

      // 2. Upload License to Cloudinary
      const uploadResult = await uploadToCloudinary(
        licenseFile, 
        `doctor-licenses/${currentUser.uid}`,
        (p) => setUploadProgress(p)
      );

      // 3. Create Doctor Document
      await setDoc(doc(db, 'doctors', currentUser.uid), {
        uid: currentUser.uid,
        email,
        name,
        licenseNumber,
        licenseFileURL: uploadResult.secure_url,
        specialization: 'Gynecologist', // Default
        isVerified: false,
        createdAt: new Date().toISOString(),
        notificationCount: 0,
        onboarded: false
      });

      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-plum flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-2xl gradient-teal flex items-center justify-center shadow-glow-teal mb-4"
          >
            <Stethoscope size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-white">Doctor Registration</h1>
          <p className="text-lavender/60 font-body text-center mt-2">Join our network of healthcare professionals</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard padding="lg" hover={false}>
                <form onSubmit={handleStep1} className="space-y-4">
                  <div>
                    <label className="block text-xs font-body font-semibold text-lavender/50 uppercase tracking-wider mb-1.5 ml-1">Full Legal Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender/30" size={18} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-plum-700/30 border border-lavender/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-lavender/20 focus:outline-none focus:border-teal/50 transition-colors"
                        placeholder="Dr. Jane Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-body font-semibold text-lavender/50 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender/30" size={18} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-plum-700/30 border border-lavender/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-lavender/20 focus:outline-none focus:border-teal/50 transition-colors"
                        placeholder="doctor@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-body font-semibold text-lavender/50 uppercase tracking-wider mb-1.5 ml-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender/30" size={18} />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-plum-700/30 border border-lavender/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-lavender/20 focus:outline-none focus:border-teal/50 transition-colors"
                          placeholder="••••••"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-body font-semibold text-lavender/50 uppercase tracking-wider mb-1.5 ml-1">License No.</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender/30" size={18} />
                        <input
                          type="text"
                          required
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          className="w-full bg-plum-700/30 border border-lavender/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-lavender/20 focus:outline-none focus:border-teal/50 transition-colors"
                          placeholder="MCI-12345"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-body font-semibold text-lavender/50 uppercase tracking-wider mb-1.5 ml-1">Upload License (PDF/Image)</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-lavender/10 rounded-xl cursor-pointer hover:bg-plum-700/20 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-lavender/30 mb-2" />
                        <p className="text-xs text-lavender/50 font-body">
                          {licenseFile ? licenseFile.name : 'Click to upload license'}
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*,.pdf" 
                        onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  {error && <p className="text-rose-400 text-xs font-body text-center">{error}</p>}
                  
                  {loading && (
                    <div className="space-y-2">
                      <div className="w-full bg-plum-700/50 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-teal h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-[10px] text-teal-400 text-center font-body">Uploading credentials... {uploadProgress}%</p>
                    </div>
                  )}

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full btn-teal flex items-center justify-center gap-2 group"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
                    {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                  </button>

                  <button 
                    type="button"
                    onClick={() => navigate('/auth')}
                    className="w-full text-xs text-lavender/40 font-body hover:text-lavender transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft size={12} /> Back to Login
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <GlassCard padding="lg" hover={false} className="text-center">
                <div className="w-20 h-20 rounded-full bg-teal/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="text-teal-400" />
                </div>
                <h2 className="text-xl font-display font-bold text-white mb-2">Account Created!</h2>
                <p className="text-sm text-lavender/60 font-body leading-relaxed mb-8">
                  Your profile has been created. Our team will verify your medical license within 24 hours. Once verified, you can start answering patient queries.
                </p>
                <button
                  onClick={() => navigate('/doctor-dashboard')}
                  className="w-full btn-teal"
                >
                  Go to Dashboard
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
