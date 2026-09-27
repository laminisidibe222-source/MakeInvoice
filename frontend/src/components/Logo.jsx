export default function Logo({ size = 32, showText = true, variant = 'default' }) {
  const wordColor = variant === 'light' ? '#FFFFFF' : '#0F172A';
  const badgeSize = size;

  return (
    <div
      className="brand-logo"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.3,
        userSelect: 'none',
      }}
    >
      <span
        className="brand-badge"
        style={{
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize * 0.3,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 55%, #DB2777 100%)',
          boxShadow:
            '0 6px 18px rgba(79, 70, 229, 0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* soft inner highlight */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 30% 15%, rgba(255,255,255,0.4), transparent 55%)',
            pointerEvents: 'none',
          }}
        />
        {/* geometric M */}
        <svg
          width={badgeSize * 0.62}
          height={badgeSize * 0.62}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <path
            d="M5 19V7.5C5 6.67 5.67 6 6.5 6H7.4C7.77 6 8.12 6.19 8.32 6.5L12 12.4L15.68 6.5C15.88 6.19 16.23 6 16.6 6H17.5C18.33 6 19 6.67 19 7.5V19"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {showText && (
        <span
          style={{
            fontSize: size * 0.58,
            fontWeight: 800,
            letterSpacing: '-0.045em',
            lineHeight: 1,
            fontFamily: "'Inter', -apple-system, sans-serif",
            color: wordColor,
          }}
        >
          Make
          <span
            style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #DB2777 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Invoice
          </span>
        </span>
      )}
    </div>
  );
}