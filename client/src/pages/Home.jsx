import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Terminal, Zap, Trophy, GitBranch,
  CheckCircle2, ChevronRight, Flame, Lock, Code2, Layers, Target
} from "lucide-react";
import { motion, animate } from "framer-motion";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../features/auth/authSelectors";
import api from "../api/axios";

// ── Animated counter ────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const controls = animate(0, to, {
      duration: 2,
      ease: "easeOut",
      onUpdate(value) {
        if (ref.current) ref.current.textContent = Math.floor(value) + suffix;
      },
    });
    return () => controls.stop();
  }, [to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

// ── Floating grid card ────────────────────────────────────────────────────────
const ProblemRow = ({ num, title, diff, tags, delay }) => {
  const colors = { Easy: "text-emerald-400", Medium: "text-amber-400", Hard: "text-red-400" };
  const bgs    = { Easy: "bg-emerald-500/10 border-emerald-500/20", Medium: "bg-amber-500/10 border-amber-500/20", Hard: "bg-red-500/10 border-red-500/20" };
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer"
    >
      <span className="text-white/20 text-xs font-mono w-6 flex-shrink-0">{num}.</span>
      <span className="flex-1 text-sm text-white/70 group-hover:text-white transition-colors font-medium truncate">{title}</span>
      <span className={`text-xs font-bold ${colors[diff]} flex-shrink-0`}>{diff}</span>
      <div className="hidden sm:flex gap-1.5 flex-shrink-0">
        {tags.map(t => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">{t}</span>
        ))}
      </div>
    </motion.div>
  );
};

