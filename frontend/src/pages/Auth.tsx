import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Flower2, Mail, Lock, User, Eye, EyeOff, Chrome, ArrowLeft, Stethoscope, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import femtrackDB from '@/lib/db';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function Auth() {
  const [searchParams] = useSearchParams();
  const isDoctor = searchParams.get('role') === 'doctor';
  const inviteCodeFromUrl = searchParams.get('invite');
  const emailFromUrl = searchParams.get('email');

  const [isLogin, setIsLogin] = useState(!inviteCodeFromUrl);
  const [signupRole, setSignupRole] = useState<'user' | 'partner'>(inviteCodeFromUrl ? 'partner' : 'user');
  const [email, setEmail] = useState(emailFromUrl || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [enteredInviteCode, setEnteredInviteCode] = useState(inviteCodeFromUrl || '');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        
        // After login, check DB for role
        const profile = await femtrackDB.profiles.where('email').equals(email).first();
        if (profile?.role === 'partner') {
          navigate('/partner-dashboard', { replace: true });
          setLoading(false);
          return;
        }

        // Check if it's a doctor
        const doctorSnap = await getDoc(doc(db, 'doctors', (await import('@/config/firebase')).auth.currentUser?.uid || ''));
        if (doctorSnap.exists()) {
          navigate('/doctor-dashboard', { replace: true });
          setLoading(false);
          return;
        }
      } else {
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }

        // If partner signup, verify the code
        let linkedId = '';
        if (signupRole === 'partner') {
          if (!enteredInviteCode) {
            setError('Please enter the invite code from your email');
            setLoading(false);
            return;
          }

          const inviteDoc = await getDoc(doc(db, 'invitations', enteredInviteCode));
          if (inviteDoc.exists()) {
            linkedId = inviteDoc.data().senderUid;
          } else {
            setError('Invalid or expired invite code. Please check your email.');
            setLoading(false);
            return;
          }
        }

        await signUp(email, password, name);

        // Update the newly created profile
        const myProfile = await femtrackDB.profiles.where('email').equals(email).first();
        if (myProfile) {
          await femtrackDB.profiles.update(myProfile.id!, {
            role: signupRole,
            linkedUserId: linkedId,
            onboarded: signupRole === 'partner',
            synced: false
          });
        }

        if (signupRole === 'partner') {
          navigate('/partner-dashboard', { replace: true });
          setLoading(false);
          return;
        }
      }
      
      navigate(isDoctor ? '/doctor' : '/dashboard', { replace: true });
    } catch (err: any) {
      let friendlyMessage = err.message?.replace('Firebase: ', '') || 'Authentication failed';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        friendlyMessage = isLogin 
          ? "No account found with this email. Did you mean to Sign Up instead?" 
          : "Invalid credentials. Please check your email and password.";
      }
      setError(friendlyMessage);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      // Check role after Google Sign-in
      const myProfile = await femtrackDB.profiles.where('email').equals(email).first();
      if (myProfile?.role === 'partner') {
        navigate('/partner-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
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
                      (120 + 80 * Math.cos((i * Math.PI) / 3)).toString(),
                      (120 + 80 * Math.cos((i * Math.PI) / 3 + Math.PI * 2)).toString(),
                    ],
                    cy: [
                      (120 + 80 * Math.sin((i * Math.PI) / 3)).toString(),
                      (120 + 80 * Math.sin((i * Math.PI) / 3 + Math.PI * 2)).toString(),
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

          {/* Invitation Badge */}
          {inviteCodeFromUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-rose/10 border border-rose/20 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl gradient-rose flex items-center justify-center text-white shrink-0">
                <Heart size={20} fill="currentColor" />
              </div>
              <div>
                <p className="text-sm font-display font-bold text-white">Invitation Detected</p>
                <p className="text-[10px] text-lavender/60 font-body">Create your account to view your partner's health dashboard.</p>
              </div>
            </motion.div>
          )}

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
                    className="space-y-4"
                  >
                    {/* Role Selector */}
                    <div className="flex p-1 bg-plum-700/50 rounded-xl border border-lavender/10">
                      <button
                        type="button"
                        onClick={() => setSignupRole('user')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${signupRole === 'user' ? 'bg-rose text-white shadow-glow-rose' : 'text-lavender/50'}`}
                      >
                        <User size={14} /> I'm Tracking
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupRole('partner')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${signupRole === 'partner' ? 'bg-rose text-white shadow-glow-rose' : 'text-lavender/50'}`}
                      >
                        <Heart size={14} /> I'm a Partner
                      </button>
                    </div>

                    <div>
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
                    </div>

                    {signupRole === 'partner' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <label className="block text-xs text-lavender/60 font-body mb-1.5 ml-1">
                          Invite Code (from email)
                        </label>
                        <div className="relative group">
                          <Lock
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender/40 group-focus-within:text-rose-400 transition-colors"
                          />
                          <input
                            type="text"
                            value={enteredInviteCode}
                            onChange={(e) => setEnteredInviteCode(e.target.value.toUpperCase())}
                            placeholder="e.g. RR2MJ3Z8"
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-plum-700/50 border border-rose/30 text-rose-300 placeholder-rose/20 font-mono text-sm tracking-widest focus:outline-none focus:border-rose/50 focus:ring-2 focus:ring-rose/20 transition-all duration-300"
                            id="auth-invite-code"
                          />
                        </div>
                      </motion.div>
                    )}
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

          {/* Doctor Registration Entry */}
          <div className="mt-8 pt-6 border-t border-lavender/5">
            <p className="text-[10px] text-center text-lavender/30 uppercase tracking-widest font-bold mb-4">Medical Professionals</p>
            <button
              onClick={() => navigate('/auth/doctor-register')}
              className="w-full py-3 rounded-xl border border-teal/20 text-teal-400 font-body text-sm font-semibold flex items-center justify-center gap-2 hover:bg-teal/5 transition-all"
            >
              <Stethoscope size={18} /> Create a Doctor Profile
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Auth;
