import { useRoute } from '../../context/RouteContext';
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
const IMPACT_PRIORITY: Record<string, string> = { critical: 'Priority: Critical', high: 'Priority: High', medium: 'Priority: Medium', low: 'Priority: Low' };

/** Split an authored sentence-y description into up to 3 deterministic steps. */
function toSteps(rec: Recommendation | undefined): string[] {
  if (!rec) return [];
  const parts = rec.description.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  return (parts.length ? parts : [rec.title]).slice(0, 3);
}

export function ExplainedResults({ result }: { result: AuditResult }) {
  const { navigate } = useRoute();
  const recById = new Map<string, Recommendation>(result.recommendations.map(r => [r.id, r]));
  const sectionByKey = new Map(result.sectionScores.map(s => [s.key, s]));

  const ordered = [...result.findings].sort((a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity));

  const actions = (rec?: Recommendation) => [
    { label: rec?.category === 'automate' ? 'See agents that can do this' : 'See recommended agents', onClick: () => navigate({ name: 'agents' }), primary: true },
    { label: 'Open the design guide', onClick: () => navigate({ name: 'system-builder' }) },
  ];

  return (
    <section style={{ marginTop: 8 }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 19, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
        What your results mean
      </h2>
      <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.5 }}>
        Each item below explains what we found, why it matters, and the fastest next step — with the score points you can recover.
      </p>

      {ordered.length === 0 ? (
        <InsightCard
          tone="good" icon="✓" title="No gaps triggered — strong foundation"
          metric={`${result.globalScore}/100`}
          whatItMeans="Your answers didn’t trigger any findings — your AI practice already covers the basics we check."
          whyItMatters="That’s a solid base. The next gains come from operating these controls consistently and at scale."
          flow={{ input: 'good practices', process: 'make them routine', output: 'consistent controls', gain: 'durable, scalable trust' }}
          example="Teams here move from “we do this” to “this runs by itself” — automating the manual parts. (Illustrative.)"
          doNext={{ heading: 'Scale it', steps: ['Automate the controls you run by hand today.', 'Re-audit periodically to hold the line.'], actions: actions() }}
        />
      ) : (
        ordered.map((f: Finding) => {
          const rec = f.recommendationIds.map(id => recById.get(id)).find(Boolean);
          const sec = sectionByKey.get(f.sectionKey);
          const recoverable = sec ? Math.max(0, Math.round(sec.weight * 100 - sec.contribution)) : 0;
          const nar = getSectionNarrative(f.sectionKey);
          const badges = [
            IMPACT_PRIORITY[rec?.impact ?? f.severity] ?? 'Priority: Medium',
            rec ? `Effort: ${rec.effort}` : 'Effort: medium',
            rec ? `~${rec.timeframeDays} days` : '~30 days',
          ];
          const refs = (f.regulatoryRefs ?? rec?.regulatoryRefs ?? []).map(r => `${r.framework.replace(/_/g, ' ')} ${r.ref}`);
          return (
            <InsightCard
              key={f.id}
              icon={SEV_ICON[f.severity]}
              tone={SEV_TONE[f.severity]}
              title={f.title}
              metric={recoverable > 0 ? `−${recoverable} pts to recover` : f.severity}
              whatItMeans={nar.whatItMeans}
              whyItMatters={rec?.whyItMatters ?? nar.whyItMatters}
              flow={nar.flow}
              example={nar.example}
              doNext={{
                heading: rec ? CATEGORY_VERB[rec.category] : 'Do this next',
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
