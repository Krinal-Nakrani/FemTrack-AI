import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Flower2,
  Shield,
  BarChart3,
  Calendar,
  Brain,
  Smartphone,
  ArrowRight,
  Sparkles,
  Heart,
  Search,
  Activity,
  Zap,
  Stethoscope,
} from 'lucide-react';

/* ───── Animated Counter Component ───── */
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [display, setDisplay] = useState('0');
  const numericPart = parseInt(value.replace(/\D/g, ''));
  const prefix = value.replace(/[\d]/g, '').replace(suffix, '');

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(String(Math.round(eased * numericPart)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, numericPart]);

  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  );
}

/* ───── Floating Petal Particles ───── */
function FloatingPetals() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-rose-300/20"
          initial={{
            x: `${Math.random() * 100}vw`,
            y: `${110 + Math.random() * 20}vh`,
            rotate: 0,
            scale: 0.5 + Math.random() * 0.8,
          }}
          animate={{
            y: `-10vh`,
            x: `${Math.random() * 100}vw`,
            rotate: 360 + Math.random() * 360,
          }}
          transition={{
            duration: 12 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: 'linear',
          }}
          style={{ fontSize: `${12 + Math.random() * 14}px` }}
        >
          {['🌸', '✿', '❀', '🌺', '⚘'][Math.floor(Math.random() * 5)]}
        </motion.div>
      ))}
    </div>
  );
}

/* ───── Animated Hero Illustration ───── */
function HeroIllustration() {
  return (
    <motion.div
      className="relative w-full max-w-[340px] mx-auto"
      animate={{ y: [0, -15, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 300 300" className="w-full h-auto">
        {/* Outer glow ring */}
        <motion.circle
          cx="150" cy="150" r="130"
          fill="none"
          stroke="url(#outerGlow)"
          strokeWidth="2"
          strokeDasharray="8 6"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '150px 150px' }}
        />
        {/* Middle ring */}
        <motion.circle
          cx="150" cy="150" r="110"
          fill="none"
          stroke="url(#middleRing)"
          strokeWidth="3"
          strokeDasharray="20 10"
          initial={{ rotate: 0 }}
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '150px 150px' }}
        />
        {/* Inner gradient circle */}
        <circle cx="150" cy="150" r="85" fill="url(#innerGrad)" opacity="0.6" />
        {/* Cycle phase arcs */}
        {[0, 1, 2, 3].map((i) => (
          <motion.path
            key={i}
            d={`M 150 150 L ${150 + 75 * Math.cos((i * Math.PI) / 2 - Math.PI / 2)} ${150 + 75 * Math.sin((i * Math.PI) / 2 - Math.PI / 2)} A 75 75 0 0 1 ${150 + 75 * Math.cos(((i + 1) * Math.PI) / 2 - Math.PI / 2)} ${150 + 75 * Math.sin(((i + 1) * Math.PI) / 2 - Math.PI / 2)} Z`}
            fill={['rgba(201,75,138,0.3)', 'rgba(179,157,219,0.25)', 'rgba(255,107,157,0.2)', 'rgba(149,117,205,0.2)'][i]}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.15, duration: 0.6, type: 'spring' }}
            style={{ transformOrigin: '150px 150px' }}
          />
        ))}
        {/* Center flower icon */}
        <motion.g
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
          style={{ transformOrigin: '150px 150px' }}
        >
          <circle cx="150" cy="150" r="28" fill="url(#centerGrad)" />
          <text x="150" y="157" textAnchor="middle" fontSize="22" fill="white">❀</text>
        </motion.g>
        {/* Phase labels */}
        {['Period', 'Follicular', 'Ovulation', 'Luteal'].map((label, i) => {
          const angle = (i * Math.PI) / 2 - Math.PI / 4;
          const r = 100;
          return (
            <motion.text
              key={label}
              x={150 + r * Math.cos(angle)}
              y={150 + r * Math.sin(angle)}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(179,157,219,0.6)"
              fontSize="9"
              fontFamily="Inter, sans-serif"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 + i * 0.1 }}
            >
              {label}
            </motion.text>
          );
        })}
        {/* Defs */}
        <defs>
          <radialGradient id="innerGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(201,75,138,0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="outerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C94B8A" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#B39DDB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF6B9D" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="middleRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B39DDB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#C94B8A" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="centerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C94B8A" />
            <stop offset="100%" stopColor="#FF6B9D" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

