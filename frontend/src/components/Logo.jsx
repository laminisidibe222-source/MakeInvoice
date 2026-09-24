export default function Logo({ size = 32, showText = true }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.3,
        userSelect: 'none',
      }}
    >
      {/* Gradient badge */}
      <span
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #6366F1 0%, #8B5CF6 45%, #EC4899 100%)',
          boxShadow: '0 6px 20px rgba(99,102,241,0.35)',
          flexShrink: 0,
        }}
      >
        <svg
          width={size * 0.62}
          height={size * 0.62}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Invoice sheet */}
          <path
            d="M5 3.5C5 2.67 5.67 2 6.5 2H15L19 6V19.5C19 20.33 18.33 21 17.5 21H6.5C5.67 21 5 20.33 5 19.5V3.5Z"
            fill="white"
            fillOpacity="0.95"
          />
          {/* Corner fold */}
          <path d="M15 2L19 6H15.5C15.22 6 15 5.78 15 5.5V2Z" fill="#C7D2FE" />
          {/* Text lines */}
          <rect x="8" y="9" width="6" height="1.4" rx="0.7" fill="#6366F1" />
          <rect x="8" y="12" width="8" height="1.4" rx="0.7" fill="#A5B4FC" />
          {/* Checkmark */}
          <path
            d="M8.5 16.8L10.4 18.7L14.5 14.4"
            stroke="#10B981"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {/* Wordmark */}
      {showText && (
        <span
          style={{
            fontSize: size * 0.6,
            fontWeight: 800,
            letterSpacing: '-0.045em',
            lineHeight: 1,
            fontFamily: "'Inter', -apple-system, sans-serif",
            color: '#0F172A',
          }}
        >
          Make
          <span
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
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