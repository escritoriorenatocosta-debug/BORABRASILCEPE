/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sticker } from '../types';
import { Sparkles, HelpCircle } from 'lucide-react';
import { SLOTS } from '../data';

interface StickerItemProps {
  sticker: Sticker;
  size?: 'sm' | 'md' | 'lg';
  isGlued?: boolean;
  className?: string;
  customRole?: string;
  style?: React.CSSProperties;
  svgStyle?: React.CSSProperties;
}

export default function StickerItem({
  sticker,
  size = 'md',
  isGlued = false,
  className = '',
  customRole,
  style,
  svgStyle
}: StickerItemProps) {
  const [imageError, setImageError] = useState(false);

  // Helper to obtain beautiful clean physical soccer position
  const displayPosition = (() => {
    if (sticker.id >= 101 && sticker.id <= 136) {
      return `Nº ${sticker.id - 100}`;
    }

    const rawRole = customRole || (() => {
      const defaultSlot = SLOTS.find(s => s.id === sticker.slotId);
      return defaultSlot ? defaultSlot.label : sticker.role;
    })();

    if (!rawRole) return 'JOGADOR';
    const val = rawRole.toUpperCase();
    if (val.includes('GOLEIRO') || val.includes('GOLEIRA')) return 'GOLEIRO';
    if (val.includes('LATERAL DIREITO')) return 'LATERAL DIREITO';
    if (val.includes('LATERAL ESQUERDO')) return 'LATERAL ESQUERDO';
    if (val.includes('ZAGUEIRO') || val.includes('ZAGUEIRA')) return 'ZAGUEIRO';
    if (val.includes('VOLANTE')) return 'VOLANTE';
    if (val.includes('ARMADOR') || val.includes('MEIO-CAMPO') || val.includes('MEIA')) return 'MEIO-CAMPO';
    if (val.includes('PONTA') || val.includes('CENTROAVANTE') || val.includes('ATACANTE')) return 'ATACANTE';
    if (val.includes('TÉCNICO')) return 'TÉCNICO';
    if (val.includes('CROMO') || val.includes('ESPECIAL')) return 'ESPECIAL';
    return val.replace(/\s+II$/, '');
  })();

  // Helper to render customized visual SVG avatar representing the real players
  const renderSvgAvatar = (id: number) => {
    // Standard stickers 1 to 48 and minicraques 101 to 136 use base player models 1 to 12
    const resolvedId = (id >= 101 && id <= 136) ? (id - 100) : id;
    const baseId = resolvedId <= 48 ? ((resolvedId - 1) % 12) + 1 : resolvedId;

    // Custom facial features matching the attached photos of the team
    let skinColor = '#efcbb4'; // Light-medium skin
    let hairColor = '#1a1a1a'; // Dark hair
    let hairElement = null;
    let facialHairElement = null;
    let accessoryElement = null;
    let faceDetails = null;

    if (baseId === 201) {
      // Golden Special Cromo 1 render: Golden Medal and Ribbon (Flat Design)
      return (
        <g transform="translate(0, -2)">
          {/* Ribbon */}
          <path d="M 38 40 L 50 70 L 62 40" fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 43 40 L 50 64 L 57 40" fill="none" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          {/* Shiny Gold Star Medal */}
          <circle cx="50" cy="65" r="16" fill="#fcd34d" stroke="#d97706" strokeWidth="2" />
          <circle cx="50" cy="65" r="12" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="2,2" />
          <polygon points="50,54 53,60 60,61 55,66 57,72 50,69 43,72 45,66 40,61 47,60" fill="#fff" />
        </g>
      );
    }

    if (baseId === 202) {
      // Golden Special Cromo 2 render: Glorious Gold Trophy (Flat Design)
      return (
        <g transform="translate(0, -4)">
          {/* Trophy Handles */}
          <path d="M 33 45 C 20 45 20 60 33 60" fill="none" stroke="#fcd34d" strokeWidth="3" />
          <path d="M 67 45 C 80 45 80 60 67 60" fill="none" stroke="#fcd34d" strokeWidth="3" />
          {/* Trophy Cup */}
          <path d="M 32 35 L 68 35 C 68 56 60 68 50 68 C 40 68 32 56 32 35 Z" fill="#fcd34d" stroke="#d97706" strokeWidth="2" />
          {/* Pedestal */}
          <rect x="46" y="68" width="8" height="12" fill="#78350f" />
          <rect x="36" y="80" width="28" height="8" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          {/* Tiny details */}
          <polygon points="50,42 52,47 57,47 53,50 55,55 50,52 45,55 47,50 43,47 48,47" fill="#fff" />
          <text x="50" y="86" fill="#fcd34d" fontSize="5" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">CEPE</text>
        </g>
      );
    }

    if (baseId === 203) {
      // Golden Special Cromo 3 render: Elegant Laurel Shield (Flat Design)
      return (
        <g transform="translate(0, -2)">
          {/* Shield */}
          <path d="M 30 25 L 70 25 L 70 50 C 70 70 50 85 50 85 C 50 85 30 70 30 50 Z" fill="#fcd34d" stroke="#d97706" strokeWidth="2" />
          {/* Laurel */}
          <path d="M 25 35 C 20 45 20 60 25 70" fill="none" stroke="#fcd34d" strokeWidth="4" />
          <path d="M 75 35 C 80 45 80 60 75 70" fill="none" stroke="#fcd34d" strokeWidth="4" />
          {/* Tiny details */}
          <polygon points="50,30 52,40 60,40 53,45 55,55 50,50 45,55 47,45 40,40 48,40" fill="#fff" />
          <text x="50" y="60" fill="#78350f" fontSize="6" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">TIME</text>
        </g>
      );
    }

    if (baseId === 204) {
      // Golden Special Cromo 4 render: Supreme Crown with Wings (Flat Design)
      return (
        <g transform="translate(0, -2)">
          {/* Wings */}
          <path d="M 32 50 C 15 40 15 65 32 70" fill="none" stroke="#fcd34d" strokeWidth="3" />
          <path d="M 68 50 C 85 40 85 65 68 70" fill="none" stroke="#fcd34d" strokeWidth="3" strokeLinecap="round" />
          {/* Brilliant Crown */}
          <path d="M 30 75 L 70 75 L 66 52 L 58 64 L 50 48 L 42 64 L 34 52 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2.5" />
          {/* Jewels */}
          <circle cx="50" cy="46" r="2.5" fill="#ef4444" />
          <circle cx="34" cy="50" r="2" fill="#3b82f6" />
          <circle cx="66" cy="50" r="2" fill="#3b82f6" />
          <circle cx="58" cy="62" r="1.5" fill="#10b981" />
          <circle cx="42" cy="62" r="1.5" fill="#10b981" />
          <text x="50" y="86" fill="#78350f" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">SUPREMO</text>
        </g>
      );
    }

    switch (baseId) {
      case 1: // Jânio Santos (dark bearded, short curly hair)
        skinColor = '#8c6239'; // Dark brown
        hairElement = (
          <path d="M 35 32 Q 50 18 65 32 Q 50 25 35 32" fill="#111" />
        );
        facialHairElement = (
          <g>
            {/* Full beard and mustache */}
            <path d="M 36 50 Q 50 68 64 50 Q 50 72 36 50 Z" fill="#111" />
            <path d="M 40 50 Q 50 56 60 50 Q 50 52 40 50" fill="#111" />
          </g>
        );
        break;
      case 2: // Davizinho (smiling mustache, slick hair)
        skinColor = '#c69c6d'; // Tan skin
        hairElement = (
          <path d="M 34 32 Q 50 15 66 32 C 60 26 40 26 34 32" fill="#1f1812" />
        );
        facialHairElement = (
          <path d="M 41 51 Q 50 58 59 51 Q 50 54 41 51" fill="#1f1812" />
        );
        faceDetails = (
          /* Happy wide open smile */
          <path d="M 44 54 Q 50 62 56 54 Z" fill="#fff" stroke="#111" strokeWidth="0.5" />
        );
        break;
      case 3: // Diego Maradona (smiling, short basic dark hair)
        skinColor = '#f3d0b2'; // Light tone
        hairElement = (
          <path d="M 35 32 Q 50 19 65 32 C 60 26 40 26 35 32" fill="#222" />
        );
        faceDetails = (
          <path d="M 45 53 Q 50 59 55 53" stroke="#8c6239" strokeWidth="1" fill="none" strokeLinecap="round" />
        );
        break;
      case 4: // Ed (mature bearded, nice short crop hair)
        skinColor = '#b18a5e'; // Tanned olive
        hairElement = (
          <path d="M 36 32 Q 50 20 64 32 Q 50 26 36 32" fill="#2b2520" />
        );
        facialHairElement = (
          <g>
            {/* Boxed short circle beard */}
            <path d="M 37 48 Q 50 66 63 48 C 61 58 39 58 37 48 Z" fill="#2b2520" />
            <path d="M 42 49 Q 50 53 58 49" fill="#2b2520" />
          </g>
        );
        break;
      case 5: // Guilherme (young bearded, dark hair, earrings)
        skinColor = '#d1a982'; // Olive skin
        hairElement = (
          <path d="M 35 32 Q 50 17 65 32 C 58 24 42 24 35 32" fill="#1a120b" />
        );
        facialHairElement = (
          <g>
            <path d="M 36 48 Q 50 66 64 48 C 61 58 39 58 36 48 Z" fill="#1a120b" />
            <path d="M 41 49 Q 50 53 59 49" fill="#1a120b" />
          </g>
        );
        accessoryElement = (
          <g>
            {/* Gauge earrings */}
            <circle cx="34" cy="50" r="1.5" fill="#111" />
            <circle cx="66" cy="50" r="1.5" fill="#111" />
          </g>
        );
        break;
      case 6: // Júlia Lobo (glasses, short dark hair)
        skinColor = '#fbd7bd'; // Light clear skin
        hairElement = (
          <path d="M 34 32 Q 50 14 66 32 C 67 43 64 35 63 35 C 60 21 40 21 37 35 C 36 35 33 43 34 32" fill="#3d2314" />
        );
        accessoryElement = (
          <g>
            {/* Rounded stylish glasses */}
            <circle cx="43" cy="45" r="5" fill="none" stroke="#222" strokeWidth="1" />
            <circle cx="57" cy="45" r="5" fill="none" stroke="#222" strokeWidth="1" />
            <line x1="48" y1="45" x2="52" y2="45" stroke="#222" strokeWidth="1" />
          </g>
        );
        break;
      case 7: // Lucas Furtado (long wavy dark hair, retro mustache)
        skinColor = '#c69c6d'; // Tanned tone
        hairElement = (
          <g>
            {/* Long wavy hair draping the sides */}
            <path d="M 33 32 Q 50 12 67 32 Q 72 45 66 52 Q 62 40 60 32 Q 40 32 39 40 Q 38 46 34 52 Q 28 45 33 32" fill="#111" />
          </g>
        );
        facialHairElement = (
          /* Prominent retro thick mustache */
          <path d="M 39 51 Q 50 56 61 51 Q 50 54 39 51" fill="#111" />
        );
        break;
      case 8: // Costinha (glasses, dense curly greyish hair)
        skinColor = '#efcbb4';
        hairElement = (
          <g>
            {/* Salt and pepper dense hair */}
            <path d="M 34 32 Q 50 12 66 32 C 60 23 40 23 34 32" fill="#4d4d4d" />
            <circle cx="42" cy="22" r="3" fill="#808080" />
            <circle cx="50" cy="20" r="3" fill="#666" />
            <circle cx="58" cy="22" r="3" fill="#808080" />
          </g>
        );
        accessoryElement = (
          <g>
            {/* Thick glasses */}
            <rect x="37" y="41" width="10" height="7" rx="1.5" fill="none" stroke="#111" strokeWidth="1.2" />
            <rect x="53" y="41" width="10" height="7" rx="1.5" fill="none" stroke="#111" strokeWidth="1.2" />
            <line x1="47" y1="44" x2="53" y2="44" stroke="#111" strokeWidth="1.5" />
          </g>
        );
        break;
      case 9: // Rodolfo G. (stubby beard, masculine neat back-hair)
        skinColor = '#bc9671'; // Darker olive
        hairElement = (
          <path d="M 36 32 Q 50 18 64 32 C 60 26 40 26 36 32" fill="#1f1a17" />
        );
        facialHairElement = (
          /* Subtle gray-brown stubble */
          <path d="M 37 49 Q 50 63 63 49 C 60 57 40 57 37 49 Z" fill="#3a322e" opacity="0.6" />
        );
        break;
      case 10: // Rodolfo E. (friendly, neat short hair)
        skinColor = '#e3be9f';
        hairElement = (
          <path d="M 36 32 Q 50 20 64 32 C 60 25 40 25 36 32" fill="#222" />
        );
        break;
      case 11: // Nando (long styled hair, facial hair, huge smile)
        skinColor = '#bc9671';
        hairElement = (
          <path d="M 32 32 Q 50 10 68 32 C 72 44 65 48 64 36 C 60 28 40 28 36 36 C 35 48 28 44 32 32" fill="#241b14" />
        );
        facialHairElement = (
          <g>
            <path d="M 38 49 Q 50 64 62 49 Q 50 69 38 49 Z" fill="#241b14" />
            <path d="M 42 50 Q 50 54 58 50" fill="#241b14" />
          </g>
        );
        faceDetails = (
          <path d="M 44 52 Q 50 58 56 52" stroke="#fff" strokeWidth="1" fill="none" />
        );
        break;
      case 12: // Mascot (canary)
        return (
          <g transform="translate(0, -2)">
            {/* Canary Face */}
            <circle cx="50" cy="45" r="16" fill="#fed000" />
            {/* Big cute expressive soccer eyes */}
            <circle cx="44" cy="42" r="5" fill="#fff" />
            <circle cx="44" cy="42" r="2.5" fill="#00529b" />
            <circle cx="45" cy="41" r="1" fill="#fff" />
            
            <circle cx="56" cy="42" r="5" fill="#fff" />
            <circle cx="56" cy="42" r="2.5" fill="#00529b" />
            <circle cx="57" cy="41" r="1" fill="#fff" />
            
            {/* Mascot orange happy beak */}
            <polygon points="46,47 54,47 50,56" fill="#ff7a00" stroke="#ff5c00" strokeWidth="0.5" />
            
            {/* Cute green sporty baseball cap or trim */}
            <path d="M 36 38 C 42 28 58 28 64 38 Z" fill="#00a24c" />
            <path d="M 38 34 Q 50 30 62 34" stroke="#ffed00" strokeWidth="1.5" fill="none" />
          </g>
        );
    }

    return (
      <g>
        {/* Draw Body / CBF Yellow Jersey */}
        <path d="M 28 85 L 72 85 L 66 65 Q 50 72 34 65 Z" fill="#fed000" />
        {/* Green Jersey V-collar trim */}
        <path d="M 43 67 Q 50 76 57 67 Q 50 72 43 67 Z" fill="#00a24c" />
        
        {/* CBF Badge / Coat of arms on yellow shirt */}
        <g transform="translate(56, 71) scale(0.12)">
          {/* CBF Shield */}
          <path d="M 5 0 L 35 0 C 35 0 40 18 35 32 C 30 42 20 50 20 50 C 20 50 10 42 5 32 C 0 18 5 0 5 0 Z" fill="#00529b" stroke="#fff" strokeWidth="2" />
          {/* Five tiny CBF Stars above shield */}
          <polygon points="12,-5 14,-1 18,-1 15,2 16,6 12,4 8,6 9,2 6,-1 10,-1" fill="#00a24c" transform="scale(0.5) translate(4, -1)" />
          <polygon points="12,-5 14,-1 18,-1 15,2 16,6 12,4 8,6 9,2 6,-1 10,-1" fill="#00a24c" transform="scale(0.5) translate(14, -1)" />
          <polygon points="12,-5 14,-1 18,-1 15,2 16,6 12,4 8,6 9,2 6,-1 10,-1" fill="#00a24c" transform="scale(0.5) translate(24, -1)" />
          <polygon points="12,-5 14,-1 18,-1 15,2 16,6 12,4 8,6 9,2 6,-1 10,-1" fill="#00a24c" transform="scale(0.5) translate(34, -1)" />
          <polygon points="12,-5 14,-1 18,-1 15,2 16,6 12,4 8,6 9,2 6,-1 10,-1" fill="#00a24c" transform="scale(0.5) translate(44, -1)" />
          {/* CBF horizontal and vertical center white stripe */}
          <line x1="20" y1="5" x2="20" y2="45" stroke="#fff" strokeWidth="2" />
          <line x1="7" y1="20" x2="33" y2="20" stroke="#fff" strokeWidth="2" />
        </g>

        {/* Draw Neck */}
        <rect x="44" y="58" width="12" height="11" fill={skinColor} />
        {/* Shadow under chin */}
        <rect x="44" y="58" width="12" height="2" fill="#000" opacity="0.1" />

        {/* Draw Oval Head */}
        <ellipse cx="50" cy="45" rx="15" ry="17" fill={skinColor} />

        {/* Hair rendering */}
        {hairElement}

        {/* Facial hair rendering */}
        {facialHairElement}

        {/* Simple Eyes */}
        <circle cx="44" cy="43" r="1.5" fill="#1a1a1a" />
        <circle cx="56" cy="43" r="1.5" fill="#1a1a1a" />
        {/* Simple friendly eyebrows */}
        <path d="M 40 39 Q 44 38 47 41" stroke="#1a1a1a" strokeWidth="0.8" fill="none" />
        <path d="M 60 39 Q 56 38 53 41" stroke="#1a1a1a" strokeWidth="0.8" fill="none" />

        {/* Happy smile */}
        {faceDetails || (
          <path d="M 45 51 Q 50 56 55 51" stroke="#a0522d" strokeWidth="1" fill="none" strokeLinecap="round" />
        )}

        {/* Standard rounded nose */}
        <path d="M 49 45 Q 50 49 51 45" stroke="#a0522d" strokeWidth="0.8" fill="none" />

        {/* Accessories if any (glasses, earrings) */}
        {accessoryElement}
      </g>
    );
  };

  const getDepartmentColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'EDITORA':
        return 'bg-amber-500 text-amber-950 border-amber-300';
      case 'REVISTA':
        return 'bg-pink-500 text-pink-950 border-pink-300';
      case 'INFORMÁTICA':
        return 'bg-blue-500 text-blue-950 border-blue-300';
      case 'SUMID':
        return 'bg-purple-500 text-purple-950 border-purple-300';
      case 'COMERCIAL':
        return 'bg-yellow-500 text-yellow-950 border-yellow-300';
      default:
        return 'bg-emerald-500 text-emerald-950 border-emerald-300';
    }
  };

  return (
    <div
      id={`sticker-card-${sticker.id}`}
      className={`
        relative select-none rounded-xl overflow-hidden flex flex-col items-center justify-center
        border border-white/60 shadow-lg transition-transform duration-200 aspect-[0.72]
        ${isGlued ? 'shadow-md border-opacity-90 hover:scale-[1.03]' : 'hover:-translate-y-1 hover:shadow-xl'}
        ${className}
      `}
      style={{
        // Give size styles or default to filling parent container if dimensions are passed in parent className
        width: className.includes('w-') ? undefined : (size === 'sm' ? '4.25rem' : size === 'md' ? '6.25rem' : '8rem'),
        ...style
      }}
    >
      {!imageError ? (
        /* Render Full Edge-to-Edge Visual Sticker Image */
        <div className="w-full h-full relative flex items-center justify-center bg-[#b4e6e8]">
          <img
            src={(() => {
              let path = sticker.imagePath;
              if (sticker.id >= 101 && sticker.id <= 136) {
                if (path.includes('input_file_11.png')) {
                  path = '/src/assets/images/minicraque(16).png';
                }
              }
              return path.startsWith('/src/assets/images/') ? path : `/src/assets/images${path}`;
            })()}
            alt={sticker.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const currentSrc = e.currentTarget.src;
              if (sticker.id === 3 && !currentSrc.includes('input_file_0.png')) {
                // If Diego Maradona's specific input_file_3.png fails to load, fall back to input_file_0.png (where user uploaded it!)
                e.currentTarget.src = '/src/assets/images/input_file_0.png';
              } else if (currentSrc.includes('/src/assets/images/')) {
                // If the assets/images path failed, try the simple root path
                const parts = sticker.imagePath.split('/');
                const filename = parts[parts.length - 1];
                e.currentTarget.src = `/${filename}`;
              } else {
                setImageError(true);
              }
            }}
            className="w-full h-full object-cover select-none"
            style={{ marginRight: 0, marginBottom: 0, marginTop: 0 }}
            draggable={false}
          />
          {/* Subtle physical paper cut border */}
          <div className="absolute inset-0 border border-black/10 rounded-xl pointer-events-none" />
        </div>
      ) : (
        /* Resilient vector-complete sticker rendering (No code/ID shown on front face) */
        <div 
          style={style}
          className={`w-full h-full relative flex flex-col items-center justify-between p-[4%] font-sans overflow-hidden ${
            sticker.id >= 101 && sticker.id <= 136
              ? 'bg-gradient-to-tr from-[#4f46e5] via-[#9333ea] to-[#db2777] border-4 border-violet-950 text-white'
              : sticker.id >= 201 
              ? 'bg-[#fbbf24] border-4 border-[#d97706] text-amber-950' 
              : 'bg-[#80D5D8]'
          }`}
        >
          
          {/* Watermark Background "26 cepe" or sporty emblem behind the avatar */}
          <svg 
            style={svgStyle}
            className="absolute inset-0 w-full h-full pointer-events-none select-none z-0" 
            viewBox="0 0 100 138" 
            preserveAspectRatio="none"
          >
            {/* Giant Green Number 2 */}
            <path d="M -10 -10 L 40 -10 C 40 30 10 50 10 65 L 55 65 C 55 80 15 90 -10 90 Z" fill={sticker.id >= 201 ? "#b45309" : "#01a550"} opacity={sticker.id >= 201 ? "0.15" : "0.35"} />
            {/* Giant Yellow Number 6 */}
            <path d="M 60 20 C 85 20 110 40 110 75 C 110 110 80 125 50 120 C 35 117 38 90 55 90 C 70 90 85 85 85 70 C 85 55 70 48 50 48 Z" fill={sticker.id >= 201 ? "#f59e0b" : "#ffd100"} opacity={sticker.id >= 201 ? "0.2" : "0.45"} />
            {/* Outline decorative stars */}
            <polygon points="12,12 14,16 18,16 15,19 16,23 12,21 8,23 9,19 6,16 10,16" fill="#01a550" opacity="0.2" />
            <polygon points="85,32 87,36 91,36 88,39 89,43 85,41 81,43 82,39 79,36 83,36" fill="#ffd100" opacity="0.3" />
          </svg>

          {/* Header row overlay */}
          <div className="w-full flex justify-between items-center text-[9px] leading-none z-10 px-[3%] mt-[2%] font-extrabold select-none pointer-events-none text-emerald-950">
            <span className="font-black italic tracking-tighter scale-y-110">
              BRASIL
            </span>
            <div className="flex flex-col items-end leading-none">
              <span className="text-[120%] font-black">{sticker.id <= 48 ? "26" : "★"}</span>
              <span className="text-[60%] tracking-widest uppercase leading-none font-sans font-black">cepe</span>
            </div>
          </div>

          {/* Central responsive SVG Avatar wrapper */}
          <div className="flex-1 w-[88%] mx-auto my-[3%] relative z-10 flex items-center justify-center">
            {/* SVG responsive box fitted to page aspect ratio */}
            <svg 
              className="w-full h-full max-h-[84%]" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="xMidYMid meet"
            >
              {renderSvgAvatar(sticker.id)}
            </svg>
          </div>

          {/* Visual Sticker Card Bottom Overlay descriptors - 100% vector identical to original sticker design */}
          <div className="w-full flex flex-col gap-1 items-center z-10 mb-1 select-none pointer-events-none">
            {/* Name Capsule styling exactly matching Diego Maradona photo (No IDs or system codes!) */}
            <div className={`w-[94%] font-sans font-black tracking-wide uppercase text-[9px] py-1 rounded-lg text-center truncate ${
              sticker.id >= 101 && sticker.id <= 136
                ? 'bg-violet-950 border border-violet-800/40 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]'
                : 'bg-emerald-900 border border-emerald-700/50 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]'
            }`}>
              {sticker.name}
            </div>
            {/* Department Capsule */}
            <div className={`w-[82%] font-sans font-bold uppercase text-[7px] py-[1.5px] rounded-full text-center truncate ${
              sticker.id >= 101 && sticker.id <= 136
                ? 'bg-pink-850 border border-pink-700/60 text-pink-100'
                : 'bg-[#0d6b55] border border-[#09503e] text-[#bbf7d0]'
            }`}>
              {displayPosition}
            </div>
          </div>

        </div>
      )}

      {/* Flat design border accent */}
      <div className="absolute inset-0 border border-black/5 rounded-xl pointer-events-none" />
    </div>
  );
}
