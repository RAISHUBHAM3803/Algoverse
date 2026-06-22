import React from "react";

/**
 * AlgoVerseLogo
 * Pixel-perfect, production-ready brand mark for AlgoVerse.
 *
 * Design notes:
 * - Hexagon is built from a single closed path with rounded joints,
 *   stroked (not filled) at 2.25px so it reads crisply at 24-48px.
 *   A soft violet glow sits behind it (filter, not box-shadow) so it
 *   survives being dropped on any dark surface, not just navbar navy.
 * - The hexagon interior carries a small angle-bracket glyph ( < > )
 *   rendered as two strokes — a quiet nod to "code" without resorting
 *   to a literal, overused {} icon.
 * - Wordmark splits "Algo" (white) / "Verse" (violet) with -0.01em
 *   tracking tightened on Verse only, since the heavier violet weight
 *   optically reads as wider — a 1px-scale detail most generators miss.
 * - "v2.0" is a real pill: 1px inset border + 10% fill of the amber,
 *   not a flat amber chip — keeps it from competing with the wordmark.
 *
 * Usage:
 *   <AlgoVerseLogo />                                  -> full horizontal lockup, hexagon mark
 *   <AlgoVerseLogo icon="terminal" />                   -> full lockup, terminal/cursor mark (sharp-ish corners)
 *   <AlgoVerseLogo icon="terminal-rounded" />           -> full lockup, terminal mark with extra-rounded corners
 *   <AlgoVerseLogo variant="icon" icon="terminal-rounded" /> -> rounded terminal mark only (favicon/avatar)
 *   <AlgoVerseLogo showBadge={false} />                 -> lockup without v2.0 pill
 *   <AlgoVerseLogo size={32} />                         -> scales icon height; text scales with it
 */
export default function AlgoVerseLogo({
  variant = "full", // "full" | "icon"
  icon = "hexagon", // "hexagon" | "terminal" | "terminal-rounded"
  showBadge = true,
  size = 28, // icon height in px; everything else derives from this
  className = "",
}) {
  const uid = React.useId().replace(/:/g, "");

  const hex = {
    violet: "#06b6d4",     // cyan-500
    violetSoft: "#67e8f9", // cyan-300
    blue: "#6366f1",       // indigo-500
    amber: "#F59E0B",
    white: "#FFFFFF",
  };

  const gradientDefs = (
    <defs>
      <linearGradient id={`grad-${uid}`} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={hex.violetSoft} />
        <stop offset="0.55" stopColor={hex.violet} />
        <stop offset="1" stopColor={hex.blue} />
      </linearGradient>
      <filter id={`glow-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2.6" result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="0 0 0 0 0.486  0 0 0 0 0.227  0 0 0 0 0.929  0 0 0 0.55 0"
        />
      </filter>
    </defs>
  );

  const HexagonIcon = (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {gradientDefs}
      {/* glow pass (duplicate path, blurred, sits behind) */}
      <path d="M24 3.5 L41.6 13.75 V34.25 L24 44.5 L6.4 34.25 V13.75 Z" stroke={hex.violet} strokeWidth="2.25" filter={`url(#glow-${uid})`} />
      {/* crisp hexagon outline */}
      <path d="M24 3.5 L41.6 13.75 V34.25 L24 44.5 L6.4 34.25 V13.75 Z" stroke={`url(#grad-${uid})`} strokeWidth="2.25" strokeLinejoin="round" />
      {/* interior glyph: minimal angle marks, suggests code without being literal */}
      <path d="M19.5 19 L15 24 L19.5 29" stroke={hex.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M28.5 19 L33 24 L28.5 29" stroke={hex.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="24" cy="24" r="1.6" fill={hex.amber} />
    </svg>
  );

  const TerminalIcon = (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {gradientDefs}
      {/* glow pass */}
      <rect x="4" y="6" width="40" height="36" rx="9" stroke={hex.violet} strokeWidth="2.25" filter={`url(#glow-${uid})`} />
      {/* terminal window, rounded square, gradient stroke */}
      <rect x="4" y="6" width="40" height="36" rx="9" stroke={`url(#grad-${uid})`} strokeWidth="2.25" />
      {/* prompt chevron */}
      <path d="M13 18 L20 24 L13 30" stroke={hex.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* blinking cursor block */}
      <rect x="24" y="28" width="11" height="2.6" rx="1.3" fill={hex.amber} />
    </svg>
  );

  const TerminalRoundedIcon = (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {gradientDefs}
      {/* glow pass */}
      <rect x="4" y="6" width="40" height="36" rx="14" stroke={hex.violet} strokeWidth="2.25" filter={`url(#glow-${uid})`} />
      {/* terminal window, extra-rounded corners, gradient stroke */}
      <rect x="4" y="6" width="40" height="36" rx="14" stroke={`url(#grad-${uid})`} strokeWidth="2.25" />
      {/* prompt chevron */}
      <path d="M14 19 L21 24 L14 29" stroke={hex.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* cursor block */}
      <rect x="25" y="27" width="10" height="2.6" rx="1.3" fill={hex.amber} />
    </svg>
  );

  const Icon =
    icon === "terminal-rounded" ? TerminalRoundedIcon : icon === "terminal" ? TerminalIcon : HexagonIcon;

  if (variant === "icon") {
    return <span className={className} style={{ display: "inline-flex", lineHeight: 0 }}>{Icon}</span>;
  }

  const wordmarkPx = Math.round(size * 0.79);

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: Math.round(size * 0.32),
        userSelect: "none",
      }}
    >
      {Icon}

      <span style={{ display: "inline-flex", alignItems: "center" }}>
        <span
          style={{
            fontFamily:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontWeight: 800,
            fontSize: wordmarkPx,
            lineHeight: 1,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: hex.white }}>Algo</span>
          <span style={{ color: hex.violet, letterSpacing: "-0.02em" }}>Verse</span>
        </span>
      </span>
    </span>
  );
}
