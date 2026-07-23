export function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="logo">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="15" fill="#ff385c" />
        <path
          d="M16 1c-4 4-4 10 0 15s4 11 0 15"
          stroke="#ffffff"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M16 1c4 4 4 10 0 15s-4 11 0 15"
          stroke="#ffffff"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
      <span className="logo-wordmark">tennis-bot</span>
    </span>
  );
}
