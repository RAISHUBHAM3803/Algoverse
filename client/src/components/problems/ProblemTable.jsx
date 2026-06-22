import React, { memo } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectProblems,
  selectProblemsLoading,
  selectProblemsError,
  selectCurrentPage,
} from "../../features/problems/problemSelectors";
import { fetchProblems, setTag } from "../../features/problems/problemSlice";
import { Lock, FileWarning, RefreshCw, CheckCircle2 } from "lucide-react";

const PAGE_SIZE = 20; // must match LIMIT in Problems.jsx
// ─── Difficulty helpers ────────────────────────────────────────────────────────

const DIFFICULTY_COLOR = {
  Easy:   "text-[#00b8a3]",
  Medium: "text-[#ffc01e]",
  Hard:   "text-[#ff375f]",
};

const DIFFICULTY_LABEL = { Medium: "Med." };

// ─── Acceptance rate color ─────────────────────────────────────────────────────

const acceptanceColor = (rate) => {
  if (rate == null) return "text-[#8a8a8a]";
  if (rate >= 60)  return "text-[#00b8a3]";
  if (rate >= 40)  return "text-[#ffc01e]";
  return "text-[#ff375f]";
};

// ─── Tag chip colours (cycles through a palette) ──────────────────────────────

const TAG_COLORS = [
  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "bg-orange-500/10 text-orange-400 border-orange-500/20",
];

// Stable colour per tag name (same tag always gets same colour)
const tagColorClass = (tag) => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) & 0xffff;
  return TAG_COLORS[hash % TAG_COLORS.length];
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-6 py-4 border-b border-[#2a2a2a] animate-pulse bg-[#1a1a1a]">
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

const TableHeader = () => (
  <div className="hidden md:grid grid-cols-[minmax(240px,1fr)_7rem_6rem_minmax(120px,180px)_4rem] gap-4 px-6 py-3 border-b border-[#2a2a2a] bg-[#222222]">
    <span className="text-[11px] font-semibold text-[#6a6a6a] uppercase tracking-wider">Title</span>
    <span className="text-[11px] font-semibold text-[#6a6a6a] uppercase tracking-wider">Acceptance</span>
    <span className="text-[11px] font-semibold text-[#6a6a6a] uppercase tracking-wider">Difficulty</span>
    <span className="text-[11px] font-semibold text-[#6a6a6a] uppercase tracking-wider">Tags</span>
    <span className="text-[11px] font-semibold text-[#6a6a6a] flex justify-center">
      <Lock className="w-3.5 h-3.5 opacity-40" />
    </span>
  </div>
);

const EmptyState = ({ hasFilters }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
    <div className="w-16 h-16 rounded-2xl bg-[#2a2a2a] border border-[#3a3a3a] flex items-center justify-center mb-4">
      <Lock className="w-7 h-7 text-[#8a8a8a]" />
    </div>
    <h3 className="text-[#eff1f6] font-semibold text-lg mb-2">
      {hasFilters ? "No problems match your filters" : "No problems yet"}
    </h3>
    <p className="text-[#8a8a8a] text-sm max-w-xs">
      {hasFilters
        ? "Try adjusting your search, difficulty, or tag filter."
        : "Problems will appear here once they're added to the platform."}
    </p>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
      <FileWarning className="w-7 h-7 text-red-400" />
    </div>
    <h3 className="text-[#eff1f6] font-semibold text-lg mb-2">Failed to load problems</h3>
    <p className="text-[#8a8a8a] text-sm max-w-xs mb-6">{error}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-md"
    >
      <RefreshCw className="w-4 h-4" />
      Try Again
    </button>
  </div>
);

// ─── Inline tag chip (clickable — sets tag filter) ────────────────────────────

const TagChip = ({ tag, onClick }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(tag);
    }}
    className={`text-[10px] px-1.5 py-0.5 rounded border font-medium whitespace-nowrap transition-all hover:scale-105 active:scale-95 ${tagColorClass(tag)}`}
    title={`Filter by: ${tag}`}
  >
    {tag}
  </button>
);

// ─── Main Table ───────────────────────────────────────────────────────────────

