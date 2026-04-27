import { Button } from '../ui/Button';
import { useRoute } from '../../context/RouteContext';
import type { AuditResult } from '../../types/scoring';
import {
  estimateScoreLift,
  getNextStep,
  getTopActions,
} from '../../lib/scoring/assistance';

/**
 * Compact bridge from the result page to the assistance page.
 * Shows: top action, projected score lift, prescribed next step — and a single CTA.
 */
export function AssistanceTeaser({ result }: { result: AuditResult }) {
  const { navigate } = useRoute();
  const top = getTopActions(result, 3);
  const { projectedScore, delta } = estimateScoreLift(result, top);
  const next = getNextStep(result);

  const topAction = top[0];

  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 24,
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {/* Decorative gradient stripe at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'var(--brand-gradient)',
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: 24,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: 'var(--violet-text)',
              marginBottom: 6,
            }}
          >
            ✨ Guided action plan
          </div>
          <h3
            style={{
              margin: 0,
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--text-primary)',
              letterSpacing: -0.2,
            }}
          >
            {next.headline}
          </h3>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 18,
              marginTop: 14,
              fontSize: 13,
              color: 'var(--text-secondary)',
            }}
          >
            {topAction && (
              <Stat
                label="Top action"
                value={topAction.title}
                truncate
              />
            )}
            <Stat
              label="Projected score"
              value={`${result.globalScore} → ${projectedScore} ${delta > 0 ? `(+${delta})` : ''}`}
            />
            <Stat
              label="Recommendations"
              value={`${result.recommendations.length} actions`}
            />
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate({ name: 'audit/assistance' })}
        >
          Open action plan →
        </Button>
      </div>
    </section>
  );
}

function Stat({ label, value, truncate = false }: { label: string; value: string; truncate?: boolean }) {
  return (
    <div style={{ minWidth: 0, maxWidth: truncate ? 280 : undefined }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginTop: 2,
          overflow: truncate ? 'hidden' : undefined,
          textOverflow: truncate ? 'ellipsis' : undefined,
          whiteSpace: truncate ? 'nowrap' : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}
