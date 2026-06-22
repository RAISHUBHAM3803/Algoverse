import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMySubmissions } from "../features/submissions/submissionSlice";
import { useNavigate } from "react-router-dom";
import {
  selectSubmissions,
  selectSubmissionsLoading,
  selectSubmissionsError,
} from "../features/submissions/submissionSelectors";
import SubmissionTable from "../components/submissions/SubmissionTable";
import { Loader2, AlertTriangle, ClipboardList, ArrowLeft, RefreshCw, Activity } from "lucide-react";
import { motion } from "framer-motion";

// Premium Skeleton Loader for the table
const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5 animate-pulse bg-white/[0.02]">
    <div className="flex-1 h-5 bg-white/5 rounded-md"></div>
    <div className="w-24 h-5 bg-white/5 rounded-full flex-shrink-0"></div>
    <div className="w-24 h-6 bg-white/5 rounded-full flex-shrink-0"></div>
    <div className="w-16 h-5 bg-white/5 rounded-md flex-shrink-0"></div>
    <div className="w-32 h-4 bg-white/5 rounded-md flex-shrink-0 hidden sm:block"></div>
    <div className="w-8 h-8 bg-white/5 rounded-lg flex-shrink-0"></div>
  </div>
);

const SubmissionHistory = () => {
  const dispatch = useDispatch();
  const submissions = useSelector(selectSubmissions);
  const loading = useSelector(selectSubmissionsLoading);
  const error = useSelector(selectSubmissionsError);

  useEffect(() => {
    dispatch(getMySubmissions());
  }, [dispatch]);

  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const filteredSubmissions = submissions ? (filter === "All" ? submissions : submissions.filter(s => s.verdict === filter)) : [];

  return (
    <div className="w-full min-h-screen relative z-10 flex flex-col py-10 lg:py-16 bg-[#0a0c10] overflow-hidden">
      {/* Premium Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/20 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-20 flex-1 flex flex-col">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10"
        >
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 group mb-6 backdrop-blur-md border border-transparent hover:border-white/10"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.15)] relative group">
              <div className="absolute inset-0 bg-primary-500/20 rounded-2xl blur-xl group-hover:bg-primary-500/30 transition-colors duration-500"></div>
              <Activity className="w-7 h-7 text-primary-400 relative z-10" />
            </div>
            <div>
              <p className="font-semibold text-primary-400 text-xs uppercase tracking-[0.2em] mb-1">
                My Activity
              </p>
              <h1 className="text-3xl lg:text-5xl font-display font-bold text-white tracking-tight drop-shadow-sm">
                Submission History
              </h1>
            </div>
          </div>
          <p className="text-white/60 text-base max-w-2xl mt-4">
            Review all your past code submissions, verdicts, and performance metrics.
          </p>
        </motion.div>

        {/* Error State */}
        {error && !loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface/40 backdrop-blur-xl border border-danger/20 rounded-2xl p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
          >
            <div className="w-20 h-20 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative">
              <div className="absolute inset-0 rounded-full bg-danger/20 blur-xl"></div>
              <AlertTriangle className="w-10 h-10 text-danger relative z-10" />
            </div>
            <h2 className="text-white font-display font-bold text-2xl mb-3 tracking-tight">
              Failed to load submissions
            </h2>
            <p className="text-white/60 text-base mb-8 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => dispatch(getMySubmissions())}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          </motion.div>
        )}

        {/* Loading / Table Area */}
        {!error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 w-full"
          >
            {loading ? (
              <div className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                {/* Header Skeleton */}
                <div className="hidden md:flex gap-4 px-6 py-5 border-b border-white/10 bg-white/[0.02]">
                  <span className="flex-1 text-xs font-bold uppercase tracking-widest text-white/40">Problem</span>
                  <span className="w-24 text-xs font-bold uppercase tracking-widest text-white/40">Language</span>
                  <span className="w-24 text-xs font-bold uppercase tracking-widest text-white/40">Verdict</span>
                  <span className="w-16 text-xs font-bold uppercase tracking-widest text-white/40">Runtime</span>
                  <span className="w-32 text-xs font-bold uppercase tracking-widest text-white/40">Submitted</span>
                  <span className="w-10"></span>
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
                  {["All", "Accepted", "Wrong Answer", "Compilation Error", "Time Limit Exceeded"].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                        filter === f
                          ? "bg-primary-500/20 text-primary-400 border-primary-500/30 border"
                          : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <SubmissionTable submissions={filteredSubmissions} />
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubmissionHistory;