// ── Hero terminal ─────────────────────────────────────────────────────────────
const HeroTerminal = () => {
  const [typedCode, setTypedCode] = useState("");
  const codeString = `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i`;

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedCode(codeString.substring(0, i));
      i++;
      if (i > codeString.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Syntax highlighting for the typed code
  const highlightCode = (code) => {
    return code
      .replace(/def |for |in |if |return /g, match => `<span class="text-purple-400">${match}</span>`)
      .replace(/two_sum|enumerate/g, match => `<span class="text-cyan-400">${match}</span>`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="w-full max-w-lg mx-auto lg:mx-0 rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(6,182,212,0.08)] bg-[#0d1117]"
    >
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/8">
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-amber-500/60" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
        <span className="ml-2 text-[11px] text-white/20 font-mono">two_sum.py</span>
      </div>
      {/* Code lines */}
      <div className="p-5 font-mono text-[13px] leading-relaxed text-white/70 whitespace-pre-wrap min-h-[220px]">
        <div dangerouslySetInnerHTML={{ __html: highlightCode(typedCode) }} />
        {typedCode.length === codeString.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-3 flex items-center gap-2 pt-3 border-t border-white/5"
          >
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
            </span>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-xs text-white/30">Runtime 56ms · Beats 94%</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Home = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [platformStats, setPlatformStats] = useState({
    totalProblems: 200,
    totalUsers: 1500,
    totalSubmissions: 50000
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats');
        if (response.data?.success && response.data?.data) {
          setPlatformStats({
            totalProblems: response.data.data.totalProblems,
            totalUsers: response.data.data.totalUsers,
            totalSubmissions: response.data.data.totalSubmissions,
          });
        }
      } catch (error) {
        console.error("Failed to fetch platform stats", error);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { value: platformStats.totalProblems, suffix: "+", label: "Problems" },
    { value: platformStats.totalUsers,    suffix: "+", label: "Developers" },
    { value: platformStats.totalSubmissions, suffix: "+", label: "Submissions" },
    { value: 4,                           suffix: "",  label: "Languages" },
  ];

  const problems = [
    { num: 1,  title: "Two Sum",                  diff: "Easy",   tags: ["Array", "Hash Map"] },
    { num: 15, title: "3Sum",                     diff: "Medium", tags: ["Two Pointers"] },
    { num: 23, title: "Merge K Sorted Lists",     diff: "Hard",   tags: ["Linked List"] },
    { num: 53, title: "Maximum Subarray",         diff: "Medium", tags: ["DP"] },
    { num: 121, title: "Best Time to Buy Stock",  diff: "Easy",   tags: ["Array"] },
  ];

  const features = [
    { icon: Zap,       title: "Instant Execution",    desc: "Run C++, Python, Java, and JS directly in the browser. Zero setup.", color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
    { icon: Trophy,    title: "Streaks & Rankings",   desc: "Daily streaks, XP points and a live leaderboard to stay motivated.", color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/20" },
    { icon: GitBranch, title: "Full Submission Log",  desc: "Every submission saved. Review any past solution in one click.",     color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20" },
    { icon: Flame,     title: "AI Hints On Demand",   desc: "Stuck? Get a context-aware nudge from your built-in AI assistant.", color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20" },
    { icon: Lock,      title: "Secure Sandbox",       desc: "All code runs in an isolated cloud environment. No local setup.",    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { icon: Code2,     title: "Smart Analytics",      desc: "Track your topic coverage and identify weak spots automatically.",   color: "text-indigo-400",  bg: "bg-indigo-500/10",  border: "border-indigo-500/20" },
  ];

  return (
    <div className="min-h-screen bg-[#080b12] relative overflow-x-hidden font-sans">
      {/* ── Global ambient orbs ─────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-cyan-500/4 blur-[120px]" />
        <div className="absolute top-1/2 -right-60 w-[600px] h-[600px] rounded-full bg-indigo-500/4 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] rounded-full bg-cyan-600/3 blur-[100px]" />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: "linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: copy */}
            <div className="flex-1 text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-6xl xl:text-7xl font-display font-black leading-[1.05] tracking-tight mb-6"
              >
                <span className="text-white">Level up your</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400">
                  Coding Skills
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-white/50 text-lg max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
              >
                The ultimate platform to practice algorithms, crush technical interviews, and track your growth — all in one beautifully crafted workspace.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link
                  to="/register"
                  id="hero-cta-start"
                  className="group flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_45px_rgba(6,182,212,0.55)] hover:scale-105 active:scale-95 text-sm"
                >
                  Start Coding Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/problems"
                  id="hero-cta-browse"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 text-sm"
                >
                  <Terminal className="w-4 h-4 text-white/40" />
                  Browse Problems
                </Link>
              </motion.div>
            </div>

            {/* Right: code preview */}
            <div className="flex-1 w-full max-w-lg">
              <HeroTerminal />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ─────────────────────────────────────────────────── */}
      <section className="relative z-10 py-12 border-y border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-display font-black text-white mb-1">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="text-[11px] uppercase tracking-widest text-white/30 font-bold">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* ── Workflow ────────────────────────────────────────── */}
      <section className="py-24 relative z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">How it works</h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">Three simple steps from practice to mastery.</p>
          </div>
          
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              {[
                { icon: Layers, step: "01", title: "Pick a Problem", desc: "Select a coding challenge. Start with an Easy warmup or jump straight into a Hard interview question." },
                { icon: Terminal, step: "02", title: "Write Code", desc: "Type your solution in our built-in editor. Run it instantly to see if your logic passes all the test cases." },
                { icon: Target, step: "03", title: "Level Up", desc: "Watch your daily streak grow and your ranking improve every time you solve a new problem." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/30 mb-6">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Step {item.step}</div>
                  <h3 className="text-xl font-display font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem Preview ──────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 bg-white/[0.015] border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            {/* Text */}
            <div className="lg:w-80 flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4">Problem Set</div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 leading-snug">
                  200+ hand-curated challenges
                </h2>
                <p className="text-white/50 text-sm leading-relaxed mb-8">
                  From Easy warm-ups to brutal Hard problems — filter by topic, difficulty, or tag and jump straight into your next challenge.
                </p>
                <Link
                  to="/problems"
                  className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors group"
                >
                  Explore all problems
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            {/* Problem table preview */}
            <div className="flex-1 bg-[#0a0c10] border border-white/8 rounded-2xl overflow-hidden w-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-white/[0.02]">
                <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Recent Problems</span>
                <div className="flex gap-2">
                  {["Easy", "Medium", "Hard"].map(d => (
                    <span key={d} className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold
                      ${d === "Easy"   ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" :
                        d === "Medium" ? "text-amber-400 border-amber-500/30 bg-amber-500/10" :
                                         "text-red-400 border-red-500/30 bg-red-500/10"}`}
                    >{d}</span>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-white/[0.04] px-2">
                {problems.map((p, i) => (
                  <ProblemRow key={p.num} {...p} delay={i * 0.08} />
                ))}
              </div>
              <div className="px-4 py-3 border-t border-white/8 text-center">
                <Link to="/problems" className="text-xs text-white/30 hover:text-white/60 transition-colors">
                  View all 200+ problems →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ────────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4">Everything you need</div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Built for developers who are{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">serious</span>
              </h2>
              <p className="text-white/40 max-w-xl mx-auto text-base">
                Every feature was designed to make your practice sessions faster, smarter, and more enjoyable.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="group relative bg-white/[0.02] hover:bg-white/[0.05] border border-white/8 hover:border-white/15 rounded-2xl p-6 transition-all duration-300 overflow-hidden cursor-default"
              >
                {/* Hover glow */}
                <div className={`absolute inset-0 ${f.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl`} />
                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-xl ${f.bg} ${f.border} border flex items-center justify-center mb-4 ${f.color}`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-bold mb-2 text-base">{f.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-28 px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/8 via-transparent to-indigo-500/8 p-10 md:p-16 overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-cyan-500/10 blur-[80px] rounded-full" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-5 tracking-tight leading-tight">
                Ready to {isAuthenticated ? "continue" : "start"} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">your journey?</span>
              </h2>
              <p className="text-white/40 text-base mb-10 max-w-md mx-auto">
                {isAuthenticated 
                  ? "Jump back into your dashboard to maintain your streak and crush your next algorithm."
                  : "Join developers actively levelling up on AlgoVerse. No credit card. No limits. Just code."}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="group flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_45px_rgba(6,182,212,0.55)] hover:scale-105 active:scale-95 text-sm"
                  >
                    Go to Dashboard
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="group flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_45px_rgba(6,182,212,0.55)] hover:scale-105 active:scale-95 text-sm"
                  >
                    Create Free Account
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                <Link
                  to="/problems"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 text-sm"
                >
                  Explore Problems
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
