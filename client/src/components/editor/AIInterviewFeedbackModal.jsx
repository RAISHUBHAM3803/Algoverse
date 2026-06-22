import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Brain, Code2, Zap, MessageSquare, Award } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getInterviewFeedbackAPI } from "../../features/ai/aiAPI";
import toast from "react-hot-toast";

const AIInterviewFeedbackModal = ({ isOpen, onClose, code, language, problem, verdict }) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (isOpen && !feedback) {
      fetchFeedback();
    }
  }, [isOpen]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const data = await getInterviewFeedbackAPI({
        language,
        code,
        problemTitle: problem.title,
        verdict: verdict || "Pending"
      });
      if (data.success) {
        setFeedback(data.data);
      } else {
        toast.error("Failed to generate feedback");
        onClose();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to connect to AI");
      onClose();
    } finally {
      setLoading(false);
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
          className="relative w-full max-w-3xl bg-[#0a0c10] border border-primary-500/30 rounded-2xl shadow-[0_0_60px_rgba(34,197,94,0.12)] overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-primary-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">AI Interview Feedback</h2>
                <p className="text-xs text-primary-300/70">Mock Technical Interview Evaluation</p>
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
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary-400 animate-pulse" />
                </div>
                <p className="text-primary-300/70 text-sm font-medium animate-pulse mt-4">Analyzing submission against industry standards...</p>
              </div>
            ) : feedback ? (
              <div className="space-y-6">
                {/* Scores Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ScoreCard 
                    title="Problem Solving" 
                    score={feedback.problemSolving} 
                    icon={Brain} 
                    color="text-blue-400" 
                    bg="bg-blue-500/10" 
                    border="border-blue-500/20" 
                  />
                  <ScoreCard 
                    title="Code Quality" 
                    score={feedback.codeQuality} 
                    icon={Code2} 
                    color="text-purple-400" 
                    bg="bg-purple-500/10" 
                    border="border-purple-500/20" 
                  />
                  <ScoreCard 
                    title="Optimization" 
                    score={feedback.optimization} 
                    icon={Zap} 
                    color="text-yellow-400" 
                    bg="bg-yellow-500/10" 
                    border="border-yellow-500/20" 
                  />
                  <ScoreCard 
                    title="Communication" 
                    score={feedback.communicationReadiness} 
                    icon={MessageSquare} 
                    color="text-green-400" 
                    bg="bg-green-500/10" 
                    border="border-green-500/20" 
                  />
                </div>

                {/* Overall Feedback */}
                <div className="mt-6 bg-[#0d1117] border border-white/5 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-primary-500/5">
                    <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                      <span>📋</span> Detailed Interview Feedback
                    </h3>
                    <span className="text-xs text-primary-400/70 font-medium">
                      Overall: {Math.round((feedback.problemSolving + feedback.codeQuality + feedback.optimization + feedback.communicationReadiness) / 4)}/10
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="prose prose-invert prose-sm max-w-none
                      text-white/75
                      prose-headings:text-white prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-2
                      prose-h3:text-base prose-h3:border-b prose-h3:border-white/10 prose-h3:pb-1
                      prose-p:leading-relaxed prose-p:text-white/70
                      prose-strong:text-primary-300 prose-strong:font-semibold
                      prose-li:text-white/70 prose-li:leading-relaxed
                      prose-ul:my-2 prose-ul:space-y-1
                      prose-code:text-primary-300 prose-code:bg-primary-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                      prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
                    ">
                      <ReactMarkdown>{feedback.overallFeedback}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

const ScoreCard = ({ title, score, icon: Icon, color, bg, border }) => {
  // Calculate percentage for a progress ring (score is out of 10)
  const percentage = (score / 10) * 100;
  
  return (
    <div className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-3 ${bg} ${border}`}>
      <div className={`p-2 rounded-lg bg-black/20 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">{title}</h3>
      
      {/* Circular Progress (Simplified representation) */}
      <div className="relative flex items-center justify-center">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle 
            className="text-black/20" 
            strokeWidth="4" 
            stroke="currentColor" 
            fill="transparent" 
            r="28" 
            cx="32" 
            cy="32" 
          />
          <circle 
            className={color} 
            strokeWidth="4" 
            strokeDasharray={28 * 2 * Math.PI} 
            strokeDashoffset={28 * 2 * Math.PI - (percentage / 100) * 28 * 2 * Math.PI} 
            strokeLinecap="round" 
            stroke="currentColor" 
            fill="transparent" 
            r="28" 
            cx="32" 
            cy="32" 
          />
        </svg>
        <span className={`absolute text-lg font-bold ${color}`}>{score}</span>
      </div>
    </div>
  );
};

export default AIInterviewFeedbackModal;
