import { useState } from 'react';

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`password-input${className ? ` ${className}` : ''}`}>
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="password-toggle"
        tabIndex={-1}
        aria-label={visible ? 'Wachtwoord verbergen' : 'Wachtwoord tonen'}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 4.24A9.94 9.94 0 0112 4c5 0 9.27 3.11 11 7.5a11.9 11.9 0 01-3.16 4.29M6.6 6.6C4.24 8.14 2.44 10.55 1 11.5 2.73 15.89 7 19 12 19a10.9 10.9 0 004-.76"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M1 11.5C2.73 7.11 7 4 12 4s9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 15.89 1 11.5z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="11.5" r="3" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        )}
      </button>
    </div>
  );
}
