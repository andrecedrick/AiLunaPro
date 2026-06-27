/**
 * AcceptInvitePage — Phase J1.3D.
 *
 * URL: #/invite/{orgId}/{inviteId}/{token}
 *
 * Flow:
 *   1. Parse hash → orgId, inviteId, token
 *   2. If unauthenticated → store invite in sessionStorage, route to login/signup
 *   3. After auth, validate token + create member doc with invite.role
 *   4. Mark invite accepted, add orgId to user.orgIds, switch to org, redirect dashboard
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../context/RouteContext';
import { useLocale } from '../context/LocaleContext';
import { parseInviteHash } from '../lib/team/invitationsService';
import { apiAcceptInvite, getIdToken } from '../lib/team/teamApiClient';
import { resolveLayer } from '../lib/featureFlags';

type State = 'parsing' | 'auth-required' | 'verifying' | 'accepting' | 'done' | 'error';

const STORAGE_KEY = 'ailunapro:pendingInvite';

export function AcceptInvitePage() {
  const { session, isAuthenticated } = useAuth();
  const { navigate } = useRoute();
  const I = useLocale().auth.invite;
  const [state, setState] = useState<State>('parsing');
  const [error, setError] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);

  useEffect(() => {
    if (resolveLayer('auth') !== 'firebase') {
      setError('Invitations require Firebase auth layer.');
      setState('error');
      return;
    }

    const parsed = parseInviteHash(window.location.hash);
    if (!parsed) {
      setError('Invalid invite link.');
      setState('error');
      return;
    }

    // J1.3E: detect placeholder tokens from old buggy build
    if (parsed.token.includes('__token-not-recoverable')) {
      setError('This invite link is incomplete. Ask the workspace owner to regenerate the invitation link.');
      setState('error');
      return;
    }

    // Persist for cross-auth roundtrip
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); } catch { /* ignore */ }

    if (!isAuthenticated) {
      setState('auth-required');
      return;
    }

    void run(parsed);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (parsed: { orgId: string; inviteId: string; token: string }) => {
    if (!session?.userId) {
      setState('auth-required');
      return;
    }
    setState('verifying');
    setError(null);

    try {
      const idToken = await getIdToken();
      const result = await apiAcceptInvite(parsed, idToken);
      setPlanName(result.role);
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }

      setState('done');
      setTimeout(() => {
        try { window.localStorage.setItem('ailunapro:activeOrg', parsed.orgId); } catch { /* ignore */ }
        window.location.hash = '#/';
        window.location.reload();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite');
      setState('error');
    }
  };

  return (
    <div style={{
      minHeight:       '100vh',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         24,
      background:      'var(--bg)',
    }}>
      <div style={{
        maxWidth:      480,
        width:         '100%',
        background:    'var(--surface)',
        border:        '1px solid var(--border)',
        borderRadius:  18,
        padding:       '40px 36px',
        textAlign:     'center',
        boxShadow:     '0 20px 50px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          width:           64,
          height:          64,
          borderRadius:    '50%',
          background:      state === 'error' ? 'var(--red-soft-bg)' : 'var(--green-soft-bg)',
          display:         'inline-flex',
          alignItems:      'center',
          justifyContent:  'center',
          marginBottom:    20,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
               stroke={state === 'error' ? 'var(--red-text)' : 'var(--green-text)'}
               strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            {state === 'error'
              ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              : <polyline points="20 6 9 17 4 12" />
            }
          </svg>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
          {state === 'parsing'       && I.titleParsing}
          {state === 'auth-required' && I.titleAuthRequired}
          {state === 'verifying'     && I.titleVerifying}
          {state === 'accepting'     && I.titleAccepting}
          {state === 'done'          && I.titleDone}
          {state === 'error'         && I.titleError}
        </h1>

        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 22px', lineHeight: 1.55 }}>
          {state === 'auth-required' && I.authRequiredBody}
          {state === 'done'          && (planName ? `You joined as ${planName}. ${I.redirecting}` : I.redirecting)}
          {state === 'error'         && (error ?? 'Something went wrong.')}
          {(state === 'parsing' || state === 'verifying' || state === 'accepting') && I.pleaseWait}
        </p>

        {state === 'auth-required' && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => navigate({ name: 'signup' })}
              style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: 'var(--brand-gradient)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
            >
              {I.createAccountButton}
            </button>
            <button
              type="button"
              onClick={() => navigate({ name: 'login' })}
              style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid var(--violet)', background: 'transparent', color: 'var(--violet-text)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
            >
              {I.signInButton}
            </button>
          </div>
        )}

        {state === 'error' && (
          <button
            type="button"
            onClick={() => navigate({ name: 'dashboard' })}
            style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: 'var(--brand-gradient)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            {I.backToDashboard}
          </button>
        )}
      </div>
    </div>
  );
}
