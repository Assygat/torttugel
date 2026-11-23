/**
 * Қазақтың «қошқар мүйіз» ою-өрнегінен шабыттанған нәзік әшекейлер.
 * Түсі `currentColor` арқылы беріледі.
 */

const HornPair = () => (
  <>
    <path d="M128 16 C136 16 140 6 150 6 C158 6 160 14 154 15 C150 16 148 12 151 11" />
    <path d="M128 16 C136 16 140 26 150 26 C158 26 160 18 154 17 C150 16 148 20 151 21" />
    <path d="M164 16 H214" />
    <circle cx="221" cy="16" r="2.2" fill="currentColor" stroke="none" />
    <circle cx="230" cy="16" r="1.4" fill="currentColor" stroke="none" />
  </>
);

export function OrnamentDivider({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`ornament ${className}`}
      viewBox="0 0 240 32"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M120 7 L129 16 L120 25 L111 16 Z" />
        <path d="M120 12 L124 16 L120 20 L116 16 Z" fill="currentColor" stroke="none" />
        <HornPair />
        <g transform="translate(240 0) scale(-1 1)">
          <HornPair />
        </g>
      </g>
    </svg>
  );
}

/** Карточка бұрышына қойылатын шағын ою */
export function OrnamentCorner({ className = '' }: { className?: string }) {
  return (
    <svg className={`ornament-corner ${className}`} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 42 V22 C6 12 12 6 22 6 H42" />
        <path d="M6 24 C6 15 15 13 19 17 C22 20 19 24 16 22" />
        <path d="M24 6 C15 6 13 15 17 19 C20 22 24 19 22 16" />
        <path d="M14 30 L18 26 L22 30 L18 34 Z" fill="currentColor" stroke="none" opacity="0.6" />
        <path d="M30 14 L34 18 L30 22 L26 18 Z" fill="currentColor" stroke="none" opacity="0.6" />
      </g>
    </svg>
  );
}
