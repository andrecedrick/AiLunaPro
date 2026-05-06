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
import { syncSession } from '../lib/billing/stripeClient';

type SyncState = 'idle' | 'syncing' | 'synced' | 'failed';

function extractSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  const href   = window.location.href;
  const hash   = window.location.hash;
  const search = window.location.search;

  console.log('[BillingSuccess] href=',   href);
  console.log('[BillingSuccess] hash=',   hash);
  console.log('[BillingSuccess] search=', search);

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

function friendlyError(raw: string): string {
  if (raw.toLowerCase().includes('not yet completed')) {
    return 'Payment is still being processed. Please wait a moment and try again.';
  }
  if (raw.toLowerCase().includes('no such checkout session')) {
    return 'This checkout session is no longer valid. Please start a new subscription.';
  }
  if (raw.toLowerCase().includes('not authenticated')) {
    return 'You are not signed in. Please sign in and retry.';
  }
  if (raw.toLowerCase().includes('orgid')) {
    return 'Could not link this subscription to your organization. Please contact support.';
  }
  return 'Something went wrong while activating your subscription.';
}

export function BillingSuccessPage() {
  const { navigate }      = useRoute();
  const { hasActiveSubscription, subscription, refreshSubscription } = useBilling();

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
      console.log('[BillingSuccess] sync-session request started — sessionId=', sid);
      const result = await syncSession(sid, idToken);
      console.log('[BillingSuccess] sync-session response — orgId=', result.orgId, 'plan=', result.subscription.plan);
      // Force BillingContext to fetch the freshly-written Firestore doc
      await refreshSubscription();
      console.log('[BillingSuccess] refreshSubscription complete');
      setState('synced');
      try { window.sessionStorage.removeItem('stripe.lastSessionId'); } catch { /* ignore */ }
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Sync failed';
      console.error('[BillingSuccess] sync-session failed:', err);
      setErrMsg(friendlyError(raw));
      setState('failed');
    }
  };

  // One-shot: extract sessionId, kick off sync
  useEffect(() => {
    if (triggeredRef.current) return;
    const sid = extractSessionId();
    sessionIdRef.current = sid;
    console.log('[BillingSuccess] extracted sessionId=', sid);
    if (!sid) {
      setErrMsg('We could not detect your checkout session. Please return to Billing and try again.');
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
    isFail                                 ? 'Sync failed'
    : hasActiveSubscription                ? `Your ${subscription.plan} plan is active`
    : 'Thank you — your subscription is being activated';

  const subtext =
    isFail                                 ? (errMsg ?? 'We could not finalize your subscription automatically.')
    : hasActiveSubscription                ? 'Redirecting you to Billing…'
    : 'We are syncing your subscription with Stripe.';

  const pillLabel =
    isFail                                 ? 'Sync failed'
    : hasActiveSubscription                ? 'Subscription activated'
    : state === 'syncing'                  ? 'Syncing subscription…'
    : 'Almost done…';

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
              background:   'var(--violet)',
              color:        '#fff',
              fontWeight:   600,
              fontSize:     14,
              cursor:       'pointer',
            }}
          >
            Back to Billing
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
              Retry sync
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
