import { useState, type ReactNode, type CSSProperties } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRoute } from '../../context/RouteContext';
import { useLocale } from '../../context/LocaleContext';
import { SupportModal } from '../support/SupportModal';

/**
 * B1 — minimal adaptive chrome for the public/chromeless campaign pages
 * (#/diagnostic, #/roi-calculator). Anonymous visitors get brand + Log in / Sign up
 * (navigation only — NO tracking/lead-capture; that is B2). Authenticated users get
 * brand + a "← Back to app" return path. Deterministic; no LLM; no funnel-content change.
 */
const LOGO_URL = 'https://res.cloudinary.com/dhtnegf9d/image/upload/v1777320369/6_xldhxr.png';

export function CampaignChrome({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const { navigate } = useRoute();
  const T = useLocale();
  const [supportOpen, setSupportOpen] = useState(false);
  const authed = !!session;

  const link: CSSProperties = {
    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--violet-text, var(--violet))',
  };
  const primary: CSSProperties = {
    padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
    background: 'var(--brand-gradient, var(--violet))', color: '#fff',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, padding: '10px 18px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={LOGO_URL} alt="AiLunaPro" style={{ height: 26, width: 'auto' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button type="button" style={{ ...link, color: 'var(--text-secondary)' }} onClick={() => setSupportOpen(true)}>{T.support.cta}</button>
          {authed ? (
            <button type="button" style={link} onClick={() => navigate({ name: 'dashboard' })}>← Back to app</button>
          ) : (
            <>
              <button type="button" style={link} onClick={() => navigate({ name: 'login' })}>Log in</button>
              <button type="button" style={primary} onClick={() => navigate({ name: 'signup' })}>Sign up</button>
            </>
          )}
        </div>
      </header>
      {children}
      {supportOpen && <SupportModal open onClose={() => setSupportOpen(false)} />}
    </div>
  );
}
