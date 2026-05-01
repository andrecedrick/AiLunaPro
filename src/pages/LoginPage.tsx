import { useState } from 'react';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthInput, FormField } from '../components/auth/FormField';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../context/RouteContext';
import { loginValidate } from '../utils/validators/auth';

export function LoginPage() {
  const { login } = useAuth();
  const { navigate } = useRoute();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = loginValidate(email, password);
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate({ name: 'dashboard' });
    } else {
      setError(result.error ?? 'Login failed.');
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
        Sign in
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
        Welcome back to AiLunaPro
      </p>

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

        <FormField label="Password">
          <AuthInput
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <div style={{ textAlign: 'right', marginTop: 6 }}>
            <span
              onClick={() => navigate({ name: 'forgot-password' })}
              style={{
                fontSize: 11,
                color: 'var(--violet-text)',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Forgot password?
            </span>
          </div>
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
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          margin: '22px 0',
        }}
      >
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Demo credentials</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Demo hint */}
      <div
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '12px 14px',
          fontSize: 12,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          fontFamily: 'monospace',
        }}
      >
        <span style={{ color: 'var(--text-muted)' }}>email: </span>sophie@acmecorp.io<br />
        <span style={{ color: 'var(--text-muted)' }}>pass: &nbsp;</span>password123
      </div>

      {/* Sign up link */}
      <p
        style={{
          margin: '22px 0 0',
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--text-muted)',
        }}
      >
        Don't have an account?{' '}
        <span
          onClick={() => navigate({ name: 'signup' })}
          style={{
            color: 'var(--violet-text)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sign up
        </span>
      </p>
    </AuthCard>
  );
}
