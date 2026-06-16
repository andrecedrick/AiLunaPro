import { useMemo, useState } from 'react';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthInput, FormField } from '../components/auth/FormField';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../context/RouteContext';
import { useLocale } from '../context/LocaleContext';
import { format } from '../lib/locale/i18n';
import type { Dict } from '../lib/locale/i18n/en';
import { validateOrgName } from '../utils/validators';
import { postAuthRoute } from '../lib/journey/journeyState';
import { track } from '../lib/analytics/track';
import type { Organization } from '../types/auth';

function buildPlans(t: Dict['orgCreate']): { value: Organization['plan']; label: string; desc: string }[] {
  return [
    { value: 'Free',         label: 'Free',         desc: t.planDesc.free },
    { value: 'Starter',      label: 'Starter',      desc: t.planDesc.starter },
    { value: 'Professional', label: 'Professional', desc: t.planDesc.professional },
    { value: 'Enterprise',   label: 'Enterprise',   desc: t.planDesc.enterprise },
  ];
}

export function OrgCreatePage() {
  const { createOrg, session } = useAuth();
  const { navigate } = useRoute();
  const T = useLocale();
  const PLANS = useMemo(() => buildPlans(T.orgCreate), [T]);

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
      track('workspace_created', { plan });
      setLoading(false);
      navigate({ name: postAuthRoute() });
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
        {T.orgCreate.heading}
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
          ? format(T.orgCreate.subtitle.signedIn, { email: session.user.email })
          : T.orgCreate.subtitle.anonymous}
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <FormField label={T.orgCreate.form.nameLabel} error={error}>
          <AuthInput
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder={T.orgCreate.form.namePlaceholder}
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
            {T.orgCreate.form.planLabel}
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
          {loading ? T.orgCreate.submit.loading : T.orgCreate.submit.idle}
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
            {T.orgCreate.backToDashboard}
          </span>
        </p>
      )}
    </AuthCard>
  );
}
