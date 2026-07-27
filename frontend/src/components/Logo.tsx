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
        <rect x="1" y="1" width="30" height="30" rx="9" fill="#ff385c" />
        <path
          d="M11 5v4M21 5v4"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="7" y="8" width="18" height="18" rx="4" stroke="#ffffff" strokeWidth="2" />
        <path
          d="M11.5 17.5l3 3 6-6"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="logo-wordmark">ReserveringBot</span>
    </span>
  );
}
