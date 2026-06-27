import React, { useEffect, useState, useRef, memo, useCallback } from "react";
import DOMPurify from "dompurify";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProblemById, clearSelectedProblem } from "../features/problems/problemSlice";
import { selectSelectedProblem, selectDetailLoading, selectDetailError } from "../features/problems/problemSelectors";
import { setCode, clearSubmissionResult, clearOutput } from "../features/editor/editorSlice";
import CodeEditor from "../components/editor/CodeEditor";
import DifficultyBadge from "../components/problems/DifficultyBadge";
import TagList from "../components/problems/TagList";
import {
  ArrowLeft, BookOpen, Tag, AlertTriangle, ChevronRight,
  Code2, Server, FileText, CheckCircle2, XCircle, Clock, Cpu,
  ChevronDown, ChevronUp, Maximize2, Minimize2, RotateCcw, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { selectEditorSubmissionResult } from "../features/editor/editorSelectors";
import AIHintModal from "../components/editor/AIHintModal";

const DEFAULT_TEMPLATES = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
  java: `public class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n`,
  python: `def solution():\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    solution()\n`,
  javascript: `function solution() {\n    // Write your solution here\n}\n\nsolution();\n`,
};

// ─── Skeleton ───────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="animate-pulse space-y-6 p-6">
    <div className="h-8 bg-surface-hover border border-border rounded-lg w-3/4" />
    <div className="flex gap-3">
      <div className="h-6 bg-surface-hover rounded-full w-20" />
      <div className="h-6 bg-surface-hover rounded w-32" />
    </div>
    <div className="space-y-3 pt-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-4 bg-surface-hover rounded" style={{ width: `${90 - i * 8}%` }} />
      ))}
    </div>
    <div className="h-40 bg-surface-hover border border-border rounded-xl mt-6" />
  </div>
);

// ─── Example Block ───────────────────────────────────────────────────────────
const ExampleBlock = memo(({ example, index }) => (
  <div className="bg-[#161b22] border border-white/8 rounded-xl p-4 space-y-2 font-mono text-sm">
    <p className="font-semibold text-text-primary text-xs uppercase tracking-widest text-text-muted mb-3">
      Example {index + 1}
    </p>
    {example.input !== undefined && (
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-text-muted font-sans uppercase tracking-wider">Input</span>
        <pre className="text-primary-400 bg-primary-500/5 border border-primary-500/20 rounded-lg px-3 py-2 text-xs whitespace-pre-wrap leading-relaxed">
          {String(example.input)}
        </pre>
      </div>
    )}
    {example.output !== undefined && (
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-text-muted font-sans uppercase tracking-wider">Output</span>
        <pre className="text-success bg-success/5 border border-success/20 rounded-lg px-3 py-2 text-xs whitespace-pre-wrap leading-relaxed">
          {String(example.output)}
        </pre>
      </div>
    )}
    {example.explanation && (
      <div className="pt-1 border-t border-white/5">
        <span className="text-[11px] text-text-muted font-sans uppercase tracking-wider block mb-1">Explanation</span>
        <p className="text-text-secondary text-xs leading-relaxed font-sans">{example.explanation}</p>
      </div>
    )}
  </div>
));

// ─── Tab Button ──────────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
      active
        ? "border-primary-500 text-primary-400"
        : "border-transparent text-text-muted hover:text-text-secondary hover:border-border"
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

// ─── Description Tab ─────────────────────────────────────────────────────────
const DescriptionTab = memo(({ problem }) => (
  <div className="p-6 space-y-7 text-text-secondary text-sm leading-relaxed">
    {/* Title */}
    <div className="pb-5 border-b border-border">
      <h1 className="text-xl font-display font-bold text-text-primary tracking-tight mb-3">
        {problem.title}
      </h1>
      <div className="flex flex-wrap items-center gap-2">
        <DifficultyBadge difficulty={problem.difficulty} />
        {problem.acceptanceRate !== undefined && (
          <span className="inline-flex items-center gap-1.5 text-xs text-text-muted bg-surface-hover border border-border px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-success" />
            {Math.round(problem.acceptanceRate)}% Accepted
          </span>
        )}
      </div>
    </div>

    {/* Problem Statement */}
    {problem.statement && (
      <div className="problem-statement-content">
        {problem.isRealDataFetched ? (
          <div 
            className="prose prose-invert max-w-none text-text-primary prose-p:leading-[1.8] prose-p:text-[15px] prose-pre:bg-[#161b22] prose-pre:border prose-pre:border-white/8 prose-pre:rounded-xl prose-pre:p-4 prose-a:text-primary-400 hover:prose-a:text-primary-300 prose-code:text-primary-200 prose-code:bg-primary-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(problem.statement) }}
          />
        ) : (
          <div className="whitespace-pre-wrap leading-[1.8] text-[15px] text-text-primary">
            {problem.statement}
          </div>
        )}
      </div>
    )}

    {/* Examples (Hidden if Real Data is Fetched because it's already in the HTML) */}
    {!problem.isRealDataFetched && problem.examples?.length > 0 && (
      <div className="space-y-4">
        {problem.examples.map((ex, i) => (
          <ExampleBlock key={i} example={ex} index={i} />
        ))}
      </div>
    )}

    {/* Constraints (Hidden if Real Data is Fetched because it's already in the HTML) */}
    {!problem.isRealDataFetched && problem.constraints && (
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" /> Constraints
        </h3>
        <ul className="space-y-1.5 font-mono text-xs bg-[#161b22] border border-white/8 p-4 rounded-xl">
          {Array.isArray(problem.constraints)
            ? problem.constraints.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-text-secondary">
                  <span className="text-warning mt-0.5 flex-shrink-0">•</span>
                  <span>{c}</span>
                </li>
              ))
            : <li className="whitespace-pre-wrap text-text-secondary">{problem.constraints}</li>
          }
        </ul>
      </div>
    )}

    {/* Tags */}
    {problem.tags?.length > 0 && (
      <div className="pt-4 border-t border-border">
        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
          <Tag className="w-3.5 h-3.5" /> Related Topics
        </h4>
        <TagList tags={problem.tags} max={20} />
      </div>
    )}
  </div>
));

