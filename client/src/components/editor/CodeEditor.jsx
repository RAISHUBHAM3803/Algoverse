import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import Editor from "@monaco-editor/react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCode } from "../../features/editor/editorSlice";
import {
  selectEditorCode,
  selectEditorLanguage,
  selectEditorOutput,
  selectEditorLoading,
  selectEditorError,
  selectEditorSubmissionResult,
  selectEditorIsSubmitting,
} from "../../features/editor/editorSelectors";
import { selectSelectedProblem } from "../../features/problems/problemSelectors";
import EditorToolbar from "./EditorToolbar";
import AIInterviewFeedbackModal from "./AIInterviewFeedbackModal";
import {
  Loader2, Terminal, CheckCircle2, XCircle, AlertTriangle,
  Clock, Cpu, ChevronDown, ChevronUp, GripHorizontal,
  Trophy, List, RotateCcw, Bot
} from "lucide-react";

// ─── Submission Result Panel ──────────────────────────────────────────────────
const SubmissionResultPanel = ({ result, code, language, problem }) => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const verdict = result?.verdict ?? "";
  const isAccepted = verdict.toLowerCase() === "accepted";
  const passed = result?.passedTestCases ?? result?.testCasesPassed ?? 0;
  const total = result?.totalTestCases ?? 0;
  const runtime = result?.runtime ?? 0;
  const memory = result?.memory ?? 0;

  const isWarning = verdict.toLowerCase().includes("warning");

  // Determine colours
  const panelBg = isAccepted ? "bg-[#0a1a0a]" : isWarning ? "bg-[#1a1500]" : "bg-[#1a0a0a]";
  const bannerBg = isAccepted ? "bg-success/10 border-success/20" : isWarning ? "bg-yellow-500/10 border-yellow-500/30" : "bg-danger/10 border-danger/20";
  const iconColor = isAccepted ? "text-success" : isWarning ? "text-yellow-400" : "text-danger";
  const subtextColor = isAccepted ? "text-success/70" : isWarning ? "text-yellow-400/70" : "text-danger/70";

  return (
    <div className={`flex flex-col h-full overflow-auto ${panelBg}`}>
      {/* Verdict banner */}
      <div className={`px-5 py-4 border-b flex items-center justify-between flex-shrink-0 ${bannerBg}`}>
        <div className={`flex items-center gap-3 ${iconColor}`}>
          {isAccepted ? <Trophy className="w-5 h-5" /> : isWarning ? <AlertTriangle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <div>
            <p className="font-bold text-base leading-tight">
              {isAccepted ? "Accepted" : verdict.replace(/_/g, " ") || "Wrong Answer"}
            </p>
            <p className={`text-xs mt-0.5 ${subtextColor}`}>
              {total > 0
                ? `${passed} / ${total} test cases passed`
                : isAccepted ? "All test cases passed" : isWarning ? "Compiled with warnings" : "Some test cases failed"
              }
            </p>
          </div>
        </div>
        {/* View history link */}
        <Link
          to="/submissions"
          className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary-400 px-2.5 py-1.5 rounded-md hover:bg-primary-500/10 transition-colors border border-border hover:border-primary-500/20 flex-shrink-0"
        >
          <List className="w-3.5 h-3.5" />
          View All
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-border/50 border-b border-border/30 flex-shrink-0">
        <div className="flex flex-col items-center py-3 px-2">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">Runtime</span>
          <span className="text-sm font-bold text-text-primary font-mono">{runtime} ms</span>
        </div>
        <div className="flex flex-col items-center py-3 px-2">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">Memory</span>
          <span className="text-sm font-bold text-text-primary font-mono">{memory} KB</span>
        </div>
        <div className="flex flex-col items-center py-3 px-2">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">Tests</span>
          <span className={`text-sm font-bold font-mono ${isAccepted ? "text-success" : "text-danger"}`}>
            {total > 0 ? `${passed}/${total}` : (isAccepted ? "✓" : "✗")}
          </span>
        </div>
      </div>

      {/* Error message if any */}
      {result?.errorMessage && (
        <div className={`p-4 m-4 border rounded-xl ${isWarning ? "bg-yellow-500/5 border-yellow-500/20" : "bg-danger/5 border-danger/20"}`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isWarning ? "text-yellow-500/50" : "text-danger/50"}`}>
            {isWarning ? "Compiler Warnings" : "Error Details"}
          </p>
          <pre className={`text-xs font-mono whitespace-pre-wrap leading-relaxed ${isWarning ? "text-yellow-300/90" : "text-danger/85"}`}>
            {result.errorMessage}
          </pre>
        </div>
      )}

      {/* Accepted congratulations */}
      {isAccepted && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-success/10 border border-success/30 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-success" />
          </div>
          <div>
            <p className="text-success font-bold text-sm">Great job!</p>
            <p className="text-text-muted text-xs mt-1">Your solution passed all hidden test cases.</p>
          </div>
          
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] active:scale-95"
          >
            <Bot className="w-5 h-5" />
            Get AI Interview Feedback
          </button>
          
          <Link
            to="/submissions"
            className="mt-3 text-xs font-medium text-primary-400 hover:text-primary-300 underline underline-offset-2"
          >
            View submission history →
          </Link>
        </div>
      )}

      {/* AI Interview Feedback Modal */}
      {problem && (
        <AIInterviewFeedbackModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          code={code}
          language={language}
          problem={problem}
          verdict={verdict}
        />
      )}
    </div>
  );
};

// ─── Run Output Panel ─────────────────────────────────────────────────────────
const RunOutputPanel = () => {
  const output  = useSelector(selectEditorOutput);
  const loading = useSelector(selectEditorLoading);
  const error   = useSelector(selectEditorError);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0d1117] text-text-muted gap-3">
      <div className="flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
        <span className="font-mono text-sm text-primary-400 animate-pulse">Evaluating code…</span>
      </div>
      <p className="text-xs text-text-muted font-mono">Running against test cases</p>
    </div>
  );

  if (error) {
    // error is now { message: string, status: string } e.g. "Compilation Error"
    const errorMessage = error?.message ?? error ?? "Unknown error";
    const errorStatus  = error?.status  ?? "Error";
    const isCompile    = errorStatus.toLowerCase().includes("compilation") && !errorStatus.toLowerCase().includes("warning");
    const isRuntime    = errorStatus.toLowerCase().includes("runtime");
    const isWarning    = errorStatus.toLowerCase().includes("warning");

    // Choose colour theme based on verdict type
    const theme = isWarning
      ? { bg: "bg-[#1a1500]", banner: "bg-yellow-500/10 border-yellow-500/30", icon: "bg-yellow-500/20 border-yellow-500/30", iconColor: "text-yellow-400", titleColor: "text-yellow-300", subColor: "text-yellow-400/60", labelColor: "text-yellow-500/50", preStyle: "text-yellow-300/90 bg-yellow-500/5 border-yellow-500/20" }
      : { bg: "bg-[#1a0808]", banner: "bg-danger/15 border-danger/30",         icon: "bg-danger/20 border-danger/30",         iconColor: "text-danger",       titleColor: "text-danger",       subColor: "text-danger/60",       labelColor: "text-danger/50",       preStyle: "text-danger/85 bg-danger/5 border-danger/20" };

    const subtitle = isWarning
      ? "Your code compiled with warnings — it may produce wrong or undefined results."
      : isCompile
      ? "Your code failed to compile. Fix the errors below."
      : isRuntime
      ? "Your code crashed during execution."
      : "An error occurred during execution.";

    const label = isWarning ? "Compiler Warnings" : isCompile ? "Compiler Output" : "Error Output";

    return (
      <div className={`flex flex-col h-full ${theme.bg} overflow-hidden`}>
        {/* Verdict banner */}
        <div className={`px-5 py-3 border-b flex items-center gap-3 flex-shrink-0 ${theme.banner}`}>
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${theme.icon}`}>
            {isWarning
              ? <AlertTriangle className={`w-4 h-4 ${theme.iconColor}`} />
              : <XCircle className={`w-4 h-4 ${theme.iconColor}`} />
            }
          </div>
          <div>
            <p className={`font-bold text-sm leading-tight ${theme.titleColor}`}>{errorStatus}</p>
            <p className={`text-xs mt-0.5 ${theme.subColor}`}>{subtitle}</p>
          </div>
        </div>

        {/* Error output */}
        <div className="flex-1 overflow-auto p-4">
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${theme.labelColor}`}>{label}</p>
          <pre className={`text-xs font-mono whitespace-pre-wrap leading-relaxed border rounded-xl p-4 ${theme.preStyle}`}>
            {errorMessage}
          </pre>
        </div>
      </div>
    );
  }

  if (!output) return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0d1117] text-text-muted gap-2">
      <Terminal className="w-7 h-7 text-white/10" />
      <p className="font-mono text-sm">
        Press <kbd className="bg-white/10 text-white/60 px-1.5 py-0.5 rounded text-xs border border-white/10">Run</kbd> to execute your code
      </p>
    </div>
  );

  const { output: stdout, runtime, memory, status, compile_output } = output;
  const isAccepted = status === "Accepted";
  const displayMemory = memory?.includes?.("MB") || memory?.includes?.("KB") ? memory : `${memory} KB`;
  const displayTime   = runtime?.includes?.("ms") || runtime?.includes?.("s")  ? runtime : `${runtime} s`;

  return (
    <div className="flex flex-col h-full bg-[#0d1117] overflow-hidden">
      {/* Status bar */}
      <div className="px-4 py-2 bg-[#161b22] border-b border-white/10 flex justify-between items-center flex-shrink-0">
        <div className={`flex items-center gap-2 font-semibold text-sm ${isAccepted ? "text-success" : "text-danger"}`}>
          {isAccepted ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {status || "Finished"}
        </div>
        <div className="flex items-center gap-4 text-xs text-white/40 font-mono">
          {runtime && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> {displayTime}
            </span>
          )}
          {memory && <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> {displayMemory}</span>}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4 font-mono text-sm">
        {compile_output && (
          <div>
            <p className="text-white/40 text-xs font-semibold mb-2 uppercase tracking-wider">Compilation Output</p>
            <pre className="text-warning/90 whitespace-pre-wrap bg-warning/5 border border-warning/20 rounded-lg p-3 text-xs leading-relaxed">{compile_output}</pre>
          </div>
        )}
        {stdout && (
          <div>
            <p className="text-white/40 text-xs font-semibold mb-2 uppercase tracking-wider">Standard Output</p>
            <pre className={`whitespace-pre-wrap rounded-lg p-3 border text-xs leading-relaxed ${
              isAccepted
                ? "text-success bg-success/5 border-success/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                : status === "Wrong Answer" || status?.includes("Error")
                  ? "text-danger bg-danger/5 border-danger/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                  : "text-white/80 bg-white/5 border-white/10"
            }`}>
              {stdout}
            </pre>
          </div>
        )}
        {!stdout && !compile_output && (
          <p className="text-white/30 italic text-xs">No output produced.</p>
        )}
      </div>
    </div>
  );
};

// ─── Combined Output Panel ─────────────────────────────────────────────────────
const OutputPanel = () => {
  const submissionResult = useSelector(selectEditorSubmissionResult);
  const isSubmitting     = useSelector(selectEditorIsSubmitting);
  const code             = useSelector(selectEditorCode);
  const language         = useSelector(selectEditorLanguage);
  const problem          = useSelector(selectSelectedProblem);

  // Judging spinner (while waiting for SSE)
  if (isSubmitting) return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0d1117] text-text-muted gap-3">
      <div className="relative">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
      <div className="text-center">
        <p className="font-mono text-sm text-primary-400 animate-pulse font-semibold">Judging…</p>
        <p className="text-xs text-text-muted font-mono mt-1">Running against hidden test cases</p>
      </div>
    </div>
  );

  // Show submission verdict
  if (submissionResult) return <SubmissionResultPanel result={submissionResult} code={code} language={language} problem={problem} />;

  // Default: run output
  return <RunOutputPanel />;
};

// ─── Resizable Handle ─────────────────────────────────────────────────────────
const PANEL_MIN = 80;
const PANEL_DEFAULT = 220;
const PANEL_MAX = 500;

const CodeEditor = memo(() => {
  const dispatch   = useDispatch();
  const code       = useSelector(selectEditorCode);
  const language   = useSelector(selectEditorLanguage);
  const output     = useSelector(selectEditorOutput);
  const loading    = useSelector(selectEditorLoading);
  const submissionResult = useSelector(selectEditorSubmissionResult);
  const isSubmitting     = useSelector(selectEditorIsSubmitting);

  const [localCode, setLocalCode] = useState(code);
  const [panelH, setPanelH]       = useState(PANEL_DEFAULT);
  const [collapsed, setCollapsed]  = useState(false);
  const [dragging, setDragging]   = useState(false);
  const startY  = useRef(0);
  const startH  = useRef(0);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);
  const isTyping = useRef(false);

  // Sync external code changes (language switch, reset)
  useEffect(() => { 
    if (!isTyping.current && code !== localCode) {
      setLocalCode(code); 
    }
  }, [code]);

  // Auto-open output panel when there's new content
  useEffect(() => {
    if (output || loading || submissionResult || isSubmitting) setCollapsed(false);
  }, [output, loading, submissionResult, isSubmitting]);

  const handleEditorChange = useCallback((value) => {
    isTyping.current = true;
    const val = value || "";
    setLocalCode(val);
    
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(setCode(val));
      isTyping.current = false;
    }, 800);
  }, [dispatch]);

  // Drag-to-resize logic
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    startY.current = e.clientY;
    startH.current = panelH;
    setDragging(true);
  }, [panelH]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const delta = startY.current - e.clientY;
      const next  = Math.min(PANEL_MAX, Math.max(PANEL_MIN, startH.current + delta));
      setPanelH(next);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const effectivePanelH = collapsed ? 38 : panelH;

  // Determine output panel header label
  const hasSubmission = submissionResult || isSubmitting;
  const panelLabel    = hasSubmission ? "Result" : "Output";
  const dotColor      = isSubmitting
    ? "bg-primary-500 animate-pulse"
    : submissionResult
      ? (submissionResult.verdict?.toLowerCase() === "accepted" ? "bg-success" : "bg-danger")
      : (output ? "bg-success" : "bg-white/20");
  const showDot = isSubmitting || submissionResult || output || loading;

  return (
    <div ref={wrapRef} className="flex flex-col w-full h-full bg-[#0d1117] rounded-xl border border-white/8 overflow-hidden">

      {/* Toolbar */}
      <EditorToolbar />

      {/* Monaco — fills remaining space */}
      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0">
          <Editor
            height="100%"
            width="100%"
            language={language}
            theme="vs-dark"
            value={localCode}
            onChange={handleEditorChange}
            loading={
              <div className="flex items-center justify-center h-full bg-[#0d1117] text-text-muted">
                <Loader2 className="w-7 h-7 animate-spin text-primary-500" />
              </div>
            }
            options={{
              minimap:              { enabled: false },
              fontSize:             14,
              fontFamily:           "'Menlo', 'Monaco', 'Consolas', monospace",
              lineHeight:           24,
              padding:              { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling:      true,
              cursorBlinking:       "smooth",
              cursorSmoothCaretAnimation: "on",
              formatOnPaste:        true,
              tabSize:              4,
              wordWrap:             "on",
              renderLineHighlight:  "gutter",
              scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
            }}
          />
        </div>
      </div>

      {/* ── Drag Handle & Collapsible Output / Result Panel ── */}
      <div
        className="flex-shrink-0 flex flex-col border-t border-white/8"
        style={{ height: effectivePanelH }}
      >
        {/* Handle bar */}
        <div
          className={`flex items-center justify-between px-4 bg-[#161b22] border-b border-white/8 flex-shrink-0 select-none ${
            collapsed ? "py-2" : "py-1.5 cursor-row-resize hover:bg-white/5"
          } transition-colors`}
          onMouseDown={collapsed ? undefined : onMouseDown}
        >
          <div className="flex items-center gap-2">
            {!collapsed && (
              <GripHorizontal className="w-4 h-4 text-white/20" />
            )}
            <span className="flex items-center gap-1.5 text-xs font-semibold text-text-muted font-mono">
              <Terminal className="w-3.5 h-3.5" />
              {panelLabel}
            </span>
            {showDot && !collapsed && (
              <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            )}
          </div>
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={() => setCollapsed(c => !c)}
            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Panel content */}
        {!collapsed && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <OutputPanel />
          </div>
        )}
      </div>
    </div>
  );
});

CodeEditor.displayName = "CodeEditor";
export default CodeEditor;
