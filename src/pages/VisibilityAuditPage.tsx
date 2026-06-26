/**
 * VisibilityAuditPage — AI Visibility (GEO) & Social audit (G3 + G4).
 * Authenticated in-app tool: #/visibility
 *
 * Deterministic scored questionnaire (méthode §7.1 / §7.2): the user answers
 * Non / Partiel / Oui for each GEO and social check; the page shows live scores
 * per dimension, an overall grade, and prioritized recommendations. No LLM.
 * French-first labels. Pure client tool + localStorage.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRoute } from '../context/RouteContext';
import { track } from '../lib/analytics/track';
import {
  computeVisibility, VISIBILITY_QUESTIONS,
  type Answers, type Dimension, type Grade,
} from '../lib/visibility/visibilityAudit';

const STORAGE_KEY = 'ailunapro-visibility-v1';

const CHOICES: Array<{ v: number; label: string }> = [
  { v: 0,   label: 'Non' },
  { v: 0.5, label: 'Partiel' },
  { v: 1,   label: 'Oui' },
];

const DIM_META: Record<Dimension, { title: string; sub: string }> = {
  geo:    { title: 'Visibilité IA (GEO / AI Search)', sub: 'Présence et exactitude dans ChatGPT, Perplexity, Gemini, Google AI.' },
  social: { title: 'Réseaux sociaux & contenu',       sub: 'Autorité, métriques utiles, régularité, supervision du contenu IA.' },
};

const GRADE_COLOR: Record<Grade, string> = { A: 'var(--green-text)', B: '#2563EB', C: '#B45309', D: 'var(--red-text)' };

function loadAnswers(): Answers {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw) as Answers; } catch { /* ignore */ }
  return {};
}

export function VisibilityAuditPage() {
  const { navigate } = useRoute();
  const [answers, setAnswers] = useState<Answers>(loadAnswers);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); } catch { /* quota */ }
  }, [answers]);

  const result = useMemo(() => computeVisibility(answers), [answers]);
  const set = (id: string, v: number) => setAnswers(prev => ({ ...prev, [id]: v }));
  const reset = () => setAnswers({});

  // Self-assessment: an untouched form must NOT show a red 0/100 "Note D" as if it
  // were a measured verdict. Gate the headline until at least one answer is given.
  const answered = result.dimensions.reduce((s, d) => s + d.answered, 0);
  const hasAnswers = answered > 0;

  const dims: Dimension[] = ['geo', 'social'];

  return (
    <div style={{ padding: '28px 24px', maxWidth: 920, margin: '0 auto' }}>
      <header style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Auto-évaluation Visibilité IA & Réseaux sociaux
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55, maxWidth: 720 }}>
          Évalue ta présence dans les réponses des IA (GEO) et sur les réseaux sociaux.
          Réponds <strong>Non / Partiel / Oui</strong> ; score et recommandations en direct.
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.5, maxWidth: 720, fontStyle: 'italic' }}>
          Indicateur de maturité déclaratif : le score reflète tes propres réponses, ce n’est pas une mesure
          des moteurs IA. Pour un audit mesuré, demande un plan d’action.
        </p>
      </header>

      {/* Score banner — neutral until the user has answered at least one question. */}
      {hasAnswers ? (
        <section style={{ ...card, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={statLabel}>Score global (déclaratif)</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: GRADE_COLOR[result.grade], lineHeight: 1 }}>
              {result.overallScore}<span style={{ fontSize: 18, color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: GRADE_COLOR[result.grade] }}>Note {result.grade}</div>
          </div>
          {result.dimensions.map(d => (
            <div key={d.dimension} style={{ flex: '1 1 200px', minWidth: 180 }}>
              <div style={statLabel}>{DIM_META[d.dimension].title}</div>
              <Bar value={d.score} />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{d.score}/100 · {d.answered}/{d.total} répondu</div>
            </div>
          ))}
        </section>
      ) : (
        <section style={{ ...card, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
          Réponds aux questions ci-dessous — ton score de maturité et tes recommandations s’afficheront ici.
        </section>
      )}

      {/* Questions by dimension */}
      {dims.map(dim => (
        <section key={dim} style={card}>
          <div style={sectionTitle}>{DIM_META[dim].title}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12 }}>{DIM_META[dim].sub}</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {VISIBILITY_QUESTIONS.filter(q => q.dimension === dim).map(q => (
              <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ flex: 1, minWidth: 220, fontSize: 13.5, color: 'var(--text-primary)' }}>{q.label}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {CHOICES.map(ch => {
                    const active = answers[q.id] === ch.v;
                    return (
                      <button key={ch.v} onClick={() => set(q.id, ch.v)} style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                        border: active ? '1px solid var(--violet)' : '1px solid var(--border)',
                        background: active ? 'var(--violet)' : 'var(--surface)',
                        color: active ? '#fff' : 'var(--text-secondary)',
                      }}>{ch.label}</button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <section style={card}>
          <div style={sectionTitle}>Recommandations prioritaires</div>
          <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
            {result.recommendations.slice(0, 6).map((r, i) => (
              <li key={r.id} style={{ display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <span style={{ flex: '0 0 auto', width: 22, height: 22, borderRadius: 6, background: 'var(--violet)', color: '#fff', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                <span style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>
                  {r.text} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {r.dimension === 'geo' ? 'GEO' : 'Social'}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Conversion — turn a weak score into a paid action plan. */}
      {hasAnswers && result.recommendations.length > 0 && (
        <section style={{ ...card, border: '1px solid var(--violet)', background: 'rgba(124,58,237,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', minWidth: 240 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              Passe de la note {result.grade} à un plan d’action.
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              On chiffre la mise en œuvre de tes {result.recommendations.length} priorités dans un devis.
            </div>
          </div>
          <button
            onClick={() => { track('cta_clicked', { flow: 'visibility', target: 'quote' }); navigate({ name: 'quote' }); }}
            style={{ padding: '12px 22px', borderRadius: 10, border: '1px solid var(--violet)', background: 'var(--violet)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Obtenir un plan d’action / devis →
          </button>
        </section>
      )}

      <div style={{ marginTop: 14 }}>
        <button onClick={reset} style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

function Bar({ value }: { value: number }) {
  const color = value >= 80 ? 'var(--green-text)' : value >= 60 ? '#2563EB' : value >= 40 ? '#B45309' : 'var(--red-text)';
  return (
    <div style={{ height: 8, borderRadius: 4, background: 'var(--surface-2)', overflow: 'hidden', marginTop: 4 }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, transition: 'width 0.2s ease' }} />
    </div>
  );
}

const card: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--card-radius, 14px)', boxShadow: 'var(--card-shadow)',
  padding: 18, marginBottom: 16,
};
const sectionTitle: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 };
const statLabel: React.CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 4 };
