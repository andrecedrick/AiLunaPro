/**
 * WorksheetPage — "AUDIT TEMPS → ARGENT" (G1).
 * Authenticated in-app tool: #/worksheet
 *
 * Reproduces the spreadsheet from the source videos: the user enters their REAL
 * data — net monthly income + weekly hours (→ hourly rate), then every task with
 * its weekly hours and three qualifiers (who can do it / clear rules? / energy).
 * The engine returns, live, a per-task VERDICT, the annual cost, and the
 * recoverable hours — no estimation. Computation mirrors the worker engine and is
 * locked by tests/unit/audit-worksheet-parity.test.ts.
 *
 * French-first labels (i18n can follow). Pure client tool + localStorage; the
 * worker route (POST /api/worksheet) exists for a future "save audit" step.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMoney } from '../lib/currency/useMoney';
import { SUPPORTED_CURRENCIES, type Currency } from '../lib/billing/currencyConstants';
import {
  computeWorksheet,
  type WorksheetTask, type Who, type Rules, type Energy, type Verdict, type IncomePeriod,
} from '../lib/worksheet/auditWorksheet';
import {
  saveWorksheet, listWorksheets, getWorksheet, deleteWorksheet,
  type SavedWorksheetItem,
} from '../lib/worksheet/worksheetClient';

const STORAGE_KEY = 'ailunapro-worksheet-v1';

interface TaskRow extends WorksheetTask { rowId: string; hoursInput: string; }

const WHO_LABELS:    Record<Who, string>     = { self: 'Moi seul', specialist: 'Un spécialiste formé', anyone: 'N’importe qui formé' };
const RULES_LABELS:  Record<Rules, string>   = { yes: 'Oui', no: 'Non' };
const ENERGY_LABELS: Record<Energy, string>  = { energizing: 'Énergisant', neutral: 'Neutre', draining: 'Épuisant' };

const VERDICT_META: Record<Verdict, { label: string; bg: string; fg: string }> = {
  keep:     { label: '✅ GARDER',      bg: 'rgba(16,185,129,0.12)',  fg: 'var(--green-text)' },
  automate: { label: '🤖 AUTOMATISER', bg: 'rgba(124,58,237,0.12)',  fg: 'var(--violet-text)' },
  delegate: { label: '→ DÉLÉGUER',     bg: 'rgba(59,130,246,0.12)',  fg: '#2563EB' },
  rethink:  { label: '⚠️ REPENSER',    bg: 'rgba(245,158,11,0.14)',  fg: '#B45309' },
};

let seq = 0;
const newRowId = () => `r${Date.now().toString(36)}${(seq++).toString(36)}`;

function seedTasks(): TaskRow[] {
  const seed: Array<[string, number, Who, Rules, Energy]> = [
    ['Répondre aux emails / Slack', 10, 'anyone', 'yes', 'draining'],
    ['Comptabilité, facturation',    4, 'specialist', 'no', 'neutral'],
    ['Prospection / rdv clients',   20, 'self', 'yes', 'energizing'],
    ['Saisie de données CRM',        2, 'anyone', 'no', 'draining'],
    ['Gestion réseaux sociaux',      5, 'anyone', 'no', 'neutral'],
    ['Reporting manuel hebdo',       2, 'anyone', 'yes', 'draining'],
    ['Gestion planning / agenda',    3, 'anyone', 'yes', 'draining'],
    ['Devis client',                10, 'self', 'yes', 'draining'],
  ];
  return seed.map(([label, h, who, rules, energy]) => ({
    rowId: newRowId(), label, weeklyHours: h, hoursInput: String(h), who, rules, energy,
  }));
}

interface Persisted {
  monthlyNetIncome: string;
  weeklyWorkHours:  string;
  incomePeriod?:    IncomePeriod;
  currency?:        Currency;
  tasks: Array<{ label: string; hoursInput: string; who: Who; rules: Rules; energy: Energy }>;
}

const PERIOD_LABELS: Record<IncomePeriod, string> = { month: 'par mois', year: 'par an', week: 'par semaine' };
const PERIOD_INCOME_LABEL: Record<IncomePeriod, string> = { month: 'Revenu mensuel net', year: 'Revenu annuel net', week: 'Revenu hebdo net' };

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Persisted;
  } catch { return null; }
}

export function WorksheetPage() {
  const { session } = useAuth();
  const orgId = session?.orgId ?? '';
  const money = useMoney();
  const hf = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }), []);

  const persisted = useMemo(loadPersisted, []);
  const [monthlyIncome, setMonthlyIncome] = useState(persisted?.monthlyNetIncome ?? '7000');
  const [weeklyHours, setWeeklyHours]     = useState(persisted?.weeklyWorkHours ?? '60');
  const [incomePeriod, setIncomePeriod]   = useState<IncomePeriod>(persisted?.incomePeriod ?? 'month');
  const [currency, setCurrency]           = useState<Currency>(persisted?.currency ?? money.currency);
  const nf = useMemo(
    () => new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase(), maximumFractionDigits: 0 }),
    [currency],
  );
  const [tasks, setTasks] = useState<TaskRow[]>(() => {
    if (persisted?.tasks?.length) {
      return persisted.tasks.map(t => ({
        rowId: newRowId(), label: t.label, hoursInput: t.hoursInput,
        weeklyHours: Number(t.hoursInput) || 0, who: t.who, rules: t.rules, energy: t.energy,
      }));
    }
    return seedTasks();
  });

  // Persist (non-sensitive; client-only).
  useEffect(() => {
    const data: Persisted = {
      monthlyNetIncome: monthlyIncome,
      weeklyWorkHours: weeklyHours,
      incomePeriod,
      currency,
      tasks: tasks.map(t => ({ label: t.label, hoursInput: t.hoursInput, who: t.who, rules: t.rules, energy: t.energy })),
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* quota — ignore */ }
  }, [monthlyIncome, weeklyHours, incomePeriod, currency, tasks]);

  // Live computation (mirror of the worker engine).
  const result = useMemo(() => {
    const profile = {
      monthlyNetIncome: Number(monthlyIncome) > 0 ? Number(monthlyIncome) : 0,
      weeklyWorkHours:  Number(weeklyHours) > 0 ? Number(weeklyHours) : 0,
      incomePeriod,
    };
    const safeProfile = profile.monthlyNetIncome > 0 && profile.weeklyWorkHours > 0
      ? profile : { monthlyNetIncome: 1, weeklyWorkHours: 1, incomePeriod }; // avoid div0 display; rate still shown 0 below
    const valid = profile.monthlyNetIncome > 0 && profile.weeklyWorkHours > 0;
    const engineTasks: WorksheetTask[] = tasks
      .filter(t => t.label.trim() !== '')
      .map(t => ({ id: t.rowId, label: t.label.trim(), weeklyHours: Number(t.hoursInput) || 0, who: t.who, rules: t.rules, energy: t.energy }));
    const r = computeWorksheet({ profile: valid ? profile : safeProfile, tasks: engineTasks.length ? engineTasks : [{ label: '—', weeklyHours: 0, who: 'self', rules: 'yes', energy: 'neutral' }] });
    return { r, valid, hasTasks: engineTasks.length > 0 };
  }, [monthlyIncome, weeklyHours, incomePeriod, tasks]);

  const rate = result.valid ? result.r.hourlyRate : 0;
  const totals = result.r.totals;

  const setTask = (rowId: string, patch: Partial<TaskRow>) =>
    setTasks(prev => prev.map(t => (t.rowId === rowId ? { ...t, ...patch } : t)));
  const addRow = () =>
    setTasks(prev => [...prev, { rowId: newRowId(), label: '', weeklyHours: 0, hoursInput: '', who: 'anyone', rules: 'yes', energy: 'draining' }]);
  const removeRow = (rowId: string) => setTasks(prev => prev.filter(t => t.rowId !== rowId));
  const resetAll = () => { setMonthlyIncome('7000'); setWeeklyHours('60'); setTasks(seedTasks()); };

  // ── Server save / load (authed, org-scoped) ──────────────
  const [saved, setSaved] = useState<SavedWorksheetItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const refreshSaved = useCallback(async () => {
    if (!orgId) return;
    try { setSaved(await listWorksheets(orgId)); } catch { /* non-blocking */ }
  }, [orgId]);
  useEffect(() => { void refreshSaved(); }, [refreshSaved]);

  const buildInput = () => ({
    profile: { monthlyNetIncome: Number(monthlyIncome) || 0, weeklyWorkHours: Number(weeklyHours) || 0, incomePeriod },
    tasks: tasks
      .filter(t => t.label.trim() !== '')
      .map(t => ({ id: t.rowId, label: t.label.trim(), weeklyHours: Number(t.hoursInput) || 0, who: t.who, rules: t.rules, energy: t.energy })),
  });

  const onSave = async () => {
    if (!orgId) { setMsg('Espace de travail requis pour enregistrer.'); return; }
    if (!result.valid || !result.hasTasks) { setMsg('Renseigne le profil et au moins une tâche.'); return; }
    setBusy(true); setMsg(null);
    try {
      await saveWorksheet(orgId, buildInput());
      setMsg('Audit enregistré ✓');
      await refreshSaved();
    } catch (e) {
      setMsg(`Échec de l’enregistrement (${e instanceof Error ? e.message : 'erreur'})`);
    } finally { setBusy(false); }
  };

  const onLoad = async (id: string) => {
    if (!orgId) return;
    setBusy(true); setMsg(null);
    try {
      const d = await getWorksheet(orgId, id);
      if (d.input) {
        setMonthlyIncome(String(d.input.profile.monthlyNetIncome));
        setWeeklyHours(String(d.input.profile.weeklyWorkHours));
        if (d.input.profile.incomePeriod) setIncomePeriod(d.input.profile.incomePeriod);
        setTasks(d.input.tasks.map(t => ({
          rowId: newRowId(), label: t.label, hoursInput: String(t.weeklyHours),
          weeklyHours: t.weeklyHours, who: t.who, rules: t.rules, energy: t.energy,
        })));
        setMsg('Audit chargé ✓');
      }
    } catch { setMsg('Chargement impossible.'); }
    finally { setBusy(false); }
  };

  const onDelete = async (id: string) => {
    if (!orgId) return;
    try { await deleteWorksheet(orgId, id); setSaved(prev => prev.filter(s => s.worksheetId !== id)); }
    catch { setMsg('Suppression impossible.'); }
  };

  // Map computed rows back by id for the table (engine output is the source of truth).
  const verdictById = new Map(result.r.rows.map(row => [row.id, row]));

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1080, margin: '0 auto' }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Audit Temps → Argent
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55, maxWidth: 760 }}>
          Saisis tes <strong>vraies données</strong> (pas d’estimation). Pour chaque tâche, l’outil calcule
          son verdict, son coût réel par an et les heures récupérables. Choisis ta devise et la période de ton revenu (mois/an/semaine) — l’outil s’adapte à ton pays.
        </p>
      </header>

      {/* Profile */}
      <section style={cardStyle}>
        <div style={sectionTitle}>① Ton profil</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-end' }}>
          <LabeledInput label={`${PERIOD_INCOME_LABEL[incomePeriod]} (${currency.toUpperCase()})`}>
            <input type="number" inputMode="decimal" min={0} value={monthlyIncome}
              onChange={e => setMonthlyIncome(e.target.value)} style={fieldStyle} />
          </LabeledInput>
          <LabeledInput label="Période du revenu">
            <select value={incomePeriod} onChange={e => setIncomePeriod(e.target.value as IncomePeriod)} style={fieldStyle}>
              {(Object.keys(PERIOD_LABELS) as IncomePeriod[]).map(p => <option key={p} value={p}>{PERIOD_LABELS[p]}</option>)}
            </select>
          </LabeledInput>
          <LabeledInput label="Devise">
            <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} style={fieldStyle}>
              {SUPPORTED_CURRENCIES.map(cur => <option key={cur} value={cur}>{cur.toUpperCase()}</option>)}
            </select>
          </LabeledInput>
          <LabeledInput label="Heures / semaine">
            <input type="number" inputMode="decimal" min={1} max={168} value={weeklyHours}
              onChange={e => setWeeklyHours(e.target.value)} style={fieldStyle} />
          </LabeledInput>
          <div style={{ flex: '1 1 160px', minWidth: 150 }}>
            <div style={statLabel}>→ Taux horaire</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--violet-text)', fontVariantNumeric: 'tabular-nums' }}>
              {result.valid ? nf.format(rate) : '—'}<span style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 600 }}> / h</span>
            </div>
          </div>
        </div>
        {!result.valid && (
          <div style={{ marginTop: 10, fontSize: 12.5, color: '#B45309' }}>
            Renseigne un revenu et des heures &gt; 0 pour calculer le taux horaire.
          </div>
        )}
      </section>

      {/* Tasks */}
      <section style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ ...sectionTitle, padding: '16px 18px 0' }}>② Tes tâches</div>
        <div style={{ padding: '4px 18px 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
          Astuce : note le titre exact (verbe + objet), ex. « relire les propales », pas « admin ».
        </div>
        <div style={{ overflowX: 'auto', padding: '12px 12px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 880 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                <th style={th}>Tâche</th>
                <th style={{ ...th, width: 78 }}>H / sem</th>
                <th style={{ ...th, width: 150 }}>Qui peut le faire ?</th>
                <th style={{ ...th, width: 100 }}>Règles claires ?</th>
                <th style={{ ...th, width: 120 }}>Énergie</th>
                <th style={{ ...th, width: 130 }}>Verdict</th>
                <th style={{ ...th, width: 100, textAlign: 'right' }}>Coût / an</th>
                <th style={{ ...th, width: 78, textAlign: 'right' }}>H. récup.</th>
                <th style={{ ...th, width: 34 }} />
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => {
                const row = verdictById.get(t.rowId);
                const v = row?.verdict;
                const meta = v ? VERDICT_META[v] : null;
                return (
                  <tr key={t.rowId} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={td}>
                      <input value={t.label} onChange={e => setTask(t.rowId, { label: e.target.value })}
                        placeholder="Nom de la tâche" style={{ ...fieldStyle, width: '100%', minWidth: 160 }} />
                    </td>
                    <td style={td}>
                      <input type="number" inputMode="decimal" min={0} max={168} value={t.hoursInput}
                        onChange={e => setTask(t.rowId, { hoursInput: e.target.value, weeklyHours: Number(e.target.value) || 0 })}
                        style={{ ...fieldStyle, width: 64 }} />
                    </td>
                    <td style={td}>
                      <select value={t.who} onChange={e => setTask(t.rowId, { who: e.target.value as Who })} style={{ ...fieldStyle, width: '100%' }}>
                        {(Object.keys(WHO_LABELS) as Who[]).map(k => <option key={k} value={k}>{WHO_LABELS[k]}</option>)}
                      </select>
                    </td>
                    <td style={td}>
                      <select value={t.rules} onChange={e => setTask(t.rowId, { rules: e.target.value as Rules })} style={{ ...fieldStyle, width: '100%' }}>
                        {(Object.keys(RULES_LABELS) as Rules[]).map(k => <option key={k} value={k}>{RULES_LABELS[k]}</option>)}
                      </select>
                    </td>
                    <td style={td}>
                      <select value={t.energy} onChange={e => setTask(t.rowId, { energy: e.target.value as Energy })} style={{ ...fieldStyle, width: '100%' }}>
                        {(Object.keys(ENERGY_LABELS) as Energy[]).map(k => <option key={k} value={k}>{ENERGY_LABELS[k]}</option>)}
                      </select>
                    </td>
                    <td style={td}>
                      {meta && (
                        <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: meta.bg, color: meta.fg, whiteSpace: 'nowrap' }}>
                          {meta.label}
                        </span>
                      )}
                    </td>
                    <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                      {result.valid && row ? nf.format(row.annualCost) : '—'}
                    </td>
                    <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {row ? `${hf.format(row.recoveredHoursPerWeek)} h` : '—'}
                    </td>
                    <td style={td}>
                      <button onClick={() => removeRow(t.rowId)} title="Supprimer"
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 700 }}>
                <td style={td}>TOTAL</td>
                <td style={{ ...td, fontVariantNumeric: 'tabular-nums' }}>{hf.format(totals.totalWeeklyHours)} h</td>
                <td style={td} colSpan={3} />
                <td style={td} />
                <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{result.valid ? nf.format(totals.totalAnnualCost) : '—'}</td>
                <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{hf.format(totals.totalRecoveredHoursPerWeek)} h</td>
                <td style={td} />
              </tr>
            </tfoot>
          </table>
        </div>
        <div style={{ padding: '12px 18px 18px' }}>
          <button onClick={addRow} style={addBtn}>+ Ajouter une tâche</button>
        </div>
      </section>

      {/* Summary */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 4 }}>
        <SummaryCard label="Heures récupérables / an" value={result.valid ? `${hf.format(totals.totalRecoveredHoursPerYear)} h` : '—'} accent="var(--violet-text)" />
        <SummaryCard label="Valeur récupérable / an" value={result.valid ? nf.format(totals.annualValueRecovered) : '—'} accent="var(--green-text)" />
        <SummaryCard label="À automatiser" value={`${totals.counts.automate}`} accent="var(--violet-text)" />
        <SummaryCard label="À déléguer" value={`${totals.counts.delegate}`} accent="#2563EB" />
      </section>

      {/* Quick-Wins — do first (Impact × Effort, méthode §3.4) */}
      {result.valid && result.r.quickWins.length > 0 && (
        <section style={{ ...cardStyle, marginTop: 16 }}>
          <div style={sectionTitle}>③ À faire en premier (Quick-Wins)</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12 }}>
            Tâches récupérables classées par impact (coût/an) ÷ effort. Commence par le haut.
          </div>
          <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
            {result.r.quickWins.slice(0, 3).map((q, i) => (
              <li key={q.id ?? q.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <span style={{ flex: '0 0 auto', width: 24, height: 24, borderRadius: 6, background: 'var(--violet)', color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                <span style={{ flex: 1, minWidth: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{q.label || '—'}</span>
                <span style={{ fontSize: 11.5, padding: '3px 8px', borderRadius: 6, background: VERDICT_META[q.verdict].bg, color: VERDICT_META[q.verdict].fg, fontWeight: 700, whiteSpace: 'nowrap' }}>{VERDICT_META[q.verdict].label}</span>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>effort {q.effort === 'low' ? 'faible' : 'moyen'}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: 'var(--green-text)', whiteSpace: 'nowrap' }}>{nf.format(q.annualCost)}/an</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div style={{ marginTop: 18, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={onSave} disabled={busy} style={{ ...addBtn, opacity: busy ? 0.6 : 1, cursor: busy ? 'wait' : 'pointer' }}>
          💾 Enregistrer
        </button>
        <button onClick={resetAll} style={{ ...addBtn, background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
          Réinitialiser
        </button>
        {msg && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{msg}</span>}
      </div>

      {saved.length > 0 && (
        <section style={{ ...cardStyle, marginTop: 16 }}>
          <div style={sectionTitle}>Mes audits enregistrés</div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
            {saved.map(s => (
              <li key={s.worksheetId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13 }}>
                  {s.title} <span style={{ color: 'var(--text-muted)' }}>· {new Date(s.createdAt).toLocaleDateString()}</span>
                </span>
                <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'var(--green-text)', fontWeight: 600 }}>{nf.format(s.annualValueRecovered)}/an récup.</span>
                <button onClick={() => onLoad(s.worksheetId)} disabled={busy} style={miniBtn}>Charger</button>
                <button onClick={() => onDelete(s.worksheetId)} style={{ ...miniBtn, color: 'var(--red-text)' }}>Suppr.</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div style={{ marginTop: 14, fontSize: 11.5, color: 'var(--text-muted)' }}>
        Verdict : <strong>Moi seul</strong> + énergisant → Garder · sinon Repenser. Sinon <strong>N’importe qui + règles claires</strong> → Automatiser · sinon Déléguer.
      </div>
    </div>
  );
}

/* ── Local atoms / styles ──────────────────────────────────── */

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--card-radius, 14px)', boxShadow: 'var(--card-shadow)',
  padding: 18, marginBottom: 16,
};
const sectionTitle: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 };
const statLabel: React.CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 4 };
const fieldStyle: React.CSSProperties = {
  padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit',
};
const th: React.CSSProperties = { padding: '6px 8px', fontWeight: 700 };
const td: React.CSSProperties = { padding: '8px 8px', verticalAlign: 'middle' };
const addBtn: React.CSSProperties = {
  padding: '9px 16px', borderRadius: 10, border: '1px solid var(--border)',
  background: 'var(--violet)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
};
const miniBtn: React.CSSProperties = {
  padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border)',
  background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
};

function LabeledInput({ label, suffix, children }: { label: string; suffix?: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: '0 0 auto' }}>
      <div style={statLabel}>{label}{suffix ? ` (${suffix})` : ''}</div>
      {children}
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <div style={statLabel}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: accent, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}
