/**
 * Pipeline controls + activity log + timeline, embedded in the contact detail panel.
 *
 * Kept out of ContactDetailPanel so that file stays under the size limit and so
 * the commercial surface can change without touching the record view.
 *
 * DESIGN: logging a contact attempt is ONE action, not three. The operator picks
 * a channel and an outcome and presses log; the server advances the stage and
 * books the next follow-up from that outcome. Making a rep separately remember to
 * tick "contacted" and pick a date is how leads end up with neither.
 */

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { Button } from '../ui/Button';
import {
  PIPELINE_STATUSES, CHANNELS, PRIORITIES, OUTCOMES, FOLLOW_UP_PRESETS,
  updatePipeline, logActivity, fetchTimeline,
  SalesError, type PipelineStatus, type Channel, type Outcome, type Priority, type TimelineEvent,
} from '../../lib/sales/salesClient';
import type { Contact } from '../../lib/contacts/contactsClient';

const label = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)' } as const;
const field: React.CSSProperties = {
  padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit',
};

/** Stage of a contact that has never been through the pipeline. Mirrors the server. */
function stageOf(c: Contact): PipelineStatus {
  const explicit = (c as { pipelineStatus?: string }).pipelineStatus;
  if (explicit && (PIPELINE_STATUSES as readonly string[]).includes(explicit)) return explicit as PipelineStatus;
  const legacy = c.leadStatus ?? '';
  if (legacy === 'contacted' || legacy === 'qualified' || legacy === 'won' || legacy === 'lost') return legacy;
  return c.assignedToUid ? 'assigned' : 'new';
}

