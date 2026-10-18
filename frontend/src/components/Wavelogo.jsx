export default function Wavelogo({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cercle bleu officiel Wave */}
      <circle cx="50" cy="50" r="50" fill="#1DC8FF" />
      {/* La vague blanche */}
      <path
        d="M25 55 C35 35, 45 35, 50 45 C55 55, 65 55, 75 35"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}