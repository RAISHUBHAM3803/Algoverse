/**
 * Analytics Helper
 * Provides utility functions for calculating user performance and submission metrics.
 */

/**
 * Calculates current and longest streaks based on a list of active dates.
 * A streak is defined as consecutive days with at least one accepted submission.
 *
 * @param {string[]} dates - Array of date strings (YYYY-MM-DD), sorted ascending.
 *   The MongoDB $group aggregation that produces this input already guarantees
 *   uniqueness — no de-duplication is needed here.
 * @param {Date} [referenceDate] - Optional reference date (defaults to now).
 * @returns {{ currentStreak: number, longestStreak: number }}
 */
const calculateStreaks = (dates, referenceDate = new Date()) => {
  if (!dates || dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Input is already unique+sorted from DB aggregation; sort defensively for safety
  const sortedDates = [...dates].sort();

  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  /**
   * Parse a "YYYY-MM-DD" string into a local Date (midnight, timezone-independent)
   * @param {string} str
   * @returns {Date}
   */
  const parseDateString = (str) => {
    const [year, month, day] = str.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // ── Calculate longest streak by scanning all dates ────────────────────────
  let longestStreak = 1;
  let tempStreak    = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const diffDays = Math.round(
      (parseDateString(sortedDates[i]) - parseDateString(sortedDates[i - 1])) / MS_PER_DAY
    );

    if (diffDays === 1) {
      tempStreak++;
    } else if (diffDays > 1) {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
    // diffDays === 0 means duplicate (shouldn't happen after $group, but safe)
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Helper to format Date into YYYY-MM-DD in IST to match backend aggregation
  const getISTDateStr = (date) => {
    return new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  // ── Calculate current streak relative to referenceDate ───────────────────
  const todayStr     = getISTDateStr(referenceDate);
  const yesterday    = new Date(referenceDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getISTDateStr(yesterday);

  const lastDateStr  = sortedDates[sortedDates.length - 1];

  let currentStreak = 0;
  if (lastDateStr === todayStr || lastDateStr === yesterdayStr) {
    // Walk backwards to count the last consecutive segment
    currentStreak = 1;
    for (let i = sortedDates.length - 1; i > 0; i--) {
      const diffDays = Math.round(
        (parseDateString(sortedDates[i]) - parseDateString(sortedDates[i - 1])) / MS_PER_DAY
      );
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
};

module.exports = { calculateStreaks };
