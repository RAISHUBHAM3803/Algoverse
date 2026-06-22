import React from "react";
import { Loader2 } from "lucide-react";

const Loader = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
          <div className="absolute inset-0 bg-primary-500/10 blur-xl rounded-full -z-10"></div>
        </div>
        <p className="font-semibold text-sm text-text-muted uppercase tracking-widest animate-pulse font-display">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
    </div>
  );
};

export default Loader;
