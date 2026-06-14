import { useRoute } from '../../context/RouteContext';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';
import type { AuditResult, Finding, Recommendation, Severity } from '../../types/scoring';
import { getSectionNarrative, CATEGORY_VERB } from '../../lib/result/narrative';
import { InsightCard, type InsightTone } from './InsightCard';

/**
 * Full-audit "What your results mean" — replaces the flat findings/recommendations
 * lists with pedagogical Insight Cards (deterministic). Each card merges a finding,
 * its linked recommendation, the section's recoverable score points, and a
 * conversion-first next step toward agents / the design guide. No LLM, no PII.
 */

const SEV_ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];
const SEV_TONE: Record<Severity, InsightTone> = { critical: 'critical', high: 'warning', medium: 'warning', low: 'info' };
const SEV_ICON: Record<Severity, string> = { critical: '⛔', high: '⚠', medium: '•', low: 'ℹ' };

/** Split an authored sentence-y description into up to 3 deterministic steps. */
function toSteps(rec: Recommendation | undefined): string[] {
  if (!rec) return [];
  const parts = rec.description.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  return (parts.length ? parts : [rec.title]).slice(0, 3);
}

export function ExplainedResults({ result }: { result: AuditResult }) {
  const { navigate } = useRoute();
  const T = useLocale();
  const E = T.results.explained;
  const priorityLabel = (k: string): string =>
    ({ critical: E.priorityCritical, high: E.priorityHigh, medium: E.priorityMedium, low: E.priorityLow } as Record<string, string>)[k] ?? E.priorityMedium;
  const recById = new Map<string, Recommendation>(result.recommendations.map(r => [r.id, r]));
  const sectionByKey = new Map(result.sectionScores.map(s => [s.key, s]));

  const ordered = [...result.findings].sort((a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity));

  const actions = (rec?: Recommendation) => [
    { label: rec?.category === 'automate' ? E.ctaSeeAgentsForThis : E.ctaSeeRecommendedAgents, onClick: () => navigate({ name: 'agents' }), primary: true },
    { label: E.ctaOpenDesignGuide, onClick: () => navigate({ name: 'system-builder' }) },
  ];

  return (
    <section style={{ marginTop: 8 }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 19, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
        {E.heading}
      </h2>
      <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.5 }}>
        {E.subtitle}
      </p>

      {ordered.length === 0 ? (
        <InsightCard
          tone="good" icon="✓" title={E.emptyTitle}
          metric={`${result.globalScore}/100`}
          whatItMeans={E.emptyWhatItMeans}
          whyItMatters={E.emptyWhyItMatters}
          flow={{ input: E.emptyFlowInput, process: E.emptyFlowProcess, output: E.emptyFlowOutput, gain: E.emptyFlowGain }}
          example={E.emptyExample}
          doNext={{ heading: E.emptyDoNextHeading, steps: [E.emptyDoNextStep1, E.emptyDoNextStep2], actions: actions() }}
        />
      ) : (
        ordered.map((f: Finding) => {
          const rec = f.recommendationIds.map(id => recById.get(id)).find(Boolean);
          const sec = sectionByKey.get(f.sectionKey);
          const recoverable = sec ? Math.max(0, Math.round(sec.weight * 100 - sec.contribution)) : 0;
          const nar = getSectionNarrative(f.sectionKey);
          const badges = [
            priorityLabel(rec?.impact ?? f.severity),
            rec ? format(E.effortBadge, { effort: rec.effort }) : E.effortBadgeDefault,
            rec ? format(E.timeframeBadge, { days: rec.timeframeDays }) : E.timeframeBadgeDefault,
          ];
          const refs = (f.regulatoryRefs ?? rec?.regulatoryRefs ?? []).map(r => `${r.framework.replace(/_/g, ' ')} ${r.ref}`);
          return (
            <InsightCard
              key={f.id}
              icon={SEV_ICON[f.severity]}
              tone={SEV_TONE[f.severity]}
              title={f.title}
              metric={recoverable > 0 ? format(E.ptsToRecover, { n: recoverable }) : f.severity}
              whatItMeans={nar.whatItMeans}
              whyItMatters={rec?.whyItMatters ?? nar.whyItMatters}
              flow={nar.flow}
              example={nar.example}
              doNext={{
                heading: rec ? CATEGORY_VERB[rec.category] : T.results.insightCard.doThisNext,
                badges,
                steps: toSteps(rec).length ? toSteps(rec) : [f.description],
                outcome: rec?.expectedOutcome,
                actions: actions(rec),
              }}
              references={refs.length ? refs : undefined}
            />
          );
        })
      )}
    </section>
  );
}
