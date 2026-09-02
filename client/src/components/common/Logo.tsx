import { FC } from 'react';
import { useLocation } from 'wouter';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showFullLogo?: boolean;
}

const Logo: FC<LogoProps> = ({ size = 'medium', showFullLogo = false }) => {
  const [, setLocation] = useLocation();
  let sizeClass = 'h-24';

  if (size === 'small') {
    sizeClass = 'h-12';
  } else if (size === 'large') {
    sizeClass = showFullLogo ? 'h-32 w-full' : 'h-32';
  }

  const handleLogoClick = () => {
    setLocation('/');
  };

  // Utilizza i loghi esatti forniti
  const logoPath = showFullLogo
    ? '/images/logo-betmaster-full.png'  // Logo completo con testo
    : '/images/logo-betmaster-icon.png'; // Solo icona

  return (
    <div
      className="flex items-center justify-center cursor-pointer"
      onClick={handleLogoClick}
    >
      <img
        src={logoPath}
        alt="BetMaster League Logo"
        className={`${sizeClass} ${showFullLogo ? 'object-contain' : 'object-cover'}`}
      />
    </div>
  );
};

export default Logo;
