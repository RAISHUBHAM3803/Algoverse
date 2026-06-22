import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProblems } from "../features/problems/problemSlice";
import {
  selectCurrentPage,
  selectDifficulty,
  selectSearch,
  selectTag,
  selectTotalProblems,
  selectProblemsLoading,
} from "../features/problems/problemSelectors";
import ProblemSearch from "../components/problems/ProblemSearch";
import ProblemFilters from "../components/problems/ProblemFilters";
import ProblemTable from "../components/problems/ProblemTable";
import Pagination from "../components/problems/Pagination";
import { Code2 } from "lucide-react";
import { motion } from "framer-motion";

const LIMIT = 20;

const Problems = () => {
  const dispatch = useDispatch();
  const page = useSelector(selectCurrentPage);
  const search = useSelector(selectSearch);
  const difficulty = useSelector(selectDifficulty);
  const tag = useSelector(selectTag);
  const total = useSelector(selectTotalProblems);
  const loading = useSelector(selectProblemsLoading);
  const hasFilters = !!(search || difficulty || tag);

  // Re-fetch whenever page, search or difficulty changes
  useEffect(() => {
    dispatch(fetchProblems({ page, limit: LIMIT, search, difficulty, tag }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch, page, search, difficulty, tag]);

  return (
    <div className="w-full min-h-screen relative z-10 flex flex-col">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-600/10 to-transparent -z-10 animate-pulse" style={{ animationDuration: '4s' }}></div>
      
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 flex-1 flex flex-col">

        {/* ── Page Header ───────────────────────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-primary-500 shadow-sm">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight flex items-center gap-3">
                Problem Library

              </h1>
              <p className="text-text-secondary text-sm">
                {loading ? "Loading..." : "Explore our curated coding challenges"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Search + Filters Bar ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="sticky top-[72px] z-30 mb-6 bg-background/95 backdrop-blur-md py-3 border-b border-border shadow-sm -mx-4 px-4 sm:mx-0 sm:px-5 sm:border sm:rounded-xl sm:bg-surface/80"
        >
          {/* Search row */}
          <div className="w-full max-w-md mb-3">
            <ProblemSearch />
          </div>
          {/* Filters (difficulty + tags) */}
          <ProblemFilters />
        </motion.div>

        {/* ── Problem Table ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col"
        >
          <ProblemTable hasFilters={hasFilters} />
        </motion.div>

        {/* ── Pagination ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          <Pagination />
        </motion.div>

      </div>
    </div>
  );
};

export default Problems;
