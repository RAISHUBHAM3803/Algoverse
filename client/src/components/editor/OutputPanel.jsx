import React from "react";
import { useSelector } from "react-redux";
import {
  selectEditorOutput,
  selectEditorLoading,
  selectEditorError,
} from "../../features/editor/editorSelectors";
import { Loader2, Terminal, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";

const OutputPanel = () => {
  const output = useSelector(selectEditorOutput);
  const loading = useSelector(selectEditorLoading);
  const error = useSelector(selectEditorError);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0d1117] text-text-muted gap-3">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
          <span className="font-mono text-sm text-primary-400 animate-pulse">Evaluating code...</span>
        </div>
        <p className="text-xs text-text-muted font-mono">Running against test cases</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-danger/5 font-mono text-sm overflow-auto p-4 whitespace-pre-wrap">
        <div className="flex items-center gap-2 font-bold mb-3 text-danger">
          <XCircle className="w-4 h-4" /> Error
        </div>
        <pre className="text-danger/80 text-xs leading-relaxed">{error}</pre>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0d1117] text-text-muted gap-3">
        <Terminal className="w-8 h-8 text-white/10" />
        <p className="font-mono text-sm">Press <kbd className="bg-white/10 text-white/60 px-1.5 py-0.5 rounded text-xs border border-white/10">Run</kbd> to execute your code</p>
      </div>
    );
  }

  const { output: stdout, runtime, memory, status, compile_output } = output;
  const isAccepted = status === "Accepted";

  const displayMemory = memory?.includes("MB") || memory?.includes("KB") ? memory : `${memory}KB`;
  const displayTime = runtime?.includes("ms") || runtime?.includes("s") ? runtime : `${runtime}s`;

  return (
    <div className="flex flex-col h-full bg-[#0d1117] overflow-hidden">
      {/* Status bar */}
      <div className="px-4 py-2.5 bg-[#161b22] border-b border-white/10 flex justify-between items-center flex-shrink-0">
        <div className={`flex items-center gap-2 font-semibold text-sm ${isAccepted ? "text-success" : "text-danger"}`}>
          {isAccepted
            ? <CheckCircle2 className="w-4 h-4" />
            : <AlertTriangle className="w-4 h-4" />
          }
          {status || "Finished"}
        </div>
        <div className="flex items-center gap-4 text-xs text-white/40 font-mono">
          {runtime && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> {displayTime}
            </span>
          )}
          {memory && <span>Mem: {displayMemory}</span>}
        </div>
      </div>

      {/* Output content */}
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
            <pre className="text-white/80 whitespace-pre-wrap bg-white/5 rounded-lg p-3 border border-white/10 text-xs leading-relaxed">{stdout}</pre>
          </div>
        )}
        {!stdout && !compile_output && (
          <p className="text-white/30 italic text-xs">No output produced.</p>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
