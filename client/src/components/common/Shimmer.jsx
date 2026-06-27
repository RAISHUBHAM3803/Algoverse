import React from 'react';
import { motion } from 'framer-motion';

export const ShimmerCard = ({ className = "" }) => (
  <div className={`relative overflow-hidden rounded-2xl bg-surface/20 border border-white/5 p-6 shadow-lg ${className}`}>
    <motion.div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent z-10"
      animate={{ translateX: ["-100%", "100%"] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    />
    <div className="flex items-center gap-5">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="w-20 h-3 rounded bg-white/5" />
        <div className="w-16 h-8 rounded bg-white/5" />
      </div>
    </div>
  </div>
);

export const ShimmerLine = ({ className = "" }) => (
  <div className={`relative overflow-hidden rounded bg-white/5 ${className}`}>
    <motion.div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent z-10"
      animate={{ translateX: ["-100%", "100%"] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    />
  </div>
);

export const ShimmerRow = () => (
  <div className="relative flex items-center gap-4 px-6 py-4 border-b border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
    <motion.div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent z-10"
      animate={{ translateX: ["-100%", "100%"] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    />
    <div className="w-5 h-4 bg-[#2a2a2a] rounded flex-shrink-0" />
    <div className="flex-1 h-4 bg-[#2a2a2a] rounded" />
    <div className="w-14 h-4 bg-[#2a2a2a] rounded hidden md:block" />
    <div className="w-16 h-5 bg-[#2a2a2a] rounded-full hidden md:block" />
    <div className="hidden md:flex gap-1.5">
      <div className="w-16 h-5 bg-[#2a2a2a] rounded-md" />
      <div className="w-14 h-5 bg-[#2a2a2a] rounded-md" />
    </div>
    <div className="w-8 h-4 bg-[#2a2a2a] rounded hidden lg:block" />
  </div>
);
