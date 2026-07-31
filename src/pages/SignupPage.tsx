import { useMemo, useState } from 'react';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthInput, FormField } from '../components/auth/FormField';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../context/RouteContext';
import { useLocale } from '../context/LocaleContext';
import { signupValidate } from '../utils/validators/auth';
import { track } from '../lib/analytics/track';
import type { FormErrors } from '../types/form';
import { usePreferences } from '../context/PreferencesContext';
import { countryOptions, toE164 } from '../lib/geo/countries';
import { stashSignupCrm } from '../lib/crm/signupCrmClient';

export function SignupPage() {
  const { signup } = useAuth();
  const { navigate } = useRoute();
  const A = useLocale().auth;
  const D = useLocale().dashboardHome.cta.demoModal;
  const { language } = usePreferences();
  const countryList = useMemo(() => countryOptions(language), [language]);

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  // Country + local number, composed into E.164. Sales calls new accounts back,
  // and a national-format number carries no region at all.
  const [company, setCompany] = useState('');
  const [country, setCountry] = useState('');
  const [phone,   setPhone]   = useState('');
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
    if (!company.trim()) errs.company = A.error.companyRequired;
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setLoading(true);
    track('signup_started');
    // Stashed before the network call: signup navigates to #/org/create and the
    // org-scoped CRM push only runs once that workspace exists.
    stashSignupCrm({ name, company: company.trim(), phone: country && phone ? toE164(country, phone) : '' });
    const result = await signup(name, email, password);
    setLoading(false);
    if (result.success) {
      track('signup_completed');
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
        {A.signup.title}
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
        {A.signup.subtitle}
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        <FormField label={A.field.fullName} error={errors.name}>
          <AuthInput
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={A.placeholder.fullName}
            autoComplete="name"
            autoFocus
          />
        </FormField>

        <FormField label={A.field.workEmail} error={errors.email}>
          <AuthInput
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={A.placeholder.email}
            autoComplete="email"
          />
        </FormField>

        {/* Company is MANDATORY: a lead with no company cannot be qualified or
            routed, and it is what creates the Twenty Company the person is
            linked to. It was the one field the pipeline accepted but the form
            never collected. */}
        <FormField label={D.placeholderCompany} error={errors.company}>
          <AuthInput
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder={D.placeholderCompany}
            autoComplete="organization"
          />
        </FormField>

        {/* Country + phone. Optional at signup so a CRM field can never block
            account creation, but captured here because sales needs a reachable
            number and the country makes the stored value unambiguous E.164. */}
        <FormField label={D.labelCountry}>
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            aria-label={D.labelCountry}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 10,
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit',
            }}
          >
            <option value="">{D.labelCountry}</option>
            {countryList.map(o => <option key={o.iso} value={o.iso}>{o.name} ({o.dial})</option>)}
          </select>
        </FormField>

        <FormField label={D.placeholderPhone}>
          <AuthInput
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder={D.placeholderPhone}
            autoComplete="tel"
          />
        </FormField>

        <FormField label={A.field.password} error={errors.password} hint={A.signup.passwordHint}>
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
          {loading ? A.signup.creatingAccount : A.signup.createAccountButton}
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
        {A.signup.haveAccountPrompt}{' '}
        <span
          onClick={() => navigate({ name: 'login' })}
          style={{ color: 'var(--violet-text)', fontWeight: 600, cursor: 'pointer' }}
        >
          {A.signup.signInLink}
        </span>
      </p>
    </AuthCard>
  );
}
