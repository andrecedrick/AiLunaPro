/**
 * Deterministic, consulting-grade white-paper Report PDF (full New-Audit flow).
 *
 * Pure: same { title, createdAt, result, answers } -> byte-identical output.
 * The engine's `computedAt` is NEVER rendered. No LLM, no invented numbers
 * (impact is expressed in recoverable score points + risk, never fabricated
 * money), examples are labelled illustrative, disclaimers retained, no legal
 * conclusions. Built on the hand-rolled deterministic PDF primitives (no deps).
 */
import { PdfBuilder } from './pdf/pdf-doc';
import { drawReadinessBar, drawKpiTiles } from './pdf/pdf-charts';
import { coverPage, conceptBox, flowDiagram, maturityLadder, twoColumn } from './pdf/pdf-whitepaper';
import { getDeepNarrative } from './report-narrative';
import type { AuditAnswers, AuditResult } from './audit-scoring';

export const REPORT_PDF_ENGINE = 'report-pdf-2.0.0';
export const REPORT_DISCLAIMER =
  'Preparation support for your AI governance work - informational only. Not a certification, audit opinion, or legal advice.';

export interface ReportPdfInput {
  title: string;
  createdAt: string;
  result: AuditResult;
  answers: AuditAnswers;
}

const RISK_LABEL: Record<string, string> = {
  low: 'Low risk', medium: 'Medium risk', high: 'High risk', critical: 'Critical risk',
};
const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

/** Split an authored description into up to 3 deterministic action steps. */
function toSteps(desc: string): string[] {
  const parts = desc.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  return (parts.length ? parts : [desc]).slice(0, 3);
}

