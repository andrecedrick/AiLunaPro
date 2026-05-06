/**
 * Promo Codes panel — Phase J1.3B (owner-only).
 * List + Create + Disable Stripe promotion codes.
 */

import { useEffect, useState } from 'react';
import {
  fetchPromoCodes,
  createPromoCode,
  disablePromoCode,
} from '../../../lib/billing/adminClient';
import type { PromoCode, Plan, CreatePromoInput } from '../../../types/billingAdmin';
import { panelCard, panelTitle, panelSubtitle, button, fieldLabel, input, pill } from './panelStyles';

export function PromoCodesPanel({ orgId }: { orgId: string }) {
  const [codes, setCodes]     = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const { auth } = await import('../../../lib/firebase-auth');
      const idToken  = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      setCodes(await fetchPromoCodes(orgId, idToken));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load promo codes');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDisable = async (id: string) => {
    setErr(null);
    try {
      const { auth } = await import('../../../lib/firebase-auth');
      const idToken  = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      await disablePromoCode(orgId, id, idToken);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Disable failed');
    }
  };

  return (
    <section style={panelCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <h3 style={panelTitle}>Promotion Codes</h3>
          <p style={panelSubtitle}>Stripe coupons + redeemable codes. Used at checkout.</p>
        </div>
        <button type="button" style={button(true)} onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : 'Create promo code'}
        </button>
      </div>

      {err && (
        <div style={{ padding: 10, background: 'var(--red-soft-bg)', color: 'var(--red-text)', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
          {err}
        </div>
      )}

      {showForm && (
        <CreatePromoForm
          orgId={orgId}
          onCreated={() => { setShowForm(false); void load(); }}
          onError={msg => setErr(msg)}
        />
      )}

      {loading && codes.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: 8 }}>Loading…</div>
      ) : codes.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: 16, border: '1px dashed var(--border)', borderRadius: 8 }}>
          No promo codes yet.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Code', 'Off', 'Duration', 'Applies to', 'Redeemed', 'Expires', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < codes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700 }}>{c.code}</td>
                  <td style={{ padding: '12px' }}>{c.percentOff}%</td>
                  <td style={{ padding: '12px' }}>
                    {c.duration === 'repeating' ? `${c.durationInMonths}mo` : c.duration}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {c.appliesTo === 'all' ? 'All plans' : c.appliesTo}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {c.timesRedeemed}{c.maxRedemptions ? ` / ${c.maxRedemptions}` : ''}
                  </td>
                  <td style={{ padding: '12px', fontSize: 11, color: 'var(--text-muted)' }}>
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={pill(c.active ? 'ok' : 'muted')}>{c.active ? 'active' : 'inactive'}</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {c.active && (
                      <button type="button" style={{ ...button(false), padding: '5px 10px', fontSize: 11 }} onClick={() => void onDisable(c.id)}>
                        Disable
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ── Create form ──────────────────────────────────────── */

function CreatePromoForm({ orgId, onCreated, onError }: {
  orgId: string;
  onCreated: () => void;
  onError: (msg: string) => void;
}) {
  const [code, setCode]                   = useState('');
  const [percentOff, setPercentOff]       = useState(20);
  const [duration, setDuration]           = useState<CreatePromoInput['duration']>('once');
  const [durationInMonths, setMonths]     = useState(3);
  const [maxRedemptions, setMaxRed]       = useState(0);
  const [expiresAt, setExpiresAt]         = useState('');
  const [appliesTo, setAppliesTo]         = useState<Plan | 'all'>('all');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const { auth } = await import('../../../lib/firebase-auth');
      const idToken  = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      const input: CreatePromoInput = {
        orgId,
        ...(code.trim() ? { code: code.trim().toUpperCase() } : {}),
        percentOff,
        duration,
        ...(duration === 'repeating' ? { durationInMonths } : {}),
        ...(maxRedemptions > 0 ? { maxRedemptions } : {}),
        ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
        appliesTo,
      };
      await createPromoCode(input, idToken);
      onCreated();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Create failed');
    } finally { setBusy(false); }
  };

  return (
    <div style={{ marginBottom: 18, padding: 16, background: 'var(--surface-2, transparent)', border: '1px solid var(--border)', borderRadius: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <div>
          <label style={fieldLabel}>Code (blank = auto)</label>
          <input type="text" placeholder="WELCOME20" value={code} onChange={e => setCode(e.target.value)} style={input} />
        </div>
        <div>
          <label style={fieldLabel}>% off</label>
          <input type="number" min={1} max={100} value={percentOff} onChange={e => setPercentOff(Number(e.target.value))} style={input} />
        </div>
        <div>
          <label style={fieldLabel}>Duration</label>
          <select value={duration} onChange={e => setDuration(e.target.value as CreatePromoInput['duration'])} style={input}>
            <option value="once">Once</option>
            <option value="repeating">Repeating</option>
            <option value="forever">Forever</option>
          </select>
        </div>
        {duration === 'repeating' && (
          <div>
            <label style={fieldLabel}>Months</label>
            <input type="number" min={1} value={durationInMonths} onChange={e => setMonths(Number(e.target.value))} style={input} />
          </div>
        )}
        <div>
          <label style={fieldLabel}>Max redemptions (0 = unlimited)</label>
          <input type="number" min={0} value={maxRedemptions} onChange={e => setMaxRed(Number(e.target.value))} style={input} />
        </div>
        <div>
          <label style={fieldLabel}>Expires (optional)</label>
          <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} style={input} />
        </div>
        <div>
          <label style={fieldLabel}>Applies to</label>
          <select value={appliesTo} onChange={e => setAppliesTo(e.target.value as Plan | 'all')} style={input}>
            <option value="all">All plans</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>
      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button type="button" style={button(true)} onClick={() => void submit()} disabled={busy}>
          {busy ? 'Creating…' : 'Create promo code'}
        </button>
      </div>
    </div>
  );
}
