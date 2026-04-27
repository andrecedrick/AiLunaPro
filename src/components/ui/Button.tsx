import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--brand-gradient)',
    color: '#FFFFFF',
    border: 'none',
    fontWeight: 600,
  },
  secondary: {
    background: 'var(--brand-tint-bg)',
    color: 'var(--violet-text)',
    border: 'none',
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
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}
