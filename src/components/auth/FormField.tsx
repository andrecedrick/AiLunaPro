import type { InputHTMLAttributes, ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  children?: ReactNode;
}

/** Labelled form field wrapper used on auth pages. */
export function FormField({ label, error, hint, children }: FormFieldProps) {
  return (
    <label style={{ display: 'block' }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: 6,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </div>
      {children}
      {hint && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          {hint}
        </div>
      )}
      {error && (
        <div
          style={{
            fontSize: 11,
            color: 'var(--red-text)',
            fontWeight: 600,
            marginTop: 4,
          }}
        >
          {error}
        </div>
      )}
    </label>
  );
}

/** Styled text / email / password input that matches the rest of the app. */
export function AuthInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        display: 'block',
        width: '100%',
        padding: '10px 12px',
        background: 'var(--input-bg)',
        border: '1px solid var(--input-border)',
        borderRadius: 10,
        fontSize: 13,
        fontFamily: 'var(--font-body)',
        color: 'var(--text-primary)',
        outline: 'none',
        boxSizing: 'border-box',
        lineHeight: 1.5,
        transition: 'border-color 0.15s',
        ...props.style,
      }}
    />
  );
}
