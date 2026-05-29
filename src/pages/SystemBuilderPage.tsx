/**
 * SystemBuilderPage — J9 Batch 3 (Phase C skeleton).
 *
 * STATIC, READ-ONLY pre-deployment design guide for AI systems. Helps users
 * design AI systems correctly across six dimensions: purpose & risk, data
 * governance, model selection & validation, human oversight, monitoring &
 * incidents, documentation & transparency.
 *
 * STRICT GUARDRAILS:
 *   - No persistence v1 (state is in-memory only — currentStep).
 *   - No scoring, no validation of user input (no input fields at all).
 *   - All content static + deterministic.
 *   - No LLM. No code generation. No legal advice.
 *   - Mandatory §9.22 disclaimer surfaces here too.
 *   - Auth-gated like other content routes (sits inside the dashboard shell).
 */

import { useState } from 'react';
import { Disclaimer } from '../components/result/Disclaimer';
import type { RegulatoryRef } from '../types/scoring';

interface BuilderStep {
  key: string;
  title: string;
  intro: string;
  checklist: string[];
  questions: string[];
  refs: RegulatoryRef[];
}

const BUILDER_STEPS: BuilderStep[] = [
  {
    key: 'purpose',
    title: '1. Purpose & risk classification',
    intro:
      "Pin down what the system is for, who it affects, and how risky it is before you build anything. This anchors every later decision.",
    checklist: [
      'Write a one-sentence intended purpose (no jargon).',
      'List affected persons or groups (users, customers, third parties).',
      'Classify risk tier: unacceptable / high (Annex III) / limited / minimal — or GPAI.',
      'Document use-case scope and the boundary (what is out of scope).',
      'List foreseeable misuse / off-label use and what you will refuse to do.',
    ],
    questions: [
      'Who has the authority to deploy or pause this system?',
      'What happens — concretely — if the system gets it wrong?',
      'Which legal rights, safety conditions, or freedoms could be affected?',
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
    title: '2. Data governance',
    intro:
      "If your data is wrong, the system is wrong. Inventory it, classify it, justify why you hold it, and watch for bias.",
    checklist: [
      'Build a data inventory: source, owner, sensitivity, retention.',
      'Establish a lawful basis (GDPR Art. 6) for every category processed.',
      'Document quality: relevance, representativeness, gaps, known biases.',
      'Apply data minimisation: collect only what you need; retain only as long as needed.',
      'Plan periodic bias reviews and corrective action paths.',
    ],
    questions: [
      'Where did each dataset come from, and who is accountable for it?',
      'Does the dataset include sensitive categories (Art. 9 GDPR)? On what basis?',
      'What bias signals will you measure, and against what baseline?',
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
    title: '3. Model selection & validation',
    intro:
      "Pick the smallest model that works. Validate it the way attackers and users will actually use it. Document what it cannot do.",
    checklist: [
      'Justify the choice of model size / family vs the actual use case.',
      'Define accuracy + robustness targets and how you will measure them.',
      'Run adversarial / red-team testing (prompt injection, jailbreaks, biased outputs).',
      'Document known failure modes and explicit non-uses.',
      'Version every model artefact and ship change notes with deployments.',
    ],
    questions: [
      'Why this model, and what cheaper alternative did you rule out?',
      'What does the system look like when it is wrong — and how do you know?',
      'Is your test set representative of production traffic?',
    ],
    refs: [
      { framework: 'EU_AI_ACT',   ref: 'Art. 15',     note: 'Accuracy, robustness, cybersecurity' },
      { framework: 'NIST_AI_RMF', ref: 'MEASURE-2' },
      { framework: 'ISO_42001',   ref: 'cl. 8.2' },
    ],
  },
  {
    key: 'oversight',
    title: '4. Human oversight',
    intro:
      "Decide how humans stay in control of consequential outcomes. Make sure the controls actually work under pressure.",
    checklist: [
      'Choose oversight mode per decision type: in-loop, on-loop, or out-of-loop.',
      'Name reviewers and document SLAs for high-stakes decisions.',
      'Provide override / pause / kill-switch controls the reviewer can use.',
      'Write an escalation runbook (who is paged, with what context).',
      'Log every override / pause for post-incident review.',
    ],
    questions: [
      'Who reviews high-stakes outputs — and do they have the time and context to do it?',
      'Can a single operator stop the system without a meeting?',
      'How do you avoid rubber-stamping ("automation complacency")?',
    ],
    refs: [
      { framework: 'EU_AI_ACT',   ref: 'Art. 14',     note: 'Human oversight' },
      { framework: 'NIST_AI_RMF', ref: 'MANAGE-2' },
      { framework: 'ISO_42001',   ref: 'cl. 8.3' },
    ],
  },
  {
    key: 'monitoring',
    title: '5. Monitoring & incidents',
    intro:
      "Post-deployment monitoring is non-optional. Drift is silent. Incidents are not.",
    checklist: [
      'Define post-deployment monitoring metrics (accuracy, latency, harm, drift).',
      'Implement drift detection on inputs and outputs.',
      'Log incidents to a single queue with severity and owner.',
      'Document reporting paths (regulator, customer, internal).',
      'Schedule periodic re-evaluation (quarterly minimum).',
    ],
    questions: [
      'What single metric, if it moves, tells you to pause the system?',
      'Who gets paged at 3am, and what runbook do they open?',
      'When did you last rehearse an AI incident scenario?',
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
    title: '6. Documentation & transparency',
    intro:
      "Write down what the system is, what it is not, and what users need to know. Refresh on every material change.",
    checklist: [
      'Maintain technical documentation per Art. 11 (purpose, data, training, eval, risks).',
      'Publish a model / system card per system; refresh on every release.',
      'Add a user-facing AI disclosure on every customer surface.',
      'Update privacy notices to reflect AI processing.',
      'Keep training records for staff who operate the system.',
    ],
    questions: [
      'What do end-users need to know to use this system responsibly?',
      'What would an external auditor need on day one?',
      'How fresh is the model / system card right now?',
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
  const [stepIdx, setStepIdx] = useState(0);
  const step = BUILDER_STEPS[stepIdx];
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
          AI System Builder
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.55, maxWidth: 720 }}>
          A pre-deployment design guide. Walk through six dimensions — purpose &amp; risk,
          data, model, oversight, monitoring, documentation — to design an AI system
          responsibly. Read-only checklist and key questions; nothing here is saved.
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
            Design steps
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
              Checklist
            </h3>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.65 }}>
              {step.checklist.map((c, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  {c}
                </li>
              ))}
            </ul>

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
              Key questions
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
              References (advisory, not legal advice)
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
              ← Previous step
            </button>

            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Step {stepIdx + 1} of {BUILDER_STEPS.length}
            </div>

            <button
              type="button"
              onClick={() => setStepIdx(i => Math.min(BUILDER_STEPS.length - 1, i + 1))}
              disabled={isLast}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: isLast ? 'var(--surface-2, var(--surface))' : 'var(--brand-gradient)',
                color: isLast ? 'var(--text-muted)' : '#fff',
                cursor: isLast ? 'not-allowed' : 'pointer',
                opacity: isLast ? 0.6 : 1,
                fontWeight: 700,
                fontSize: 13,
                fontFamily: 'var(--font-body)',
              }}
            >
              Next step →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
