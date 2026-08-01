/**
 * Public-source enrichment panel (cahier §26.10, §26.11, §26.12).
 *
 * Renders the transparency chain the specification mandates, for every finding:
 *
 *   Finding -> Evidence -> Observed -> Declared -> Gap -> Risk -> Recommendation
 *
 * NOTHING IS COMPUTED HERE. The worker assembles the view from a frozen
 * snapshot; this component only displays it. Recomputing anything in the browser
 * would give two engines that can disagree, and the whole value of the feature is
 * that a finding is reproducible from (snapshotId, engineVersion, rulesetVersion).
 *
 * Engine text (titles, explanations, recommendations) is rendered as the engine
 * produced it and is deliberately NOT translated: it is versioned, rule-derived
 * output, and a translated variant would be a second ruleset nobody stamped.
 */

import { useEffect, useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import {
  fetchEnrichmentReport,
  type EnrichmentReportView, type Finding, type CoverageState, type RiskLevel,
} from '../../lib/enrichment/enrichmentClient';

const RISK_COLOR: Record<RiskLevel, string> = {
  critical: '#b91c1c', high: '#c2410c', medium: '#a16207', low: '#3f6212',
};

const card: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--card-radius)',
  boxShadow: 'var(--card-shadow)',
  padding: 18,
};

const mono: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 11,
  wordBreak: 'break-all',
};

const shortHash = (h: string) => (h.length > 20 ? `${h.slice(0, 20)}…` : h);

interface Props {
  orgId: string;
  snapshotId: string;
}

