import React from 'react';

export const DragonIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className}>
    {/* Two-Headed Red Dragon Body */}
    <path fill="currentColor" d="M448 320c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32s14.3-32 32-32h320c17.7 0 32 14.3 32 32z"/>
    
    {/* Left Head */}
    <g transform="translate(120, 100) rotate(-20)">
      <path fill="currentColor" d="M0 0c30-20 80-20 110 0s20 80 0 110-80 20-110 0-20-80 0-110z"/>
      <path fill="white" d="M20 80l10 15h20l10-15zM60 80l10 15h20l10-15z"/> {/* Teeth */}
      <circle cx="30" cy="40" r="8" fill="yellow" /> {/* Eye */}
      <path d="M10 30l20-5" stroke="black" strokeWidth="2" /> {/* Brow */}
    </g>

    {/* Right Head */}
    <g transform="translate(280, 80) rotate(10)">
      <path fill="currentColor" d="M0 0c30-20 80-20 110 0s20 80 0 110-80 20-110 0-20-80 0-110z"/>
      <path fill="white" d="M20 80l10 15h20l10-15zM60 80l10 15h20l10-15z"/> {/* Teeth */}
      <circle cx="80" cy="40" r="8" fill="yellow" /> {/* Eye */}
      <path d="M90 30l-20-5" stroke="black" strokeWidth="2" /> {/* Brow */}
    </g>

    {/* Wings */}
    <path fill="#7f1d1d" d="M64 200c-40-40-80-20-100 20 40 0 60 20 70 60s10 80 0 100c60-40 80-100 30-180zM448 200c40-40 80-20 100 20-40 0-60 20-70 60s-10 80 0 100c-60-40-80-100-30-180z" />
  </svg>
);

export const KnightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className}>
    {/* Knight with Shield and Sword (Back View) */}
    <path fill="currentColor" d="M200 100c0-30 20-50 56-50s56 20 56 50v60H200v-60z"/> {/* Helmet */}
    <path fill="currentColor" d="M180 160h152v200H180z"/> {/* Body Armor */}
    <path fill="#991b1b" d="M180 160l-40 100 40 100h152l40-100-40-100z" opacity="0.8" /> {/* Red Cape */}
    
    {/* Shield (Left Arm) */}
    <path fill="#4b5563" d="M100 200c0 100 50 150 100 180v-260c-50 30-100 80-100 80z" stroke="black" strokeWidth="4" />
    <path fill="gold" d="M140 240l20 40h-40z" opacity="0.5" /> {/* Shield Detail */}

    {/* Sword (Right Arm) */}
    <g transform="translate(380, 200) rotate(30)">
      <rect x="-10" y="-150" width="20" height="180" fill="silver" stroke="black" strokeWidth="2" /> {/* Blade */}
      <rect x="-40" y="30" width="80" height="15" fill="gold" stroke="black" strokeWidth="2" /> {/* Guard */}
      <rect x="-10" y="45" width="20" height="40" fill="brown" stroke="black" strokeWidth="2" /> {/* Hilt */}
    </g>
  </svg>
);

