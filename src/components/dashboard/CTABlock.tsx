import { useState } from 'react';
import { useRoute } from '../../context/RouteContext';
import { useAuth } from '../../context/AuthContext';
import { useBilling } from '../../context/BillingContext';
import { useToast } from '../../hooks/useToast';

export function CTABlock() {
  const { navigate } = useRoute();
  const { isAuthenticated } = useAuth();
  const { hasActiveSubscription } = useBilling();
  const { showToast } = useToast();
  const [demoOpen, setDemoOpen] = useState(false);

  const handleStartTrial = () => {
    if (!isAuthenticated) navigate({ name: 'signup' });
    else if (hasActiveSubscription) showToast('You already have an active plan.', 'info');
    else navigate({ name: 'billing' });
  };

  return (
    <div
      style={{
        borderRadius: 'var(--card-radius)',
        background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 40%, #22D3EE 100%)',
        padding: '40px 48px',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 32,
        boxShadow: 'var(--card-shadow)',
      }}
    >
      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} onSubmit={() => { setDemoOpen(false); showToast("Demo request captured. We'll review it and get back to you.", 'success'); }} />}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -60,
          left: '35%',
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 20,
            padding: '4px 12px',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.5,
            marginBottom: 14,
          }}
        >
          ✨ Powered by Luna AI
        </div>
        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 26,
            lineHeight: 1.2,
            letterSpacing: -0.5,
          }}
        >
          Ready to achieve full AI compliance?
        </h2>
        <p
          style={{
            margin: '10px 0 0',
            fontSize: 14,
            opacity: 0.85,
            lineHeight: 1.6,
            maxWidth: 480,
          }}
        >
          Join organizations using AiLunaPro to automate their compliance
          workflows, reduce risk, and build trust with stakeholders.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, flexShrink: 0, position: 'relative', zIndex: 1 }}>
        <button
          type="button"
          onClick={() => setDemoOpen(true)}
          style={{
            background: 'var(--cta-glass-bg)',
            border: '1.5px solid var(--cta-glass-border)',
            color: '#fff',
            borderRadius: 12,
            padding: '12px 24px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            backdropFilter: 'blur(4px)',
            whiteSpace: 'nowrap',
          }}
        >
          Schedule Demo
        </button>
        <button
          type="button"
          onClick={handleStartTrial}
          style={{
            background: '#fff',
            border: 'none',
            color: '#7C3AED',
            borderRadius: 12,
            padding: '12px 24px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
          }}
        >
          Start Free Trial →
        </button>
      </div>
    </div>
  );
}

/* ── Demo modal (J1.3G) ─────────────────────────────────── */

function DemoModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 500, padding: 24, color: 'var(--text-primary)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 28, maxWidth: 480, width: '100%',
          boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
        }}
      >
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>Schedule a demo</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-muted)' }}>
          Tell us a bit about your team and we'll be in touch.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={inputStyle()} />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email" type="email" style={inputStyle()} />
          <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" style={inputStyle()} />
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="What would you like to discuss?" rows={3} style={{ ...inputStyle(), resize: 'vertical', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button type="button" onClick={onClose} style={btnGhost()}>Cancel</button>
          <button type="button" onClick={onSubmit} disabled={!name || !email} style={btnPrimary(!name || !email)}>
            Request demo
          </button>
        </div>
      </div>
    </div>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--surface)',
    color: 'var(--text-primary)', fontSize: 13, outline: 'none',
  };
}
function btnGhost(): React.CSSProperties {
  return { padding: '9px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer' };
}
function btnPrimary(disabled = false): React.CSSProperties {
  return { padding: '9px 18px', borderRadius: 8, border: 'none', background: disabled ? 'var(--text-muted)' : 'var(--violet)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 };
}
