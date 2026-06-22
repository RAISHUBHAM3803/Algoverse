import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { executeCode } from "../../features/editor/editorSlice";
import {
  selectEditorCode,
  selectEditorLanguage,
  selectEditorLoading,
  selectEditorIsSubmitting,
} from "../../features/editor/editorSelectors";
import { submitCode } from "../../features/submissions/submissionSlice";
import { selectSelectedProblem } from "../../features/problems/problemSelectors";
import {
  setSubmissionResult,
  setEditorSubmitting,
  clearSubmissionResult,
} from "../../features/editor/editorSlice";
import { Play, Send, Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

const RunSubmitButtons = () => {
  const dispatch = useDispatch();
  const { id: problemId } = useParams();
  const problem = useSelector(selectSelectedProblem);

  const code = useSelector(selectEditorCode);
  const language = useSelector(selectEditorLanguage);
  const editorLoading = useSelector(selectEditorLoading);
  const isSubmitting = useSelector(selectEditorIsSubmitting);
  const isBusy = editorLoading || isSubmitting;

  const handleRun = () => {
    if (!code.trim()) {
      toast.error("Please enter some code to run");
      return;
    }
    // Clear any previous submission result so output panel shows run result
    dispatch(clearSubmissionResult());
    const input = problem?.visibleTestCases?.[0]?.input || "";
    dispatch(executeCode({ language, code, problemId, input }));
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to submit");
      return;
    }

    // Mark as submitting — output panel will show spinner
    dispatch(setEditorSubmitting(true));
    dispatch(clearSubmissionResult());

    const toastId = toast.loading("Judging your code...", { id: "submission" });

    const resultAction = await dispatch(submitCode({ problemId, language, code }));

    toast.dismiss(toastId);

    if (submitCode.fulfilled.match(resultAction)) {
      const payload = resultAction.payload;
      const verdict = payload?.verdict ?? "";
      const isAccepted = verdict.toLowerCase() === "accepted";

      // Store result in editor state — output panel renders it inline
      dispatch(setSubmissionResult(payload));

      if (isAccepted) {
        toast.success("✅ All test cases passed!", { duration: 4000 });
        // Signal the Dashboard to refresh its stats, heatmap, and recent submissions
        window.dispatchEvent(new CustomEvent("submission:accepted"));
      } else {
        toast.error(payload?.message || "❌ Wrong Answer", { duration: 4000 });
      }
    } else {
      // On failure, clear the submitting spinner
      dispatch(setEditorSubmitting(false));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        id="btn-run-code"
        onClick={handleRun}
        disabled={isBusy}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg text-xs font-semibold font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 hover:border-white/20"
      >
        {editorLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Play className="w-3.5 h-3.5 text-success" />
        )}
        Run
      </button>

      <button
        id="btn-submit-code"
        onClick={handleSubmit}
        disabled={isBusy}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-primary-500/20"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Judging...
          </>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            Submit
          </>
        )}
      </button>
    </div>
  );
};

export default RunSubmitButtons;
