import React from 'react';

export default function DefaultTitleLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 400 350" 
      className={className || "w-full h-full object-contain"}
    >
      <defs>
        <linearGradient id="gradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#009B3A" />
          <stop offset="100%" stopColor="#006C28" />
        </linearGradient>
        <linearGradient id="gradientYellow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFDF1B" />
          <stop offset="100%" stopColor="#D4A700" />
        </linearGradient>
        <linearGradient id="gradientBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEDF00" />
          <stop offset="100%" stopColor="#002776" />
        </linearGradient>
      </defs>
      {/* Background rhomboid */}
      <polygon points="200,40 370,140 200,240 30,140" fill="url(#gradientYellow)" />
      
      {/* Central blue sphere */}
      <circle cx="200" cy="140" r="70" fill="#002776" stroke="#ffffff" strokeWidth="4" />
      
      {/* Stylized white band */}
      <path d="M 134,155 Q 200,120 266,155 Q 200,110 134,155 Z" fill="#ffffff" />
      
      {/* Small stars */}
      <circle cx="170" cy="165" r="2" fill="#ffffff" />
      <circle cx="185" cy="170" r="2" fill="#ffffff" />
      <circle cx="200" cy="175" r="2" fill="#ffffff" />
      <circle cx="215" cy="170" r="2" fill="#ffffff" />
      <circle cx="230" cy="165" r="2" fill="#ffffff" />
      
      {/* Green & Yellow Typography */}
      <text x="200" y="295" textAnchor="middle" fill="#009B3A" fontStyle="italic" fontWeight="900" fontSize="58" fontFamily="sans-serif" letterSpacing="-2">
        BORA,
      </text>
      <text x="200" y="340" textAnchor="middle" fill="#FFDF1B" fontStyle="italic" fontWeight="900" fontSize="54" fontFamily="sans-serif" letterSpacing="-2">
        BRASIL!
      </text>
      
      <path d="M 60,345 L 340,345" stroke="#FFDF1B" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
