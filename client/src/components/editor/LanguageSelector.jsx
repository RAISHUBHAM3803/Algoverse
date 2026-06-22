import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage, setCode } from "../../features/editor/editorSlice";
import { selectEditorLanguage } from "../../features/editor/editorSelectors";
import { selectSelectedProblem } from "../../features/problems/problemSelectors";
import { ChevronDown } from "lucide-react";

export const DEFAULT_TEMPLATES = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    \n}\n`,
  java: `public class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n`,
  python: `def solution():\n    pass\n\nif __name__ == "__main__":\n    solution()\n`,
  javascript: `function solution() {\n    \n}\n\nsolution();\n`,
};

const LANG_LABELS = {
  cpp: "C++",
  java: "Java",
  python: "Python",
  javascript: "JavaScript",
};

const LanguageSelector = () => {
  const dispatch = useDispatch();
  const currentLanguage = useSelector(selectEditorLanguage);
  const problem = useSelector(selectSelectedProblem);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    dispatch(setLanguage(lang));
    const codeTemplate = (problem?.starterCode && problem.starterCode[lang])
      ? problem.starterCode[lang]
      : DEFAULT_TEMPLATES[lang];
    dispatch(setCode(codeTemplate));
  };

  return (
    <div className="relative flex items-center">
      <select
        id="language-select"
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="appearance-none bg-white/5 border border-white/10 text-white/80 text-xs font-mono rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-primary-500/50 focus:bg-white/10 transition-all cursor-pointer hover:bg-white/10"
      >
        <option className="bg-[#161b22] text-white" value="cpp">C++</option>
        <option className="bg-[#161b22] text-white" value="java">Java</option>
        <option className="bg-[#161b22] text-white" value="python">Python</option>
        <option className="bg-[#161b22] text-white" value="javascript">JavaScript</option>
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
    </div>
  );
};

export default LanguageSelector;
