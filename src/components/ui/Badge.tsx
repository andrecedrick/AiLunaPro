type BadgeVariant =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'completed'
  | 'in_progress'
  | 'draft'
  | 'published'
  | 'archived'
  | 'effort-low'
  | 'effort-medium'
  | 'effort-high'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  children?: React.ReactNode;
  className?: string;
}

/* Each variant maps to a (bg-var, fg-var, default-text) triple.
   The CSS variables themselves switch with the theme. */
const STYLES: Record<BadgeVariant, { bg: string; fg: string; text: string }> = {
  low:             { bg: 'var(--green-bg)',   fg: 'var(--green-text)',   text: 'Low' },
  medium:          { bg: 'var(--amber-bg)',   fg: 'var(--amber-text)',   text: 'Medium' },
  high:            { bg: 'var(--red-bg)',     fg: 'var(--red-text)',     text: 'High' },
  critical:        { bg: 'var(--critical-bg)',fg: 'var(--critical-text)',text: 'Critical' },
  completed:       { bg: 'var(--green-bg)',   fg: 'var(--green-text)',   text: 'Completed' },
  in_progress:     { bg: 'var(--blue-bg)',    fg: 'var(--blue-text)',    text: 'In Progress' },
  draft:           { bg: 'var(--neutral-bg)', fg: 'var(--neutral-text)', text: 'Draft' },
  published:       { bg: 'var(--green-bg)',   fg: 'var(--green-text)',   text: 'Published' },
  archived:        { bg: 'var(--neutral-bg)', fg: 'var(--neutral-text)', text: 'Archived' },
  'effort-low':    { bg: 'var(--green-bg)',   fg: 'var(--green-text)',   text: 'Low effort' },
  'effort-medium': { bg: 'var(--amber-bg)',   fg: 'var(--amber-text)',   text: 'Med effort' },
  'effort-high':   { bg: 'var(--red-bg)',     fg: 'var(--red-text)',     text: 'High effort' },
  info:            { bg: 'var(--blue-bg)',    fg: 'var(--blue-text)',    text: '' },
  success:         { bg: 'var(--green-bg)',   fg: 'var(--green-text)',   text: '' },
  warning:         { bg: 'var(--amber-bg)',   fg: 'var(--amber-text)',   text: '' },
  danger:          { bg: 'var(--red-bg)',     fg: 'var(--red-text)',     text: '' },
};

function effortVariant(effort: 'low' | 'medium' | 'high'): BadgeVariant {
  return `effort-${effort}` as BadgeVariant;
}

export function Badge({ variant, label, children, className = '' }: BadgeProps) {
  const s = STYLES[variant] ?? STYLES.info;
  const text = label ?? children ?? s.text;
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
        background: s.bg,
        color: s.fg,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
}

export { effortVariant };
