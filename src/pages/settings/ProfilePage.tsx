import { useEffect, useState } from 'react';
import { SettingsLayout } from './SettingsLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { FormField, AuthInput } from '../../components/auth/FormField';
import { Button } from '../../components/ui/Button';
import { resolveLayer } from '../../lib/featureFlags';
import { firebaseGetEmailVerified, firebaseSendEmailVerification } from '../../lib/auth/firebaseAuthService';

/**
 * Settings — Profile.
 * Edit displayName + email. Trigger password reset email via Firebase Auth
 * when running in firebase mode (mock mode shows a "sent" toast).
 */
export function ProfilePage() {
  const { session, updateProfile, resetPassword } = useAuth();
  const { showToast } = useToast();

  const user = session?.user;

  const [name, setName]   = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  // Email verification (firebase layer only). null = unknown/resolving.
  const isFirebase = resolveLayer('auth') === 'firebase';
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);

  const dirty = name !== (user?.displayName ?? '') || email !== (user?.email ?? '');

  useEffect(() => {
    if (!isFirebase) return;
    let active = true;
    firebaseGetEmailVerified({ reload: true })
      .then(v => { if (active) setEmailVerified(v); })
      .catch(() => { if (active) setEmailVerified(null); });
    return () => { active = false; };
  }, [isFirebase]);

  const onVerifyEmail = async () => {
    if (verifying) return;
    setVerifying(true);
    const res = await firebaseSendEmailVerification();
    setVerifying(false);
    if (res.success) {
      showToast(`Verification email sent to ${email}. Check inbox and spam/promotions, then sign out and back in.`, 'success');
    } else {
      showToast(res.error ?? 'Could not send verification email.', 'error');
    }
  };

  const onSave = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    const res = await updateProfile(name, email);
    setSaving(false);

    if (res.success) {
      showToast('Profile updated.', 'success');
    } else if (res.error === 'coming-soon') {
      showToast('Profile editing on Firebase coming soon.', 'info');
    } else {
      showToast(res.error ?? 'Could not update profile.', 'error');
    }
  };

  const onResetPassword = async () => {
    if (!email || resetting) return;
    setResetting(true);
    const res = await resetPassword(email);
    setResetting(false);
    if (res.success) {
      showToast(`Password reset email sent to ${email}.`, 'success');
    } else {
      showToast(res.error ?? 'Could not send password reset email.', 'error');
    }
  };

  return (
    <SettingsLayout title="Profile">
      <div
        style={{
          display: 'grid',
          gap: 18,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 22,
        }}
      >
        {/* Avatar (read-only initials) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--brand-gradient)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            {user?.initials ?? '??'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Avatar is generated from your initials. Custom upload coming later.
          </div>
        </div>

        <FormField label="Display name">
          <AuthInput
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </FormField>

        <FormField label="Email">
          <AuthInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </FormField>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button
            variant="primary"
            size="md"
            onClick={onSave}
            disabled={!dirty || saving}
            style={!dirty || saving ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>

      {/* Security card */}
      <div
        style={{
          marginTop: 22,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 22,
        }}
      >
        {/* Email verification (firebase only) */}
        {isFirebase && emailVerified !== null && (
          <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, marginBottom: 6, color: 'var(--text-primary)' }}>
              Email verification
            </h3>
            {emailVerified ? (
              <p style={{ fontSize: 12, color: 'var(--green-text)', margin: 0 }}>
                ✓ Your email is verified.
              </p>
            ) : (
              <>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 0, marginBottom: 12 }}>
                  Your email is <strong>not verified</strong>. Some features (e.g. platform
                  operator access) require a verified email. We'll send a verification link;
                  after confirming, sign out and back in.
                </p>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={onVerifyEmail}
                  disabled={verifying}
                  style={verifying ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                >
                  {verifying ? 'Sending…' : 'Send verification email'}
                </Button>
              </>
            )}
          </div>
        )}

        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            margin: 0,
            marginBottom: 6,
            color: 'var(--text-primary)',
          }}
        >
          Password
        </h3>
        <p
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            marginTop: 0,
            marginBottom: 14,
          }}
        >
          We will send a reset link to your email. The link expires after one hour.
        </p>
        <Button
          variant="ghost"
          size="md"
          onClick={onResetPassword}
          disabled={resetting || !email}
          style={resetting || !email ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
        >
          {resetting ? 'Sending…' : 'Send password reset email'}
        </Button>
      </div>
    </SettingsLayout>
  );
}
