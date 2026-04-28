import { Button } from '../ui/Button';
import { ThemeToggle } from '../theme/ThemeToggle';

export function Topbar() {
  return (
    <header
      className="topbar"
      style={{
        height: 60,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 18,
            color: 'var(--text-primary)',
            letterSpacing: -0.3,
          }}
        >
          Dashboard
        </h1>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
          AI Compliance Overview — April 2025
        </p>
      </div>

      {/* Date range chip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--input-bg)',
          border: '1px solid var(--input-border)',
          borderRadius: 8,
          padding: '6px 12px',
          fontSize: 12,
          color: 'var(--text-secondary)',
          cursor: 'pointer',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Apr 1 – Apr 27, 2025
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--input-bg)',
          border: '1px solid var(--input-border)',
          borderRadius: 8,
          padding: '6px 12px',
          width: 200,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search audits, reports…"
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: 12,
            color: 'var(--text-secondary)',
            width: '100%',
            fontFamily: 'var(--font-body)',
          }}
        />
      </div>

      {/* Notification bell */}
      <button
        type="button"
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          background: 'var(--input-bg)',
          border: '1px solid var(--input-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
          color: 'var(--text-secondary)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span
          style={{
            position: 'absolute',
            top: 7,
            right: 7,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#EF4444',
            border: '1.5px solid var(--surface)',
          }}
        />
      </button>

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Export */}
      <Button variant="ghost" size="sm">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </Button>

      {/* New Audit */}
      <Button variant="primary" size="sm">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Audit
      </Button>
    </header>
  );
}
