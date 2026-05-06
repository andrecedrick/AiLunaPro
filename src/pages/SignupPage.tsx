import { useState } from 'react';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthInput, FormField } from '../components/auth/FormField';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../context/RouteContext';
import { signupValidate } from '../utils/validators/auth';
import type { FormErrors } from '../types/form';

export function SignupPage() {
  const { signup } = useAuth();
  const { navigate } = useRoute();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // J1.3C: workspace name is no longer collected at signup. New users land
    // on OrgCreatePage where they explicitly create a workspace (becoming
    // owner of THAT workspace) or accept an invite (gets invite role).
    const errs = signupValidate(name, email, password, '__skip__');
    delete errs.orgName; // not collected here anymore
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setLoading(true);
    const result = await signup(name, email, password);
    setLoading(false);
    if (result.success) {
      // J1.3D: if user came via invite link, resume invite flow.
      let resumedInvite = false;
      try {
        const pending = sessionStorage.getItem('ailunapro:pendingInvite');
        if (pending) {
          const parsed = JSON.parse(pending) as { orgId: string; inviteId: string; token: string };
          if (parsed?.orgId && parsed?.inviteId && parsed?.token) {
            window.location.hash = `#/invite/${parsed.orgId}/${parsed.inviteId}/${parsed.token}`;
            navigate({ name: 'accept-invite' });
            resumedInvite = true;
          }
        }
      } catch { /* ignore */ }
      if (!resumedInvite) {
        navigate({ name: 'org/create' });
      }
    } else {
      setApiError(result.error ?? 'Could not create account.');
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
        Create your account
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
        Start your AI compliance journey
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        <FormField label="Full name" error={errors.name}>
          <AuthInput
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Sophie Martin"
            autoComplete="name"
            autoFocus
          />
        </FormField>

        <FormField label="Work email" error={errors.email}>
          <AuthInput
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </FormField>

        <FormField label="Password" error={errors.password} hint="Minimum 8 characters">
          <AuthInput
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </FormField>

        {apiError && (
          <div
            style={{
              background: 'var(--red-bg)',
              color: 'var(--red-text)',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {apiError}
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
          {loading ? 'Creating account…' : 'Create account'}
        </Button>

        <p
          style={{
            margin: '4px 0 0',
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}
        >
          By creating an account you agree to our{' '}
          <span style={{ color: 'var(--violet-text)', cursor: 'pointer' }}>Terms of Service</span>
          {' '}and{' '}
          <span style={{ color: 'var(--violet-text)', cursor: 'pointer' }}>Privacy Policy</span>.
        </p>
      </form>

      <p
        style={{
          margin: '22px 0 0',
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--text-muted)',
        }}
      >
        Already have an account?{' '}
        <span
          onClick={() => navigate({ name: 'login' })}
          style={{ color: 'var(--violet-text)', fontWeight: 600, cursor: 'pointer' }}
        >
          Sign in
        </span>
      </p>
    </AuthCard>
  );
}
