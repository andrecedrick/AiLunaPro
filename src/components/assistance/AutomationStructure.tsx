import { SectionTitle } from './SectionTitle';
import { Badge } from '../ui/Badge';
import type { AuditResult, Recommendation, RecommendationCategory } from '../../types/scoring';
import { getByCategory } from '../../lib/scoring/assistance';

const CATEGORY_META: Record<
  RecommendationCategory,
  { eyebrow: string; title: string; tagline: string; accent: string }
> = {
  automate: {
    eyebrow: 'Tools & systems',
    title: 'Automate',
    tagline: 'Items where the leverage comes from the system, not the human.',
    accent: 'var(--blue-text)',
  },
  structure: {
    eyebrow: 'Policy & governance',
    title: 'Structure',
    tagline: 'Items that need formal ownership, policy, or framework alignment.',
    accent: 'var(--violet-text)',
  },
  process: {
    eyebrow: 'Recurring motion',
    title: 'Operate',
    tagline: 'Items that are processes you keep running on a cadence.',
    accent: 'var(--amber-text)',
  },
  train: {
    eyebrow: 'People',
    title: 'Train',
    tagline: 'Items that change behaviour through education.',
    accent: 'var(--green-text)',
  },
};

export function AutomationStructure({ result }: { result: AuditResult }) {
  const automate = getByCategory(result, 'automate');
  const structure = getByCategory(result, 'structure');
  const process = getByCategory(result, 'process');
  const train = getByCategory(result, 'train');

  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 24,
        marginBottom: 20,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <SectionTitle eyebrow="03 · Operating model" title="What to automate or structure" />
      <p
        style={{
          margin: '0 0 18px',
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}
      >
        Each item below has a primary mode of execution. Automating where you should
        structure (or vice versa) is a common failure pattern.
      </p>

      {/* Two-column primary: automate / structure */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 14,
          marginBottom: process.length + train.length > 0 ? 14 : 0,
        }}
      >
        <CategoryColumn category="automate" items={automate} />
        <CategoryColumn category="structure" items={structure} />
      </div>

      {/* Smaller tail: process + train */}
      {(process.length > 0 || train.length > 0) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 14,
          }}
        >
          <CategoryColumn category="process" items={process} dense />
          <CategoryColumn category="train" items={train} dense />
        </div>
      )}
    </section>
  );
}

function CategoryColumn({
  category,
  items,
  dense = false,
}: {
  category: RecommendationCategory;
  items: Recommendation[];
  dense?: boolean;
}) {
  const meta = CATEGORY_META[category];

  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: dense ? 14 : 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minHeight: dense ? 120 : 160,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 2,
          }}
        >
          {meta.eyebrow}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: dense ? 14 : 16,
              color: meta.accent,
              letterSpacing: -0.2,
            }}
          >
            {meta.title}
          </h3>
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            {items.length} {items.length === 1 ? 'action' : 'actions'}
          </span>
        </div>
        {!dense && (
          <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {meta.tagline}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            background: 'var(--surface)',
            border: '1px dashed var(--border)',
            borderRadius: 8,
            padding: '10px 12px',
            textAlign: 'center',
          }}
        >
          Nothing here right now.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(rec => (
            <div
              key={rec.id}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    lineHeight: 1.35,
                  }}
                >
                  {rec.title}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {rec.id}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6 }}>
                <Badge variant={`effort-${rec.effort}` as 'effort-low' | 'effort-medium' | 'effort-high'} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {rec.timeframeDays}d
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
