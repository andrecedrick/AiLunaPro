/**
 * BillingSuccessPage — Phase J1.2 (final UX)
 *
 * Landing after Stripe Checkout. URL form:
 *   /#/billing/success?session_id=cs_test_...
 *
 * Flow:
 *   1. Extract session_id from URL (hash → search → href regex → sessionStorage)
 *   2. POST /api/billing/sync-session { sessionId } — orgId derived server-side
 *   3. After sync OK: refreshSubscription() → BillingContext catches up
 *   4. Auto-redirect to /billing once hasActiveSubscription becomes true,
 *      OR after a 6 s timeout (BillingContext refresh should be fast)
 *
 * UI: clean, no technical detail. Diagnostics only in console.
 */

import { useEffect, useRef, useState } from 'react';
import { useRoute } from '../context/RouteContext';
import { useBilling } from '../context/BillingContext';
import { useLocale } from '../context/LocaleContext';
import { format } from '../lib/locale/i18n';
import type { Dict } from '../lib/locale/i18n/en';
import { syncSession } from '../lib/billing/stripeClient';
import { dlog } from '../lib/log';

type SyncState = 'idle' | 'syncing' | 'synced' | 'failed';

function extractSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  const href   = window.location.href;
  const hash   = window.location.hash;
  const search = window.location.search;

  dlog('[BillingSuccess] href=', href, 'hash=', hash, 'search=', search);

  if (hash.includes('?')) {
    const id = new URLSearchParams(hash.slice(hash.indexOf('?'))).get('session_id');
    if (id) return id;
  }
  if (search) {
    const id = new URLSearchParams(search).get('session_id');
    if (id) return id;
  }
  const m = href.match(/[?&]session_id=([^&#]+)/);
  if (m && m[1]) return decodeURIComponent(m[1]);
  try {
    const stored = window.sessionStorage.getItem('stripe.lastSessionId');
    if (stored) return stored;
  } catch { /* ignore */ }
  return null;
}

function friendlyError(raw: string, t: Dict['billingPage']): string {
  if (raw.toLowerCase().includes('not yet completed')) {
    return t.success.errors.stillProcessing;
  }
  if (raw.toLowerCase().includes('no such checkout session')) {
    return t.success.errors.sessionInvalid;
  }
  if (raw.toLowerCase().includes('not authenticated')) {
    return t.success.errors.notSignedIn;
  }
  if (raw.toLowerCase().includes('orgid')) {
    return t.success.errors.orgLinkFailed;
  }
  return t.success.errors.generic;
}

export function BillingSuccessPage() {
  const { navigate }      = useRoute();
  const { hasActiveSubscription, subscription, refreshSubscription } = useBilling();
  const T = useLocale();

  const [state,  setState]  = useState<SyncState>('idle');
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const triggeredRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  const runSync = async (sid: string): Promise<void> => {
    setState('syncing');
    setErrMsg(null);
    try {
      const { auth } = await import('../lib/firebase-auth');
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      dlog('[BillingSuccess] sync-session request started — sessionId=', sid);
      const result = await syncSession(sid, idToken);
      dlog('[BillingSuccess] sync-session response — orgId=', result.orgId, 'plan=', result.subscription.plan);
      // Force BillingContext to fetch the freshly-written Firestore doc
      await refreshSubscription();
      dlog('[BillingSuccess] refreshSubscription complete');
      setState('synced');
      try { window.sessionStorage.removeItem('stripe.lastSessionId'); } catch { /* ignore */ }
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Sync failed';
      console.error('[BillingSuccess] sync-session failed:', err);
      setErrMsg(friendlyError(raw, T.billingPage));
      setState('failed');
    }
  };

  // One-shot: extract sessionId, kick off sync
  useEffect(() => {
    if (triggeredRef.current) return;

    // J1.4A guard: if we landed here from a token top-up redirect (hash
    // contains `topup=success` or path is `#/billing/tokens`), bail out
    // and re-route to the tokens page. sync-session is for subscription
    // sessions only and would 4xx on a one-time payment session.
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#/billing/tokens') || hash.includes('topup=success') || hash.includes('topup=cancel')) {
        dlog('[BillingSuccess] token top-up redirect detected — routing to tokens page');
        navigate({ name: 'billing/tokens' });
        return;
      }
    }

    const sid = extractSessionId();
    sessionIdRef.current = sid;
    dlog('[BillingSuccess] extracted sessionId=', sid);
    if (!sid) {
      setErrMsg(T.billingPage.success.errors.noSessionDetected);
      setState('failed');
      return;
    }
    triggeredRef.current = true;
    void runSync(sid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-redirect when context shows the new active subscription
  useEffect(() => {
    if (state === 'synced' && hasActiveSubscription) {
      const id = setTimeout(() => navigate({ name: 'billing' }), 1200);
      return () => clearTimeout(id);
    }
    // Explicit: an effect that returns a cleanup on one path and nothing on
    // another is the shape that leaks timers when a branch is later added.
    return undefined;
  }, [state, hasActiveSubscription, navigate]);

  // Hard fallback: after 6 s of synced-but-context-not-updated, navigate anyway
  useEffect(() => {
    if (state !== 'synced') return;
    const id = setTimeout(() => {
      if (!hasActiveSubscription) {
        console.warn('[BillingSuccess] context not updated after 6 s — navigating anyway');
        void refreshSubscription();
        navigate({ name: 'billing' });
      }
    }, 6000);
    return () => clearTimeout(id);
  }, [state, hasActiveSubscription, navigate, refreshSubscription]);

  const isFail   = state === 'failed';
  const showSpin = state === 'syncing' || (state === 'synced' && !hasActiveSubscription);

  const headline =
    isFail                                 ? T.billingPage.success.headline.failed
    : hasActiveSubscription                ? format(T.billingPage.success.headline.active, { plan: subscription.plan })
    : T.billingPage.success.headline.activating;

  const subtext =
    isFail                                 ? (errMsg ?? T.billingPage.success.subtext.failedFallback)
    : hasActiveSubscription                ? T.billingPage.success.subtext.redirecting
    : T.billingPage.success.subtext.syncing;

  const pillLabel =
    isFail                                 ? T.billingPage.success.pill.failed
    : hasActiveSubscription                ? T.billingPage.success.pill.activated
    : state === 'syncing'                  ? T.billingPage.success.pill.syncing
    : T.billingPage.success.pill.almostDone;

  return (
    <div style={{
      minHeight:       '70vh',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         24,
    }}>
      <div style={{
        maxWidth:      540,
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
          background:      isFail ? 'var(--red-soft-bg)' : 'var(--green-soft-bg)',
          display:         'inline-flex',
          alignItems:      'center',
          justifyContent:  'center',
          marginBottom:    20,
        }}>
          {isFail ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--red-text)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green-text)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
          {headline}
        </h1>

        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 22px', lineHeight: 1.55 }}>
          {subtext}
        </p>

        <div style={{
          display:      'inline-flex',
          alignItems:   'center',
          gap:          8,
          fontSize:     12,
          color:
            isFail ? 'var(--red-text)' :
            hasActiveSubscription ? 'var(--green-text)' : 'var(--text-muted)',
          background:
            isFail ? 'var(--red-soft-bg)' :
            hasActiveSubscription ? 'var(--green-soft-bg)' : 'var(--surface-2)',
          padding:      '6px 14px',
          borderRadius: 20,
          marginBottom: 24,
          fontWeight:   600,
        }}>
          <span style={{
            width:       8, height: 8, borderRadius: '50%',
            background:
              isFail ? 'var(--red-text)' :
              hasActiveSubscription ? 'var(--green-text)' : 'var(--text-muted)',
            animation:   showSpin ? 'pulse 1.5s ease-in-out infinite' : 'none',
          }} />
          {pillLabel}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate({ name: 'billing' })}
            style={{
              padding:      '10px 22px',
              borderRadius: 10,
              border:       'none',
              background:   'var(--brand-gradient)',
              color:        '#fff',
              fontWeight:   600,
              fontSize:     14,
              cursor:       'pointer',
            }}
          >
            {T.billingPage.success.backToBilling}
          </button>
          {isFail && sessionIdRef.current && (
            <button
              type="button"
              onClick={() => { void runSync(sessionIdRef.current!); }}
              style={{
                padding:      '10px 22px',
                borderRadius: 10,
                border:       '1px solid var(--violet)',
                background:   'transparent',
                color:        'var(--violet-text)',
                fontWeight:   600,
                fontSize:     14,
                cursor:       'pointer',
              }}
            >
              {T.billingPage.success.retrySync}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
