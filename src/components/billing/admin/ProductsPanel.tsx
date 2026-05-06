/**
 * Products & Prices panel — Phase J1.3 (owner-only).
 * Per-plan, per-currency price grid. "Update price" creates new Stripe Price.
 */

import { useEffect, useState } from 'react';
import { fetchAdminProducts } from '../../../lib/billing/adminClient';
import {
  CURRENCY_SYMBOLS,
  type AdminProduct,
  type Currency,
  type Plan,
} from '../../../types/billingAdmin';
import { formatMoney } from '../../../lib/billing/currencyFormat';
import { panelCard, panelTitle, panelSubtitle, button, pill } from './panelStyles';
import { PriceUpdateModal } from './PriceUpdateModal';

interface Props {
  orgId:             string;
  enabledCurrencies: Currency[];
}

export function ProductsPanel({ orgId, enabledCurrencies }: Props) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [modal, setModal] = useState<{ plan: Plan; currency?: Currency } | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const { auth } = await import('../../../lib/firebase-auth');
      const idToken  = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      setProducts(await fetchAdminProducts(orgId, idToken));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section style={panelCard}>
      <h3 style={panelTitle}>Products & Prices</h3>
      <p style={panelSubtitle}>
        Stripe products: Starter / Professional / Enterprise. Updating a price creates a new
        Stripe Price — existing subscribers are unaffected.
      </p>

      {err && (
        <div style={{ padding: 10, background: 'var(--red-soft-bg)', color: 'var(--red-text)', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
          {err}
        </div>
      )}

      {loading && products.length === 0 && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading products…</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {products.map(p => (
          <div key={p.plan} style={{
            border: '1px solid var(--border)', borderRadius: 12, padding: 16, background: 'var(--surface)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.productId}</div>
              </div>
              <span style={pill(p.active ? 'ok' : 'err')}>{p.active ? 'active' : 'archived'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {enabledCurrencies.map(cur => {
                const cell = p.pricesByCurrency[cur];
                return (
                  <div key={cur} style={{
                    border: cell ? '1px solid var(--border)' : '1px dashed var(--border)',
                    borderRadius: 10, padding: 12,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                        {cur.toUpperCase()} {CURRENCY_SYMBOLS[cur]}
                      </span>
                      {cell && <span style={pill(cell.active ? 'ok' : 'muted')}>{cell.active ? 'active' : 'inactive'}</span>}
                    </div>
                    {cell ? (
                      <>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatMoney(cell.amount, cell.currency)}
                          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>
                            /{cell.interval}
                          </span>
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 4 }}>
                          {cell.priceId}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No price set</div>
                    )}
                    <button
                      type="button"
                      style={{ ...button(false), marginTop: 8, padding: '6px 12px', fontSize: 11 }}
                      onClick={() => setModal({ plan: p.plan, currency: cur })}
                    >
                      {cell ? 'Update price' : 'Create price'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <button type="button" style={button(false)} onClick={() => void load()} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {modal && (
        <PriceUpdateModal
          orgId={orgId}
          plan={modal.plan}
          enabledCurrencies={enabledCurrencies}
          initialCurrency={modal.currency}
          onClose={() => setModal(null)}
          onCreated={() => { setModal(null); void load(); }}
        />
      )}
    </section>
  );
}
