import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ChevronDown, CheckCircle2, Lock, Unlock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getAIHintsAPI } from "../../features/ai/aiAPI";
import toast from "react-hot-toast";

const AIHintModal = ({ isOpen, onClose, problem }) => {
  const [loading, setLoading] = useState(false);
  const [hints, setHints] = useState(null);
  const [revealedHints, setRevealedHints] = useState(1);

  useEffect(() => {
    if (isOpen && !hints) {
      fetchHints();
    }
  }, [isOpen]);

  const fetchHints = async () => {
    try {
      setLoading(true);
      const data = await getAIHintsAPI({
        problemTitle: problem.title,
        problemDescription: problem.statement,
        difficulty: problem.difficulty,
      });
      if (data.success) {
        setHints(data.data);
      } else {
        toast.error("Failed to generate hints");
        onClose();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to connect to AI");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleRevealNext = () => {
    if (revealedHints < 3) {
      setRevealedHints((prev) => prev + 1);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0a0c10] border border-indigo-500/30 rounded-2xl shadow-[0_0_60px_rgba(99,102,241,0.18)] overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-indigo-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">AI Coach</h2>
                <p className="text-xs text-indigo-300/70">Progressive hints for {problem.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
                <p className="text-indigo-300/70 text-sm font-medium animate-pulse">Analyzing problem logic...</p>
              </div>
            ) : hints ? (
              <div className="space-y-4">
                {/* Hint 1 */}
                <HintBox
                  title="Hint 1: Conceptual Approach"
                  content={hints.hint1}
                  isOpen={true}
                />

                {/* Hint 2 */}
                <HintBox
                  title="Hint 2: Algorithmic Structure"
                  content={hints.hint2}
                  isOpen={revealedHints >= 2}
                  onReveal={handleRevealNext}
                />

                {/* Hint 3 */}
                <HintBox
                  title="Hint 3: Edge Cases & Optimization"
                  content={hints.hint3}
                  isOpen={revealedHints >= 3}
                  onReveal={handleRevealNext}
                />
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

const HintBox = ({ title, content, isOpen, onReveal }) => {
  return (
    <div className={`border rounded-xl transition-all duration-300 ${isOpen ? 'bg-white/[0.02] border-indigo-500/30' : 'bg-black/20 border-white/5'}`}>
      <div 
        className={`flex items-center justify-between p-4 ${!isOpen && 'cursor-pointer hover:bg-white/[0.02]'}`}
        onClick={!isOpen ? onReveal : undefined}
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <Unlock className="w-4 h-4 text-indigo-400" />
          ) : (
            <Lock className="w-4 h-4 text-white/30" />
          )}
          <span className={`font-semibold text-sm ${isOpen ? 'text-indigo-300' : 'text-white/40'}`}>
            {title}
          </span>
        </div>
        {!isOpen && (
          <span className="text-xs font-medium text-indigo-400/80 bg-indigo-500/10 px-3 py-1 rounded-full">
            Reveal
          </span>
        )}
      </div>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-4 pb-5 pt-2"
        >
          <div className="prose prose-invert prose-sm max-w-none
            text-white/75
            prose-p:leading-relaxed prose-p:text-white/70 prose-p:my-1
            prose-strong:text-indigo-300 prose-strong:font-semibold
            prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
            prose-ul:my-1 prose-li:text-white/70
          ">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIHintModal;
