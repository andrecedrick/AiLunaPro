/**
 * SystemBuilderPage — J9 Batch 3 (Phase C skeleton).
 *
 * STATIC, READ-ONLY pre-deployment design guide for AI systems. Helps users
 * design AI systems correctly across six dimensions: purpose & risk, data
 * governance, model selection & validation, human oversight, monitoring &
 * incidents, documentation & transparency.
 *
 * STRICT GUARDRAILS:
 *   - B3 (2026-06-11): localStorage-only persistence of current step + checklist
 *     ticks (personal progress markers; no backend, no cross-device, no PII).
 *   - No scoring, no validation of user input.
 *   - All content static + deterministic.
 *   - No LLM. No code generation. No legal advice.
 *   - Mandatory §9.22 disclaimer surfaces here too.
 *   - Auth-gated like other content routes (sits inside the dashboard shell).
 */

import { useState, useMemo } from 'react';
import { Disclaimer } from '../components/result/Disclaimer';
import type { RegulatoryRef } from '../types/scoring';
import {
  readBuilderStep, saveBuilderStep, readBuilderTicks, saveBuilderTicks, tickKey,
} from '../lib/systemBuilder/builderState';
import { useLocale } from '../context/LocaleContext';
import { format } from '../lib/locale/i18n';
import type { Dict } from '../lib/locale/i18n/en';

interface BuilderStep {
  key: string;
  title: string;
  intro: string;
  checklist: string[];
  questions: string[];
  refs: RegulatoryRef[];
}

function buildSteps(t: Dict['systemBuilder']): BuilderStep[] {
  return [
    {
      key: 'purpose',
      title: t.steps.purpose.title,
      intro: t.steps.purpose.intro,
      checklist: [
        t.steps.purpose.checklist.c1,
        t.steps.purpose.checklist.c2,
        t.steps.purpose.checklist.c3,
        t.steps.purpose.checklist.c4,
        t.steps.purpose.checklist.c5,
      ],
      questions: [
        t.steps.purpose.questions.q1,
        t.steps.purpose.questions.q2,
        t.steps.purpose.questions.q3,
      ],
      refs: [
        { framework: 'EU_AI_ACT',   ref: 'Art. 6 / Annex III', note: 'High-risk classification' },
        { framework: 'EU_AI_ACT',   ref: 'Art. 5',             note: 'Prohibited practices' },
        { framework: 'NIST_AI_RMF', ref: 'MAP-1' },
        { framework: 'ISO_42001',   ref: 'cl. 6.1' },
      ],
    },
    {
      key: 'data',
      title: t.steps.data.title,
      intro: t.steps.data.intro,
      checklist: [
        t.steps.data.checklist.c1,
        t.steps.data.checklist.c2,
        t.steps.data.checklist.c3,
        t.steps.data.checklist.c4,
        t.steps.data.checklist.c5,
      ],
      questions: [
        t.steps.data.questions.q1,
        t.steps.data.questions.q2,
        t.steps.data.questions.q3,
      ],
      refs: [
        { framework: 'EU_AI_ACT',   ref: 'Art. 10',          note: 'Data and data governance' },
        { framework: 'GDPR',        ref: 'Art. 5 / 6 / 9',   note: 'Principles + lawful basis + special categories' },
        { framework: 'NIST_AI_RMF', ref: 'GOVERN-5' },
        { framework: 'ISO_42001',   ref: 'cl. 6.1.3' },
      ],
    },
    {
      key: 'model',
      title: t.steps.model.title,
      intro: t.steps.model.intro,
      checklist: [
        t.steps.model.checklist.c1,
        t.steps.model.checklist.c2,
        t.steps.model.checklist.c3,
        t.steps.model.checklist.c4,
        t.steps.model.checklist.c5,
      ],
      questions: [
        t.steps.model.questions.q1,
        t.steps.model.questions.q2,
        t.steps.model.questions.q3,
      ],
      refs: [
        { framework: 'EU_AI_ACT',   ref: 'Art. 15',     note: 'Accuracy, robustness, cybersecurity' },
        { framework: 'NIST_AI_RMF', ref: 'MEASURE-2' },
        { framework: 'ISO_42001',   ref: 'cl. 8.2' },
      ],
    },
    {
      key: 'oversight',
      title: t.steps.oversight.title,
      intro: t.steps.oversight.intro,
      checklist: [
        t.steps.oversight.checklist.c1,
        t.steps.oversight.checklist.c2,
        t.steps.oversight.checklist.c3,
        t.steps.oversight.checklist.c4,
        t.steps.oversight.checklist.c5,
      ],
      questions: [
        t.steps.oversight.questions.q1,
        t.steps.oversight.questions.q2,
        t.steps.oversight.questions.q3,
      ],
      refs: [
        { framework: 'EU_AI_ACT',   ref: 'Art. 14',     note: 'Human oversight' },
        { framework: 'NIST_AI_RMF', ref: 'MANAGE-2' },
        { framework: 'ISO_42001',   ref: 'cl. 8.3' },
      ],
    },
    {
      key: 'monitoring',
      title: t.steps.monitoring.title,
      intro: t.steps.monitoring.intro,
      checklist: [
        t.steps.monitoring.checklist.c1,
        t.steps.monitoring.checklist.c2,
        t.steps.monitoring.checklist.c3,
        t.steps.monitoring.checklist.c4,
        t.steps.monitoring.checklist.c5,
      ],
      questions: [
        t.steps.monitoring.questions.q1,
        t.steps.monitoring.questions.q2,
        t.steps.monitoring.questions.q3,
      ],
      refs: [
        { framework: 'EU_AI_ACT',   ref: 'Art. 72',     note: 'Post-market monitoring' },
        { framework: 'EU_AI_ACT',   ref: 'Art. 73',     note: 'Serious incident reporting' },
        { framework: 'NIST_AI_RMF', ref: 'MANAGE-4' },
        { framework: 'ISO_42001',   ref: 'cl. 9.1' },
      ],
    },
    {
      key: 'docs',
      title: t.steps.docs.title,
      intro: t.steps.docs.intro,
      checklist: [
        t.steps.docs.checklist.c1,
        t.steps.docs.checklist.c2,
        t.steps.docs.checklist.c3,
        t.steps.docs.checklist.c4,
        t.steps.docs.checklist.c5,
      ],
      questions: [
        t.steps.docs.questions.q1,
        t.steps.docs.questions.q2,
        t.steps.docs.questions.q3,
      ],
      refs: [
        { framework: 'EU_AI_ACT',   ref: 'Art. 11',       note: 'Technical documentation' },
        { framework: 'EU_AI_ACT',   ref: 'Art. 13',       note: 'Transparency to deployer' },
        { framework: 'EU_AI_ACT',   ref: 'Art. 50',       note: 'Transparency to natural persons' },
        { framework: 'NIST_AI_RMF', ref: 'GOVERN-1.6' },
        { framework: 'ISO_42001',   ref: 'cl. 8.4 / 8.5' },
      ],
    },
  ];
}

