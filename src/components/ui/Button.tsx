import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    // The single primary CTA look: brand gradient (violet → cyan) + soft lift.
    background: 'var(--brand-gradient)',
    color: '#FFFFFF',
    border: 'none',
    fontWeight: 700,
    boxShadow: '0 8px 22px rgba(124, 58, 237, 0.28)',
  },
  secondary: {
    background: 'var(--brand-tint-bg)',
    color: 'var(--violet-text)',
    border: 'none',
    fontWeight: 600,
  },
  danger: {
    background: 'transparent',
    color: 'var(--red-text)',
    border: '1.5px solid var(--border-strong)',
    fontWeight: 600,
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1.5px solid var(--border-strong)',
    fontWeight: 500,
  },
};

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: { fontSize: 12, padding: '6px 14px', borderRadius: 8 },
  md: { fontSize: 13, padding: '8px 18px', borderRadius: 10 },
  lg: { fontSize: 14, padding: '11px 24px', borderRadius: 12 },
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  style,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        lineHeight: 1,
        transition: 'opacity 0.15s, transform 0.1s',
        width: fullWidth ? '100%' : undefined,
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
        ...style,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.opacity = '1'; b.style.transform = 'none'; }}
      onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(1px)'; }}
      onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
    >
      {children}
    </button>
  );
}
