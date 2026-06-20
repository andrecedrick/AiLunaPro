/**
 * FeedbackPrompt — S1 (User feedback).
 *
 * An inline, non-intrusive strip shown beneath a tool result (quote / diagnostic
 * / roi / audit). Progressive: it shows only a one-tap satisfaction row until the
 * user rates, then reveals difficulty + the key "what prevented you" question +
 * an optional suggestion. Never a modal — it must not interrupt the main flow.
 *
 * Anonymous + best-effort: the rating is sent to /api/public/feedback with no
 * PII, the analytics event carries no free text, and a per-source localStorage
 * flag ensures it never nags the same visitor twice. Separate from support (S2)
 * and Luna (S3) by design.
 */

import { useState, type CSSProperties } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { useToast } from '../../hooks/useToast';
import { inputStyle } from '../ui-tools';
import { submitFeedback, type FeedbackDifficulty } from '../../lib/feedback/feedbackClient';
import { emit, type FeedbackSource } from '../../lib/analytics/events';

const DISMISS_PREFIX = 'ailunapro-feedback-v1-';
const FACES = ['😞', '🙁', '😐', '🙂', '😄'];

function alreadyHandled(source: FeedbackSource): boolean {
  try { return !!localStorage.getItem(DISMISS_PREFIX + source); } catch { return false; }
}
function markHandled(source: FeedbackSource, how: 'done' | 'dismissed') {
  try { localStorage.setItem(DISMISS_PREFIX + source, how); } catch { /* non-fatal */ }
}

export function FeedbackPrompt({ source }: { source: FeedbackSource }) {
  const T = useLocale().feedback;
  const { showToast } = useToast();
  const [hidden, setHidden]         = useState(() => alreadyHandled(source));
  const [rating, setRating]         = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<FeedbackDifficulty | null>(null);
  const [blocker, setBlocker]       = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (hidden) return null;

  const dismiss = () => {
    emit('feedback_dismissed', { source });
    markHandled(source, 'dismissed');
    setHidden(true);
  };

  const onSubmit = () => {
    if (rating === null || submitting) return;
    setSubmitting(true);
    // No free text in analytics — blocker/suggestion are stored server-side only.
    emit('feedback_submitted', { source, satisfaction: rating });
    // Best-effort, fire-and-forget — never block or surface an error.
    void submitFeedback({
      source,
      satisfaction: rating,
      difficulty:   difficulty ?? undefined,
      blocker:      blocker.trim() || undefined,
      suggestion:   suggestion.trim() || undefined,
    });
    markHandled(source, 'done');
    showToast(T.success, 'success');
    setHidden(true);
  };

  const satLabels = [T.sat1, T.sat2, T.sat3, T.sat4, T.sat5];
  const diffOptions: { value: FeedbackDifficulty; label: string }[] = [
    { value: 'easy', label: T.diffEasy },
    { value: 'ok',   label: T.diffOk },
    { value: 'hard', label: T.diffHard },
  ];

  const chip = (active: boolean): CSSProperties => ({
    padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: active ? '1px solid var(--violet)' : '1px solid var(--border)',
    background: active ? 'rgba(124,58,237,0.08)' : 'transparent',
    color: active ? 'var(--violet-text)' : 'var(--text-secondary)',
    transition: 'all 0.15s ease',
  });

  return (
    <section style={{
      marginTop: 20, padding: '16px 18px', borderRadius: 14,
      border: '1px solid var(--border)', background: 'var(--surface-2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{T.title}</div>
        <button
          type="button" onClick={dismiss} aria-label={T.dismissAria}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 2 }}
        >×</button>
      </div>

      {/* Satisfaction — always visible, one tap */}
      <div role="group" aria-label={T.satisfactionLabel} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {FACES.map((face, i) => {
          const value = i + 1;
          const active = rating === value;
          return (
            <button
              key={value} type="button" title={satLabels[i]} aria-label={satLabels[i]} aria-pressed={active}
              onClick={() => setRating(value)}
              style={{
                width: 42, height: 42, borderRadius: 10, cursor: 'pointer', fontSize: 20,
                border: active ? '2px solid var(--violet)' : '1px solid var(--border)',
                background: active ? 'rgba(124,58,237,0.08)' : 'var(--surface)',
                filter: active ? 'none' : 'grayscale(0.4)', transition: 'all 0.15s ease',
              }}
            >{face}</button>
          );
        })}
      </div>

      {/* Progressive reveal — only after a rating, to stay non-intrusive */}
      {rating !== null && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>{T.difficultyLabel}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {diffOptions.map(opt => (
                <button
                  key={opt.value} type="button" aria-pressed={difficulty === opt.value}
                  onClick={() => setDifficulty(d => (d === opt.value ? null : opt.value))}
                  style={chip(difficulty === opt.value)}
                >{opt.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>{T.blockerLabel}</label>
            <textarea
              value={blocker} onChange={e => setBlocker(e.target.value)} maxLength={500} rows={2}
              placeholder={T.blockerPlaceholder}
              style={{ ...inputStyle(), resize: 'vertical', minHeight: 44 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>{T.suggestionLabel}</label>
            <textarea
              value={suggestion} onChange={e => setSuggestion(e.target.value)} maxLength={500} rows={2}
              placeholder={T.suggestionPlaceholder}
              style={{ ...inputStyle(), resize: 'vertical', minHeight: 44 }}
            />
          </div>

          <div>
            <button
              type="button" onClick={onSubmit} disabled={submitting}
              style={{
                padding: '10px 22px', borderRadius: 10, border: 'none',
                background: 'var(--violet)', color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: submitting ? 'wait' : 'pointer',
              }}
            >{T.submit}</button>
          </div>
        </div>
      )}
    </section>
  );
}
