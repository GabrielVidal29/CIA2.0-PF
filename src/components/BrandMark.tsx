import React from 'react';

interface BrandMarkProps {
  variant?: 'light' | 'dark';
  compact?: boolean;
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  variant = 'dark',
  compact = false,
}) => {
  const isLight = variant === 'light';

  return (
    <div className="flex items-center gap-3 shrink-0">
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          width="36"
          height="36"
          rx="8"
          fill={isLight ? '#164273' : '#0B1D3A'}
        />
        <path
          d="M18 7L27 11.2V18.5C27 23.6 23.1 27.9 18 29.5C12.9 27.9 9 23.6 9 18.5V11.2L18 7Z"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M18 11.5V24.5M13.5 16H22.5"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <div className="leading-tight whitespace-nowrap">
        <div
          className={`font-display text-base font-bold tracking-tight ${
            isLight ? 'text-white' : 'text-[#0B1D3A]'
          }`}
        >
          CIA 2.0
        </div>
        {!compact && (
          <div
            className={`text-xs ${
              isLight ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            UniCatólica · Palmas/TO
          </div>
        )}
      </div>
    </div>
  );
};
