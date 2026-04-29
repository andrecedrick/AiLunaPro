import { useEffect, useState } from 'react';
import { RoleSelector } from '../auth/RoleSelector';
import { AuthInput, FormField } from '../auth/FormField';
import { Button } from '../ui/Button';
import { inviteValidate } from '../../utils/validators/auth';
import type { UserRole } from '../../types/auth';

interface InviteModalProps {
  currentUserRole: UserRole;
  onClose: () => void;
  onInvite: (email: string, name: string, role: UserRole) => void;
}

export function InviteModal({ currentUserRole, onClose, onInvite }: InviteModalProps) {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [role,    setRole]    = useState<UserRole>('member');
  const [errors,  setErrors]  = useState<Partial<Record<'email' | 'name', string>>>({});
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  /* Escape key */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSend = () => {
    const errs = inviteValidate(name, email);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSending(true);
    /* Simulate network delay */
    setTimeout(() => {
      onInvite(email, name, role);
      setSending(false);
      setSent(true);
    }, 500);
  };

  /* "Owner" can only be assigned by another owner. */
  const disabledRoles: UserRole[] = currentUserRole !== 'owner' ? ['owner'] : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-dialog-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 200,
        padding: '60px 24px 24px',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--card-radius)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
          width: '100%',
          maxWidth: 480,
          padding: 28,
        }}
      >
        {sent ? (
          /* Success state */
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'var(--green-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3
              style={{
                margin: '0 0 8px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 18,
                color: 'var(--text-primary)',
              }}
            >
              Invite sent!
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
              {name} will appear as <strong>Pending</strong> until they accept the invitation.
            </p>
            <Button variant="primary" size="md" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3
                id="invite-dialog-title"
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 18,
                  color: 'var(--text-primary)',
                  letterSpacing: -0.3,
                }}
              >
                Invite team member
              </h3>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: 20,
                  lineHeight: 1,
                  padding: 4,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <FormField label="Full name" error={errors.name}>
                <AuthInput
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                  autoFocus
                />
              </FormField>

              <FormField label="Email address" error={errors.email}>
                <AuthInput
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                />
              </FormField>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: 8,
                    letterSpacing: 0.2,
                  }}
                >
                  Role
                </div>
                <RoleSelector
                  value={role}
                  onChange={setRole}
                  disabledRoles={disabledRoles}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 24,
                paddingTop: 18,
                borderTop: '1px dashed var(--border)',
              }}
            >
              <Button variant="ghost" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleSend} disabled={sending}>
                {sending ? 'Sending…' : 'Send invite'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
