import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCode } from "../../features/editor/editorSlice";
import { selectEditorLanguage } from "../../features/editor/editorSelectors";
import LanguageSelector, { DEFAULT_TEMPLATES } from "./LanguageSelector";
import RunSubmitButtons from "./RunSubmitButtons";
import { RotateCcw } from "lucide-react";

const EditorToolbar = () => {
  const dispatch = useDispatch();
  const language = useSelector(selectEditorLanguage);

  const handleReset = () => {
    if (window.confirm("Reset your code? This will discard your current changes.")) {
      dispatch(setCode(DEFAULT_TEMPLATES[language]));
    }
  };

  return (
    <div className="flex justify-between items-center bg-[#161b22] border-b border-white/10 px-3 py-2 flex-shrink-0">
      <div className="flex items-center gap-3">
        <LanguageSelector />
        <button
          onClick={handleReset}
          className="text-white/30 hover:text-white/70 transition-colors p-1 rounded hover:bg-white/5"
          title="Reset to default code"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
      <RunSubmitButtons />
    </div>
  );
};

export default EditorToolbar;
