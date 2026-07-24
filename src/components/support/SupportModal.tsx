/**
 * SupportModal — S2 (Support tickets).
 *
 * A small, fast modal to report an issue: type (bug/question/billing, required),
 * description (required), email (auto-filled + read-only when authenticated, else
 * manual), and an optional priority. On submit it POSTs to /api/support/ticket
 * with page context and shows a success toast. Separate from feedback + Luna.
 */

import { useState, type CSSProperties } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRoute } from '../../context/RouteContext';
import { useLocale } from '../../context/LocaleContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useToast } from '../../hooks/useToast';
import { inputStyle, primaryBtnStyle } from '../ui-tools';
import { submitSupportTicket, friendlySupportError, type SupportType, type SupportPriority } from '../../lib/support/supportClient';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const APP_VERSION = import.meta.env.VITE_APP_VERSION as string | undefined;

interface Errors { type?: string; description?: string; email?: string; phone?: string }

/**
 * Phone is MANDATORY (operators must be able to call back). Mirrors the worker's
 * server-authoritative rule: optional leading '+', 7–15 digits once separators
 * are stripped. The server re-validates — this is UX, not the boundary.
 */
function isValidPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export function SupportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const T = useLocale().support;
  const { session } = useAuth();
  const { route } = useRoute();
  const { language } = usePreferences();
  const { showToast } = useToast();

  const authedEmail = session?.user.email ?? '';
  const authed = !!session;

  const [type, setType]               = useState<SupportType | ''>('');
  const [description, setDescription] = useState('');
  const [email, setEmail]             = useState('');
  const [phone, setPhone]             = useState('');
  const [priority, setPriority]       = useState<SupportPriority | null>(null);
  const [errors, setErrors]           = useState<Errors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting]   = useState(false);

  if (!open) return null;

  const reset = () => {
    setType(''); setDescription(''); setEmail(''); setPriority(null);
    setErrors({}); setGeneralError(null); setSubmitting(false);
  };
  const close = () => { reset(); onClose(); };

  const typeOptions: { value: SupportType; label: string }[] = [
    { value: 'bug',      label: T.typeBug },
    { value: 'question', label: T.typeQuestion },
    { value: 'billing',  label: T.typeBilling },
  ];
  const prioOptions: { value: SupportPriority; label: string }[] = [
    { value: 'low',    label: T.prioLow },
    { value: 'medium', label: T.prioMedium },
    { value: 'high',   label: T.prioHigh },
  ];

  const onSubmit = async () => {
    if (submitting) return;
    const finalEmail = authed ? authedEmail : email.trim();
    const err: Errors = {};
    if (!type)                                    err.type = T.errType;
    if (description.trim().length === 0)          err.description = T.errDescription;
    if (!authed && !EMAIL_RE.test(finalEmail))    err.email = T.errEmail;
    // Phone is required for EVERY ticket (authed included — the token carries no
    // phone), and must be well-formed. Empty is never accepted.
    if (phone.trim().length === 0)                err.phone = 'Phone number is required';
    else if (!isValidPhone(phone))                err.phone = 'Enter a valid phone number';
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setSubmitting(true); setGeneralError(null);
    try {
      await submitSupportTicket({
        type: type as SupportType,
        description: description.trim(),
        email: finalEmail,
        phone: phone.trim(),
        priority: priority ?? undefined,
        context: { route: route.name, locale: language, appVersion: APP_VERSION },
      });
      showToast(T.success, 'success');
      close();
    } catch (e) {
      setGeneralError(friendlySupportError(e));
      setSubmitting(false);
    }
  };

  const chip = (active: boolean): CSSProperties => ({
    padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: active ? '1px solid var(--violet)' : '1px solid var(--border)',
    background: active ? 'rgba(124,58,237,0.08)' : 'transparent',
    color: active ? 'var(--violet-text)' : 'var(--text-secondary)',
    transition: 'all 0.15s ease',
  });
  const label: CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 };
  const errLine: CSSProperties = { color: 'var(--red-text)', fontSize: 12, marginTop: 4 };

  return (
    <div
      onClick={close}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={T.title}
        style={{ width: '100%', maxWidth: 460, background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', padding: 24, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{T.title}</h2>
          <button type="button" onClick={close} aria-label={T.close} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 2 }}>×</button>
        </div>
        <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{T.subtitle}</p>

        {/* Type — required */}
        <div style={{ marginBottom: 16 }}>
          <span style={label}>{T.typeLabel} <span style={{ color: 'var(--red-text)' }}>*</span></span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {typeOptions.map(o => (
              <button key={o.value} type="button" aria-pressed={type === o.value} onClick={() => setType(o.value)} style={chip(type === o.value)}>{o.label}</button>
            ))}
          </div>
          {errors.type && <div style={errLine}>{errors.type}</div>}
        </div>

        {/* Description — required */}
        <div style={{ marginBottom: 16 }}>
          <label style={label}>{T.descriptionLabel} <span style={{ color: 'var(--red-text)' }}>*</span></label>
          <textarea
            value={description} onChange={e => setDescription(e.target.value)} maxLength={2000} rows={4}
            placeholder={T.descriptionPlaceholder} style={{ ...inputStyle(), resize: 'vertical', minHeight: 90 }}
          />
          {errors.description && <div style={errLine}>{errors.description}</div>}
        </div>

        {/* Email — auto-filled (read-only) when authed, else manual */}
        <div style={{ marginBottom: 16 }}>
          <label style={label}>{T.emailLabel} {!authed && <span style={{ color: 'var(--red-text)' }}>*</span>}</label>
          {authed ? (
            <input type="email" value={authedEmail} readOnly aria-readonly="true" style={{ ...inputStyle(), opacity: 0.7, cursor: 'not-allowed' }} />
          ) : (
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={T.emailPlaceholder} style={inputStyle()} />
          )}
          {errors.email && <div style={errLine}>{errors.email}</div>}
        </div>

        {/* Phone — REQUIRED for every ticket (no verified phone on the token). */}
        <div style={{ marginBottom: 16 }}>
          <label style={label}>Phone <span style={{ color: 'var(--red-text)' }}>*</span></label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+33 6 12 34 56 78"
            aria-required="true"
            aria-invalid={errors.phone ? true : undefined}
            style={inputStyle()}
          />
          {errors.phone && <div style={errLine}>{errors.phone}</div>}
        </div>

        {/* Priority — optional */}
        <div style={{ marginBottom: 20 }}>
          <span style={label}>{T.priorityLabel} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{T.optional}</span></span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {prioOptions.map(o => (
              <button key={o.value} type="button" aria-pressed={priority === o.value} onClick={() => setPriority(p => (p === o.value ? null : o.value))} style={chip(priority === o.value)}>{o.label}</button>
            ))}
          </div>
        </div>

        {generalError && (
          <div style={{ marginBottom: 14, padding: 10, borderRadius: 8, background: 'var(--red-soft-bg)', color: 'var(--red-text)', fontSize: 13 }}>{generalError}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => void onSubmit()} disabled={submitting} style={{ ...primaryBtnStyle(), opacity: submitting ? 0.6 : 1, cursor: submitting ? 'wait' : 'pointer' }}>
            {submitting ? T.submitting : T.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
