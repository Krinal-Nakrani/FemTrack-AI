import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import type { PassportData } from '@/utils/passportHelpers';
import { getPassportUrl } from '@/utils/passportHelpers';

interface PassportCardProps {
  data: PassportData;
  showQR?: boolean;
}

const riskColors = { low: '#4ADE80', moderate: '#FBBF24', high: '#EF4444' };
const trendLabels = { improving: '↓ Improving', stable: '→ Stable', worsening: '↑ Increasing' };
const trendColors = { improving: '#4ADE80', stable: '#FBBF24', worsening: '#EF4444' };

export function PassportCard({ data, showQR = true }: PassportCardProps) {
  const riskPct = Math.min(data.pcodRiskScore, 100);

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[380px] rounded-[24px] overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #4C1D95 0%, #3B0764 100%)',
        boxShadow: '0 20px 60px rgba(76, 29, 149, 0.4), 0 0 30px rgba(201, 75, 138, 0.15)',
      }}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Watermark pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.5) 35px, rgba(255,255,255,0.5) 36px)`,
      }} />

      {/* Header */}
      <div className="relative px-6 pt-6 pb-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <span className="text-white/90 text-xs font-bold tracking-[0.2em] uppercase">FemTrack AI</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white/60">🪪</span>
        </div>
      </div>
      <div className="px-6 pb-3 pt-2">
        <h2 className="text-white text-lg font-bold tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>CYCLE PASSPORT</h2>
      </div>

      {/* Identity */}
      <div className="px-6 py-3 border-t border-white/10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Name</p>
            <p className="text-white font-semibold text-sm">{data.name}</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Member Since</p>
            <p className="text-white/80 text-xs">{data.memberSince}</p>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-white/40 text-[10px] uppercase tracking-wider">Passport ID</p>
          <p className="text-rose-300 font-mono text-sm font-bold tracking-widest">{data.passportId}</p>
        </div>
      </div>

      {/* Cycle Profile */}
      <div className="px-6 py-3 border-t border-white/10">
        <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold mb-2">Cycle Profile</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-white font-bold text-lg">{data.avgCycleLength}</p>
            <p className="text-white/40 text-[9px]">Avg Length (days)</p>
          </div>
          <div>
            <p className="text-white font-bold text-lg">±{data.cycleVariance}</p>
            <p className="text-white/40 text-[9px]">Variance (days)</p>
          </div>
          <div>
            <p className="text-white font-bold text-lg">{data.cyclesTracked}</p>
            <p className="text-white/40 text-[9px]">Cycles Tracked</p>
          </div>
        </div>
      </div>

      {/* PCOD Risk */}
      <div className="px-6 py-3 border-t border-white/10">
        <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold mb-2">PCOD Risk Score</p>
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${riskColors[data.pcodRiskLevel]}, ${riskColors[data.pcodRiskLevel]}88)` }}
              initial={{ width: 0 }}
              animate={{ width: `${riskPct}%` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
            />
          </div>
          <span className="text-white font-bold text-sm min-w-[60px] text-right">{data.pcodRiskScore}/100</span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] font-bold uppercase" style={{ color: riskColors[data.pcodRiskLevel] }}>
            {data.pcodRiskLevel}
          </span>
          <span className="text-[10px]" style={{ color: trendColors[data.pcodTrend] }}>
            Trend: {trendLabels[data.pcodTrend]}
          </span>
        </div>
      </div>

      {/* Top Symptoms */}
      <div className="px-6 py-3 border-t border-white/10">
        <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold mb-2">Top Symptoms</p>
        <div className="flex flex-wrap gap-1.5">
          {data.topSymptoms.slice(0, 5).map((s) => (
            <span key={s} className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-white/70 capitalize">{s}</span>
          ))}
        </div>
      </div>

      {/* QR Code */}
      {showQR && (
        <div className="px-6 py-5 border-t border-white/10 flex flex-col items-center">
          <div className="bg-white p-3 rounded-2xl">
            <QRCodeSVG
              value={getPassportUrl(data.passportId)}
              size={130}
              bgColor="#ffffff"
              fgColor="#4C1D95"
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-white/40 text-[10px] mt-3 text-center">Scan to view full dashboard</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/30 text-[9px]">Valid • Last updated: {data.lastUpdated}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
