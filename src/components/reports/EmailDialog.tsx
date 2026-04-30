import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import type { Report } from '../../types/report';
import { validateEmail } from '@/utils/validators';

interface Props {
  report: Report;
  onClose: () => void;
  onSent: (recipient: string) => void;
}

export function EmailDialog({ report, onClose, onSent }: Props) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  /* Close on Esc */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !sending) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, sending]);

  const handleSend = () => {
    setError(null);
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    setSending(true);
    setTimeout(() => {
      onSent(email.trim());
      setSending(false);
      setSent(true);
      setTimeout(() => onClose(), 1800);
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-dialog-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--card-radius)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
          width: '100%',
          maxWidth: 480,
          padding: 24,
        }}
      >
        <h3
          id="email-dialog-title"
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 18,
            color: 'var(--text-primary)',
            letterSpacing: -0.2,
          }}
        >
          Send report by email
        </h3>
        <p
          style={{
            margin: '6px 0 18px',
            fontSize: 13,
            color: 'var(--text-muted)',
            lineHeight: 1.55,
          }}
        >
          Send <strong style={{ color: 'var(--text-secondary)' }}>{report.title}</strong> to a
          stakeholder. This is a UI-shell mock — no real email is delivered.
        </p>

        <Field label="Recipient email">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={sending || sent}
            placeholder="recipient@example.com"
            style={inputStyle}
            autoFocus
          />
        </Field>

        <Field label="Optional message">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={sending || sent}
            placeholder="A short note for the recipient…"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 76 }}
          />
        </Field>

        {error && (
          <p
            style={{
              margin: '4px 0 12px',
              fontSize: 12,
              color: 'var(--red-text)',
              fontWeight: 600,
            }}
          >
            {error}
          </p>
        )}

        {sent ? (
          <div
            style={{
              background: 'var(--green-bg)',
              color: 'var(--green-text)',
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            ✓ Sent to {email} — no real email delivered (mock)
          </div>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <Button variant="ghost" size="md" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSend} disabled={sending || sent}>
            {sending ? 'Sending…' : sent ? '✓ Sent' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  borderRadius: 10,
  fontSize: 13,
  fontFamily: 'var(--font-body)',
  color: 'var(--text-primary)',
  outline: 'none',
  lineHeight: 1.5,
  boxSizing: 'border-box',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label
      style={{
        display: 'block',
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}