const ProblemTable = ({ hasFilters }) => {
  const dispatch   = useDispatch();
  const problems   = useSelector(selectProblems);
  const loading    = useSelector(selectProblemsLoading);
  const error      = useSelector(selectProblemsError);
  const currentPage = useSelector(selectCurrentPage);

  const handleRetry    = () => dispatch(fetchProblems());
  const handleTagClick = (tag) => dispatch(setTag(tag));

  const getDisplayNumber = (problem, idx) =>
    (currentPage - 1) * PAGE_SIZE + idx + 1;

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-sm">
        <TableHeader />
        {Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (error)   return <ErrorState error={error} onRetry={handleRetry} />;
  if (!problems || problems.length === 0) return <EmptyState hasFilters={hasFilters} />;

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-sm font-sans">
      <TableHeader />

      <div className="divide-y divide-[#2a2a2a]/60">
        {problems.map((problem, idx) => {
          const rate = problem.acceptanceRate;
          const diffColor = DIFFICULTY_COLOR[problem.difficulty] ?? "text-[#8a8a8a]";
          const diffLabel = DIFFICULTY_LABEL[problem.difficulty] ?? problem.difficulty;
          const visibleTags = (problem.tags ?? []).slice(0, 2);
          const extraCount  = (problem.tags?.length ?? 0) - visibleTags.length;

          return (
            <Link
              to={`/problems/${problem._id}/solve`}
              key={problem._id}
              className={`group flex md:grid md:grid-cols-[minmax(240px,1fr)_7rem_6rem_minmax(120px,180px)_4rem] gap-4 items-center px-6 py-3.5 transition-all duration-150 relative overflow-hidden ${
                problem.isSolved ? "bg-success/5 hover:bg-success/10" : "hover:bg-[#242424]"
              }`}
            >
              {/* Animated left border accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-300 ${
                problem.isSolved ? "bg-success" : "bg-primary-500 opacity-0 group-hover:opacity-100"
              }`}></div>
              {/* ── Title + solved badge ── */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Solved indicator */}
                <div className="w-4 flex-shrink-0 flex items-center justify-center">
                  {problem.isSolved ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00b8a3]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#3a3a3a] transition-colors" />
                  )}
                </div>

                {/* Title */}
                <div className="min-w-0">
                  <span className="text-[#eff1f6]/90 text-[14.5px] group-hover:text-primary-400 transition-colors truncate font-medium block">
                    {getDisplayNumber(problem, idx)}. {problem.title}
                  </span>

                  {/* Mobile: difficulty + rate inline */}
                  <div className="flex items-center gap-2 mt-0.5 md:hidden">
                    <span className={`text-[11px] font-medium ${diffColor}`}>{diffLabel}</span>
                    {rate != null && (
                      <span className={`text-[11px] ${acceptanceColor(rate)}`}>{rate.toFixed(1)}%</span>
                    )}
                    {visibleTags.length > 0 && (
                      <span className="text-[10px] text-[#6a6a6a]">{visibleTags.join(" · ")}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Acceptance rate ── */}
              <div className="hidden md:flex items-center">
                {rate != null ? (
                  <div className="flex flex-col">
                    <span className={`text-[13.5px] font-semibold tabular-nums ${acceptanceColor(rate)}`}>
                      {rate.toFixed(1)}%
                    </span>
                    {problem.totalSubmissions > 0 && (
                      <span className="text-[10px] text-[#5a5a5a]">
                        {problem.totalSubmissions.toLocaleString()} sub.
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[#5a5a5a] text-[13px]">—</span>
                )}
              </div>

              {/* ── Difficulty ── */}
              <div className="hidden md:flex items-center">
                <span className={`text-[13.5px] font-semibold ${diffColor}`}>{diffLabel}</span>
              </div>

              {/* ── Tags ── */}
              <div className="hidden md:flex items-center gap-1.5 overflow-hidden">
                {visibleTags.length > 0 ? (
                  <>
                    {visibleTags.map((t) => (
                      <TagChip key={t} tag={t} onClick={handleTagClick} />
                    ))}
                    {extraCount > 0 && (
                      <span className="text-[10px] text-[#5a5a5a] font-medium">+{extraCount}</span>
                    )}
                  </>
                ) : (
                  <span className="text-[#5a5a5a] text-[13px]">—</span>
                )}
              </div>

              {/* ── Frequency / lock icon ── */}
              <div className="hidden md:flex justify-center items-center gap-1 opacity-30 group-hover:opacity-80 transition-opacity">
                <div className="flex gap-0.5 items-end h-3">
                  <div className="w-0.5 h-1 bg-[#8a8a8a]" />
                  <div className="w-0.5 h-2 bg-[#8a8a8a]" />
                  <div className="w-0.5 h-1.5 bg-[#8a8a8a]" />
                </div>
                <Lock className="w-3.5 h-3.5 text-[#8a8a8a] ml-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default memo(ProblemTable);
