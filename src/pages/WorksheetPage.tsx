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

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../context/RouteContext';
import { useLocale } from '../context/LocaleContext';
import { format } from '../lib/locale/i18n';
import { emit } from '../lib/analytics/events';
import { saveWorksheetQuotePrefill } from '../lib/worksheet/quotePrefill';
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
import { TASK_CATALOG, suggestForLabel, type CatalogTask } from '../lib/worksheet/taskCatalog';
import {
  localSaveWorksheet, localListSaves, localGetSave, localDeleteSave, type LocalSave,
} from '../lib/worksheet/localSaves';

const STORAGE_KEY = 'ailunapro-worksheet-v1';

interface TaskRow extends WorksheetTask { rowId: string; hoursInput: string; }

/** Verdict colors (the localized label comes from T.auditTools.worksheet.verdict). */
const VERDICT_COLOR: Record<Verdict, { bg: string; fg: string }> = {
  keep:     { bg: 'rgba(16,185,129,0.12)',  fg: 'var(--green-text)' },
  automate: { bg: 'rgba(124,58,237,0.12)',  fg: 'var(--violet-text)' },
  delegate: { bg: 'rgba(59,130,246,0.12)',  fg: '#2563EB' },
  rethink:  { bg: 'rgba(245,158,11,0.14)',  fg: '#B45309' },
};

let seq = 0;
const newRowId = () => `r${Date.now().toString(36)}${(seq++).toString(36)}`;

/**
 * Parse a user-typed number safely: accept comma decimals (fr-FR audience),
 * reject negative / non-finite / NaN. The live preview can never enter a value
 * the worker would 400-reject, and a stray '-5' or '1,5' can't corrupt totals.
 */
const parseNum = (s: string): number => {
  const n = Number(String(s).replace(',', '.').trim());
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

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

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Persisted;
  } catch { return null; }
}

