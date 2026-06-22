import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSearch } from "../../features/problems/problemSlice";
import { selectSearch } from "../../features/problems/problemSelectors";
import { Search, X } from "lucide-react";

const DEBOUNCE_MS = 400;

const ProblemSearch = () => {
  const dispatch = useDispatch();
  const reduxSearch = useSelector(selectSearch);

  const [localValue, setLocalValue] = useState(reduxSearch);
  const debounceTimer = useRef(null);

  useEffect(() => {
    setLocalValue(reduxSearch);
  }, [reduxSearch]);

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      setLocalValue(val);
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        dispatch(setSearch(val));
      }, DEBOUNCE_MS);
    },
    [dispatch]
  );

  const handleClear = useCallback(() => {
    clearTimeout(debounceTimer.current);
    setLocalValue("");
    dispatch(setSearch(""));
  }, [dispatch]);

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  return (
    <div className="relative w-full max-w-md group">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary-500 transition-colors pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder="Search problems by title or keyword..."
        className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm font-sans"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ProblemSearch;
