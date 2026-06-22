import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDifficulty, setTag, resetFilters } from "../../features/problems/problemSlice";
import {
  selectDifficulty,
  selectSearch,
  selectTag,
} from "../../features/problems/problemSelectors";
import { SlidersHorizontal, X, Tag } from "lucide-react";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const DIFFICULTY_STYLES = {
  Easy: {
    active: "bg-success/15 border-success text-success shadow-sm",
    idle: "border-border text-text-secondary hover:border-success/50 hover:text-success hover:bg-success/5",
  },
  Medium: {
    active: "bg-warning/15 border-warning text-warning shadow-sm",
    idle: "border-border text-text-secondary hover:border-warning/50 hover:text-warning hover:bg-warning/5",
  },
  Hard: {
    active: "bg-danger/15 border-danger text-danger shadow-sm",
    idle: "border-border text-text-secondary hover:border-danger/50 hover:text-danger hover:bg-danger/5",
  },
};

// Top tags derived from the auto-tagged dataset — shown as quick-filter chips
const POPULAR_TAGS = [
  "Array",
  "String",
  "Dynamic Programming",
  "Math",
  "Tree",
  "Graph",
  "Greedy",
  "Binary Search",
  "Two Pointers",
  "Backtracking",
  "Hash Table",
  "Sorting",
  "Stack",
  "Linked List",
  "Bit Manipulation",
  "Matrix",
  "Sliding Window",
];

const ProblemFilters = () => {
  const dispatch = useDispatch();
  const activeDifficulty = useSelector(selectDifficulty);
  const activeSearch = useSelector(selectSearch);
  const activeTag = useSelector(selectTag);
  const hasFilters = activeDifficulty || activeSearch || activeTag;

  const handleDifficulty = useCallback(
    (d) => {
      dispatch(setDifficulty(activeDifficulty === d ? "" : d));
    },
    [dispatch, activeDifficulty]
  );

  const handleTag = useCallback(
    (t) => {
      dispatch(setTag(activeTag === t ? "" : t));
    },
    [dispatch, activeTag]
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Row 1: Difficulty + Reset */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold uppercase tracking-wider flex-shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Difficulty
        </div>

        <div className="flex items-center gap-2">
          {DIFFICULTIES.map((d) => {
            const isActive = activeDifficulty === d;
            const styles = DIFFICULTY_STYLES[d];
            return (
              <button
                key={d}
                onClick={() => handleDifficulty(d)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold transition-all duration-200 ${
                  isActive ? styles.active : styles.idle
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${
                  d === "Easy" ? "bg-success" : d === "Medium" ? "bg-warning" : "bg-danger"
                }`}></div>
                {d}
              </button>
            );
          })}
        </div>

        {hasFilters && (
          <button
            onClick={() => dispatch(resetFilters())}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-danger hover:border-danger/50 hover:bg-danger/5 transition-all font-semibold border border-border px-2.5 py-1.5 rounded-full"
          >
            <X className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Row 2: Tags */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold uppercase tracking-wider flex-shrink-0">
          <Tag className="w-3.5 h-3.5" />
          Tags
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_TAGS.map((t) => {
            const isActive = activeTag === t;
            return (
              <button
                key={t}
                onClick={() => handleTag(t)}
                className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary-500/20 border-primary-500/60 text-primary-400 shadow-sm"
                    : "border-border/60 text-text-muted hover:border-primary-500/40 hover:text-primary-400 hover:bg-primary-500/5"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProblemFilters;