export function WorksheetPage() {
  const { session } = useAuth();
  const { navigate } = useRoute();
  const W = useLocale().auditTools.worksheet;
  const WHO_LABELS:    Record<Who, string>    = { self: W.who.self, specialist: W.who.specialist, anyone: W.who.anyone };
  const RULES_LABELS:  Record<Rules, string>  = { yes: W.rules.yes, no: W.rules.no };
  const ENERGY_LABELS: Record<Energy, string> = { energizing: W.energy.energizing, neutral: W.energy.neutral, draining: W.energy.draining };
  const VERDICT_LABEL: Record<Verdict, string> = { keep: W.verdict.keep, automate: W.verdict.automate, delegate: W.verdict.delegate, rethink: W.verdict.rethink };
  const PERIOD_LABELS: Record<IncomePeriod, string> = { month: W.profile.periodMonth, year: W.profile.periodYear, week: W.profile.periodWeek };
  const PERIOD_INCOME_LABEL: Record<IncomePeriod, string> = { month: W.profile.incomeMonth, year: W.profile.incomeYear, week: W.profile.incomeWeek };
  const orgId = session?.orgId ?? '';
  const money = useMoney();
  const hf = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }), []);

  const persisted = useMemo(loadPersisted, []);
  // Honest empty start — NO fabricated numbers. The user loads an example on demand.
  const [monthlyIncome, setMonthlyIncome] = useState(persisted?.monthlyNetIncome ?? '');
  const [weeklyHours, setWeeklyHours]     = useState(persisted?.weeklyWorkHours ?? '');
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
        weeklyHours: parseNum(t.hoursInput), who: t.who, rules: t.rules, energy: t.energy,
      }));
    }
    return []; // honest empty start — no seeded data
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
      monthlyNetIncome: parseNum(monthlyIncome),
      weeklyWorkHours:  parseNum(weeklyHours),
      incomePeriod,
    };
    const safeProfile = profile.monthlyNetIncome > 0 && profile.weeklyWorkHours > 0
      ? profile : { monthlyNetIncome: 1, weeklyWorkHours: 1, incomePeriod }; // avoid div0 display; rate still shown 0 below
    const valid = profile.monthlyNetIncome > 0 && profile.weeklyWorkHours > 0;
    const engineTasks: WorksheetTask[] = tasks
      .filter(t => t.label.trim() !== '')
      .map(t => ({ id: t.rowId, label: t.label.trim(), weeklyHours: parseNum(t.hoursInput), who: t.who, rules: t.rules, energy: t.energy }));
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
  const resetAll = () => { setMonthlyIncome(''); setWeeklyHours(''); setTasks([]); };
  const loadExample = () => { setMonthlyIncome('7000'); setWeeklyHours('60'); setIncomePeriod('month'); setTasks(seedTasks()); };

  // ── Save / load — server when available, ALWAYS local fallback ──
  interface SavedRow { id: string; title: string; createdAt: string; value: number; source: 'server' | 'local'; }
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const toRows = (server: SavedWorksheetItem[], local: LocalSave[]): SavedRow[] => [
    ...server.map(s => ({ id: s.worksheetId, title: s.title, createdAt: s.createdAt, value: s.annualValueRecovered, source: 'server' as const })),
    ...local.map(l => ({ id: l.id, title: l.title, createdAt: l.createdAt, value: computeWorksheet(l.input).totals.annualValueRecovered, source: 'local' as const })),
  ].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const refreshSaved = useCallback(async () => {
    let server: SavedWorksheetItem[] = [];
    if (orgId) { try { server = await listWorksheets(orgId); } catch { /* offline → local only */ } }
    setSaved(toRows(server, localListSaves()));
  }, [orgId]);
  useEffect(() => { void refreshSaved(); }, [refreshSaved]);

  const buildInput = () => ({
    profile: { monthlyNetIncome: parseNum(monthlyIncome), weeklyWorkHours: parseNum(weeklyHours), incomePeriod },
    tasks: tasks
      .filter(t => t.label.trim() !== '')
      .map(t => ({ id: t.rowId, label: t.label.trim(), weeklyHours: parseNum(t.hoursInput), who: t.who, rules: t.rules, energy: t.energy })),
  });

  const applyInput = (input: ReturnType<typeof buildInput>) => {
    setMonthlyIncome(String(input.profile.monthlyNetIncome));
    setWeeklyHours(String(input.profile.weeklyWorkHours));
    if (input.profile.incomePeriod) setIncomePeriod(input.profile.incomePeriod);
    setTasks(input.tasks.map(t => ({
      rowId: newRowId(), label: t.label, hoursInput: String(t.weeklyHours),
      weeklyHours: t.weeklyHours, who: t.who, rules: t.rules, energy: t.energy,
    })));
  };

  const onSave = async () => {
    if (!result.valid || !result.hasTasks) { setMsg(W.actions.needProfile); return; }
    setBusy(true); setMsg(null);
    const input = buildInput();
    // Always keep a local copy (works offline / without workspace).
    localSaveWorksheet(input, new Date().toISOString());
    let serverOk = false;
    if (orgId) { try { await saveWorksheet(orgId, input); serverOk = true; } catch { /* fall back to local */ } }
    setMsg(serverOk ? W.actions.savedCloud : W.actions.savedLocal);
    emit('lead_flow_completed', { flow: 'worksheet' });
    await refreshSaved();
    setBusy(false);
  };

  const onLoad = async (row: SavedRow) => {
    setBusy(true); setMsg(null);
    try {
      if (row.source === 'local') {
        const l = localGetSave(row.id);
        if (l) { applyInput(l.input as ReturnType<typeof buildInput>); setMsg(W.actions.loadOk); }
      } else if (orgId) {
        const d = await getWorksheet(orgId, row.id);
        if (d.input) { applyInput(d.input as ReturnType<typeof buildInput>); setMsg(W.actions.loadOk); }
      }
    } catch { setMsg(W.actions.loadFail); }
    finally { setBusy(false); }
  };

  const onDelete = async (row: SavedRow) => {
    try {
      if (row.source === 'local') localDeleteSave(row.id);
      else if (orgId) await deleteWorksheet(orgId, row.id);
      setSaved(prev => prev.filter(s => !(s.id === row.id && s.source === row.source)));
    } catch { setMsg(W.actions.deleteFail); }
  };

  // ── Common-task picker + hours helper ──
  const addCatalogTask = (t: CatalogTask) =>
    setTasks(prev => [...prev, { rowId: newRowId(), label: t.label, weeklyHours: 0, hoursInput: '', who: t.who, rules: t.rules, energy: t.energy }]);

  const replaceWithSplits = (rowId: string, splits: CatalogTask[]) =>
    setTasks(prev => {
      const idx = prev.findIndex(t => t.rowId === rowId);
      if (idx < 0) return prev;
      const src = prev[idx];
      const newRows: TaskRow[] = splits.map(s => ({ rowId: newRowId(), label: s.label, weeklyHours: src.weeklyHours, hoursInput: src.hoursInput, who: s.who, rules: s.rules, energy: s.energy }));
      return [...prev.slice(0, idx), ...newRows, ...prev.slice(idx + 1)];
    });

  const [hoursPerDay, setHoursPerDay] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('');
  const applyHoursHelper = () => {
    const h = Number(hoursPerDay), d = Number(daysPerWeek);
    if (h > 0 && d > 0) setWeeklyHours(String(Math.round(h * d * 10) / 10));
  };

  // Funnel: signal a viewed result once it first becomes valid with at least one task.
  const scoreViewedRef = useRef(false);
  useEffect(() => {
    if (result.valid && result.hasTasks && !scoreViewedRef.current) {
      scoreViewedRef.current = true;
      emit('score_viewed', { flow: 'worksheet' });
    }
  }, [result.valid, result.hasTasks]);

  // Conversion handoff → Quote: carry a localized, no-PII-to-analytics seed (the
  // user's own task labels stay in sessionStorage, never an event) + preselect the
  // automation service so the quote arrives pre-contextualised.
  const goToQuote = () => {
    const recoverable = result.r.rows.filter(r => r.verdict === 'automate' || r.verdict === 'delegate');
    const top = recoverable.slice(0, 5).map(r => r.label).filter(Boolean);
    const seed =
      format(W.quoteSeedMain, { count: String(recoverable.length), value: nf.format(totals.annualValueRecovered) }) +
      (top.length ? format(W.quoteSeedTasks, { tasks: top.join(', ') }) : W.quoteSeedEnd);
    saveWorksheetQuotePrefill({ category: 'automation', descriptionSeed: seed });
    emit('cta_clicked', { flow: 'worksheet', target: 'quote' });
    navigate({ name: 'quote' });
  };

  // Map computed rows back by id for the table (engine output is the source of truth).
  const verdictById = new Map(result.r.rows.map(row => [row.id, row]));

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1080, margin: '0 auto' }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
          {W.title}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55, maxWidth: 760 }}>
          {W.subtitle}
        </p>
      </header>

      {/* Profile */}
      <section style={cardStyle}>
        <div style={sectionTitle}>{W.profile.sectionTitle}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-end' }}>
          <LabeledInput label={`${PERIOD_INCOME_LABEL[incomePeriod]} (${currency.toUpperCase()})`}>
            <input type="number" inputMode="decimal" min={0} value={monthlyIncome}
              onChange={e => setMonthlyIncome(e.target.value)} style={fieldStyle} />
          </LabeledInput>
          <LabeledInput label={W.profile.periodLabel}>
            <select value={incomePeriod} onChange={e => setIncomePeriod(e.target.value as IncomePeriod)} style={fieldStyle}>
              {(Object.keys(PERIOD_LABELS) as IncomePeriod[]).map(p => <option key={p} value={p}>{PERIOD_LABELS[p]}</option>)}
            </select>
          </LabeledInput>
          <LabeledInput label={W.profile.currencyLabel}>
            <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} style={fieldStyle}>
              {SUPPORTED_CURRENCIES.map(cur => <option key={cur} value={cur}>{cur.toUpperCase()}</option>)}
            </select>
          </LabeledInput>
          <LabeledInput label={W.profile.hoursLabel}>
            <input type="number" inputMode="decimal" min={1} max={168} value={weeklyHours}
              onChange={e => setWeeklyHours(e.target.value)} style={fieldStyle} />
          </LabeledInput>
          <div style={{ flex: '1 1 160px', minWidth: 150 }}>
            <div style={statLabel}>{W.profile.hourlyRate}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--violet-text)', fontVariantNumeric: 'tabular-nums' }}>
              {result.valid ? nf.format(rate) : '—'}<span style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 600 }}> {W.profile.perHour}</span>
            </div>
          </div>
        </div>
        {!result.valid && (
          <div style={{ marginTop: 10, fontSize: 12.5, color: '#B45309' }}>
            {W.profile.invalidHint}
          </div>
        )}
        {/* Helper: estimate weekly hours for anyone who doesn't know the number. */}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)', display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)', alignSelf: 'center' }}>{W.profile.helperPrompt}</span>
          <LabeledInput label={W.profile.helperHoursPerDay}>
            <input type="number" inputMode="decimal" min={0} max={24} value={hoursPerDay}
              onChange={e => setHoursPerDay(e.target.value)} style={{ ...fieldStyle, width: 90 }} placeholder="8" />
          </LabeledInput>
          <LabeledInput label={W.profile.helperDaysPerWeek}>
            <input type="number" inputMode="decimal" min={0} max={7} value={daysPerWeek}
              onChange={e => setDaysPerWeek(e.target.value)} style={{ ...fieldStyle, width: 90 }} placeholder="5" />
          </LabeledInput>
          <button onClick={applyHoursHelper} style={{ ...miniBtn, padding: '8px 14px' }}>{W.profile.helperCalc}</button>
        </div>
      </section>

      {/* Tasks */}
      <section style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ ...sectionTitle, padding: '16px 18px 0' }}>{W.tasks.sectionTitle}</div>
        <div style={{ padding: '4px 18px 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
          {W.tasks.tip}
        </div>
        <div style={{ overflowX: 'auto', padding: '12px 12px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 880 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                <th style={th}>{W.tasks.colTask}</th>
                <th style={{ ...th, width: 78 }}>{W.tasks.colHours}</th>
                <th style={{ ...th, width: 150 }}>{W.tasks.colWho}</th>
                <th style={{ ...th, width: 100 }}>{W.tasks.colRules}</th>
                <th style={{ ...th, width: 120 }}>{W.tasks.colEnergy}</th>
                <th style={{ ...th, width: 130 }}>{W.tasks.colVerdict}</th>
                <th style={{ ...th, width: 100, textAlign: 'right' }}>{W.tasks.colCost}</th>
                <th style={{ ...th, width: 78, textAlign: 'right' }}>{W.tasks.colRecovered}</th>
                <th style={{ ...th, width: 34 }} />
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => {
                const row = verdictById.get(t.rowId);
                const v = row?.verdict;
                const sug = suggestForLabel(t.label);
                return (
                  <Fragment key={t.rowId}>
                  <tr style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={td}>
                      <input value={t.label} onChange={e => setTask(t.rowId, { label: e.target.value })}
                        placeholder={W.tasks.taskPlaceholder} style={{ ...fieldStyle, width: '100%', minWidth: 160 }} />
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
                      {v && (
                        <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: VERDICT_COLOR[v].bg, color: VERDICT_COLOR[v].fg, whiteSpace: 'nowrap' }}>
                          {VERDICT_LABEL[v]}
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
                      <button onClick={() => removeRow(t.rowId)} title={W.savedList.delete}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
                    </td>
                  </tr>
                  {sug && (
                    <tr>
                      <td colSpan={9} style={{ padding: '0 8px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '8px 10px', borderRadius: 8, background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.35)' }}>
                          <span style={{ fontSize: 12.5, color: '#92400E' }}>💡 {sug.hint}</span>
                          {sug.splits.length > 0 && (
                            <button onClick={() => replaceWithSplits(t.rowId, sug.splits)} style={{ ...miniBtn, borderColor: '#F59E0B', color: '#92400E' }}>
                              {format(W.tasks.splitInto, { n: String(sug.splits.length) })}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
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
        <div style={{ padding: '12px 18px 18px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={addRow} style={addBtn}>{W.tasks.addRow}</button>
          <select
            value=""
            onChange={e => {
              const [gi, ti] = e.target.value.split(':').map(Number);
              const t = TASK_CATALOG[gi]?.tasks[ti];
              if (t) addCatalogTask(t);
              e.currentTarget.selectedIndex = 0;
            }}
            style={{ ...fieldStyle, maxWidth: 280 }}
          >
            <option value="">{W.tasks.addCommon}</option>
            {TASK_CATALOG.map((g, gi) => (
              <optgroup key={g.group} label={g.group}>
                {g.tasks.map((t, ti) => <option key={t.label} value={`${gi}:${ti}`}>{t.label}</option>)}
              </optgroup>
            ))}
          </select>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{W.tasks.addCommonHint}</span>
        </div>
      </section>

      {/* Summary */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 4 }}>
        <SummaryCard label={W.summary.recoveredHoursYear} value={result.valid ? `${hf.format(totals.totalRecoveredHoursPerYear)} h` : '—'} accent="var(--violet-text)" />
        <SummaryCard label={W.summary.recoveredValueYear} value={result.valid ? nf.format(totals.annualValueRecovered) : '—'} accent="var(--green-text)" />
        <SummaryCard label={W.summary.toAutomate} value={`${totals.counts.automate}`} accent="var(--violet-text)" />
        <SummaryCard label={W.summary.toDelegate} value={`${totals.counts.delegate}`} accent="#2563EB" />
      </section>

      {/* Quick-Wins — do first (Impact × Effort, méthode §3.4) */}
      {result.valid && result.r.quickWins.length > 0 && (
        <section style={{ ...cardStyle, marginTop: 16 }}>
          <div style={sectionTitle}>{W.quickWins.title}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12 }}>
            {W.quickWins.sub}
          </div>
          <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
            {result.r.quickWins.slice(0, 3).map((q, i) => (
              <li key={q.id ?? q.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <span style={{ flex: '0 0 auto', width: 24, height: 24, borderRadius: 6, background: 'var(--violet)', color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                <span style={{ flex: 1, minWidth: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{q.label || '—'}</span>
                <span style={{ fontSize: 11.5, padding: '3px 8px', borderRadius: 6, background: VERDICT_COLOR[q.verdict].bg, color: VERDICT_COLOR[q.verdict].fg, fontWeight: 700, whiteSpace: 'nowrap' }}>{VERDICT_LABEL[q.verdict]}</span>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{W.quickWins.effortLabel} {q.effort === 'low' ? W.quickWins.effortLow : W.quickWins.effortMed}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: 'var(--green-text)', whiteSpace: 'nowrap' }}>{nf.format(q.annualCost)}{W.quickWins.perYearSuffix}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Conversion — the result is the highest-intent moment: route into the paid funnel. */}
      {result.valid && result.hasTasks && totals.annualValueRecovered > 0 && (
        <section style={{ ...cardStyle, marginTop: 16, border: '1px solid var(--violet)', background: 'rgba(124,58,237,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px', minWidth: 240 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                {format(W.cta.headline, { value: nf.format(totals.annualValueRecovered) })}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {format(W.cta.body, { count: String(totals.counts.automate + totals.counts.delegate) })}
              </div>
            </div>
            <button
              onClick={goToQuote}
              style={{ ...addBtn, padding: '12px 22px', fontSize: 14 }}
            >
              {W.cta.button}
            </button>
          </div>
        </section>
      )}

      <div style={{ marginTop: 18, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={onSave} disabled={busy} style={{ ...addBtn, opacity: busy ? 0.6 : 1, cursor: busy ? 'wait' : 'pointer' }}>
          {W.actions.save}
        </button>
        <button onClick={loadExample} style={{ ...addBtn, background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
          {W.actions.loadExample}
        </button>
        <button onClick={resetAll} style={{ ...addBtn, background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
          {W.actions.reset}
        </button>
        {msg && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{msg}</span>}
      </div>

      {saved.length > 0 && (
        <section style={{ ...cardStyle, marginTop: 16 }}>
          <div style={sectionTitle}>{W.savedList.title}</div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
            {saved.map(s => (
              <li key={`${s.source}:${s.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13 }}>
                  {s.title} <span style={{ color: 'var(--text-muted)' }}>· {new Date(s.createdAt).toLocaleDateString()}</span>
                  <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 5, background: s.source === 'server' ? 'rgba(16,185,129,0.15)' : 'var(--surface-2)', color: s.source === 'server' ? 'var(--green-text)' : 'var(--text-muted)' }}>{s.source === 'server' ? W.savedList.cloud : W.savedList.local}</span>
                </span>
                <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'var(--green-text)', fontWeight: 600 }}>{nf.format(s.value)}{W.savedList.perYear}</span>
                <button onClick={() => onLoad(s)} disabled={busy} style={miniBtn}>{W.savedList.load}</button>
                <button onClick={() => onDelete(s)} style={{ ...miniBtn, color: 'var(--red-text)' }}>{W.savedList.delete}</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div style={{ marginTop: 14, fontSize: 11.5, color: 'var(--text-muted)' }}>
        {W.verdictRule}
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
