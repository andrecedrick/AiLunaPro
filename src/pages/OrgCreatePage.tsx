import { useState } from 'react';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthInput, FormField } from '../components/auth/FormField';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../context/RouteContext';
import { validateOrgName } from '../utils/validators';
import type { Organization } from '../types/auth';

const PLANS: { value: Organization['plan']; label: string; desc: string }[] = [
  { value: 'Free',         label: 'Free',         desc: 'Up to 3 audits, 1 seat' },
  { value: 'Starter',      label: 'Starter',      desc: '10 audits, 5 seats' },
  { value: 'Professional', label: 'Professional', desc: 'Unlimited audits, 20 seats' },
  { value: 'Enterprise',   label: 'Enterprise',   desc: 'Custom limits, SSO, SLA' },
];

export function OrgCreatePage() {
  const { createOrg, session } = useAuth();
  const { navigate } = useRoute();

  const [name,    setName]    = useState('');
  const [plan,    setPlan]    = useState<Organization['plan']>('Free');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orgErr = validateOrgName(name, 'Workspace name');
    if (orgErr) { setError(orgErr); return; }
    setError('');
    setLoading(true);
    setTimeout(() => {
      createOrg(name, plan);
      setLoading(false);
      navigate({ name: 'dashboard' });
    }, 400);
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
        Create a workspace
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
        {session
          ? `Signed in as ${session.user.email}`
          : 'Set up a new organisation workspace'}
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <FormField label="Workspace name" error={error}>
          <AuthInput
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="e.g. Acme Corp"
            autoFocus
          />
        </FormField>

        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: 8,
              letterSpacing: 0.2,
            }}
          >
            Plan
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PLANS.map(p => {
              const selected = plan === p.value;
              return (
                <label
                  key={p.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: `1.5px solid ${selected ? 'var(--violet)' : 'var(--border)'}`,
                    background: selected ? 'var(--brand-soft-bg)' : 'var(--surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={p.value}
                    checked={selected}
                    onChange={() => setPlan(p.value)}
                    style={{ accentColor: 'var(--violet)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: selected ? 'var(--violet-text)' : 'var(--text-primary)',
                      }}
                    >
                      {p.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {p.desc}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={loading}
          style={{ marginTop: 4 }}
        >
          {loading ? 'Creating workspace…' : 'Create workspace'}
        </Button>
      </form>

      {session && (
        <p
          style={{
            margin: '18px 0 0',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--text-muted)',
          }}
        >
          <span
            onClick={() => navigate({ name: 'dashboard' })}
            style={{ color: 'var(--violet-text)', fontWeight: 600, cursor: 'pointer' }}
          >
            ← Back to dashboard
          </span>
        </p>
      )}
    </AuthCard>
  );
}
