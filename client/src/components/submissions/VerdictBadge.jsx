import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Loader2 } from "lucide-react";

const VERDICT_CONFIG = {
  "Accepted": {
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/20",
    shadow: "shadow-[0_0_10px_rgba(34,197,94,0.15)]",
    icon: CheckCircle2,
  },
  "Wrong Answer": {
    bg: "bg-danger/10",
    text: "text-danger",
    border: "border-danger/20",
    shadow: "shadow-[0_0_10px_rgba(239,68,68,0.15)]",
    icon: XCircle,
  },
  "Runtime Error": {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
    shadow: "shadow-[0_0_10px_rgba(245,158,11,0.15)]",
    icon: AlertTriangle,
  },
  "Compilation Error": {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
    shadow: "shadow-[0_0_10px_rgba(245,158,11,0.15)]",
    icon: AlertTriangle,
  },
  "Time Limit Exceeded": {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    shadow: "shadow-[0_0_10px_rgba(168,85,247,0.15)]",
    icon: Clock,
  },
  "Pending": {
    bg: "bg-surface-hover",
    text: "text-text-muted",
    border: "border-border",
    shadow: "",
    icon: Loader2,
  },
};

const DEFAULT_CONFIG = {
  bg: "bg-surface-hover",
  text: "text-text-muted",
  border: "border-border",
  shadow: "",
  icon: null,
};

const VerdictBadge = ({ verdict }) => {
  const cfg = VERDICT_CONFIG[verdict] || DEFAULT_CONFIG;
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wider font-bold border ${cfg.bg} ${cfg.text} ${cfg.border} ${cfg.shadow}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {verdict || "Pending"}
    </span>
  );
};

export default VerdictBadge;
