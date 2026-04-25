import { motion } from 'framer-motion';
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
} from 'lucide-react';

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

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-plum overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="blob blob-rose w-[500px] h-[500px] -top-40 -right-40" />
        <div className="blob blob-lavender w-[400px] h-[400px] top-1/3 -left-40" />
        <div className="blob blob-coral w-[350px] h-[350px] bottom-20 right-20" />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <nav className="flex items-center justify-between px-6 md:px-12 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-rose flex items-center justify-center">
              <Flower2 size={22} className="text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white">FemTrack AI</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm font-body font-medium text-lavender/80 hover:text-white transition-colors min-tap px-4 py-2"
              id="landing-login"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="btn-primary text-sm"
              id="landing-signup"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 md:px-12 pt-16 md:pt-24 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose/10 border border-rose/20 mb-8">
              <Sparkles size={14} className="text-rose-400" />
              <span className="text-xs font-body font-medium text-rose-300">
                AI-Powered Period Intelligence
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight mb-6">
              Your Cycle,{' '}
              <span className="gradient-text">Understood</span>
              <br />
              Like Never Before
            </h1>

            <p className="text-lg md:text-xl text-lavender/70 font-body max-w-2xl mx-auto mb-10 leading-relaxed">
              Smart period tracking with AI-powered PCOD risk prediction,
              personalized insights, and encrypted privacy. The most intelligent
              cycle companion you'll ever need.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                className="btn-primary text-base px-8 py-4 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
                id="hero-cta"
              >
                Start Tracking Free
                <ArrowRight size={18} />
              </motion.button>
              <p className="text-xs text-lavender/40 font-body">
                No credit card required · 100% free
              </p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex items-center justify-center gap-8 md:gap-16 mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {[
              { value: '99%', label: 'Prediction Accuracy' },
              { value: '256-bit', label: 'AES Encryption' },
              { value: '100%', label: 'Offline Capable' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-display font-bold gradient-text">
                  {stat.value}
                </p>
                <p className="text-xs text-lavender/50 font-body mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
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
                className="glass-card p-6 group hover:border-rose/30 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${feature.color}15` }}
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
            className="glass-card p-8 md:p-12"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Ready to Take Control?
            </h2>
            <p className="text-lavender/60 font-body mb-8 max-w-lg mx-auto">
              Join thousands who track smarter with FemTrack AI. Your body,
              your data, your insights.
            </p>
            <motion.button
              className="btn-primary text-base px-8 py-4 flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
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
