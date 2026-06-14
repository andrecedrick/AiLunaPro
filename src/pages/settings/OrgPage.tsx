import { useState } from 'react';
import { SettingsLayout } from './SettingsLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { FormField, AuthInput } from '../../components/auth/FormField';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';

/**
 * Settings — Organization.
 * Owners can rename. Delete uses Option C: ConfirmDialog only, no backend
 * delete, no fake local delete, no logout — instead surfaces a clear
 * "coming later" message after confirmation.
 */
export function OrgPage() {
  const { session, updateOrgName } = useAuth();
  const { showToast } = useToast();
  const T = useLocale();
  const O = T.settingsPages.org;
  const C = T.common;

  const org  = session?.org;
  const role = session?.role;
  const isOwner = role === 'owner';

  const [name, setName]     = useState(org?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const dirty = name !== (org?.name ?? '');

  const onSave = async () => {
    if (!dirty || saving || !isOwner) return;
    setSaving(true);
    const res = await updateOrgName(name);
    setSaving(false);

    if (res.success) {
      showToast(O.renamedToast, 'success');
    } else {
      showToast(res.error ?? 'Could not update organization.', 'error');
    }
  };

  const onDeleteConfirmed = () => {
    // Option C: do not delete locally, do not call backend, do not log out.
    // Just notify the user that the feature is not available yet.
    setConfirming(false);
    showToast(O.deletionDeferredToast, 'info', 7000);
  };

  return (
    <SettingsLayout title={O.sectionTitle}>
      {/* Identity card */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 22,
          display: 'grid',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'var(--brand-gradient)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {org?.initials ?? '??'}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {org?.name ?? O.fallbackName}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Plan: <strong style={{ color: 'var(--text-secondary)' }}>{org?.plan ?? '—'}</strong>
            </div>
          </div>
        </div>

        <FormField label={O.nameLabel}>
          <AuthInput
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={O.namePlaceholder}
            disabled={!isOwner}
          />
        </FormField>

        {!isOwner && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '8px 12px',
            }}
          >
            {O.ownerOnlyNotice}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button
            variant="primary"
            size="md"
            onClick={onSave}
            disabled={!dirty || saving || !isOwner}
            style={
              !dirty || saving || !isOwner
                ? { opacity: 0.5, cursor: 'not-allowed' }
                : undefined
            }
          >
            {saving ? C.saving : C.saveChanges}
          </Button>
        </div>
      </div>

      {/* Plan card (read-only) */}
      <div
        style={{
          marginTop: 22,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 22,
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, marginBottom: 6, color: 'var(--text-primary)' }}>
          {O.planTitle}
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
          You are on the <strong style={{ color: 'var(--text-secondary)' }}>{org?.plan ?? '—'}</strong> plan.
          Plan management lives in Billing.
        </p>
      </div>

      {/* Danger zone */}
      {isOwner && (
        <div
          style={{
            marginTop: 22,
            background: 'var(--surface)',
            border: '1px solid var(--red-text, #DC2626)',
            borderRadius: 12,
            padding: 22,
          }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              margin: 0,
              marginBottom: 6,
              color: 'var(--red-text, #DC2626)',
            }}
          >
            {O.dangerZoneTitle}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 0, marginBottom: 14 }}>
            {O.dangerZoneHint}
          </p>
          <Button
            variant="ghost"
            size="md"
            onClick={() => setConfirming(true)}
            style={{ borderColor: 'var(--red-text, #DC2626)', color: 'var(--red-text, #DC2626)' }}
          >
            {O.deleteButton}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        title={format(O.deleteDialogTitle, { name: org?.name ?? 'this organization' })}
        message={
          <>
            <p style={{ margin: 0, marginBottom: 8 }}>
              {O.deleteDialogBody1}
            </p>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              {O.deleteDialogBody2}
            </p>
          </>
        }
        confirmLabel={O.deleteConfirmLabel}
        cancelLabel={C.cancel}
        destructive
        onConfirm={onDeleteConfirmed}
        onCancel={() => setConfirming(false)}
      />
    </SettingsLayout>
  );
}
