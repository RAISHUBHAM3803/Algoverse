import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSubmissionById, clearCurrentSubmission } from "../features/submissions/submissionSlice";
import {
  selectCurrentSubmission,
  selectSubmissionsLoading,
  selectSubmissionsError,
} from "../features/submissions/submissionSelectors";
import SubmissionDetails from "../components/submissions/SubmissionDetails";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

// Skeleton for submission detail
const SkeletonDetail = () => (
  <div className="space-y-6 animate-pulse">
    <div className="glass-panel p-8">
      <div className="flex gap-4 mb-8">
        <div className="h-8 w-48 bg-border rounded-lg"></div>
        <div className="h-8 w-28 bg-border rounded-full ml-auto"></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-20 bg-border rounded-xl"></div>
        ))}
      </div>
    </div>
    <div className="glass-panel p-0 overflow-hidden">
      <div className="h-12 bg-surface-hover border-b border-border"></div>
      <div className="p-6 space-y-3">
        {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-border rounded w-full" style={{width: `${60 + i * 8}%`}}></div>)}
      </div>
    </div>
  </div>
);

const SubmissionView = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const submission = useSelector(selectCurrentSubmission);
  const loading = useSelector(selectSubmissionsLoading);
  const error = useSelector(selectSubmissionsError);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getSubmissionById(id));
    return () => { dispatch(clearCurrentSubmission()); };
  }, [dispatch, id]);

  return (
    <div className="relative z-10 min-h-screen py-10 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-500/5 to-transparent -z-10"></div>

      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary-500 hover:bg-primary-500/10 px-3 py-2 rounded-lg transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
          </button>
        </motion.div>

        {/* Loading */}
        {loading && <SkeletonDetail />}

        {/* Error */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel border-danger/20 p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/30 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-danger" />
            </div>
            <h2 className="text-text-primary font-display font-semibold text-xl mb-2">
              Submission not found
            </h2>
            <p className="text-text-secondary text-sm mb-6">{error}</p>
            <Link to="/submissions" className="btn-lc-secondary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Return to Submissions
            </Link>
          </motion.div>
        )}

        {/* Details */}
        {!loading && !error && submission && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SubmissionDetails submission={submission} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubmissionView;
