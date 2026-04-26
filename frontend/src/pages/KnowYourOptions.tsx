import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Target, ShoppingBag, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Sparkles, ExternalLink, MapPin, Star, Leaf, Navigation } from 'lucide-react';
import { PRODUCTS, DID_YOU_KNOW_FACTS, ONLINE_STORES } from '@/data/products';
import type { Product } from '@/data/products';
import { generateProductRecommendation } from '@/utils/geminiApi';

function NearbyStoresMap() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError('Location access denied. Using default.');
        setCoords({ lat: 19.076, lng: 72.8777 }); // Fallback: Mumbai
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => { detectLocation(); }, [detectLocation]);

  const lat = coords?.lat || 19.076;
  const lng = coords?.lng || 72.8777;
  const bbox = `${lng - 0.02}%2C${lat - 0.015}%2C${lng + 0.02}%2C${lat + 0.015}`;

  return (
    <div className="glass-card p-4">
      {locating && (
        <div className="flex items-center justify-center gap-2 py-8">
          <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          <p className="text-lavender/60 font-body text-sm">Detecting your location...</p>
        </div>
      )}
      {!locating && (
        <>
          <div className="rounded-xl overflow-hidden mb-3" style={{ height: 250 }}>
            <iframe
              title="Nearby medical stores"
              width="100%"
              height="100%"
              frameBorder="0"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`}
              style={{ border: 0, borderRadius: 12 }}
            />
          </div>
          <div className="flex gap-2">
            <a
              href={`https://www.google.com/maps/search/medical+store+pharmacy/@${lat},${lng},15z`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 font-body text-sm hover:bg-purple-600/30 transition"
            >
              <MapPin size={14} /> Find Pharmacies
            </a>
            <button
              onClick={detectLocation}
              className="px-3 py-2.5 rounded-xl bg-white/5 text-lavender/50 hover:text-white transition"
            >
              <Navigation size={14} />
            </button>
          </div>
          {error && <p className="text-amber-400/50 text-[10px] font-body mt-2 text-center">{error}</p>}
          {coords && <p className="text-[10px] text-lavender/30 font-body mt-2 text-center">📍 Location detected — showing stores near you</p>}
        </>
      )}
    </div>
  );
}

type AgeGroup = 'under-15' | '15-17' | '18-22' | '23+';

const AGE_OPTIONS: { value: AgeGroup; label: string; emoji: string }[] = [
  { value: 'under-15', label: 'Under 15', emoji: '🌸' },
  { value: '15-17', label: '15–17', emoji: '🌺' },
  { value: '18-22', label: '18–22', emoji: '💐' },
  { value: '23+', label: '23 and above', emoji: '🌹' },
];