// ─── Main SolveProblem Page ───────────────────────────────────────────────────
const SolveProblem = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const problem = useSelector(selectSelectedProblem);
  const loading = useSelector(selectDetailLoading);
  const error   = useSelector(selectDetailError);
  const language = useSelector(state => state.editor.language);

  const [activeTab, setActiveTab] = useState("description");
  const [showEditor, setShowEditor] = useState(false); // mobile toggle
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Confetti logic
  const submissionResult = useSelector(selectEditorSubmissionResult);
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (submissionResult?.verdict?.toLowerCase() === "accepted") {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [submissionResult]);

  useEffect(() => {
    dispatch(fetchProblemById(id));
    return () => { 
      dispatch(clearSelectedProblem()); 
      dispatch(clearSubmissionResult());
      dispatch(clearOutput());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (problem) {
      const tpl = problem.starterCode?.[language] ?? DEFAULT_TEMPLATES[language];
      dispatch(setCode(tpl));
    }
  }, [problem, dispatch, language]);

  return (
    <div className="relative z-10 flex flex-col bg-background" style={{ height: "calc(100vh - 64px)" }}>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000, pointerEvents: 'none' }}
        />
      )}

      {/* ── Top Navbar Bar ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d1117] border-b border-white/8 flex-shrink-0 z-20">
        <nav className="flex items-center gap-1.5 text-sm font-medium text-text-muted">
          <button
            onClick={() => navigate(-1)}
            className="hover:text-primary-400 transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-primary-500/10 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-text-muted/50" />
          <span className="text-text-primary font-semibold truncate max-w-[180px] sm:max-w-xs md:max-w-md">
            {loading ? "Loading..." : problem?.title ?? "Workspace"}
          </span>
        </nav>

        <div className="flex items-center gap-3">

          {/* Mobile toggle */}
          <div className="flex lg:hidden items-center gap-1 bg-[#161b22] border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setShowEditor(false)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${!showEditor ? "bg-primary-600 text-white" : "text-text-muted"}`}
            >
              Problem
            </button>
            <button
              onClick={() => setShowEditor(true)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${showEditor ? "bg-primary-600 text-white" : "text-text-muted"}`}
            >
              Code
            </button>
          </div>

          {/* Online indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-text-muted bg-[#161b22] px-2.5 py-1.5 rounded-full border border-white/8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            Online
          </div>

          <Link
            to="/submissions"
            className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary-400 px-2.5 py-1.5 rounded-md hover:bg-primary-500/10 transition-colors border border-transparent hover:border-primary-500/20"
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submissions</span>
          </Link>
        </div>
      </div>

      {/* ── Main Split Layout ── */}
      <div className="flex flex-1 min-h-0 gap-1.5 p-1.5 bg-[#0d1117]">

        {/* ── LEFT: Problem Panel ── */}
        <div
          className={`flex flex-col bg-[#0f1117] border border-white/8 rounded-xl overflow-hidden flex-shrink-0 ${
            showEditor ? "hidden lg:flex" : "flex"
          } w-full lg:w-[44%]`}
        >
          {/* Tab Header */}
          <div className="flex items-center justify-between border-b border-white/8 bg-[#161b22] flex-shrink-0">
            <div className="flex items-center overflow-x-auto">
              <TabBtn
                active={activeTab === "description"}
                onClick={() => setActiveTab("description")}
                icon={BookOpen}
                label="Description"
              />
            </div>
            {problem && (
              <button
                onClick={() => setIsAIModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 mr-3 rounded text-[11px] font-bold tracking-wide bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 transition-colors shadow-[0_0_10px_rgba(99,102,241,0.1)] hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
              >
                <Sparkles className="w-3 h-3" />
                Ask AI
              </button>
            )}
          </div>

          {/* Scrollable Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {loading && <Skeleton />}

            {error && !loading && (
              <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
                <div className="w-14 h-14 bg-danger/10 border border-danger/30 rounded-2xl flex items-center justify-center mb-4">
                  <AlertTriangle className="w-7 h-7 text-danger" />
                </div>
                <h2 className="text-text-primary font-semibold mb-2">Failed to load problem</h2>
                <p className="text-text-secondary text-sm mb-4">{error}</p>
                <Link to="/problems" className="btn-lc-primary text-sm inline-flex items-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Return to Problems
                </Link>
              </div>
            )}

            {problem && !loading && (
              <>
                {activeTab === "description" && <DescriptionTab problem={problem} />}
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT: Code Editor + Output Panel ── */}
        <div
          className={`flex-1 min-w-0 flex flex-col gap-1.5 ${
            !showEditor ? "hidden lg:flex" : "flex"
          }`}
        >
          <CodeEditor />
        </div>
      </div>

      {/* AI Hint Modal */}
      {problem && (
        <AIHintModal 
          isOpen={isAIModalOpen} 
          onClose={() => setIsAIModalOpen(false)} 
          problem={problem}
        />
      )}
    </div>
  );
};

export default SolveProblem;
