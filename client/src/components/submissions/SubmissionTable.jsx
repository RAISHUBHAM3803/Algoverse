import React from "react";
import { Link } from "react-router-dom";
import VerdictBadge from "./VerdictBadge";
import { ExternalLink, Clock, FileCode, ScrollText } from "lucide-react";
import { motion } from "framer-motion";

const LANGUAGE_LABELS = {
  cpp: "C++",
  java: "Java",
  python: "Python",
  javascript: "JavaScript",
};

// Framer motion variants for table rows
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const SubmissionTable = ({ submissions }) => {
  if (!submissions || submissions.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center justify-center py-32 text-center bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
      >
        {/* Empty state background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,255,255,0.02)] relative group">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-xl group-hover:bg-indigo-500/30 transition-colors duration-500"></div>
          <ScrollText className="w-12 h-12 text-white/40 relative z-10" />
        </div>
        <h3 className="text-2xl font-display font-bold text-white mb-3 tracking-tight">No Submissions Yet</h3>
        <p className="text-white/50 text-base max-w-sm">
          Solve a problem to start building your submission history. Your past activity will appear here in stunning detail.
        </p>
        <Link 
          to="/problems" 
          className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        >
          Explore Problems
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/10">
              <th className="px-6 py-5 text-left font-bold text-xs uppercase tracking-widest text-white/40">Problem</th>
              <th className="px-6 py-5 text-left font-bold text-xs uppercase tracking-widest text-white/40 hidden sm:table-cell">Language</th>
              <th className="px-6 py-5 text-left font-bold text-xs uppercase tracking-widest text-white/40">Verdict</th>
              <th className="px-6 py-5 text-left font-bold text-xs uppercase tracking-widest text-white/40 hidden md:table-cell">Runtime</th>
              <th className="px-6 py-5 text-left font-bold text-xs uppercase tracking-widest text-white/40 hidden sm:table-cell">Submitted</th>
              <th className="px-6 py-5 text-right w-16"></th>
            </tr>
          </thead>
          <motion.tbody 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-white/5"
          >
            {submissions
              .filter((sub) => sub.problem != null)
              .map((sub) => (
              <motion.tr
                variants={itemVariants}
                key={sub._id}
                className="hover:bg-white/[0.03] transition-all duration-300 group relative"
              >
                <td className="px-6 py-5 text-white font-medium relative">
                  {/* Glowing left highlight bar on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                  
                  <div className="flex flex-col">
                    <Link
                      to={`/problems/${sub.problem._id || sub.problem}/solve`}
                      className="text-white/90 hover:text-primary-400 transition-colors font-semibold truncate max-w-[200px] md:max-w-[300px] text-base"
                    >
                      {sub.problem.title}
                    </Link>
                    {/* Mobile fallback details */}
                    <div className="sm:hidden flex items-center gap-2 mt-2 text-xs text-white/40 font-mono">
                       <span className="flex items-center gap-1.5"><FileCode className="w-3.5 h-3.5 text-primary-500/70"/>{LANGUAGE_LABELS[sub.language] || sub.language}</span>
                       <span className="text-white/20">•</span>
                       <span>{new Date(sub.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-white/60 font-mono hidden sm:table-cell text-[13px]">
                  {LANGUAGE_LABELS[sub.language] || sub.language}
                </td>
                <td className="px-6 py-5">
                  <VerdictBadge verdict={sub.verdict} />
                </td>
                <td className="px-6 py-5 text-white/60 font-mono hidden md:table-cell text-[13px]">
                  {typeof sub.runtime === "number" ? (
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/30"/>{sub.runtime === 0 ? "< 1" : sub.runtime} ms
                    </span>
                  ) : "--"}
                </td>
                <td className="px-6 py-5 text-white/40 text-[13px] hidden sm:table-cell font-mono">
                  {new Date(sub.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-6 py-5 text-right relative z-10">
                  <Link
                    to={`/submissions/${sub._id}`}
                    className="inline-flex p-2.5 text-white/40 hover:text-primary-400 bg-white/5 hover:bg-primary-500/10 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default SubmissionTable;
