
import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  const logoSrc = "https://res.cloudinary.com/dvcaqoy2a/image/upload/v1765499260/Dentro-app-logo_fpqnjq.svg";

  return (
    <img 
      src={logoSrc} 
      alt="Clinic Logo" 
      className={`object-contain drop-shadow-md ${className}`}
    />
  );
};
