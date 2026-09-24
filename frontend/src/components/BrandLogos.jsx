import waveLogo from '../assets/logos/Wave.png';
import orangeMoneyLogo from '../assets/logos/orange-money.png';
import mixxByYasLogo from '../assets/logos/mixxyass.png';
import cardLogo from '../assets/logos/card.png';

// Shared style for all logos — keeps them square, centered, and crisp
const logoStyle = {
  objectFit: 'contain',
  borderRadius: 8,
  display: 'block',
};

export function WaveLogo({ size = 28 }) {
  return (
    <img
      src={waveLogo}
      alt="Wave"
      width={size}
      height={size}
      style={logoStyle}
    />
  );
}

export function OrangeMoneyLogo({ size = 28 }) {
  return (
    <img
      src={orangeMoneyLogo}
      alt="Orange Money"
      width={size}
      height={size}
      style={logoStyle}
    />
  );
}

export function MixxByYasLogo({ size = 28 }) {
  return (
    <img
      src={mixxByYasLogo}
      alt="Mixx by Yas"
      width={size}
      height={size}
      style={logoStyle}
    />
  );
}

export function CardLogo({ size = 28 }) {
  return (
    <img
      src={cardLogo}
      alt="Carte bancaire"
      width={size}
      height={size}
      style={logoStyle}
    />
  );
}