export function EnrichmentPanel({ orgId, snapshotId }: Props) {
  const T = useLocale();
  const [view, setView] = useState<EnrichmentReportView | null>(null);
  const [errorCode, setErrorCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setErrorCode('');
    fetchEnrichmentReport(orgId, snapshotId)
      .then(v => { if (live) setView(v); })
      // Surfaced, never swallowed: a user who cannot see their evidence has to be
      // told why, not shown an empty panel that reads as "nothing found".
      .catch((e: Error) => { if (live) setErrorCode(e.message || 'UNKNOWN'); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [orgId, snapshotId]);

  if (loading) return <section style={card}><p style={{ color: 'var(--text-muted)' }}>{T.enrichment.loading}</p></section>;

  if (errorCode) {
    const message = errorCode === 'INTEGRITY_FAILED' ? T.enrichment.integrityFailed
      : errorCode === 'NOT_FOUND' ? T.enrichment.notFound
      : T.enrichment.loadError;
    return (
      <section style={{ ...card, borderColor: RISK_COLOR.high }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 17 }}>{T.enrichment.title}</h2>
        <p style={{ margin: 0, color: RISK_COLOR.high }}>{message}</p>
      </section>
    );
  }

  if (!view) return null;

  return (
    <section style={card}>
      <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>{T.enrichment.title}</h2>
      <p style={{ margin: '0 0 14px', color: 'var(--text-muted)', fontSize: 13 }}>
        {T.enrichment.subtitle} <strong>{view.subjectDomain}</strong>
      </p>

      <SnapshotStamp view={view} T={T} />
      <Coverage view={view} T={T} />
      <Observed view={view} T={T} />
      <Declared view={view} T={T} />
      <Findings view={view} T={T} />

      <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>{T.enrichment.disclaimer}</p>
    </section>
  );
}

type Dict = ReturnType<typeof useLocale>;

/* ── Reproducibility stamp ─────────────────────────────────────────── */

function SnapshotStamp({ view, T }: { view: EnrichmentReportView; T: Dict }) {
  const rows: Array<[string, string]> = [
    [T.enrichment.snapshotId, view.snapshotId],
    [T.enrichment.capturedAt, view.createdAt],
    [T.enrichment.surface, view.surface],
    [T.enrichment.fingerprint, shortHash(view.digest)],
    [T.enrichment.integrity, view.integrityVerified ? T.enrichment.verified : T.enrichment.notVerified],
    [T.enrichment.engine, `${view.determinism.engineVersion} / ${view.determinism.comparisonEngineVersion}`],
    [T.enrichment.rulesets, `${view.determinism.comparisonRulesetVersion} / ${view.determinism.findingsRulesetVersion}`],
  ];
  return (
    <div style={{ background: 'var(--surface-2, rgba(0,0,0,0.03))', borderRadius: 8, padding: 12, marginBottom: 16 }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', gap: 8, justifyContent: 'space-between', padding: '2px 0' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
          <span style={mono}>{value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Coverage: what was NOT read is as important as what was ───────── */

function Coverage({ view, T }: { view: EnrichmentReportView; T: Dict }) {
  const stateLabel: Record<CoverageState, string> = {
    succeeded: T.enrichment.covRead,
    partial: T.enrichment.covPartial,
    rate_limited: T.enrichment.covRateLimited,
    unavailable: T.enrichment.covUnavailable,
    blocked: T.enrichment.covBlocked,
    not_attempted: T.enrichment.covNotAnalyzed,
  };
  const { summary, entries } = view.coverage;
  const missing = entries.filter(e => e.state !== 'succeeded');

  return (
    <Block title={T.enrichment.coverageTitle}>
      {summary.total === 0
        ? <Muted>{T.enrichment.coverageNone}</Muted>
        : (
          <>
            <Row left={T.enrichment.sourcesRead} right={`${summary.succeeded} / ${summary.total}`} />
            {missing.map(e => (
              <Row
                key={`${e.sourceType}-${e.collector}`}
                left={`${e.sourceType} (${e.collector})`}
                right={e.reason ? `${stateLabel[e.state]} — ${e.reason}` : stateLabel[e.state]}
              />
            ))}
            {!summary.complete && (
              <p style={{ margin: '8px 0 0', fontSize: 12, color: RISK_COLOR.medium }}>{T.enrichment.coverageIncomplete}</p>
            )}
          </>
        )}
      {view.droppedCount > 0 && <Muted>{T.enrichment.dropped.replace('{n}', String(view.droppedCount))}</Muted>}
    </Block>
  );
}

/* ── Observed / Declared inventories ───────────────────────────────── */

function Observed({ view, T }: { view: EnrichmentReportView; T: Dict }) {
  return (
    <Block title={T.enrichment.observedTitle}>
      {view.observedSystems.length === 0
        ? <Muted>{T.enrichment.observedNone}</Muted>
        : view.observedSystems.map(o => (
          <Row
            key={o.key}
            left={`${o.name} — ${o.signalTypes.join(', ')}`}
            right={`${o.confidence} · ${o.declared ? T.enrichment.isDeclared : T.enrichment.notDeclared}`}
          />
        ))}
    </Block>
  );
}

function Declared({ view, T }: { view: EnrichmentReportView; T: Dict }) {
  return (
    <Block title={T.enrichment.declaredTitle}>
      {view.declaredSystems.length === 0
        ? <Muted>{T.enrichment.declaredNone}</Muted>
        : view.declaredSystems.map(d => (
          <Row
            key={d.systemId}
            left={[d.name || d.vendor || d.systemId, d.vendor && d.vendor !== d.name ? d.vendor : ''].filter(Boolean).join(' — ')}
            right={d.unmatchable ? T.enrichment.cannotCompare : d.observed ? T.enrichment.corroborated : T.enrichment.noPublicEvidence}
          />
        ))}
    </Block>
  );
}

/* ── Findings — the mandated chain ─────────────────────────────────── */

function Findings({ view, T }: { view: EnrichmentReportView; T: Dict }) {
  return (
    <Block title={T.enrichment.findingsTitle}>
      {view.findings.length === 0
        ? <Muted>{T.enrichment.findingsNone}</Muted>
        : (
          <>
            <Muted>
              {T.enrichment.impactTotal
                .replace('{n}', String(view.findings.length))
                .replace('{points}', String(view.totalImpact))}
              {view.impactCapped ? ` (${T.enrichment.capped})` : ''}
            </Muted>
            {view.findings.map(f => <FindingCard key={f.findingId} finding={f} view={view} T={T} />)}
          </>
        )}
    </Block>
  );
}

function FindingCard({ finding: f, view, T }: { finding: Finding; view: EnrichmentReportView; T: Dict }) {
  const riskLabel: Record<RiskLevel, string> = {
    critical: T.enrichment.riskCritical, high: T.enrichment.riskHigh,
    medium: T.enrichment.riskMedium, low: T.enrichment.riskLow,
  };
  const gapLabel: Record<string, string> = {
    undeclared_system: T.enrichment.gapUndeclared,
    unverified_declaration: T.enrichment.gapUnverified,
    registry_incomplete: T.enrichment.gapIncomplete,
  };
  const observed = view.observedSystems.find(o => o.key === f.subjectKey);
  const declared = f.systemId ? view.declaredSystems.find(d => d.systemId === f.systemId) : undefined;

  return (
    <article style={{ border: '1px solid var(--border)', borderLeft: `4px solid ${RISK_COLOR[f.riskLevel]}`, borderRadius: 8, padding: 14, marginTop: 12 }}>
      {/* 1 · Finding */}
      <header style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <span style={{ ...mono, color: RISK_COLOR[f.riskLevel], fontWeight: 700 }}>{riskLabel[f.riskLevel]}</span>
        <strong style={{ fontSize: 14 }}>{f.title}</strong>
      </header>
      <Row left={T.enrichment.ruleId} right={f.ruleId} />
      <Row left={T.enrichment.subject} right={f.subject} />
      <Row
        left={T.enrichment.complianceImpact}
        right={f.scoreImpact > 0 ? `−${f.scoreImpact}` : T.enrichment.impactNone}
      />
      <p style={{ margin: '10px 0', fontSize: 13 }}>{f.explanation}</p>

      {/* 2 · Evidence */}
      <SubTitle>{T.enrichment.evidenceTitle}</SubTitle>
      {f.evidence.length === 0
        ? <Muted>{T.enrichment.evidenceAbsence}</Muted>
        : f.evidence.map(e => (
          <div key={e.evidenceId} style={{ borderTop: '1px dashed var(--border)', paddingTop: 8, marginTop: 8 }}>
            <blockquote style={{ margin: '0 0 6px', fontSize: 13, fontStyle: 'italic' }}>“{e.capturedEvidence}”</blockquote>
            <div style={mono}>
              <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">{e.sourceUrl}</a>
            </div>
            <div style={{ ...mono, color: 'var(--text-muted)' }}>
              {e.sourceType} · {e.collector} · {e.confidence} · {e.capturedAt}
            </div>
            <div style={{ ...mono, color: 'var(--text-muted)' }}>
              {T.enrichment.evidenceId}: {e.evidenceId} · {T.enrichment.hash}: {shortHash(e.evidenceHash)} · {T.enrichment.snapshotId}: {e.snapshotId}
            </div>
          </div>
        ))}

      {/* 3 · Observed → 4 · Declared → 5 · Gap */}
      <SubTitle>{T.enrichment.comparisonTitle}</SubTitle>
      <Row
        left={T.enrichment.observedLabel}
        right={observed ? `${observed.name} — ${observed.signalTypes.join(', ')}` : T.enrichment.notObserved}
      />
      <Row
        left={T.enrichment.declaredLabel}
        right={declared ? `${declared.name || declared.vendor || declared.systemId} (${declared.systemId})` : T.enrichment.noRegistryEntry}
      />
      <Row left={T.enrichment.gapLabel} right={gapLabel[f.gapKind] ?? f.gapKind} />

      {/* 6 · Recommendation (risk is already on the header) */}
      <SubTitle>{T.enrichment.recommendationTitle}</SubTitle>
      <p style={{ margin: 0, fontSize: 13 }}>{f.recommendation}</p>
    </article>
  );
}

/* ── Small presentational helpers ──────────────────────────────────── */

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 6px', fontSize: 14 }}>{title}</h3>
      {children}
    </div>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h4 style={{ margin: '12px 0 4px', fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{children}</h4>;
}

function Muted({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '4px 0', fontSize: 12, color: 'var(--text-muted)' }}>{children}</p>;
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', padding: '3px 0', fontSize: 12.5 }}>
      <span style={{ color: 'var(--text-muted)' }}>{left}</span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>{right}</span>
    </div>
  );
}
