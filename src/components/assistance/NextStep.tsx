import { useState } from 'react';
import { SectionTitle } from './SectionTitle';
import type { AuditResult } from '../../types/scoring';
import { getNextStep } from '../../lib/scoring/assistance';

const SAVED_KEY = 'ailunapro-assistance-saved-at';

export function NextStep({ result }: { result: AuditResult }) {
  const step = getNextStep(result);
  const [savedAt, setSavedAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SAVED_KEY);
    } catch {
      return null;
    }
  });
  const [reminderSet, setReminderSet] = useState(false);
  const [exported, setExported] = useState(false);

  const handle = (kind: 'save' | 'remind' | 'export' | 'browse') => {
    if (kind === 'save') {
      const ts = new Date().toISOString();
      try {
        localStorage.setItem(SAVED_KEY, ts);
      } catch {
        /* ignore */
      }
      setSavedAt(ts);
    } else if (kind === 'remind') {
      setReminderSet(true);
      setTimeout(() => setReminderSet(false), 4000);
    } else if (kind === 'export') {
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    }
  };

  const featuredRec = step.primaryRecId
    ? result.recommendations.find(r => r.id === step.primaryRecId)
    : null;

  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 24,
        marginBottom: 20,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <SectionTitle eyebrow="06 · Recommended" title="Your next step" />

      <div
        style={{
          background: 'var(--brand-gradient)',
          borderRadius: 16,
          padding: '24px 26px',
          color: '#fff',
          boxShadow: 'var(--card-shadow-glow)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blob */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.15)',
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Next 1 thing
          </div>
          <h3
            style={{
              margin: 0,
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: -0.3,
              lineHeight: 1.25,
              maxWidth: 640,
            }}
          >
            {step.headline}
          </h3>
          <p
            style={{
              margin: '10px 0 0',
              fontSize: 14,
              lineHeight: 1.6,
              opacity: 0.92,
              maxWidth: 720,
            }}
          >
            {step.rationale}
          </p>

          {featuredRec && (
            <div
              style={{
                marginTop: 14,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.8 }}>
                {featuredRec.id}
              </span>
              <span>·</span>
              <span>{featuredRec.title}</span>
            </div>
          )}

          {/* CTAs */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              marginTop: 18,
            }}
          >
            {step.ctas.map(c => {
              const isSave = c.kind === 'save';
              const isRemind = c.kind === 'remind';
              const isExport = c.kind === 'export';
              const isPrimary = isSave;
              return (
                <button
                  key={c.kind + c.label}
                  type="button"
                  onClick={() => handle(c.kind)}
                  style={{
                    background: isPrimary ? '#fff' : 'rgba(255,255,255,0.15)',
                    border: isPrimary ? 'none' : '1.5px solid rgba(255,255,255,0.4)',
                    color: isPrimary ? 'var(--violet-text)' : '#fff',
                    padding: '10px 18px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {isSave && savedAt ? '✓ Saved' : isRemind && reminderSet ? '✓ Reminder set' : isExport && exported ? '✓ Exported' : c.label}
                </button>
              );
            })}
          </div>

          {savedAt && (
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 11,
                opacity: 0.8,
                fontStyle: 'italic',
              }}
            >
              Saved locally at {new Date(savedAt).toLocaleString()}.
            </p>
          )}
        </div>
      </div>

      <p
        style={{
          margin: '14px 0 0',
          fontSize: 12,
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          fontStyle: 'italic',
          textAlign: 'center',
        }}
      >
        We'll keep this plan available locally — no upload, no account upgrade required.
        Come back whenever your team is ready to act.
      </p>
    </section>
  );
}
