/** Tiny inline SVG decorations — quiet, hand-drawn feel */

export function Compass({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="16" cy="16" r="12" />
      <circle cx="16" cy="16" r="1.4" fill="currentColor" />
      <path d="M16 6 L18 16 L16 26 L14 16 Z" fill="currentColor" fillOpacity="0.85" />
    </svg>
  );
}

export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2 L13.6 9 L21 10 L15.5 14.5 L17.2 22 L12 17.7 L6.8 22 L8.5 14.5 L3 10 L10.4 9 Z" />
    </svg>
  );
}

export function Spark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor">
      <path d="M8 0 L9 7 L16 8 L9 9 L8 16 L7 9 L0 8 L7 7 Z" />
    </svg>
  );
}

export function Wave({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 12" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M2 6 Q 12 0, 22 6 T 42 6 T 62 6 T 78 6" />
    </svg>
  );
}

export function Postmark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="40" cy="40" r="34" strokeDasharray="2 3" />
      <circle cx="40" cy="40" r="26" />
      <path d="M14 40 H66 M40 14 V66" strokeOpacity="0.4" />
    </svg>
  );
}
