// Ikon garis sederhana untuk demo; dekoratif sehingga aria-hidden.
function Svg({ children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export function PlayMark() {
  return (
    <Svg>
      <path d="M7 5.5v13l11-6.5L7 5.5Z" fill="currentColor" />
      <path d="M3 5.5v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function ClockIcon() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function ControllerIcon() {
  return (
    <Svg>
      <path
        d="M7 7h10c3 0 5 11 2 11-2 0-3-3-4-3H9c-1 0-2 3-4 3-3 0-1-11 2-11Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M7 9v5m-2.5-2.5h5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="10" r="1" fill="currentColor" />
      <circle cx="18" cy="13" r="1" fill="currentColor" />
    </Svg>
  );
}

export function TvIcon() {
  return (
    <Svg>
      <rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 21h8m-4-4v4" stroke="currentColor" strokeWidth="1.5" />
    </Svg>
  );
}

export function CheckIcon() {
  return (
    <Svg>
      <path
        d="m5 12 4 4L19 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
