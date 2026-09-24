import React from 'react';
const TShirtMockup = ({ color = '#ffffff' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 500 600" 
      width="100%" 
      height="100%"
      style={{
        filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))'
      }}
    >
      <defs>
        <linearGradient id="tshirt-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.15)" />
          <stop offset="10%" stopColor="rgba(0,0,0,0.05)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0)" />
          <stop offset="90%" stopColor="rgba(0,0,0,0.05)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </linearGradient>
        <linearGradient id="fold-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <linearGradient id="fold-right" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      <path 
        fill={color} 
        d="M250 20 C180 20 170 30 160 50 L140 80 L20 140 C10 145 5 155 10 165 L50 240 C55 250 65 250 75 240 L120 190 L120 560 C120 580 130 580 250 580 C370 580 380 580 380 560 L380 190 L425 240 C435 250 445 250 450 240 L490 165 C495 155 490 145 480 140 L360 80 L340 50 C330 30 320 20 250 20 Z" 
      />
      <path 
        fill="url(#tshirt-shadow)" 
        d="M250 20 C180 20 170 30 160 50 L140 80 L20 140 C10 145 5 155 10 165 L50 240 C55 250 65 250 75 240 L120 190 L120 560 C120 580 130 580 250 580 C370 580 380 580 380 560 L380 190 L425 240 C435 250 445 250 450 240 L490 165 C495 155 490 145 480 140 L360 80 L340 50 C330 30 320 20 250 20 Z" 
      />
      <path fill="url(#fold-left)" d="M160 100 Q 180 300 130 560 L 160 560 Q 200 300 190 100 Z" />
      <path fill="url(#fold-right)" d="M340 100 Q 320 300 370 560 L 340 560 Q 300 300 310 100 Z" />
      <path 
        fill="rgba(0,0,0,0.05)" 
        d="M250 20 C200 20 185 30 170 50 C190 90 220 100 250 100 C280 100 310 90 330 50 C315 30 300 20 250 20 Z" 
      />
      <path 
        fill="none" 
        stroke="rgba(0,0,0,0.1)" 
        strokeWidth="6" 
        d="M170 50 C190 90 220 100 250 100 C280 100 310 90 330 50" 
      />
    </svg>
  );
};
export default TShirtMockup;