const QUIZ_QUESTIONS = [
  {
    id: 'flow', question: 'How would you describe your flow?',
    options: [
      { emoji: '🌊', label: 'Heavy', desc: 'Soaks through in 2–3 hours' },
      { emoji: '💧', label: 'Moderate', desc: 'Changes every 4–5 hours' },
      { emoji: '🫧', label: 'Light', desc: 'Changes once or twice a day' },
      { emoji: '📅', label: 'It varies a lot', desc: '' },
    ],
  },
  {
    id: 'activity', question: 'How active is your lifestyle?',
    options: [
      { emoji: '🏃', label: 'Very active', desc: 'Exercise, swim, or play sports' },
      { emoji: '🚶', label: 'Moderately active', desc: 'Daily walks, occasional gym' },
      { emoji: '🛋️', label: 'Mostly sedentary', desc: 'Desk job or student' },
      { emoji: '🎭', label: 'It changes day to day', desc: '' },
    ],
  },
  {
    id: 'internal_comfort', question: "What's your comfort with internal products?",
    skip_for: ['under-15'] as AgeGroup[],
    options: [
      { emoji: '✅', label: 'Totally fine', desc: "I've used tampons/cups before" },
      { emoji: '🤔', label: 'Curious but never tried', desc: '' },
      { emoji: '❌', label: 'Not comfortable', desc: 'External only for now' },
    ],
  },
  {
    id: 'priority', question: 'What matters most to you?',
    options: [
      { emoji: '💰', label: 'Cost', desc: 'Most affordable option' },
      { emoji: '🌿', label: 'Environment', desc: 'Reduce waste' },
      { emoji: '😌', label: 'Comfort', desc: 'Forget I\'m on my period' },
      { emoji: '⏱️', label: 'Convenience', desc: 'Easy to use, widely available' },
    ],
  },
  {
    id: 'skin', question: 'Do you have sensitive skin or allergies?',
    options: [
      { emoji: '😣', label: 'Yes', desc: 'I get rashes or irritation easily' },
      { emoji: '🤷', label: 'Sometimes', desc: 'Depends on the brand' },
      { emoji: '😊', label: 'No', desc: 'Never had issues' },
    ],
  },
  {
    id: 'frequency', question: 'How long do you want to go between changes?',
    options: [
      { emoji: '🔄', label: 'Short', desc: 'I prefer changing frequently' },
      { emoji: '⏰', label: 'Normal', desc: 'Every 4–6 hours is fine' },
      { emoji: '🕐', label: 'Long', desc: 'I want 8–12 hours wear time' },
    ],
  },
  {
    id: 'budget', question: "What's your monthly budget for period products?",
    options: [
      { emoji: '💵', label: 'Under ₹100', desc: '' },
      { emoji: '💳', label: '₹100–300', desc: '' },
      { emoji: '💎', label: '₹300–600', desc: '' },
      { emoji: '👑', label: "I'd invest more", desc: 'For a long-term solution' },
    ],
  },
];

