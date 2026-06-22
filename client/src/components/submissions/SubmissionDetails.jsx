import React from "react";
import Editor from "@monaco-editor/react";
import VerdictBadge from "./VerdictBadge";
import { Link } from "react-router-dom";
import { Clock, Cpu, Calendar, Code2 } from "lucide-react";

const LANGUAGE_LABELS = {
  cpp: "C++",
  java: "Java",
  python: "Python",
  javascript: "JavaScript",
};

const StatTile = ({ icon: Icon, label, value, accent = false }) => (
  <div className={`flex items-center gap-3 bg-background rounded-xl p-4 border ${accent ? "border-primary-500/20" : "border-border"}`}>
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${accent ? "bg-primary-500/10 text-primary-500" : "bg-surface-hover text-text-muted"}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-text-primary">{value}</p>
    </div>
  </div>
);

const SubmissionDetails = ({ submission }) => {
  if (!submission) return null;

  const { verdict, language, code, runtime, memory, createdAt, problem } = submission;

  return (
    <div className="space-y-6">

      {/* Header card */}
      <div className="glass-panel p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
              Problem
            </p>
            <Link
              to={`/problems/${problem?._id || problem}`}
              className="text-2xl font-display font-bold text-text-primary hover:text-primary-500 transition-colors"
            >
              {problem?.title || "Problem"}
            </Link>
          </div>
          <div className="flex-shrink-0">
            <VerdictBadge verdict={verdict} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile
            icon={Code2}
            label="Language"
            value={LANGUAGE_LABELS[language] || language}
            accent
          />
          <StatTile
            icon={Clock}
            label="Runtime"
            value={runtime ? `${runtime}ms` : "N/A"}
          />
          <StatTile
            icon={Cpu}
            label="Memory"
            value={memory ? `${memory}KB` : "N/A"}
          />
          <StatTile
            icon={Calendar}
            label="Submitted"
            value={
              createdAt
                ? new Date(createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "N/A"
            }
          />
        </div>
      </div>

      {/* Code Viewer */}
      <div className="glass-panel overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-hover/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-danger/60"></div>
              <div className="w-3 h-3 rounded-full bg-warning/60"></div>
              <div className="w-3 h-3 rounded-full bg-success/60"></div>
            </div>
            <span className="text-sm font-semibold text-text-secondary">
              Submitted Code
            </span>
          </div>
          <span className="text-xs font-semibold bg-primary-500/10 border border-primary-500/20 text-primary-500 px-2.5 py-1 rounded-full font-mono">
            {LANGUAGE_LABELS[language] || language}
          </span>
        </div>
        <div className="h-[480px] bg-[#0d1117]">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code || ""}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Menlo', 'Monaco', 'Consolas', monospace",
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              renderLineHighlight: "gutter",
              scrollbar: {
                verticalScrollbarSize: 6,
                horizontalScrollbarSize: 6,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetails;
