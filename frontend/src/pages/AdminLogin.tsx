import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, Activity, Cpu } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const admin1 = { email: import.meta.env.VITE_ADMIN_EMAIL_1, pass: import.meta.env.VITE_ADMIN_PASS_1 };
    const admin2 = { email: import.meta.env.VITE_ADMIN_EMAIL_2, pass: import.meta.env.VITE_ADMIN_PASS_2 };

    console.log("System Check: Admin 1 Loaded:", !!admin1.email);
    console.log("System Check: Admin 2 Loaded:", !!admin2.email);

    // Simulate system scan delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if ((email === admin1.email && password === admin1.pass) || 
        (email === admin2.email && password === admin2.pass)) {
      
      sessionStorage.setItem('femtrack_admin_auth', 'true');
      sessionStorage.setItem('femtrack_admin_email', email);
      navigate('/admin/dashboard');
    } else {
      setError('ACCESS DENIED: Invalid Administrative Credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-plum flex items-center justify-center px-4 relative overflow-hidden">
      {/* Cyber Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(201,75,138,0.1),transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-full grid grid-cols-[repeat(20,minmax(0,1fr))] grid-rows-[repeat(20,minmax(0,1fr))]">
          {[...Array(400)].map((_, i) => (
            <div key={i} className="border-[0.5px] border-white/5" />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 relative group"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 rounded-3xl bg-rose/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Shield size={40} className="text-rose-400 relative z-10" />
            <motion.div 
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-500 border-4 border-plum flex items-center justify-center"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Cpu size={12} className="text-white" />
            </motion.div>
          </motion.div>
          
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Central <span className="gradient-text">Command</span>
          </h1>
          <p className="text-lavender/50 font-body text-sm mt-2 uppercase tracking-[0.2em] font-semibold">
            Administrative Access Portal
          </p>
        </div>

        <GlassCard padding="lg" className="border-white/10 shadow-2xl backdrop-blur-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] text-lavender/40 font-bold uppercase tracking-widest mb-2 ml-1">
                Admin Identifier
              </label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender/30 group-focus-within:text-rose-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@femtrack.ai"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-lavender/20 font-body text-sm focus:outline-none focus:border-rose/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-lavender/40 font-bold uppercase tracking-widest mb-2 ml-1">
                Security Key
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender/30 group-focus-within:text-rose-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-lavender/20 font-body text-sm focus:outline-none focus:border-rose/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-lavender/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
                >
                  <Activity size={16} className="text-red-400 shrink-0" />
                  <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider leading-tight">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white text-plum py-4 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors disabled:opacity-50 group"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-plum/30 border-t-plum rounded-full animate-spin" />
                  <span className="uppercase tracking-widest text-[10px]">Scanning...</span>
                </div>
              ) : (
                <>
                  INITIALIZE SESSION
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>
        </GlassCard>

        <p className="text-center text-[10px] text-lavender/20 font-body mt-8 uppercase tracking-[0.3em]">
          FemTrack AI Security Protocol v4.0
        </p>
      </motion.div>
    </div>
  );
}

export default AdminLogin;
