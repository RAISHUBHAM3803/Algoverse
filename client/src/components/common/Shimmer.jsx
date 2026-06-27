import { motion } from 'framer-motion';

// ─── ShimmerCard — for Dashboard stat cards ──────────────────────────────────
export const ShimmerCard = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-white/5 p-6 shadow-lg shimmer-sweep ${className}`}
    style={{ background: 'rgba(255,255,255,0.04)' }}
  >
    <div className="flex items-center gap-5">
      <div className="w-14 h-14 rounded-2xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="flex-1 space-y-3">
        <div className="h-3 w-24 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-8 w-16 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>
    </div>
  </div>
);

// ─── ShimmerRow — for Problem List table rows ─────────────────────────────────
export const ShimmerRow = () => (
  <div
    className="relative flex items-center gap-4 px-6 py-4 border-b border-[#2a2a2a] overflow-hidden shimmer-row-sweep"
    style={{ background: '#1a1a1a' }}
  >
    <div className="w-5 h-4 rounded flex-shrink-0" style={{ background: '#2e2e2e' }} />
    <div className="flex-1 h-4 rounded" style={{ background: '#2e2e2e' }} />
    <div className="w-14 h-4 rounded hidden md:block" style={{ background: '#2e2e2e' }} />
    <div className="w-16 h-5 rounded-full hidden md:block" style={{ background: '#2e2e2e' }} />
    <div className="hidden md:flex gap-1.5">
      <div className="w-16 h-5 rounded-md" style={{ background: '#2e2e2e' }} />
      <div className="w-14 h-5 rounded-md" style={{ background: '#2e2e2e' }} />
    </div>
    <div className="w-8 h-4 rounded hidden lg:block" style={{ background: '#2e2e2e' }} />
  </div>
);

// ─── ShimmerLine — for single line placeholders ───────────────────────────────
export const ShimmerLine = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden rounded shimmer-sweep ${className}`}
    style={{ background: 'rgba(255,255,255,0.05)', minHeight: '1rem' }}
  />
);