export function buildReportPdf(input: ReportPdfInput): Uint8Array {
  const { createdAt, result, answers } = input;
  void answers; // free-text answers are intentionally never rendered (privacy)
  const doc = new PdfBuilder();

  const score = result.globalScore;
  const riskLabel = RISK_LABEL[result.riskLevel] ?? result.riskLevel;
  const findingCount = result.findings.length;
  const recCount = result.recommendations.length;
  const quickWins = result.recommendations.filter(r => r.effort === 'low').length;

  const recoverableBy = new Map<string, number>();
  for (const s of result.sectionScores) recoverableBy.set(s.key, Math.max(0, Math.round(s.weight * 100 - s.contribution)));
  const recoverableTotal = [...recoverableBy.values()].reduce((a, b) => a + b, 0);

  const byScoreDesc = [...result.sectionScores].sort((a, b) => b.score - a.score);
  const weakSection = byScoreDesc[byScoreDesc.length - 1];
  const standing = score >= 75 ? 'strong' : score >= 50 ? 'mixed' : 'early';

  /* ── 1 · Cover page ───────────────────────────────────────────── */
  coverPage(doc, {
    title: 'AI Compliance & AI Maturity Report',
    subtitle: 'A strategic assessment of your AI readiness, risks, and opportunities.',
    metaRows: [
      ['PREPARED FOR', 'Your workspace'],
      ['DATE', createdAt],
      ['ENGINE', `${REPORT_PDF_ENGINE} - deterministic, no AI-generated text`],
    ],
  });

  /* ── 2 · Executive summary ────────────────────────────────────── */
  doc.h2('1.  Executive summary');
  doc.paraKey(
    `Your organisation scores ${score}/100 on AI compliance and maturity - a ${riskLabel.toLowerCase()} position. ` +
    `Left unaddressed, the ${findingCount} gap${findingCount === 1 ? '' : 's'} in this report ${findingCount === 1 ? 'is the one' : 'are the ones'} a regulator, customer, or partner tends to examine first, and they become more costly to fix the longer they wait. ` +
    `Acted on, they are largely quick wins: about ${recoverableTotal} points of your score are recoverable through ${recCount} well-understood action${recCount === 1 ? '' : 's'}, most of them low-effort. ` +
    (weakSection ? `Your single biggest lever is ${weakSection.title} at ${weakSection.score}/100. ` : '') +
    `The pages that follow show exactly what to do, in priority order, and how AiLuna gets you there faster.`,
  );
  conceptBox(doc, 'your compliance & maturity score',
    'Your score measures how well your AI practice is governed, secured, and explained - not how advanced your technology is. A higher score means lower risk and greater trust with customers, partners, and regulators.');
  doc.spacer(4);
  drawReadinessBar(doc, score, riskLabel);
  doc.spacer(4);
  drawKpiTiles(doc, [
    { value: `${recoverableTotal}`, label: 'Points recoverable' },
    { value: `${findingCount}`, label: 'Gaps identified' },
    { value: `${quickWins}`, label: 'Quick wins' },
    { value: `L${result.maturityLevel}/5`, label: 'Maturity' },
  ]);
  doc.spacer(4);
  doc.callout(REPORT_DISCLAIMER, 'amber');

  /* ── 3 · AI maturity snapshot ─────────────────────────────────── */
  doc.h2('2.  Your AI maturity snapshot');
  doc.muted('To understand why your score sits where it does, start with how systematically your organisation runs AI today.');
  conceptBox(doc, 'AI maturity level',
    'Maturity is a 1-to-5 measure of how systematic your AI practice is - from improvised (Level 1) to well-run and continuously improving (Level 5). It is not about how advanced your technology is, but how reliably you manage it.');
  maturityLadder(doc, result.maturityLevel);
  doc.paraKey(
    `You are at Level ${result.maturityLevel} of 5. ` +
    (result.maturityLevel >= 4
      ? 'That is a strong, well-managed practice; the next gains come from scaling what works and tightening the edges.'
      : 'Moving up a level is mostly about turning good intentions into repeatable habits - the specific, low-effort steps in this report are exactly how you climb.'),
  );

  /* ── 4 · Detailed risks & findings (grouped by area — no repetition) ── */
  doc.h2('3.  Detailed risks & findings');
  if (findingCount === 0) {
    doc.para('Your answers did not trigger any findings - your AI practice already covers the fundamentals we assess. The opportunity now is to make these good practices systematic and to automate the parts you still do by hand.');
  } else {
    doc.muted('Each area is explained once, in business terms: what it is, why it costs you, and what we flagged. Areas are ordered by priority.');
    const recById = new Map(result.recommendations.map(r => [r.id, r]));
    const sevRank = (s: string) => SEVERITY_ORDER.indexOf(s);
    // Group findings by area so a shared explanation is written ONCE per area.
    const groups = new Map<string, typeof result.findings>();
    for (const f of result.findings) { const g = groups.get(f.sectionKey) ?? []; g.push(f); groups.set(f.sectionKey, g); }
    const orderedKeys = [...groups.keys()].sort((a, b) =>
      Math.min(...groups.get(a)!.map(f => sevRank(f.severity))) - Math.min(...groups.get(b)!.map(f => sevRank(f.severity))));
    for (const key of orderedKeys) {
      const fs = groups.get(key)!;
      const nar = getDeepNarrative(key);
      const recoverable = recoverableBy.get(key) ?? 0;
      doc.h3(`${nar.title}${recoverable > 0 ? `   -   recover ~${recoverable} pts` : ''}`);
      conceptBox(doc, nar.concept, nar.conceptDef);
      doc.paraKey(nar.situation);
      doc.para(nar.businessCase);
      flowDiagram(doc, nar.flow);
      doc.para(`Example. ${nar.example} (Illustrative.)`);
      doc.muted('What we flagged in this area, and what to do:');
      const refSet = new Set<string>();
      for (const f of [...fs].sort((a, b) => sevRank(a.severity) - sevRank(b.severity))) {
        const rec = f.recommendationIds.map(id => recById.get(id)).find(Boolean);
        doc.bullet(`[${f.severity.toUpperCase()}] ${f.title}`);
        if (rec) doc.muted(`   Do: ${toSteps(rec.description)[0]}${rec.expectedOutcome ? ` (outcome: ${rec.expectedOutcome})` : ''}`, 9);
        for (const r of (f.regulatoryRefs ?? rec?.regulatoryRefs ?? [])) refSet.add(`${r.framework.replace(/_/g, ' ')} ${r.ref}`);
      }
      if (refSet.size) doc.muted(`Frameworks referenced: ${[...refSet].join(', ')} (advisory, not legal advice).`, 7);
      doc.spacer(8);
    }
  }

  /* ── 5 · Strengths & opportunities ────────────────────────────── */
  doc.h2('4.  Strengths & opportunities');
  doc.muted('A balanced read: you are not starting from zero. Here is the foundation to build on, beside the areas with the most headroom.');
  twoColumn(doc,
    { title: 'What is already working', items: byScoreDesc.filter(s => s.score >= 75).slice(0, 5).map(s => `${s.title} (${s.score}/100)`) },
    { title: 'Where the opportunity is', items: [...byScoreDesc].reverse().filter(s => s.score < 70).slice(0, 5).map(s => `${s.title} (${s.score}/100)`) },
  );
  doc.para('Your strengths are assets you can point to in sales and audits today. Your opportunities are where a small, well-sequenced effort moves the score - and the business - the most.');

  /* ── 6 · Business impact ──────────────────────────────────────── */
  doc.h2('5.  Business impact');
  doc.muted('Translated into the language of the business: risk reduced, efficiency gained, advantage created.');
  drawKpiTiles(doc, [
    { value: `+${recoverableTotal}`, label: 'Score pts recoverable' },
    { value: `${findingCount}`, label: 'Gaps to close' },
    { value: `${quickWins}`, label: 'Low-effort wins' },
  ]);
  doc.paraKey(`Risk reduction. Closing these gaps recovers up to ${recoverableTotal} points and moves you from a ${riskLabel.toLowerCase()} position toward one you can defend to customers, partners, and reviewers - precisely the things examined first when scrutiny arrives.`);
  doc.paraKey('Efficiency gains. The same controls remove manual rework - the reconstructions, the repeated debates, the back-and-forth - returning time to your team and making every future review faster.');
  doc.paraKey('Competitive advantage. Demonstrable, responsible AI is fast becoming a buying criterion. Closing these gaps turns compliance from a cost centre into a proof point that wins the trust - and the deals - others lose.');

  /* ── 7 · Recommended action roadmap ───────────────────────────── */
  doc.h2('6.  Recommended action roadmap');
  doc.muted('Sequenced by leverage, not difficulty - so the earliest steps return the most.');
  const hasRoadmap = result.roadmap.some(b => b.items.length > 0);
  if (!hasRoadmap) {
    doc.para('No prioritised actions were generated for this snapshot - a sign your fundamentals are largely in place. Focus on making good practice systematic.');
  } else {
    for (const bucket of result.roadmap) {
      if (!bucket.items.length) continue;
      doc.h3(bucket.label);
      doc.muted(bucket.description);
      for (const it of bucket.items) doc.bullet(`${it.title}  (${it.impact} impact / ${it.effort} effort)`);
      doc.spacer(2);
    }
  }

  /* ── 7 · Your three key priorities (the actionable summary) ───── */
  doc.h2('7.  Your three key priorities');
  doc.muted('If you do only three things, do these - chosen for the highest impact at the lowest effort.');
  const IMPACT_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const EFFORT_RANK: Record<string, number> = { low: 0, medium: 1, high: 2 };
  const topRecs = [...result.recommendations]
    .sort((a, b) => (IMPACT_RANK[a.impact] - IMPACT_RANK[b.impact]) || (EFFORT_RANK[a.effort] - EFFORT_RANK[b.effort]))
    .slice(0, 3);
  if (topRecs.length === 0) {
    doc.para('Your fundamentals are largely in place - the priority is simply to keep them systematic and re-audit periodically.');
  } else {
    topRecs.forEach((r, i) => {
      doc.h3(`Priority ${i + 1}:  ${r.title}`);
      const why = (r.whyItMatters ?? '').trim();
      doc.para(`${why}${why && !why.endsWith('.') ? '.' : ''} ${r.expectedOutcome ? `Outcome: ${r.expectedOutcome}` : ''}`.trim());
      doc.muted(`Effort: ${r.effort} - about ${r.timeframeDays} days.`, 9);
    });
  }

  /* ── 8 · How AiLuna can help ──────────────────────────────────── */
  doc.h2('8.  How AiLuna can help you improve');
  doc.para('You now know exactly what to fix. The real question is how fast - and whether you do it alone. AiLuna is built to compress that timeline.');
  doc.paraKey(`What you gain. A clear, prioritised path from ${score}/100 toward a defensible position - turning a list of gaps into a sequence of quick, compounding wins that reduce risk, recover hours, and give you the responsible-AI proof points enterprise buyers ask for. You can achieve these improvements faster, and with less risk, using AiLuna.`);
  doc.muted('What happens next - three steps:');
  doc.bullet('Match. See the AiLuna agents mapped to your findings; each one targets a specific gap in this report.');
  doc.bullet('Act. Start with the highest-leverage, lowest-effort fixes from your 30-day roadmap.');
  doc.bullet('Prove. Re-audit to watch your score climb and generate the evidence your stakeholders ask for.');
  doc.callout('Your next step: open your matched agents and start with action one from the roadmap. In the app, this links straight to your recommended agents and a deeper audit.', 'tint');

  /* ── 9 · Conclusion ───────────────────────────────────────────── */
  doc.h2('9.  Conclusion');
  doc.paraKey(
    `Your AI practice is ${standing}, and the path forward is clear and largely low-effort. ` +
    `The cost of waiting is quiet but compounding; the value of acting is a lower-risk, more efficient, more trusted business. ` +
    (weakSection ? `Start with your single biggest lever - ${weakSection.title} - and let each quick win build on the last. ` : '') +
    `This is a position you can move out of in weeks, not quarters.`,
  );
  doc.callout(
    'Framework references (EU AI Act, GDPR, ISO/IEC 42001, NIST AI RMF) are indicative and informational - not a legal classification or advice. This report is preparation support, not a certification or audit opinion.',
    'tint',
  );

  return doc.serialize({ createdAt, footerVersion: `${REPORT_PDF_ENGINE} - ${createdAt}` });
}
