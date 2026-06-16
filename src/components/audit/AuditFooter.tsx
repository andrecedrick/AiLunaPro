import { useState } from 'react';
import { Button } from '../ui/Button';
import { useAudit } from '../../context/AuditContext';
import { useRoute } from '../../context/RouteContext';
import { useLocale } from '../../context/LocaleContext';
import { track } from '../../lib/analytics/track';

export function AuditFooter() {
  const { isFirst, isLast, prevStep, nextStep, saveProgress, submitAudit } = useAudit();
  const { navigate } = useRoute();
  const F = useLocale().auditForm;
  const [savedFlash, setSavedFlash] = useState(false);

  const handleSaveContinue = () => {
    saveProgress();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
    nextStep();
  };

  const handleSaveOnly = () => {
    saveProgress();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const handleSubmit = () => {
    const id = submitAudit();
    track('audit_completed', { type: 'full' });
    navigate({ name: 'audit/result', auditId: id });
  };

  return (
    <div
      style={{
        marginTop: 20,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        position: 'sticky',
        bottom: 16,
        zIndex: 5,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <Button
        variant="ghost"
        size="md"
        onClick={prevStep}
        disabled={isFirst}
        style={{ opacity: isFirst ? 0.45 : 1, cursor: isFirst ? 'not-allowed' : 'pointer' }}
      >
        {F.previous}
      </Button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {savedFlash && (
          <span
            style={{
              fontSize: 12,
              color: 'var(--green-text)',
              fontWeight: 600,
              transition: 'opacity 0.2s',
            }}
          >
            {F.saved}
          </span>
        )}

        <Button variant="secondary" size="md" onClick={handleSaveOnly}>
          {F.saveDraft}
        </Button>

        {!isLast ? (
          <Button variant="primary" size="md" onClick={handleSaveContinue}>
            {F.saveContinue}
          </Button>
        ) : (
          <Button variant="primary" size="md" onClick={handleSubmit}>
            {F.submit}
          </Button>
        )}
      </div>
    </div>
  );
}
