import { useState } from 'react';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthInput, FormField } from '../components/auth/FormField';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../context/RouteContext';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { navigate } = useRoute();

  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) { setError('Email address is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await resetPassword(trimmed);
    setLoading(false);
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error ?? 'Failed to send reset email.');
    }
  };

  return (
    <AuthCard>
      <h2
        style={{
          margin: '0 0 6px',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: 22,
          color: 'var(--text-primary)',
          letterSpacing: -0.4,
          textAlign: 'center',
        }}
      >
        Reset password
      </h2>
      <p
        style={{
          margin: '0 0 26px',
          fontSize: 13,
          color: 'var(--text-muted)',
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        {sent
          ? 'Check your inbox for a reset link.'
          : 'Enter your email and we\'ll send you a reset link.'}
      </p>

      {sent ? (
        /* ── Success state ──────────────────────────────────── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              background: 'var(--green-bg)',
              color: 'var(--green-text)',
              border: '1px solid var(--green-bg)',
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 13,
              fontWeight: 500,
              textAlign: 'center',
              lineHeight: 1.55,
            }}
          >
            Reset email sent to <strong>{email}</strong>.
            <br />
            Check your spam folder if it doesn't arrive.
          </div>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => navigate({ name: 'login' })}
          >
            ← Back to sign in
          </Button>
        </div>
      ) : (
        /* ── Form ───────────────────────────────────────────── */
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField label="Email address">
            <AuthInput
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              autoFocus
            />
          </FormField>

          {error && (
            <div
              style={{
                background: 'var(--red-bg)',
                color: 'var(--red-text)',
                border: '1px solid var(--red-bg)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}

      {/* Back link */}
      {!sent && (
        <p
          style={{
            margin: '22px 0 0',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--text-muted)',
          }}
        >
          Remember your password?{' '}
          <span
            onClick={() => navigate({ name: 'login' })}
            style={{
              color: 'var(--violet-text)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign in
          </span>
        </p>
      )}
    </AuthCard>
  );
}
