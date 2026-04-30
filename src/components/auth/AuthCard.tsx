import type { ReactNode } from 'react';

const LOGO_URL =
  'https://res.cloudinary.com/dhtnegf9d/image/upload/v1777320369/6_xldhxr.png';

interface AuthCardProps {
  children: ReactNode;
}

/** Full-screen centred card used by Login, Signup, and OrgCreate pages. */
export function AuthCard({ children }: AuthCardProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--page-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--card-radius)',
          boxShadow: 'var(--card-shadow)',
          padding: '40px 36px 36px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            overflow: 'hidden',
            height: 26,
            maxWidth: 160,
            margin: '0 auto 28px',
          }}
        >
          <img
            src={LOGO_URL}
            alt="AiLunaPro"
            style={{ width: '100%', height: 'auto', display: 'block', marginTop: -58 }}
          />
        </div>

        {children}
      </div>
    </div>
  );
}
