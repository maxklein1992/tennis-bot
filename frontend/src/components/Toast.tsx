import { useEffect } from 'react';

export interface ToastMessage {
  kind: 'success' | 'error';
  text: string;
}

/** Simpele, tijdelijke melding rechtsonder in beeld. Sluit vanzelf na een paar seconden. */
export function Toast({
  toast,
  onDismiss,
  durationMs = 4000,
}: {
  toast: ToastMessage;
  onDismiss: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [toast, onDismiss, durationMs]);

  return (
    <div className={`toast toast-${toast.kind}`} role="status">
      {toast.text}
    </div>
  );
}