const features = [
  {
    icon: Calendar,
    title: 'Smart Cycle Tracking',
    desc: 'AI-powered predictions with confidence windows for your unique cycle pattern.',
    color: '#C94B8A',
  },
  {
    icon: Brain,
    title: 'PCOD Risk Assessment',
    desc: 'Machine learning model analyzes your patterns to predict PCOD risk factors.',
    color: '#B39DDB',
  },
  {
    icon: BarChart3,
    title: 'Deep Insights',
    desc: 'Beautiful charts showing symptom trends, mood patterns, and cycle regularity.',
    color: '#FF6B9D',
  },
  {
    icon: Shield,
    title: 'Private & Encrypted',
    desc: 'AES-256 encryption. Your data stays yours — always.',
    color: '#4ADE80',
  },
  {
    icon: Smartphone,
    title: 'Works Offline',
    desc: 'Full PWA with offline support. Log anytime, anywhere, even without internet.',
    color: '#FBBF24',
  },
  {
    icon: Heart,
    title: 'Holistic Wellness',
    desc: 'Track mood, sleep, stress, symptoms, and get personalized daily insights.',
    color: '#EC4899',
  },
];

const steps = [
  { icon: Search, title: 'Track', desc: 'Log your daily symptoms, mood, and flow in seconds', color: '#C94B8A' },
  { icon: Activity, title: 'Analyze', desc: 'AI processes your data to find hidden patterns', color: '#B39DDB' },
  { icon: Zap, title: 'Predict', desc: 'Get accurate predictions and personalized health insights', color: '#FF6B9D' },
];