export function PipelinePanel({ contact, orgId, canEdit, onChanged }: {
  contact: Contact;
  orgId: string;
  canEdit: boolean;
  onChanged: () => Promise<void> | void;
}) {
  const C = useLocale().contacts;
  const t = (k: string) => (C as unknown as Record<string, string>)[k] ?? k;

  const c = contact as Contact & {
    pipelineStatus?: string; nextFollowUpAt?: string; nextFollowUpChannel?: string;
    priority?: string; lastContactAt?: string; lastContactChannel?: string; followUpNotes?: string;
  };

  const [stage, setStage] = useState<PipelineStatus>(stageOf(contact));
  const [priority, setPriority] = useState<Priority>((PRIORITIES as readonly string[]).includes(c.priority ?? '') ? (c.priority as Priority) : 'normal');
  const [channel, setChannel] = useState<Channel>('call');
  const [outcome, setOutcome] = useState<Outcome | ''>('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [events, setEvents] = useState<TimelineEvent[] | null>(null);

  const loadTimeline = useCallback(async () => {
    try { setEvents(await fetchTimeline(contact.orgId ?? orgId, contact.contactId)); }
    catch { setEvents([]); }
  }, [contact.orgId, contact.contactId, orgId]);
  useEffect(() => { void loadTimeline(); }, [loadTimeline]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setErr(''); setMsg('');
    try { await fn(); await loadTimeline(); await onChanged(); }
    catch (e) { setErr(e instanceof SalesError ? e.code : 'SAVE_FAILED'); }
    finally { setBusy(false); }
  };

  const saveStage = (next: PipelineStatus) => {
    setStage(next);
    void run(() => updatePipeline(contact.orgId ?? orgId, contact.contactId, { pipelineStatus: next }));
  };

  const savePriority = (next: Priority) => {
    setPriority(next);
    void run(() => updatePipeline(contact.orgId ?? orgId, contact.contactId, { priority: next }));
  };

  const schedule = (days: number) => void run(() => updatePipeline(contact.orgId ?? orgId, contact.contactId, {
    nextFollowUpAt: new Date(Date.now() + days * 86400000).toISOString(),
    nextFollowUpChannel: channel,
  }));

  const log = () => void run(async () => {
    const res = await logActivity(contact.orgId ?? orgId, contact.contactId, { channel, outcome, note });
    setNote(''); setOutcome('');
    setStage(res.pipelineStatus);
    // A bounce deliberately books nothing; say so rather than leaving the
    // operator to notice the missing date.
    setMsg(res.bounced ? t('pipelineBounced') : res.nextFollowUpAt ? `${t('pipelineNextSet')} ${res.nextFollowUpAt.slice(0, 10)}` : '');
  });

  const overdue = Boolean(c.nextFollowUpAt && Date.parse(c.nextFollowUpAt) < Date.now());
  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '—');

  return (
    <>
      <section style={{ marginBottom: 18 }}>
        <div style={{ ...label, marginBottom: 6 }}>{t('pipelineSection')}</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
          <label style={{ display: 'block' }}>
            <div style={label}>{t('pipelineStage')}</div>
            <select value={stage} onChange={e => saveStage(e.target.value as PipelineStatus)} disabled={!canEdit || busy} style={{ ...field, width: '100%' }}>
              {PIPELINE_STATUSES.map(s => <option key={s} value={s}>{t(`stage_${s}`)}</option>)}
            </select>
          </label>
          <label style={{ display: 'block' }}>
            <div style={label}>{t('pipelinePriority')}</div>
            <select value={priority} onChange={e => savePriority(e.target.value as Priority)} disabled={!canEdit || busy} style={{ ...field, width: '100%' }}>
              {PRIORITIES.map(p => <option key={p} value={p}>{t(`priority_${p}`)}</option>)}
            </select>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, marginTop: 12 }}>
          <div>
            <div style={label}>{t('pipelineNextFollowUp')}</div>
            <div style={{ fontSize: 13.5, color: overdue ? 'var(--red-text)' : 'var(--text-primary)', fontWeight: overdue ? 700 : 400 }}>
              {c.nextFollowUpAt ? `${fmt(c.nextFollowUpAt)}${overdue ? ` — ${t('pipelineOverdue')}` : ''}` : t('pipelineNoNextStep')}
            </div>
          </div>
          <div>
            <div style={label}>{t('pipelineLastContact')}</div>
            <div style={{ fontSize: 13.5 }}>
              {c.lastContactAt ? `${fmt(c.lastContactAt)}${c.lastContactChannel ? ` (${t(`channel_${c.lastContactChannel}`)})` : ''}` : '—'}
            </div>
          </div>
        </div>
      </section>

      {canEdit && (
        <section style={{ marginBottom: 18 }}>
          <div style={{ ...label, marginBottom: 6 }}>{t('pipelineLogActivity')}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select value={channel} onChange={e => setChannel(e.target.value as Channel)} aria-label={t('pipelineChannel')} style={field} disabled={busy}>
              {CHANNELS.map(ch => <option key={ch} value={ch}>{t(`channel_${ch}`)}</option>)}
            </select>
            <select value={outcome} onChange={e => setOutcome(e.target.value as Outcome | '')} aria-label={t('pipelineOutcome')} style={field} disabled={busy}>
              <option value="">{t('pipelineNoOutcome')}</option>
              {OUTCOMES.map(o => <option key={o} value={o}>{t(`outcome_${o}`)}</option>)}
            </select>
            <Button variant="primary" size="sm" onClick={log} disabled={busy}>{t('pipelineLog')}</Button>
          </div>
          <textarea
            value={note} onChange={e => setNote(e.target.value)} rows={2} disabled={busy}
            placeholder={t('pipelineNotePlaceholder')}
            style={{ ...field, width: '100%', marginTop: 8, resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('pipelineRemindIn')}</span>
            {FOLLOW_UP_PRESETS.map(d => (
              <Button key={d} variant="secondary" size="sm" onClick={() => schedule(d)} disabled={busy}>{d}d</Button>
            ))}
          </div>
          {msg && <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--text-secondary)' }}>{msg}</div>}
          {err && <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--red-text)' }}>{(C.errors as Record<string, string>)[err] ?? err}</div>}
        </section>
      )}

      <section style={{ marginBottom: 18 }}>
        <div style={{ ...label, marginBottom: 6 }}>{t('pipelineTimeline')}</div>
        <div style={{
          maxHeight: 220, overflowY: 'auto', background: 'var(--surface-2)',
          border: '1px solid var(--border)', borderRadius: 10, padding: 10, fontSize: 12.5,
        }}>
          {events === null ? <div style={{ color: 'var(--text-muted)' }}>{C.loading}</div>
            : events.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>{t('pipelineNoHistory')}</div>
            : events.map(e => (
              <div key={e.eventId} style={{ display: 'flex', gap: 8, padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', minWidth: 108 }}>
                  {e.at ? new Date(e.at).toLocaleDateString() : ''} {e.at ? new Date(e.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
                <span style={{ fontWeight: 600, minWidth: 96 }}>{t(`event_${e.kind}`)}</span>
                <span style={{ flex: 1, wordBreak: 'break-word' }}>{e.summary}</span>
                <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{e.actor}</span>
              </div>
            ))}
        </div>
      </section>
    </>
  );
}