// ═══════════════════════════════════════
// AGE GATE
// ═══════════════════════════════════════
function AgeGate({ onSelect }: { onSelect: (age: AgeGroup) => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 bg-plum flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="aurora-bg" />
      <motion.div className="relative z-10 text-center max-w-md w-full" initial={{ y: 20 }} animate={{ y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-white mb-2">Before we begin — how old are you?</h1>
        <p className="text-lavender/60 font-body text-sm mb-8">
          We'll show you what's most relevant for you. You can change this anytime.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {AGE_OPTIONS.map((opt) => (
            <motion.button
              key={opt.value}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(opt.value)}
              className="glass-card p-5 text-center hover:border-rose/30 transition-all"
            >
              <span className="text-3xl mb-2 block">{opt.emoji}</span>
              <span className="text-white font-body font-medium text-sm">{opt.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════
// PRODUCT CARD
// ═══════════════════════════════════════
function ProductCard({ product, ageGroup }: { product: Product; ageGroup: AgeGroup }) {
  const [expanded, setExpanded] = useState(false);
  const showMyths = product.show_myths_for_age.includes(ageGroup);
  const isUnder15 = ageGroup === 'under-15';

  return (
    <motion.div
      className="rounded-2xl overflow-hidden cursor-pointer w-full"
      style={{ background: `${product.color}15`, border: `1px solid ${product.color}30` }}
      onClick={() => setExpanded(!expanded)}
      layout
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-3xl">{product.emoji}</span>
          {product.teen_label && (ageGroup === '15-17') && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-body">{product.teen_label}</span>
          )}
        </div>
        <h3 className="text-white font-display font-semibold text-sm mb-1">{product.name}</h3>
        <p className="text-lavender/60 font-body text-xs">{product.tagline}</p>

        {/* Quick stats */}
        <div className="flex items-center gap-3 mt-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-lavender/70 font-body capitalize">{product.comfort_level}</span>
          <span className="text-[10px] text-lavender/50 font-body">{product.cost_india}</span>
          <span className="text-[10px] text-lavender/50">{'🌱'.repeat(product.eco_score)}</span>
        </div>

        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-3">
            <div>
              <p className="text-[10px] text-green-400 font-body font-bold mb-1">✅ PROS</p>
              {product.pros.map((p) => <p key={p} className="text-xs text-lavender/70 font-body">• {p}</p>)}
            </div>
            <div>
              <p className="text-[10px] text-red-400 font-body font-bold mb-1">❌ CONS</p>
              {product.cons.map((c) => <p key={c} className="text-xs text-lavender/70 font-body">• {c}</p>)}
            </div>
            <div>
              <p className="text-[10px] text-purple-400 font-body font-bold mb-1">🎯 BEST FOR</p>
              <p className="text-xs text-lavender/70 font-body">{product.best_for}</p>
            </div>
            {showMyths && !isUnder15 && product.myths.length > 0 && (
              <div>
                <p className="text-[10px] text-amber-400 font-body font-bold mb-1">💡 MYTHS BUSTED</p>
                {product.myths.map((m) => <p key={m} className="text-xs text-lavender/60 font-body italic">• {m}</p>)}
              </div>
            )}
            {product.teen_label && ageGroup === '15-17' && product.id === 'tampon' && (
              <p className="text-xs text-purple-300/80 font-body p-2 rounded-lg bg-purple-500/10">
                It's totally normal to start with pads and try tampons later when you feel ready. There's no rush. 💜
              </p>
            )}
            {product.teen_label && ageGroup === '15-17' && product.id === 'menstrual_cup' && (
              <p className="text-xs text-purple-300/80 font-body p-2 rounded-lg bg-purple-500/10">
                Many girls start using cups in their late teens or early twenties — whenever it feels right for you. 💜
              </p>
            )}
          </motion.div>
        )}

        <div className="mt-2 text-center">
          {expanded ? <ChevronUp size={14} className="text-lavender/30 mx-auto" /> : <ChevronDown size={14} className="text-lavender/30 mx-auto" />}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════
export function KnowYourOptions() {
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [tab, setTab] = useState('learn');
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Load age group from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('femtrack_user_age_group');
    if (stored) {
      setAgeGroup(stored as AgeGroup);
    } else {
      setShowAgeGate(true);
    }

    // Load saved quiz result
    const savedResult = localStorage.getItem('femtrack_product_match');
    if (savedResult) {
      setQuizResult(JSON.parse(savedResult));
    }
  }, []);

  // Rotate facts
  const filteredFacts = DID_YOU_KNOW_FACTS.filter((f) => ageGroup && f.age_groups.includes(ageGroup));
  useEffect(() => {
    if (filteredFacts.length === 0) return;
    const timer = setInterval(() => {
      setFactIndex((i) => (i + 1) % filteredFacts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [filteredFacts.length]);

  const handleAgeSelect = (age: AgeGroup) => {
    setAgeGroup(age);
    localStorage.setItem('femtrack_user_age_group', age);
    setShowAgeGate(false);
  };

  // Filter products by age
  const filteredProducts = PRODUCTS.filter((p) => ageGroup && p.age_groups.includes(ageGroup));

  // Filter quiz questions
  const filteredQuestions = QUIZ_QUESTIONS.filter((q) => !q.skip_for || !ageGroup || !q.skip_for.includes(ageGroup));

  const handleQuizAnswer = (questionId: string, answer: string) => {
    const updated = { ...quizAnswers, [questionId]: answer };
    setQuizAnswers(updated);

    if (quizStep < filteredQuestions.length - 1) {
      setDirection(1);
      setQuizStep(quizStep + 1);
    } else {
      // Submit to Gemini
      submitQuiz(updated);
    }
  };

  const submitQuiz = async (answers: Record<string, string>) => {
    setQuizLoading(true);
    try {
      const result = await generateProductRecommendation(ageGroup || '18-22', answers);
      setQuizResult(result);
      localStorage.setItem('femtrack_product_match', JSON.stringify(result));
    } catch (err) {
      console.error('Quiz error:', err);
    }
    setQuizLoading(false);
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers({});
    setQuizResult(null);
    localStorage.removeItem('femtrack_product_match');
  };

  // Age filter for online stores
  const ageOrder = { 'under-15': 0, '15-17': 1, '18-22': 2, '23+': 3 };
  const filteredStores = ONLINE_STORES.filter((s) => ageGroup && ageOrder[ageGroup] >= ageOrder[s.minAge as AgeGroup]);

  if (showAgeGate) return <AgeGate onSelect={handleAgeSelect} />;
  if (!ageGroup) return null;

  const TABS = [
    { key: 'learn', label: 'Learn', icon: BookOpen },
    { key: 'quiz', label: quizResult ? 'Your Match 💜' : 'Find My Match', icon: Target },
    { key: 'buy', label: 'Where to Buy', icon: ShoppingBag },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-display font-bold text-white">Know Your Options</h1>
        <p className="text-sm text-lavender/60 font-body">Every body is different. Find the period product that's actually right for you.</p>
        <button onClick={() => setShowAgeGate(true)} className="text-[10px] text-purple-400 font-body mt-1 hover:underline">
          Change age group ({AGE_OPTIONS.find((a) => a.value === ageGroup)?.label})
        </button>
      </div>

      {/* Under 15 welcome banner */}
      {ageGroup === 'under-15' && (
        <motion.div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm text-purple-300 font-body">
            Welcome! Periods are completely normal. Let's help you understand your options — starting with the basics. 💜
          </p>
        </motion.div>
      )}

      {/* Did You Know */}
      {filteredFacts.length > 0 && (
        <motion.div className="glass-card p-3 mb-4 overflow-hidden" key={factIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-xs text-lavender/70 font-body">
            <span className="text-amber-400 font-bold">💡 Did You Know? </span>
            {filteredFacts[factIndex]?.text}
          </p>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-plum-700/30 rounded-2xl p-1 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-body font-medium transition-all ${
              tab === t.key ? 'bg-purple-600/40 text-white shadow-lg' : 'text-lavender/50 hover:text-lavender/80'
            }`}
          >
            <t.icon size={14} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ═══ LEARN TAB ═══ */}
        {tab === 'learn' && (
          <motion.div key="learn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
              {filteredProducts.map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <ProductCard product={product} ageGroup={ageGroup} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══ QUIZ TAB ═══ */}
        {tab === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {quizLoading ? (
              <div className="glass-card p-8 text-center">
                <div className="w-12 h-12 border-3 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white font-body font-medium">Finding your perfect match...</p>
                <p className="text-lavender/40 font-body text-xs mt-1">Our AI is analyzing your preferences</p>
              </div>
            ) : quizResult ? (
              /* ─── RESULTS ─── */
              <div className="space-y-4">
                {/* Primary */}
                <motion.div className="glass-card p-5 border border-rose/20" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-rose-400" />
                    <span className="text-xs text-rose-400 font-body font-bold uppercase tracking-wider">Your Best Match</span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-white mb-2">{quizResult.primary_recommendation?.product}</h3>
                  <p className="text-sm text-lavender/70 font-body">{quizResult.primary_recommendation?.reason}</p>
                  <p className="text-xs text-purple-300 font-body mt-2 p-2 rounded-lg bg-purple-500/10">
                    💡 {quizResult.primary_recommendation?.tip}
                  </p>
                </motion.div>

                {/* Also Consider */}
                <div className="grid grid-cols-2 gap-3">
                  {quizResult.also_consider?.map((alt: any, i: number) => (
                    <motion.div key={i} className="glass-card p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}>
                      <p className="text-[10px] text-purple-400 font-body font-bold uppercase mb-1">Also Consider</p>
                      <h4 className="text-sm font-display font-semibold text-white mb-1">{alt.product}</h4>
                      <p className="text-xs text-lavender/60 font-body">{alt.reason}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Avoid */}
                {quizResult.avoid_for_now && (
                  <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <p className="text-[10px] text-red-400/60 font-body font-bold uppercase mb-1">Maybe Later</p>
                    <p className="text-xs text-lavender/50 font-body"><span className="text-white">{quizResult.avoid_for_now.product}</span> — {quizResult.avoid_for_now.reason}</p>
                  </div>
                )}

                {/* Savings */}
                {quizResult.monthly_savings_tip && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-400 font-body">💰 {quizResult.monthly_savings_tip}</p>
                  </div>
                )}

                {/* Encouragement */}
                <p className="text-center text-sm text-purple-300 font-body">{quizResult.encouragement}</p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={() => setTab('buy')} className="flex-1 py-3 rounded-xl gradient-rose text-white font-body text-sm font-medium flex items-center justify-center gap-2">
                    <MapPin size={14} /> Find Near Me
                  </button>
                  <button onClick={resetQuiz} className="px-4 py-3 rounded-xl bg-white/5 text-lavender/50 font-body text-sm hover:bg-white/10 transition">
                    Retake
                  </button>
                </div>
              </div>
            ) : (
              /* ─── QUIZ QUESTIONS ─── */
              <div>
                {/* Progress */}
                <div className="flex gap-1 mb-6">
                  {filteredQuestions.map((_, i) => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= quizStep ? 'gradient-rose' : 'bg-plum-700/50'}`} />
                  ))}
                </div>
                <p className="text-[10px] text-lavender/40 font-body mb-4">{quizStep + 1}/{filteredQuestions.length}</p>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={quizStep}
                    initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                    transition={{ type: 'tween', duration: 0.25 }}
                  >
                    <h2 className="text-lg font-display font-semibold text-white mb-4">
                      {filteredQuestions[quizStep]?.question}
                    </h2>
                    <div className="space-y-2">
                      {filteredQuestions[quizStep]?.options.map((opt) => (
                        <motion.button
                          key={opt.label}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleQuizAnswer(filteredQuestions[quizStep].id, opt.label)}
                          className="w-full text-left p-4 rounded-2xl bg-plum-700/30 hover:bg-plum-700/50 border border-lavender/5 hover:border-purple-400/30 transition-all flex items-center gap-3"
                        >
                          <span className="text-xl">{opt.emoji}</span>
                          <div>
                            <p className="text-sm text-white font-body font-medium">{opt.label}</p>
                            {opt.desc && <p className="text-xs text-lavender/40 font-body">{opt.desc}</p>}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {quizStep > 0 && (
                  <button
                    onClick={() => { setDirection(-1); setQuizStep(quizStep - 1); }}
                    className="flex items-center gap-1 mt-4 text-xs text-lavender/40 font-body hover:text-lavender/70"
                  >
                    <ArrowLeft size={12} /> Back
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ BUY TAB ═══ */}
        {tab === 'buy' && (
          <motion.div key="buy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {/* Online Stores */}
            <h3 className="text-sm font-display font-semibold text-white flex items-center gap-2">
              <ShoppingBag size={14} className="text-purple-400" />
              Online Stores
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {filteredStores.map((store) => (
                <a
                  key={store.name}
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-4 hover:border-purple-400/30 transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: `${store.color}20` }}>
                    <ShoppingBag size={16} style={{ color: store.color }} />
                  </div>
                  <h4 className="text-sm text-white font-body font-medium">{store.name}</h4>
                  <p className="text-[10px] text-lavender/40 font-body">{store.types}</p>
                  <p className="text-[10px] text-lavender/50 font-body mt-1">{store.priceRange}</p>
                  <span className="flex items-center gap-1 text-[10px] text-purple-400 font-body mt-2 group-hover:gap-2 transition-all">
                    Shop Now <ExternalLink size={10} />
                  </span>
                </a>
              ))}
            </div>

            {/* Nearby — OpenStreetMap with auto-location */}
            <h3 className="text-sm font-display font-semibold text-white flex items-center gap-2 mt-6">
              <MapPin size={14} className="text-rose-400" />
              Find Nearby Stores
            </h3>
            <NearbyStoresMap />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default KnowYourOptions;
