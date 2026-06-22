// ─── Problems List Selectors ──────────────────────────────────────────────────

export const selectProblems = (state) => state.problems.problems;
export const selectProblemsLoading = (state) => state.problems.loading;
export const selectProblemsError = (state) => state.problems.error;
export const selectTotalPages = (state) => state.problems.totalPages;
export const selectTotalProblems = (state) => state.problems.totalProblems;
export const selectCurrentPage = (state) => state.problems.page;
export const selectSearch = (state) => state.problems.search;
export const selectDifficulty = (state) => state.problems.difficulty;
export const selectTag = (state) => state.problems.tag;

// ─── Problem Detail Selectors ─────────────────────────────────────────────────

export const selectSelectedProblem = (state) => state.problems.selectedProblem;
export const selectDetailLoading = (state) => state.problems.detailLoading;
export const selectDetailError = (state) => state.problems.detailError;