const FRAMEWORK_LABEL: Record<RegulatoryRef['framework'], string> = {
  EU_AI_ACT:   'EU AI Act',
  GDPR:        'GDPR',
  NIST_AI_RMF: 'NIST AI RMF',
  ISO_42001:   'ISO/IEC 42001',
  OECD_AI:     'OECD AI',
};

function RefChip({ r }: { r: RegulatoryRef }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        background: 'var(--surface-2, var(--surface))',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        marginRight: 6,
        marginBottom: 6,
        whiteSpace: 'nowrap',
      }}
      title={r.note ?? ''}
    >
      <strong style={{ color: 'var(--text-primary)' }}>{FRAMEWORK_LABEL[r.framework]}</strong>
      <span>{r.ref}</span>
    </span>
  );
}

function StepNavItem({
  step,
  active,
  onClick,
}: {
  step: BuilderStep;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '10px 12px',
        borderRadius: 10,
        border: 'none',
        background: active ? 'var(--brand-soft-bg)' : 'transparent',
        color: active ? 'var(--violet-text)' : 'var(--text-primary)',
        fontWeight: active ? 700 : 500,
        fontSize: 13,
        fontFamily: 'var(--font-body)',
        cursor: 'pointer',
        marginBottom: 2,
      }}
    >
      {step.title}
    </button>
  );
}

