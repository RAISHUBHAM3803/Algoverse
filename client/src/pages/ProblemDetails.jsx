import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProblemById,
  clearSelectedProblem,
} from "../features/problems/problemSlice";
import {
  selectSelectedProblem,
  selectDetailLoading,
  selectDetailError,
} from "../features/problems/problemSelectors";
import DifficultyBadge from "../components/problems/DifficultyBadge";
import TagList from "../components/problems/TagList";
import {
  ArrowLeft, BookOpen, Tag, Cpu,
  CheckSquare, AlertTriangle, ChevronRight, Code2,
} from "lucide-react";
import { motion } from "framer-motion";

// Skeleton Detail
const SkeletonDetail = () => (
  <div className="animate-pulse space-y-6">
    <div className="glass-panel p-8">
      <div className="h-9 bg-border rounded-lg w-2/3 mb-6"></div>
      <div className="flex gap-3">
        <div className="h-7 bg-border rounded-full w-20"></div>
        <div className="h-7 bg-border rounded-full w-28"></div>
      </div>
    </div>
    {[1, 2, 3].map(i => (
      <div key={i} className="glass-panel p-6">
        <div className="h-5 bg-border rounded w-32 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-border rounded w-full"></div>
          <div className="h-4 bg-border rounded w-5/6"></div>
          <div className="h-4 bg-border rounded w-4/6"></div>
        </div>
      </div>
    ))}
  </div>
);

// Section Block
const Section = ({ icon: Icon, title, children, accentClass = "text-primary-500" }) => (
  <div className="glass-panel p-6 md:p-7">
    <div className="flex items-center gap-2.5 mb-5">
      <Icon className={`w-5 h-5 ${accentClass}`} />
      <h3 className={`text-sm font-bold uppercase tracking-widest ${accentClass}`}>
        {title}
      </h3>
    </div>
    <div className="text-text-secondary text-base leading-relaxed">
      {children}
    </div>
  </div>
);

// Example Block
const ExampleBlock = ({ example, index }) => (
  <div className="bg-surface-hover border-l-4 border-primary-500 rounded-r-xl p-5 space-y-3 font-mono text-sm">
    <p className="text-text-muted text-xs uppercase tracking-wider font-bold">
      Example {index + 1}
    </p>
    {example.input !== undefined && (
      <div>
        <span className="text-text-muted">Input: </span>
        <span className="text-primary-600 dark:text-primary-400">{String(example.input)}</span>
      </div>
    )}
    {example.output !== undefined && (
      <div>
        <span className="text-text-muted">Output: </span>
        <span className="text-success">{String(example.output)}</span>
      </div>
    )}
    {example.explanation && (
      <div>
        <span className="text-text-muted">Explanation: </span>
        <span className="text-text-secondary">{example.explanation}</span>
      </div>
    )}
  </div>
);

// Main Page
const ProblemDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const problem = useSelector(selectSelectedProblem);
  const loading = useSelector(selectDetailLoading);
  const error = useSelector(selectDetailError);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchProblemById(id));
    return () => { dispatch(clearSelectedProblem()); };
  }, [dispatch, id]);

  return (
    <div className="w-full min-h-screen relative z-10 flex flex-col">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary-500/5 to-transparent -z-10"></div>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 w-full">

        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm font-medium text-text-muted mb-10"
        >
          <button
            onClick={() => navigate(-1)}
            className="hover:text-primary-500 transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-primary-500/10 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-text-primary truncate max-w-xs">
            {problem?.title ?? "Loading..."}
          </span>
        </motion.nav>

        {/* Loading */}
        {loading && <SkeletonDetail />}

        {/* Error */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel border-danger/20 p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/30 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-danger" />
            </div>
            <h2 className="text-text-primary font-display font-semibold text-xl mb-2">Problem not found</h2>
            <p className="text-text-secondary text-sm mb-6">{error}</p>
            <Link to="/problems" className="btn-lc-secondary gap-2 inline-flex">
              <ArrowLeft className="w-4 h-4" /> Back to Problems
            </Link>
          </motion.div>
        )}

        {/* Main Content */}
        {!loading && !error && problem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Title + CTA */}
            <div className="glass-panel p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary tracking-tight leading-tight flex-1 min-w-0">
                  {problem.title}
                </h1>
                <Link
                  to={`/problems/${problem._id}/solve`}
                  className="btn-lc-primary flex-shrink-0 gap-2 text-sm py-2.5 px-5"
                >
                  <Code2 className="w-4 h-4" /> Solve Problem
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <DifficultyBadge difficulty={problem.difficulty} size="lg" />
                {problem.acceptanceRate !== undefined && (
                  <span className="text-xs text-text-secondary font-medium border border-border px-3 py-1.5 rounded-full bg-surface-hover flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {Math.round(problem.acceptanceRate)}% Acceptance
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {problem.description && (
              <Section icon={BookOpen} title="Description">
                <div className="whitespace-pre-wrap leading-8 text-text-secondary">{problem.description}</div>
              </Section>
            )}

            {/* Input / Output Format */}
            {(problem.inputFormat || problem.outputFormat) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {problem.inputFormat && (
                  <Section icon={Cpu} title="Input Format" accentClass="text-primary-500">
                    <p className="whitespace-pre-wrap leading-7">{problem.inputFormat}</p>
                  </Section>
                )}
                {problem.outputFormat && (
                  <Section icon={CheckSquare} title="Output Format" accentClass="text-success">
                    <p className="whitespace-pre-wrap leading-7">{problem.outputFormat}</p>
                  </Section>
                )}
              </div>
            )}

            {/* Examples */}
            {problem.examples?.length > 0 && (
              <Section icon={Code2} title="Examples" accentClass="text-primary-500">
                <div className="space-y-4">
                  {problem.examples.map((ex, i) => (
                    <ExampleBlock key={i} example={ex} index={i} />
                  ))}
                </div>
              </Section>
            )}

            {/* Constraints */}
            {problem.constraints && (
              <Section icon={AlertTriangle} title="Constraints" accentClass="text-warning">
                <ul className="space-y-2 font-mono text-sm bg-surface-hover border border-border p-4 rounded-xl">
                  {Array.isArray(problem.constraints)
                    ? problem.constraints.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-warning mt-0.5">●</span>
                          <span className="text-text-primary">{c}</span>
                        </li>
                      ))
                    : <li className="text-text-primary whitespace-pre-wrap">{problem.constraints}</li>
                  }
                </ul>
              </Section>
            )}

            {/* Tags */}
            {problem.tags?.length > 0 && (
              <div className="glass-panel p-6">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Related Topics
                </h4>
                <TagList tags={problem.tags} max={20} />
              </div>
            )}

            {/* Solve CTA Footer */}
            <div className="glass-panel p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary-500/5 border-primary-500/20">
              <div>
                <p className="font-display font-semibold text-text-primary">Ready to solve this?</p>
                <p className="text-text-secondary text-sm">Open the workspace and start coding.</p>
              </div>
              <Link
                to={`/problems/${problem._id}/solve`}
                className="btn-lc-primary gap-2 whitespace-nowrap px-6 py-3"
              >
                Open Editor <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetails;
