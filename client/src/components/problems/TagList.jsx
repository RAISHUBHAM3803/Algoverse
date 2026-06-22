import React from "react";

const TagList = React.memo(({ tags = [], max = 3 }) => {
  if (!tags || tags.length === 0) return null;

  const visible = tags.slice(0, max);
  const remaining = tags.length - max;

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {visible.map((tag) => (
        <span
          key={tag}
          className="text-xs px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 hover:bg-primary-500/20 transition-colors cursor-default font-medium"
        >
          {tag}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-xs text-text-muted font-mono bg-surface-hover border border-border px-2 py-0.5 rounded-full">
          +{remaining}
        </span>
      )}
    </div>
  );
});

TagList.displayName = "TagList";
export default TagList;