export function Landing() {
  const navigate = useNavigate();
  const [partnerCode, setPartnerCode] = useState('');

  return (
    <div className="min-h-screen bg-plum overflow-hidden relative">
      {/* Aurora Background */}
      <div className="aurora-bg" />

      {/* Floating Petals */}
      <FloatingPetals />

      {/* Header */}
      <header className="relative z-10">
        <nav className="flex items-center justify-between px-6 md:px-12 py-6">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="w-10 h-10 rounded-xl gradient-rose flex items-center justify-center shadow-glow-rose"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Flower2 size={22} className="text-white" />
            </motion.div>
            <span className="text-xl font-display font-bold text-white">FemTrack AI</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <button
              onClick={() => navigate('/auth')}
              className="text-sm font-body font-medium text-lavender/80 hover:text-white transition-colors min-tap px-4 py-2"
              id="landing-login"
            >
              Log In
            </button>
            <motion.button
              onClick={() => navigate('/auth')}
              className="btn-primary text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              id="landing-signup"
            >
              Get Started
            </motion.button>
          </motion.div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 md:px-12 pt-10 md:pt-16 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose/10 border border-rose/20 mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Sparkles size={14} className="text-rose-400" />
                <span className="text-xs font-body font-medium text-rose-300">
                  AI-Powered Period Intelligence
                </span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6 text-balance">
                Your Cycle,{' '}
                <span className="gradient-text">Understood</span>
                <br />
                Like Never Before
              </h1>

              <p className="text-lg text-lavender/70 font-body max-w-xl mb-10 leading-relaxed">
                Smart period tracking with AI-powered PCOD risk prediction,
                personalized insights, and encrypted privacy. The most intelligent
                cycle companion you'll ever need.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <motion.button
                  className="btn-primary text-base px-8 py-4 flex items-center gap-2"
                  whileHover={{ scale: 1.05, boxShadow: '0 12px 35px rgba(201,75,138,0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/auth')}
                  id="hero-cta"
                >
                  Start Tracking Free
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight size={18} />
                  </motion.span>
                </motion.button>
                <p className="text-xs text-lavender/40 font-body">
                  No credit card required · 100% free
                </p>
              </div>
            </motion.div>

            {/* Right: Animated Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="hidden lg:block"
            >
              <HeroIllustration />
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            className="flex items-center justify-center gap-8 md:gap-16 mt-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {[
              { value: '99', suffix: '%', label: 'Prediction Accuracy' },
              { value: '256', suffix: '-bit', label: 'AES Encryption' },
              { value: '100', suffix: '%', label: 'Offline Capable' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-display font-bold gradient-text">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-lavender/50 font-body mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lavender/60 font-body max-w-lg mx-auto">
              Three simple steps to smarter cycle management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-rose/30 via-lavender/30 to-coral/30" />

            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="flex flex-col items-center text-center relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <motion.div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 relative"
                  style={{ background: `${step.color}20` }}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <step.icon size={28} style={{ color: step.color }} />
                  <div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: step.color }}
                  >
                    {i + 1}
                  </div>
                </motion.div>
                <h3 className="text-lg font-display font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-lavender/60 font-body leading-relaxed max-w-[220px]">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-lavender/60 font-body max-w-lg mx-auto">
              Powered by machine learning, designed with love, built for your body.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="feature-card-interactive p-6 group"
              >
                <div
                  className="feature-icon-glow w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `${feature.color}15`,
                    '--icon-glow-color': `${feature.color}40`,
                  } as React.CSSProperties}
                >
                  <feature.icon size={24} style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-display font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-lavender/60 font-body leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            className="glass-card p-8 md:p-12 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* CTA glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose/10 via-transparent to-lavender/10 pointer-events-none" />

            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 relative z-10">
              Ready to Take Control?
            </h2>
            <p className="text-lavender/60 font-body mb-8 max-w-lg mx-auto relative z-10">
              Join thousands who track smarter with FemTrack AI. Your body,
              your data, your insights.
            </p>
            <motion.button
              className="btn-primary text-base px-8 py-4 flex items-center gap-2 mx-auto relative z-10"
              whileHover={{ scale: 1.05, boxShadow: '0 12px 35px rgba(201,75,138,0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              id="cta-start"
            >
              <Flower2 size={18} />
              Get Started Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Portals Section — Doctor & Partner Access */}
      <section className="relative z-10 px-6 md:px-12 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-white text-center mb-3">
            For Partners & Doctors
          </h2>
          <p className="text-center text-lavender/50 font-body text-sm mb-8">
            FemTrack AI connects patients with their care circle
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Doctor Login */}
            <motion.div
              className="glass-card p-6 relative overflow-hidden group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/auth?role=doctor')}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-500/10 blur-[60px]" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center mb-4">
                  <Stethoscope size={24} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-display font-semibold text-white mb-2">Gynecologist Portal</h3>
                <p className="text-sm text-lavender/60 font-body mb-4">
                  Log in with your verified doctor credentials to access patient dashboards, PCOD risk trends, and async Q&A.
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-blue-400 font-body font-medium group-hover:gap-2 transition-all">
                  Doctor Login <ArrowRight size={14} />
                </span>
              </div>
            </motion.div>

            {/* Partner Access */}
            <motion.div
              className="glass-card p-6 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-rose/10 blur-[60px]" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-rose/15 flex items-center justify-center mb-4">
                  <Heart size={24} className="text-rose-400" />
                </div>
                <h3 className="text-lg font-display font-semibold text-white mb-2">Partner Care Access</h3>
                <p className="text-sm text-lavender/60 font-body mb-4">
                  Your partner invited you? Enter the invite code from her email to view her wellness dashboard.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter invite code..."
                    value={partnerCode}
                    onChange={(e) => setPartnerCode(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm focus:outline-none focus:border-rose/50 transition-colors"
                    id="partner-code-input"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (partnerCode.trim()) navigate(`/partner/${partnerCode.trim()}`);
                    }}
                    className="px-4 py-2.5 rounded-xl gradient-rose text-white font-body text-sm font-medium"
                  >
                    Go
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-12 py-8 border-t border-lavender/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flower2 size={18} className="text-rose-400" />
            <span className="text-sm font-body text-lavender/50">
              © 2026 FemTrack AI. All rights reserved.
            </span>
          </div>
          <p className="text-xs text-lavender/30 font-body">
            Not a medical device. Consult a healthcare professional for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
