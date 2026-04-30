export function CTABlock() {
  return (
    <div
      style={{
        borderRadius: 'var(--card-radius)',
        background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 40%, #22D3EE 100%)',
        padding: '40px 48px',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 32,
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -60,
          left: '35%',
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 20,
            padding: '4px 12px',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.5,
            marginBottom: 14,
          }}
        >
          ✨ Powered by Luna AI
        </div>
        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 26,
            lineHeight: 1.2,
            letterSpacing: -0.5,
          }}
        >
          Ready to achieve full AI compliance?
        </h2>
        <p
          style={{
            margin: '10px 0 0',
            fontSize: 14,
            opacity: 0.85,
            lineHeight: 1.6,
            maxWidth: 480,
          }}
        >
          Join 500+ organizations using AiLunaPro to automate their compliance
          workflows, reduce risk, and build trust with stakeholders.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, flexShrink: 0, position: 'relative', zIndex: 1 }}>
        <button
          type="button"
          style={{
            background: 'var(--cta-glass-bg)',
            border: '1.5px solid var(--cta-glass-border)',
            color: '#fff',
            borderRadius: 12,
            padding: '12px 24px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            backdropFilter: 'blur(4px)',
            whiteSpace: 'nowrap',
          }}
        >
          Schedule Demo
        </button>
        <button
          type="button"
          style={{
            background: '#fff',
            border: 'none',
            color: '#7C3AED',
            borderRadius: 12,
            padding: '12px 24px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
          }}
        >
          Start Free Trial →
        </button>
      </div>
    </div>
  );
}
