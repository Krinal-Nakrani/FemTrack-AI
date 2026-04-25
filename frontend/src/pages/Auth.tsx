import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Flower2, Mail, Lock, User, Eye, EyeOff, Chrome, ArrowLeft, Stethoscope } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Auth() {
  const [searchParams] = useSearchParams();
  const isDoctor = searchParams.get('role') === 'doctor';

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const redirectPath = isDoctor ? '/doctor' : '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        await signUp(email, password, name);
      }
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message?.replace('Firebase: ', '') || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message?.replace('Firebase: ', '') || 'Google sign in failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-plum flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Aurora Background */}
      <div className="aurora-bg" />

      {/* Back to Home button */}
      <motion.button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-lavender/70 hover:text-white hover:bg-white/10 transition-all duration-200 font-body text-sm backdrop-blur-sm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        id="auth-back-home"
      >
        <ArrowLeft size={16} />
        Home
      </motion.button>

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(201,75,138,0.15) 0%, transparent 70%)',
          top: '10%',
          right: '-10%',
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(179,157,219,0.12) 0%, transparent 70%)',
          bottom: '-5%',
          left: '-8%',
        }}
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -20, 0],
          y: [0, 15, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Panel — Branding (desktop only) */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex flex-col items-center text-center"
        >
          {/* Animated illustration */}
          <motion.div
            className="relative mb-8"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg viewBox="0 0 240 240" className="w-60 h-60">
              {/* Outer pulsing ring */}
              <motion.circle
                cx="120" cy="120" r="110"
                fill="none"
                stroke="url(#authGrad1)"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '120px 120px' }}
              />
              {/* Middle ring */}
              <motion.circle
                cx="120" cy="120" r="90"
                fill="none"
                stroke="url(#authGrad2)"
                strokeWidth="2"
                strokeDasharray="12 8"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '120px 120px' }}
              />
              {/* Inner glow */}
              <circle cx="120" cy="120" r="65" fill="url(#authInner)" opacity="0.5" />
              {/* Center logo */}
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                style={{ transformOrigin: '120px 120px' }}
              >
                <circle cx="120" cy="120" r="36" fill="url(#authCenter)" />
                <text x="120" y="128" textAnchor="middle" fontSize="28" fill="white">❀</text>
              </motion.g>
              {/* Orbiting dots */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.circle
                  key={i}
                  r="4"
                  fill={['#C94B8A', '#B39DDB', '#FF6B9D', '#9575CD', '#EC4899', '#FBBF24'][i]}
                  animate={{
                    cx: [
                      120 + 80 * Math.cos((i * Math.PI) / 3),
                      120 + 80 * Math.cos((i * Math.PI) / 3 + Math.PI * 2),
                    ],
                    cy: [
                      120 + 80 * Math.sin((i * Math.PI) / 3),
                      120 + 80 * Math.sin((i * Math.PI) / 3 + Math.PI * 2),
                    ],
                  }}
                  transition={{ duration: 12 + i, repeat: Infinity, ease: 'linear' }}
                  opacity={0.6}
                />
              ))}
              <defs>
                <linearGradient id="authGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C94B8A" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#B39DDB" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="authGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B39DDB" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FF6B9D" stopOpacity="0.3" />
                </linearGradient>
                <radialGradient id="authInner">
                  <stop offset="0%" stopColor="rgba(201,75,138,0.2)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <linearGradient id="authCenter" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C94B8A" />
                  <stop offset="100%" stopColor="#FF6B9D" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          <h2 className="text-3xl font-display font-bold text-white mb-3">
            FemTrack <span className="gradient-text">AI</span>
          </h2>
          <p className="text-lavender/60 font-body max-w-xs leading-relaxed">
            Your intelligent cycle companion. Track smarter, live better, stay private.
          </p>

          {/* Trust badges */}
          <div className="flex gap-6 mt-8">
            {[
              { label: 'AES-256', sub: 'Encrypted' },
              { label: 'Offline', sub: 'First' },
              { label: 'AI', sub: 'Powered' },
            ].map((badge) => (
              <div key={badge.label} className="text-center">
                <p className="text-sm font-display font-bold gradient-text">{badge.label}</p>
                <p className="text-[10px] text-lavender/40 font-body">{badge.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Panel — Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Logo (mobile only) */}
          <div className="text-center mb-8 lg:hidden">
            <motion.div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDoctor ? 'bg-blue-500/20 shadow-[0_0_20px_rgba(96,165,250,0.3)]' : 'gradient-rose shadow-glow-rose'}`}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
            >
              {isDoctor ? <Stethoscope size={32} className="text-blue-400" /> : <Flower2 size={32} className="text-white" />}
            </motion.div>
            <h1 className="text-2xl font-display font-bold text-white">
              {isDoctor
                ? (isLogin ? 'Doctor Login' : 'Doctor Registration')
                : (isLogin ? 'Welcome Back' : 'Create Account')}
            </h1>
            <p className="text-sm text-lavender/60 font-body mt-2">
              {isDoctor
                ? 'Access the gynecologist dashboard'
                : (isLogin ? 'Sign in to continue tracking your wellness' : 'Start your smart tracking journey')}
            </p>
          </div>

          {/* Desktop title */}
          <div className="hidden lg:block text-center mb-6">
            {isDoctor && (
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <Stethoscope size={24} className="text-blue-400" />
              </div>
            )}
            <h1 className="text-2xl font-display font-bold text-white">
              {isDoctor
                ? (isLogin ? 'Doctor Login' : 'Doctor Registration')
                : (isLogin ? 'Welcome Back' : 'Create Account')}
            </h1>
            <p className="text-sm text-lavender/60 font-body mt-2">
              {isDoctor
                ? 'Verified gynecologists can access patient dashboards'
                : (isLogin ? 'Sign in to continue tracking your wellness' : 'Start your smart tracking journey')}
            </p>
          </div>

          {/* Card */}
          <div className="glass-card p-8">
            {/* Google Sign In */}
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white/10 border border-white/10 text-white font-body font-medium text-sm transition-all duration-200 mb-6 min-tap"
              id="google-signin"
            >
              <Chrome size={18} />
              Continue with Google
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-lavender/15 to-transparent" />
              <span className="text-xs text-lavender/40 font-body">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-lavender/15 to-transparent" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-xs text-lavender/60 font-body mb-1.5 ml-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <User
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender/40 group-focus-within:text-rose-400 transition-colors"
                      />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm focus:outline-none focus:border-rose/50 focus:ring-2 focus:ring-rose/20 transition-all duration-300"
                        id="auth-name"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs text-lavender/60 font-body mb-1.5 ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender/40 group-focus-within:text-rose-400 transition-colors"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm focus:outline-none focus:border-rose/50 focus:ring-2 focus:ring-rose/20 transition-all duration-300"
                    id="auth-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-lavender/60 font-body mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender/40 group-focus-within:text-rose-400 transition-colors"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm focus:outline-none focus:border-rose/50 focus:ring-2 focus:ring-rose/20 transition-all duration-300"
                    id="auth-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-lavender/40 hover:text-lavender/70 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-400 font-body bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-500/20"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                id="auth-submit"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </form>

            {/* Toggle */}
            <p className="text-center text-sm text-lavender/50 font-body mt-6">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-rose-400 font-medium hover:text-rose-300 transition-colors"
                id="auth-toggle"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-[10px] text-lavender/30 font-body mt-6 px-4">
            By continuing, you agree to FemTrack AI's Terms of Service and Privacy Policy.
            This is not a medical device.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Auth;