export const CrestLogo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className}>
    <path fill="currentColor" d="M66.54 18.002a18.07 18.07 0 0 0-12.37 4.541c-7.508 6.632-8.218 18.094-1.586 25.602c4.394 4.974 10.906 6.945 16.986 5.792l57.838 65.475l-50.373 44.498l24.188 27.38c9.69-21.368 22.255-39.484 37.427-54.65l6.91 36.188c25.092-6.29 49.834-10.563 74.366-12.873l-23.912-27.07l-38.66-12.483c17.117-12.9 36.734-22.97 58.62-30.474l-24.19-27.385l-50.37 44.496l-57.92-65.57c1.79-5.835.617-12.43-3.72-17.34a18.1 18.1 0 0 0-13.235-6.128zm384.397 0a18.1 18.1 0 0 0-13.232 6.127c-4.338 4.91-5.514 11.506-3.723 17.343l-57.92 65.568l-50.37-44.497l-24.188 27.385c21.884 7.504 41.5 17.573 58.62 30.472l-38.66 12.485l-23.255 26.324c24.71 1.863 49.367 5.706 74.118 11.46l6.498-34.03c15.173 15.166 27.74 33.282 37.43 54.65l24.185-27.38l-50.372-44.498l57.838-65.475c6.08 1.153 12.593-.818 16.987-5.792c6.63-7.508 5.92-18.97-1.586-25.602a18.07 18.07 0 0 0-12.37-4.541zm-186.425 158.51c-39.56-.098-79.467 5.226-120.633 16.095c-2.046 90.448 34.484 209.35 118.47 259.905c81.295-49.13 122.402-169.902 120.552-259.914c-39.75-10.496-78.91-15.988-118.39-16.086zm-117.176 153.5L60.47 428.35l-12.2 63.894l61.9-19.994l68.49-77.535c-12.86-20.108-23.246-42.03-31.324-64.703m228.203 6.11c-8.69 22.238-19.577 43.634-32.706 63.142l64.473 72.986l61.898 19.994l-12.2-63.894l-81.466-92.23z"/>
  </svg>
);

export const BabyDragonIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className}>
    {/* Cute Baby Dragon Body */}
    <path fill="currentColor" d="M256 120c-70 0-120 50-120 120 0 40 20 80 50 100-10 40-30 80-60 100 50 0 100-20 130-60 30 40 80 60 130 60-30-20-50-60-60-100 30-20 50-60 50-100 0-70-50-120-120-120z" />
    
    {/* Belly Scales */}
    <path fill="#fef3c7" d="M256 240c-40 0-70 30-70 70 0 30 20 60 50 80 10 30 20 60 40 80-10-20-20-50-20-80 30-20 50-50 50-80 0-40-20-70-50-70z" opacity="0.9" />
    <path d="M220 320h72M210 350h92M230 380h52" stroke="#d97706" strokeWidth="2" opacity="0.3" />
    
    {/* Wings */}
    <path fill="#bef264" d="M160 220c-40-20-80-10-100 20 20 0 40 10 50 30s10 40 0 60c30-20 50-60 50-110zM352 220c40-20 80-10 100 20-20 0-40 10-50 30s-10 40 0 60c-30-20-50-60-50-110z" />
    <path d="M100 240l40 40M412 240l-40 40" stroke="#4d7c0f" strokeWidth="2" opacity="0.5" />
    
    {/* Horns */}
    <path fill="#451a03" d="M180 140c-10-30-30-50-60-60 20 10 30 30 30 60zM332 140c10-30 30-50 60-60-20 10-30 30-30 60z" />
    <path d="M160 110l20 20M352 110l-20 20" stroke="white" strokeWidth="2" opacity="0.2" />
    
    {/* Big Expressive Eyes */}
    <circle cx="200" cy="220" r="38" fill="white" />
    <circle cx="200" cy="220" r="28" fill="#422006" />
    <circle cx="210" cy="210" r="10" fill="white" /> {/* Sparkle */}
    <circle cx="190" cy="235" r="4" fill="white" opacity="0.6" /> {/* Secondary Sparkle */}
    
    <circle cx="312" cy="220" r="38" fill="white" />
    <circle cx="312" cy="220" r="28" fill="#422006" />
    <circle cx="322" cy="210" r="10" fill="white" /> {/* Sparkle */}
    <circle cx="302" cy="235" r="4" fill="white" opacity="0.6" /> {/* Secondary Sparkle */}
    
    {/* Happy Mouth */}
    <path d="M220 280q36 35 72 0" stroke="#422006" strokeWidth="8" fill="none" strokeLinecap="round" />
    <path d="M235 288q21 18 42 0" fill="#f87171" /> {/* Tongue */}
    
    {/* Cheeks */}
    <circle cx="165" cy="270" r="12" fill="#fca5a5" opacity="0.6" />
    <circle cx="347" cy="270" r="12" fill="#fca5a5" opacity="0.6" />
  </svg>
);
