import React from "react";

const DIFFICULTY_CONFIG = {
  Easy: {
    label: "Easy",
    classes: "text-success bg-success/10 border-success/20",
  },
  Medium: {
    label: "Medium",
    classes: "text-warning bg-warning/10 border-warning/20",
  },
  Hard: {
    label: "Hard",
    classes: "text-danger bg-danger/10 border-danger/20",
  },
};

const DifficultyBadge = React.memo(({ difficulty, size = "sm" }) => {
  const config = DIFFICULTY_CONFIG[difficulty] || {
    label: difficulty,
    classes: "text-text-muted bg-surface-hover border-border",
  };

  const sizeClasses = size === "lg"
    ? "text-sm px-3 py-1 font-semibold"
    : "text-xs px-2.5 py-0.5 font-semibold";

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.classes} ${sizeClasses} tracking-wide`}
    >
      {config.label}
    </span>
  );
});

DifficultyBadge.displayName = "DifficultyBadge";
export default DifficultyBadge;
