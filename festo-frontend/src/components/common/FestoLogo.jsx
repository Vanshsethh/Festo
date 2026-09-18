import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

export const FestoLogo = ({
  size = 'md',
  showText = true,
  href = '/',
  className = '',
}) => {
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
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* District-by-Zomato inspired glowing icon badge */}
      <div className="relative shrink-0 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/30 to-purple-600/30 rounded-xl blur-md group-hover:blur-lg transition-all" />
        <img
          src={logoImg}
          alt="Festo"
          className={`${iconSizes[size] || iconSizes.md} object-cover relative z-10 shadow-lg shadow-fuchsia-500/20 group-hover:scale-105 transition-transform duration-300 border border-fuchsia-500/20`}
        />
      </div>

      {/* Brand wordmark */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-0.5">
            <span
              className={`${textSizes[size] || textSizes.md} font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-fuchsia-200 bg-clip-text text-transparent group-hover:from-white group-hover:via-fuchsia-100 group-hover:to-pink-300 transition-colors`}
            >
              festo
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 shadow-sm shadow-pink-500/50 self-end mb-1" />
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