export function SystemBuilderPage() {
  const T = useLocale();
  const BUILDER_STEPS = useMemo(() => buildSteps(T.systemBuilder), [T]);
  // B3: restore the last visited step + checklist ticks from localStorage.
  const [stepIdx, setStepIdxRaw] = useState(() => Math.min(readBuilderStep(), BUILDER_STEPS.length - 1));
  const [ticks, setTicks] = useState(() => readBuilderTicks());
  const setStepIdx = (value: number | ((i: number) => number)) => {
    setStepIdxRaw(i => {
      const next = typeof value === 'function' ? value(i) : value;
      saveBuilderStep(next);
      return next;
    });
  };
  const toggleTick = (key: string) => {
    setTicks(prev => {
      const next = { ...prev };
      if (next[key]) delete next[key]; else next[key] = true;
      saveBuilderTicks(next);
      return next;
    });
  };
  const step = BUILDER_STEPS[stepIdx];
  const doneCount = step.checklist.filter((_, i) => ticks[tickKey(step.key, i)]).length;
  const isFirst = stepIdx === 0;
  const isLast  = stepIdx === BUILDER_STEPS.length - 1;

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '8px 4px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 28,
            color: 'var(--text-primary)',
            letterSpacing: -0.5,
          }}
        >
          {T.systemBuilder.chrome.pageTitle}
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.55, maxWidth: 720 }}>
          {T.systemBuilder.chrome.pageIntro}
        </p>
      </div>

      <Disclaimer />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 22,
          alignItems: 'flex-start',
          marginTop: 18,
        }}
      >
        {/* Step nav */}
        <aside
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--card-radius)',
            boxShadow: 'var(--card-shadow)',
            padding: 12,
            position: 'sticky',
            top: 92,
            alignSelf: 'flex-start',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              padding: '6px 10px 10px',
            }}
          >
            {T.systemBuilder.chrome.designSteps}
          </div>
          {BUILDER_STEPS.map((s, i) => (
            <StepNavItem
              key={s.key}
              step={s}
              active={i === stepIdx}
              onClick={() => setStepIdx(i)}
            />
          ))}
        </aside>

        {/* Step content */}
        <main style={{ minWidth: 0 }}>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--card-radius)',
              boxShadow: 'var(--card-shadow)',
              padding: '22px 26px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: -0.3,
              }}
            >
              {step.title}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 8 }}>
              {step.intro}
            </p>

            {/* Checklist */}
            <h3
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginTop: 20,
                marginBottom: 8,
              }}
            >
              {T.systemBuilder.chrome.checklist} <span style={{ color: 'var(--violet-text)' }}>{format(T.systemBuilder.chrome.doneSuffix, { doneCount, total: step.checklist.length })}</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {step.checklist.map((c, i) => {
                const k = tickKey(step.key, i);
                const done = Boolean(ticks[k]);
                return (
                  <label key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 14, lineHeight: 1.65, cursor: 'pointer', color: done ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    <input type="checkbox" checked={done} onChange={() => toggleTick(k)} style={{ marginTop: 4, accentColor: 'var(--violet)' }} />
                    <span style={{ textDecoration: done ? 'line-through' : 'none' }}>{c}</span>
                  </label>
                );
              })}
            </div>

            {/* Key questions */}
            <h3
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginTop: 22,
                marginBottom: 8,
              }}
            >
              {T.systemBuilder.chrome.keyQuestions}
            </h3>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.65 }}>
              {step.questions.map((q, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  {q}
                </li>
              ))}
            </ul>

            {/* References */}
            <h3
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginTop: 22,
                marginBottom: 8,
              }}
            >
              {T.systemBuilder.chrome.references}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {step.refs.map((r, i) => (
                <RefChip key={i} r={r} />
              ))}
            </div>
          </div>

          {/* Footer nav */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 18,
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => setStepIdx(i => Math.max(0, i - 1))}
              disabled={isFirst}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: isFirst ? 'not-allowed' : 'pointer',
                opacity: isFirst ? 0.45 : 1,
                fontWeight: 600,
                fontSize: 13,
                fontFamily: 'var(--font-body)',
              }}
            >
              {T.systemBuilder.chrome.previousStep}
            </button>

            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {format(T.systemBuilder.chrome.stepOf, { n: stepIdx + 1, total: BUILDER_STEPS.length })}
            </div>

            {/* Final step: a disabled "Next" reads as "blocked" when the truth
                is "finished" — show an explicit end-of-guide marker instead.
                Checklist ticks intentionally never gate navigation (personal
                markers only, no scoring semantics — B3 decision). */}
            {isLast ? (
              <div
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'var(--brand-tint-bg)',
                  color: 'var(--violet-text)',
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: 'var(--font-body)',
                }}
              >
                {T.systemBuilder.chrome.endOfGuide}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setStepIdx(i => Math.min(BUILDER_STEPS.length - 1, i + 1))}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--brand-gradient)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: 'var(--font-body)',
                }}
              >
                {T.systemBuilder.chrome.nextStep}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
