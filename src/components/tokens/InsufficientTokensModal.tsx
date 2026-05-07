/**
 * InsufficientTokensModal — Phase J1.4A.
 *
 * Shown when an action requires more tokens than the org currently has.
 * Surfaces 3 top-up packs (Starter / Pro / Max) and starts a Stripe
 * Checkout session for the chosen pack.
 *
 * USD-only in MVP — multi-currency is J2.
 *
 * Permission gating happens at the worker (`/api/tokens/topup` →
 * `requireRole(['owner','admin','billing'])`). For non-billing roles
 * the parent should hide this CTA entirely; if it ever opens for
 * a member, the worker will reject and the modal surfaces the error.
 */

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createTopupCheckout, type TokenPack } from '../../lib/tokens/tokensClient';

interface PackDef {
  pack:        TokenPack;
  label:       string;
  tokens:      number;
  blurb:       string;
  highlight?:  boolean;
}

const PACKS: PackDef[] = [
  { pack: 'starter', label: 'Starter', tokens:   5_000, blurb: 'Top off a low cycle.' },
  { pack: 'pro',     label: 'Pro',     tokens:  25_000, blurb: 'Most common refill.', highlight: true },
  { pack: 'max',     label: 'Max',     tokens: 100_000, blurb: 'Big workload boost.' },
];

interface Props {
  open:      boolean;
  onClose:   () => void;
  balance:   number;
  required:  number;
  /** Optional label of the action that failed (e.g. "Run audit"). */
  actionLabel?: string;
}

export function InsufficientTokensModal({ open, onClose, balance, required, actionLabel }: Props) {
  const { session } = useAuth();
  const [pendingPack, setPendingPack] = useState<TokenPack | null>(null);
  const [error,       setError]       = useState<string | null>(null);

  if (!open) return null;

  const orgId = session?.orgId ?? null;
  const role  = session?.role  ?? null;
  const canBuy = !!orgId && (role === 'owner' || role === 'admin' || role === 'billing');

  const handleBuy = async (pack: TokenPack) => {
    if (!canBuy || !orgId) return;
    setPendingPack(pack);
    setError(null);
    try {
      const { auth } = await import('../../lib/firebase-auth');
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      const url = await createTopupCheckout(orgId, pack, idToken);
      window.location.href = url;
    } catch (err) {
      console.error('[InsufficientTokensModal] topup failed:', err);
      setError(err instanceof Error ? err.message : 'Top-up failed');
      setPendingPack(null);
    }
  };

  const missing = Math.max(0, required - balance);

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 600,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '92%', maxWidth: 560,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 28,
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--red-soft-bg)', color: 'var(--red-text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><path d="M8 12h8 M12 8v8" />
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              Not enough tokens
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
              {actionLabel ? `${actionLabel} requires more tokens.` : 'This action requires more tokens.'}
            </p>
          </div>
        </div>

        {/* Balance vs required */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 20,
          padding: '14px 16px', borderRadius: 10,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
        }}>
          <Stat label="Balance"  value={balance.toLocaleString('en-US')} />
          <Stat label="Required" value={required.toLocaleString('en-US')} />
          <Stat label="Missing"  value={missing.toLocaleString('en-US')} accent="red" />
        </div>

        {!canBuy && (
          <div style={{
            padding: '12px 14px', borderRadius: 10,
            background: 'var(--yellow-soft-bg)', color: 'var(--yellow-text)',
            fontSize: 13, marginBottom: 16,
          }}>
            Ask an owner, admin, or billing manager to buy a token pack.
          </div>
        )}

        {/* Packs */}
        {canBuy && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {PACKS.map(p => (
              <button
                key={p.pack}
                type="button"
                disabled={pendingPack !== null}
                onClick={() => void handleBuy(p.pack)}
                style={{
                  textAlign: 'left',
                  padding: 14,
                  borderRadius: 12,
                  border: p.highlight ? '2px solid var(--violet)' : '1px solid var(--border)',
                  background: p.highlight ? 'rgba(124,58,237,0.06)' : 'var(--surface)',
                  cursor: pendingPack ? 'wait' : 'pointer',
                  opacity: pendingPack && pendingPack !== p.pack ? 0.5 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {p.label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: p.highlight ? 'var(--violet-text)' : 'var(--text-primary)', marginBottom: 4 }}>
                  +{p.tokens.toLocaleString('en-US')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {pendingPack === p.pack ? 'Redirecting…' : p.blurb}
                </div>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div style={{
            padding: '10px 12px', borderRadius: 8,
            background: 'var(--red-soft-bg)', color: 'var(--red-text)',
            fontSize: 12, marginBottom: 12,
          }}>
            {error}
          </div>
        )}

        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 16px' }}>
          Token packs are currently billed in USD. Top-up tokens never expire.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'red' }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 11, fontWeight: 600,
        color: 'var(--text-muted)', marginBottom: 4,
        whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 16, fontWeight: 700,
        color: accent === 'red' ? 'var(--red-text)' : 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {value}
      </div>
    </div>
  );
}
