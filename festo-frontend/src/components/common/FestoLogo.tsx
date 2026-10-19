import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface FestoLogoProps {
  size?: LogoSize;
  showText?: boolean;
  href?: string;
  className?: string;
}

export const FestoLogo = ({
  size = 'md',
  showText = true,
  href = '/',
  className = '',
}: FestoLogoProps) => {
  const iconSizes = {
    xs: 'w-6 h-6 rounded-lg',
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-3xl',
  };

  const textSizes = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const content = (
    <div className={`festo-brand inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* District-by-Zomato inspired glowing icon badge */}
      <div className="relative shrink-0 flex items-center justify-center">
        <div className="absolute inset-0 bg-[#dcd9f0] rounded-xl blur-md group-hover:blur-lg transition-all" />
        <img
          src={logoImg}
          alt="Festo"
          className={`${iconSizes[size] || iconSizes.md} object-cover relative z-10 shadow-sm shadow-[#77709f]/20 group-hover:scale-105 transition-transform duration-300 border border-[#d9dae3]`}
        />
      </div>

      {/* Brand wordmark */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-0.5">
            <span
              className={`${textSizes[size] || textSizes.md} font-black tracking-tight text-[#191a20] transition-colors group-hover:text-[#77709f]`}
            >
              festo
            </span>
            <span className="mb-1 h-1.5 w-1.5 self-end rounded-full bg-[#77709f] shadow-sm shadow-[#77709f]/40" />
          </div>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
};
