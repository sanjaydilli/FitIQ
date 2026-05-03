import React, { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Background } from '../components/Background';

// Warm Indian skin tones
const SL  = '#F4CA9A';
const SM  = '#D49468';
const SD  = '#9E6438';
const SDD = '#7A4420';

function useBlink() {
  const [b, setB] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setB(true);
        setTimeout(() => setB(false), 110);
        loop();
      }, 2600 + Math.random() * 2600);
    };
    loop();
    return () => clearTimeout(t);
  }, []);
  return b;
}

interface FaceProps {
  uid: string;
  blink: boolean;
  faceGrad: string;
  hairGrad: string;
  outline?: string;
  outlineW?: number;
}

// Head: 24px wide (x:38-62), chin at y=31, hair top at y=-3
// All face features within y:0–31
function Face({ uid, blink, faceGrad, hairGrad, outline, outlineW = 0.8 }: FaceProps) {
  const sc = outline ?? 'none';
  const sw = outline ? outlineW : 0;
  return (
    <g>
      {/* HAIR BACK */}
      <path
        d="M38 14 C36 -1 64 -1 62 14 C60 3 50 2 40 3 C39 6 38 10 38 14 Z"
        fill={hairGrad} stroke={sc} strokeWidth={sw}
      />
      {/* HEAD OVAL — narrow adult jaw */}
      <path
        d="M38 14 C38 2 62 2 62 14 C63 23 59 31 50 32 C41 31 37 23 38 14 Z"
        fill={faceGrad} stroke={sc} strokeWidth={sw}
      />
      {/* Light bounce on cheek */}
      <ellipse cx="41" cy="11" rx="7" ry="5" fill="rgba(255,255,255,0.06)" transform="rotate(-12 41 11)" />
      {/* Cheek shadow */}
      <ellipse cx="38" cy="23" rx="4" ry="3" fill={SD} opacity="0.1" transform="rotate(-15 38 23)" />
      <ellipse cx="62" cy="23" rx="4" ry="3" fill={SD} opacity="0.1" transform="rotate(15 62 23)" />

      {/* EARS */}
      <path d="M38 11 Q31 12 30 17 Q31 22 38 21" fill={faceGrad} stroke={sc} strokeWidth={sw} />
      <path d="M62 11 Q69 12 70 17 Q69 22 62 21" fill={faceGrad} stroke={sc} strokeWidth={sw} />
      <path d="M31 14 Q30 17 31 21" fill="none" stroke={SD} strokeWidth="0.55" opacity="0.28" />
      <path d="M69 14 Q70 17 69 21" fill="none" stroke={SD} strokeWidth="0.55" opacity="0.28" />

      {/* HAIR FRONT */}
      <path
        d="M38 9 C40 2 60 2 62 9 C60 4 50 3 40 4 Z"
        fill={hairGrad} stroke={sc} strokeWidth={sw}
      />
      <path d="M42 4 Q50 1 58 4" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" />

      {/* EYEBROWS — thick defined arch */}
      <path d="M33 10 Q40 6 45 8.5" fill="none" stroke="#160e04" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M55 8.5 Q60 6 67 10" fill="none" stroke="#160e04" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M33 10 Q40 6 45 8.5 Q39 10.5 33 10 Z" fill="#160e04" opacity="0.55" />
      <path d="M55 8.5 Q60 6 67 10 Q61 10.5 55 8.5 Z" fill="#160e04" opacity="0.55" />

      {/* EYE SOCKETS */}
      <ellipse cx="39" cy="17" rx="6" ry="4" fill={SD} opacity="0.07" />
      <ellipse cx="61" cy="17" rx="6" ry="4" fill={SD} opacity="0.07" />

      {/* EYES */}
      {!blink ? (
        <>
          {/* Whites */}
          <path d="M33 17 Q39 12 45 17 Q39 22 33 17 Z" fill="white" opacity="0.97" />
          <path d="M55 17 Q61 12 67 17 Q61 22 55 17 Z" fill="white" opacity="0.97" />
          {/* Upper shadow on white */}
          <path d="M33 17 Q39 12 45 17 Q39 15 33 17 Z" fill="#cfd3e7" />
          <path d="M55 17 Q61 12 67 17 Q61 15 55 17 Z" fill="#cfd3e7" />
          {/* Iris */}
          <circle cx="39" cy="17" r="3" fill="#2C1508" />
          <circle cx="61" cy="17" r="3" fill="#2C1508" />
          {/* Pupil */}
          <circle cx="39" cy="17" r="1.7" fill="#050108" />
          <circle cx="61" cy="17" r="1.7" fill="#050108" />
          {/* Iris ring */}
          <circle cx="39" cy="17" r="3" fill="none" stroke="#0A0508" strokeWidth="0.5" />
          <circle cx="61" cy="17" r="3" fill="none" stroke="#0A0508" strokeWidth="0.5" />
          {/* Catchlight */}
          <circle cx="40.2" cy="15.8" r="1.0" fill="white" opacity="0.95" />
          <circle cx="62.2" cy="15.8" r="1.0" fill="white" opacity="0.95" />
          <circle cx="37.8" cy="18.2" r="0.45" fill="white" opacity="0.45" />
          <circle cx="59.8" cy="18.2" r="0.45" fill="white" opacity="0.45" />
          {/* Upper lash */}
          <path d="M33 16.5 Q39 11.5 45 16.5" fill="none" stroke="#0e0804" strokeWidth="1.05" strokeLinecap="round" />
          <path d="M55 16.5 Q61 11.5 67 16.5" fill="none" stroke="#0e0804" strokeWidth="1.05" strokeLinecap="round" />
          {/* Lower lid */}
          <path d="M34 18.8 Q39 21.5 44 18.8" fill="none" stroke={SD} strokeWidth="0.38" opacity="0.26" strokeLinecap="round" />
          <path d="M56 18.8 Q61 21.5 66 18.8" fill="none" stroke={SD} strokeWidth="0.38" opacity="0.26" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M33 17 Q39 22 45 17 Q39 22 33 17 Z" fill={SM} />
          <path d="M55 17 Q61 22 67 17 Q61 22 55 17 Z" fill={SM} />
          <path d="M33 17 Q39 21.5 45 17" fill="none" stroke="#0e0804" strokeWidth="1.05" strokeLinecap="round" />
          <path d="M55 17 Q61 21.5 67 17" fill="none" stroke="#0e0804" strokeWidth="1.05" strokeLinecap="round" />
        </>
      )}

      {/* NOSE — shadow-only for realistic */}
      <path d="M48.5 21 Q48 25 47.5 27" fill="none" stroke={SD} strokeWidth={outline ? 0.75 : 0.55} opacity={outline ? 0.5 : 0.22} strokeLinecap="round" />
      <path d="M51.5 21 Q52 25 52.5 27" fill="none" stroke={SD} strokeWidth={outline ? 0.75 : 0.55} opacity={outline ? 0.5 : 0.22} strokeLinecap="round" />
      {outline
        ? <path d="M45.5 28 Q50 30 54.5 28" fill="none" stroke={SD} strokeWidth="0.75" opacity="0.45" strokeLinecap="round" />
        : <>
            <ellipse cx="46" cy="28" rx="1.8" ry="0.85" fill={SDD} opacity="0.17" />
            <ellipse cx="54" cy="28" rx="1.8" ry="0.85" fill={SDD} opacity="0.17" />
          </>
      }

      {/* MOUTH — confident slight smile, inside face y:28–32 */}
      <path d="M41 28.5 Q50 35 59 28.5 Q54.5 32 50 33 Q45.5 32 41 28.5 Z"
        fill="#9E5A50" opacity={outline ? 0.85 : 0.58} stroke={sc} strokeWidth={sw * 0.7} />
      <path d="M41 28.5 Q50 35 59 28.5" fill="none"
        stroke={outline ?? '#7A3028'} strokeWidth={outline ? 0.95 : 0.85}
        strokeLinecap="round" opacity="0.78" />
      <ellipse cx="50" cy="32" rx="4" ry="1.1" fill="rgba(255,255,255,0.1)" />
      <circle cx="41.5" cy="29" r="0.75" fill={SDD} opacity="0.22" />
      <circle cx="58.5" cy="29" r="0.75" fill={SDD} opacity="0.22" />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLE A  ·  REALISTIC 3D — cinematic gradients, no outlines, idle float
// ViewBox 0 0 100 220 — head 15% height, shoulders 56px, waist 24px (V-taper 2.3:1)
// ─────────────────────────────────────────────────────────────────────────────
function StyleA({ uid }: { uid: string }) {
  const blink = useBlink();
  return (
    <svg viewBox="0 0 100 220" width="100" height="220" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`fA-${uid}`} cx="36%" cy="28%" r="64%">
          <stop offset="0%" stopColor={SL} />
          <stop offset="55%" stopColor={SM} />
          <stop offset="100%" stopColor={SD} />
        </radialGradient>
        <radialGradient id={`skA-${uid}`} cx="28%" cy="20%" r="70%">
          <stop offset="0%" stopColor="#EEC07E" />
          <stop offset="100%" stopColor="#8C5430" />
        </radialGradient>
        <linearGradient id={`tA-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#1c1c2e" />
          <stop offset="100%" stopColor="#080810" />
        </linearGradient>
        <linearGradient id={`shA-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16182c" />
          <stop offset="100%" stopColor="#0c0e18" />
        </linearGradient>
        <radialGradient id={`bgA-${uid}`} cx="50%" cy="30%">
          <stop offset="0%" stopColor="#1a1240" />
          <stop offset="100%" stopColor="#06040c" />
        </radialGradient>
        <linearGradient id={`hrA-${uid}`} x1="0.4" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#201408" />
          <stop offset="100%" stopColor="#060402" />
        </linearGradient>
        <filter id={`dsA-${uid}`} x="-22%" y="-5%" width="144%" height="120%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000" floodOpacity="0.55" />
        </filter>
      </defs>

      <rect width="100" height="220" fill={`url(#bgA-${uid})`} />
      <ellipse cx="50" cy="95" rx="36" ry="60" fill="#5EEAD4" opacity="0.04" />

      <motion.g
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 130px' }}
        filter={`url(#dsA-${uid})`}
      >
        {/* Ground shadow */}
        <ellipse cx="50" cy="218" rx="19" ry="2" fill="#000" opacity="0.4" />

        {/* SHOES */}
        <path d="M16 208 Q27 204 40 208 Q40 218 16 218 Z" fill="#111122" />
        <path d="M84 208 Q73 204 60 208 Q60 218 84 218 Z" fill="#111122" />
        <path d="M18 207 Q27 205.5 40 207" stroke="#fff" strokeWidth="0.6" fill="none" opacity="0.22" />
        <path d="M82 207 Q73 205.5 60 207" stroke="#fff" strokeWidth="0.6" fill="none" opacity="0.22" />

        {/* SHINS */}
        <path d="M23 168 Q21 190 23 208 Q28 214 38 212 Q39 192 39 168 Z" fill={`url(#skA-${uid})`} />
        <path d="M77 168 Q79 190 77 208 Q72 214 62 212 Q61 192 61 168 Z" fill={`url(#skA-${uid})`} />
        <path d="M24 174 Q22 192 24 206" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M76 174 Q78 192 76 206" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M37 172 Q38 192 38 210" fill="none" stroke={SDD} strokeWidth="0.6" opacity="0.2" strokeLinecap="round" />
        <path d="M63 172 Q62 192 62 210" fill="none" stroke={SDD} strokeWidth="0.6" opacity="0.2" strokeLinecap="round" />

        {/* KNEES */}
        <ellipse cx="31" cy="170" rx="8.5" ry="6" fill={`url(#skA-${uid})`} />
        <ellipse cx="69" cy="170" rx="8.5" ry="6" fill={`url(#skA-${uid})`} />
        <ellipse cx="31" cy="169" rx="4.5" ry="3" fill="rgba(255,255,255,0.07)" />
        <ellipse cx="69" cy="169" rx="4.5" ry="3" fill="rgba(255,255,255,0.07)" />

        {/* THIGHS */}
        <path d="M27 118 Q23 142 23 168 Q29 174 41 172 Q43 150 43 118 Z" fill={`url(#skA-${uid})`} />
        <path d="M73 118 Q77 142 77 168 Q71 174 59 172 Q57 150 57 118 Z" fill={`url(#skA-${uid})`} />
        <path d="M28 126 Q26 148 28 165" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M72 126 Q74 148 72 165" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M41 122 Q42 144 42 168" fill="none" stroke={SDD} strokeWidth="0.6" opacity="0.2" strokeLinecap="round" />
        <path d="M59 122 Q58 144 58 168" fill="none" stroke={SDD} strokeWidth="0.6" opacity="0.2" strokeLinecap="round" />

        {/* SHORTS */}
        <path d="M23 100 Q19 112 22 124 Q30 128 43 126 Q43 116 45 108 Z" fill={`url(#shA-${uid})`} />
        <path d="M77 100 Q81 112 78 124 Q70 128 57 126 Q57 116 55 108 Z" fill={`url(#shA-${uid})`} />
        <rect x="23" y="97" width="54" height="5.5" rx="2.5" fill="#16182c" />
        <line x1="50" y1="99" x2="50" y2="124" stroke="rgba(255,255,255,0.04)" strokeWidth="0.6" />

        {/* TORSO — V-taper: shoulders 56px → waist 24px */}
        <motion.g
          animate={{ scaleY: [1, 1.016, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 78px' }}
        >
          <path
            d="M22 50 Q16 68 16 100 Q34 106 50 106 Q66 106 84 100 Q84 68 78 50
               Q64 46 57 44 L56 40 Q52 38 50 39 Q48 38 44 40 L43 44 Q36 46 22 50 Z"
            fill={`url(#tA-${uid})`}
          />
          {/* Left pec shadow */}
          <path d="M22 56 Q30 52 46 56 Q44 70 36 78 Q22 74 18 64 Z" fill="#000" opacity="0.15" />
          {/* Right pec shadow */}
          <path d="M78 56 Q70 52 54 56 Q56 70 64 78 Q78 74 82 64 Z" fill="#000" opacity="0.15" />
          {/* Sternum */}
          <line x1="50" y1="52" x2="50" y2="96" stroke="rgba(0,0,0,0.2)" strokeWidth="0.7" />
          {/* Pec lines */}
          <path d="M22 62 Q36 56 50 58" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.9" />
          <path d="M78 62 Q64 56 50 58" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.9" />
          {/* Abs */}
          <path d="M38 80 Q50 78 62 80" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
          <path d="M38 88 Q50 86 62 88" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.7" />
          {/* Shirt highlight */}
          <path d="M18 58 Q16 74 18 98" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" strokeLinecap="round" />
        </motion.g>

        {/* LEFT DELTOID */}
        <path d="M22 50 Q14 52 12 60 Q12 68 20 66 Q20 58 24 52 Z" fill={`url(#skA-${uid})`} />
        {/* LEFT BICEP */}
        <path d="M12 60 Q8 74 10 92 Q14 98 20 96 Q20 80 20 66 Z" fill={`url(#skA-${uid})`} />
        {/* LEFT FOREARM */}
        <path d="M10 92 Q8 110 10 130 Q13 135 18 133 Q18 114 20 96 Z" fill={`url(#skA-${uid})`} />
        <ellipse cx="12" cy="134" rx="4.5" ry="5.5" fill={`url(#skA-${uid})`} />
        {/* Left arm highlights */}
        <path d="M8 64 Q6 78 8 92" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M14 68 Q12 80 14 90" fill="none" stroke={SDD} strokeWidth="0.65" opacity="0.22" strokeLinecap="round" />
        <path d="M8 96 Q6 112 8 128" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" strokeLinecap="round" />

        {/* RIGHT DELTOID */}
        <path d="M78 50 Q86 52 88 60 Q88 68 80 66 Q80 58 76 52 Z" fill={`url(#skA-${uid})`} />
        {/* RIGHT BICEP */}
        <path d="M88 60 Q92 74 90 92 Q86 98 80 96 Q80 80 80 66 Z" fill={`url(#skA-${uid})`} />
        {/* RIGHT FOREARM */}
        <path d="M90 92 Q92 110 90 130 Q87 135 82 133 Q82 114 80 96 Z" fill={`url(#skA-${uid})`} />
        <ellipse cx="88" cy="134" rx="4.5" ry="5.5" fill={`url(#skA-${uid})`} />
        {/* Right arm highlights */}
        <path d="M92 64 Q94 78 92 92" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M86 68 Q88 80 86 90" fill="none" stroke={SDD} strokeWidth="0.65" opacity="0.22" strokeLinecap="round" />
        <path d="M92 96 Q94 112 92 128" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" strokeLinecap="round" />

        {/* NECK */}
        <path d="M44 39 L43 50 Q50 54 57 50 L56 39 Z" fill={`url(#fA-${uid})`} />
        <line x1="44" y1="42" x2="43" y2="50" stroke={SD} strokeWidth="0.5" opacity="0.22" />
        <line x1="56" y1="42" x2="57" y2="50" stroke={SD} strokeWidth="0.5" opacity="0.22" />
        {/* Trapezius */}
        <path d="M22 50 Q34 46 44 44" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1.4" />
        <path d="M78 50 Q66 46 56 44" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1.4" />

        {/* HEAD */}
        <motion.g
          animate={{ rotate: [-0.9, 0.9, -0.9] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 39px' }}
        >
          <Face uid={uid} blink={blink} faceGrad={`url(#fA-${uid})`} hairGrad={`url(#hrA-${uid})`} />
        </motion.g>
      </motion.g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLE B  ·  VECTOR ANIME — clean outlines, blue outfit, hands on hips
// ─────────────────────────────────────────────────────────────────────────────
function StyleB({ uid }: { uid: string }) {
  const blink = useBlink();
  const OUT = '#0d0b1a';
  return (
    <svg viewBox="0 0 100 220" width="100" height="220">
      <defs>
        <radialGradient id={`fB-${uid}`} cx="36%" cy="28%" r="64%">
          <stop offset="0%" stopColor={SL} />
          <stop offset="55%" stopColor={SM} />
          <stop offset="100%" stopColor={SD} />
        </radialGradient>
        <radialGradient id={`skB-${uid}`} cx="28%" cy="20%" r="70%">
          <stop offset="0%" stopColor="#ECC07A" />
          <stop offset="100%" stopColor="#8A5830" />
        </radialGradient>
        <linearGradient id={`tB-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id={`shB-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e2232" />
          <stop offset="100%" stopColor="#0e101a" />
        </linearGradient>
        <linearGradient id={`bgB-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e1020" />
          <stop offset="100%" stopColor="#06070e" />
        </linearGradient>
        <linearGradient id={`hrB-${uid}`} x1="0.4" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#1e1208" />
          <stop offset="100%" stopColor="#080604" />
        </linearGradient>
      </defs>

      <rect width="100" height="220" fill={`url(#bgB-${uid})`} />
      <ellipse cx="50" cy="95" rx="40" ry="66" fill="#3B82F6" opacity="0.06" />

      <motion.g
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 130px' }}
      >
        <ellipse cx="50" cy="218" rx="18" ry="1.8" fill="#000" opacity="0.3" />

        {/* SHOES */}
        <path d="M16 208 Q27 204 40 208 Q40 218 16 218 Z" fill="#1a1a2a" stroke={OUT} strokeWidth="0.9" strokeLinejoin="round" />
        <path d="M84 208 Q73 204 60 208 Q60 218 84 218 Z" fill="#1a1a2a" stroke={OUT} strokeWidth="0.9" strokeLinejoin="round" />
        <path d="M18 207 Q27 205.5 40 207" stroke="#fff" strokeWidth="0.6" fill="none" opacity="0.3" />
        <path d="M82 207 Q73 205.5 60 207" stroke="#fff" strokeWidth="0.6" fill="none" opacity="0.3" />

        {/* SHINS */}
        <path d="M23 168 Q21 190 23 208 Q28 214 38 212 Q39 192 39 168 Z" fill={`url(#skB-${uid})`} stroke={OUT} strokeWidth="0.85" strokeLinejoin="round" />
        <path d="M77 168 Q79 190 77 208 Q72 214 62 212 Q61 192 61 168 Z" fill={`url(#skB-${uid})`} stroke={OUT} strokeWidth="0.85" strokeLinejoin="round" />
        <path d="M24 174 Q22 192 24 206" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M76 174 Q78 192 76 206" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1.2" strokeLinecap="round" />

        {/* KNEES */}
        <ellipse cx="31" cy="170" rx="8.5" ry="6" fill={`url(#skB-${uid})`} stroke={OUT} strokeWidth="0.7" />
        <ellipse cx="69" cy="170" rx="8.5" ry="6" fill={`url(#skB-${uid})`} stroke={OUT} strokeWidth="0.7" />

        {/* THIGHS */}
        <path d="M27 118 Q23 142 23 168 Q29 174 41 172 Q43 150 43 118 Z" fill={`url(#skB-${uid})`} stroke={OUT} strokeWidth="0.85" strokeLinejoin="round" />
        <path d="M73 118 Q77 142 77 168 Q71 174 59 172 Q57 150 57 118 Z" fill={`url(#skB-${uid})`} stroke={OUT} strokeWidth="0.85" strokeLinejoin="round" />
        <path d="M28 126 Q26 148 28 165" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M72 126 Q74 148 72 165" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1.4" strokeLinecap="round" />

        {/* SHORTS */}
        <path d="M23 100 Q19 112 22 124 Q30 128 43 126 Q43 116 45 108 Z" fill={`url(#shB-${uid})`} stroke={OUT} strokeWidth="0.85" />
        <path d="M77 100 Q81 112 78 124 Q70 128 57 126 Q57 116 55 108 Z" fill={`url(#shB-${uid})`} stroke={OUT} strokeWidth="0.85" />
        <rect x="23" y="97" width="54" height="5.5" rx="2.5" fill="#252538" stroke={OUT} strokeWidth="0.85" />

        {/* TORSO */}
        <motion.path
          d="M22 50 Q16 68 16 100 Q34 106 50 106 Q66 106 84 100 Q84 68 78 50
             Q64 46 57 44 L56 40 Q52 38 50 39 Q48 38 44 40 L43 44 Q36 46 22 50 Z"
          fill={`url(#tB-${uid})`} stroke={OUT} strokeWidth="0.85" strokeLinejoin="round"
          animate={{ scaleY: [1, 1.015, 1] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 78px' }}
        />
        <path d="M18 58 Q16 74 18 98" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M22 62 Q36 56 50 58" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.9" />
        <path d="M78 62 Q64 56 50 58" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.9" />
        <path d="M38 80 Q50 78 62 80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.7" />

        {/* LEFT ARM — deltoid + bicep + forearm bent to hip */}
        <path d="M22 50 Q14 52 12 60 Q12 68 20 66 Q20 58 24 52 Z" fill={`url(#skB-${uid})`} stroke={OUT} strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M12 60 Q8 74 10 92 Q14 98 20 96 Q20 80 20 66 Z" fill={`url(#skB-${uid})`} stroke={OUT} strokeWidth="0.8" strokeLinejoin="round" />
        {/* Forearm bent inward to hip */}
        <path d="M10 92 Q8 104 20 108 Q24 106 24 100 Q14 98 20 96 Z" fill={`url(#skB-${uid})`} stroke={OUT} strokeWidth="0.8" strokeLinejoin="round" />
        <ellipse cx="19" cy="105" rx="6.5" ry="4.5" fill={`url(#skB-${uid})`} stroke={OUT} strokeWidth="0.8" />
        <path d="M8 64 Q6 78 8 92" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.6" strokeLinecap="round" />

        {/* RIGHT ARM — hands on hips */}
        <path d="M78 50 Q86 52 88 60 Q88 68 80 66 Q80 58 76 52 Z" fill={`url(#skB-${uid})`} stroke={OUT} strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M88 60 Q92 74 90 92 Q86 98 80 96 Q80 80 80 66 Z" fill={`url(#skB-${uid})`} stroke={OUT} strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M90 92 Q92 104 80 108 Q76 106 76 100 Q86 98 80 96 Z" fill={`url(#skB-${uid})`} stroke={OUT} strokeWidth="0.8" strokeLinejoin="round" />
        <ellipse cx="81" cy="105" rx="6.5" ry="4.5" fill={`url(#skB-${uid})`} stroke={OUT} strokeWidth="0.8" />
        <path d="M92 64 Q94 78 92 92" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.6" strokeLinecap="round" />

        {/* NECK */}
        <path d="M44 39 L43 50 Q50 54 57 50 L56 39 Z" fill={`url(#fB-${uid})`} stroke={OUT} strokeWidth="0.8" strokeLinejoin="round" />

        {/* HEAD */}
        <motion.g
          animate={{ rotate: [-1, 1, -1] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 39px' }}
        >
          <Face uid={uid} blink={blink} outline={OUT} outlineW={0.8} faceGrad={`url(#fB-${uid})`} hairGrad={`url(#hrB-${uid})`} />
        </motion.g>
      </motion.g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLE C  ·  STREET — bold lines, black tank, ARMS CROSSED, confident pose
// ─────────────────────────────────────────────────────────────────────────────
function StyleC({ uid }: { uid: string }) {
  const blink = useBlink();
  const OUT = '#0a0818';
  return (
    <svg viewBox="0 0 100 220" width="100" height="220">
      <defs>
        <radialGradient id={`fC-${uid}`} cx="36%" cy="26%" r="64%">
          <stop offset="0%" stopColor={SL} />
          <stop offset="48%" stopColor={SM} />
          <stop offset="100%" stopColor={SD} />
        </radialGradient>
        <radialGradient id={`skC-${uid}`} cx="28%" cy="20%" r="70%">
          <stop offset="0%" stopColor="#ECC07A" />
          <stop offset="100%" stopColor="#885430" />
        </radialGradient>
        <linearGradient id={`tC-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#141414" />
          <stop offset="100%" stopColor="#050505" />
        </linearGradient>
        <linearGradient id={`shC-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e2434" />
          <stop offset="100%" stopColor="#0c1020" />
        </linearGradient>
        <linearGradient id={`bgC-${uid}`} x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#100e22" />
          <stop offset="100%" stopColor="#070510" />
        </linearGradient>
        <linearGradient id={`hrC-${uid}`} x1="0.4" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#241408" />
          <stop offset="100%" stopColor="#0a0806" />
        </linearGradient>
      </defs>

      <rect width="100" height="220" fill={`url(#bgC-${uid})`} />
      <ellipse cx="50" cy="95" rx="40" ry="66" fill="#A78BFA" opacity="0.05" />

      <motion.g
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 130px' }}
      >
        <ellipse cx="50" cy="218" rx="20" ry="2" fill="#000" opacity="0.32" />

        {/* SHOES */}
        <path d="M16 208 Q27 204 40 208 Q40 218 16 218 Z" fill="#0d0d1a" stroke={OUT} strokeWidth="1" strokeLinejoin="round" />
        <path d="M84 208 Q73 204 60 208 Q60 218 84 218 Z" fill="#0d0d1a" stroke={OUT} strokeWidth="1" strokeLinejoin="round" />
        <path d="M18 207 Q27 205.5 40 207" stroke="#fff" strokeWidth="0.6" fill="none" opacity="0.35" />
        <path d="M82 207 Q73 205.5 60 207" stroke="#fff" strokeWidth="0.6" fill="none" opacity="0.35" />

        {/* SHINS */}
        <path d="M23 168 Q21 190 23 208 Q28 214 38 212 Q39 192 39 168 Z" fill={`url(#skC-${uid})`} stroke={OUT} strokeWidth="1" strokeLinejoin="round" />
        <path d="M77 168 Q79 190 77 208 Q72 214 62 212 Q61 192 61 168 Z" fill={`url(#skC-${uid})`} stroke={OUT} strokeWidth="1" strokeLinejoin="round" />
        <path d="M24 174 Q22 192 24 206" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M76 174 Q78 192 76 206" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.2" strokeLinecap="round" />

        {/* KNEES */}
        <ellipse cx="31" cy="170" rx="8.5" ry="6" fill={`url(#skC-${uid})`} stroke={OUT} strokeWidth="0.8" />
        <ellipse cx="69" cy="170" rx="8.5" ry="6" fill={`url(#skC-${uid})`} stroke={OUT} strokeWidth="0.8" />

        {/* THIGHS */}
        <path d="M27 118 Q23 142 23 168 Q29 174 41 172 Q43 150 43 118 Z" fill={`url(#skC-${uid})`} stroke={OUT} strokeWidth="1" strokeLinejoin="round" />
        <path d="M73 118 Q77 142 77 168 Q71 174 59 172 Q57 150 57 118 Z" fill={`url(#skC-${uid})`} stroke={OUT} strokeWidth="1" strokeLinejoin="round" />
        <path d="M28 126 Q26 148 28 165" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M72 126 Q74 148 72 165" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.4" strokeLinecap="round" />

        {/* SHORTS */}
        <path d="M23 100 Q19 112 22 124 Q30 128 43 126 Q43 116 45 108 Z" fill={`url(#shC-${uid})`} stroke={OUT} strokeWidth="1" />
        <path d="M77 100 Q81 112 78 124 Q70 128 57 126 Q57 116 55 108 Z" fill={`url(#shC-${uid})`} stroke={OUT} strokeWidth="1" />
        <rect x="23" y="97" width="54" height="5.5" rx="2.5" fill="#20243a" stroke={OUT} strokeWidth="1" />

        {/* TORSO */}
        <motion.path
          d="M22 50 Q16 68 16 100 Q34 106 50 106 Q66 106 84 100 Q84 68 78 50
             Q64 46 57 44 L56 40 Q52 38 50 39 Q48 38 44 40 L43 44 Q36 46 22 50 Z"
          fill={`url(#tC-${uid})`} stroke={OUT} strokeWidth="1" strokeLinejoin="round"
          animate={{ scaleY: [1, 1.018, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 78px' }}
        />
        <path d="M22 62 Q36 56 50 58" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
        <path d="M78 62 Q64 56 50 58" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
        <path d="M18 58 Q16 74 18 98" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="50" y1="54" x2="50" y2="96" stroke="rgba(255,255,255,0.05)" strokeWidth="0.7" />

        {/* LEFT DELTOID + UPPER ARM */}
        <path d="M22 50 Q14 52 12 60 Q12 68 20 66 Q20 58 24 52 Z" fill={`url(#skC-${uid})`} stroke={OUT} strokeWidth="0.9" strokeLinejoin="round" />
        <path d="M12 60 Q8 74 10 90 Q14 98 20 96 Q20 80 20 66 Z" fill={`url(#skC-${uid})`} stroke={OUT} strokeWidth="0.9" strokeLinejoin="round" />
        {/* LEFT FOREARM — crosses right over torso */}
        <path d="M10 90 Q10 102 62 110 Q67 108 65 102 Q18 96 20 96 Z" fill={`url(#skC-${uid})`} stroke={OUT} strokeWidth="0.9" strokeLinejoin="round" />
        <ellipse cx="64" cy="107" rx="6.5" ry="5" fill={`url(#skC-${uid})`} stroke={OUT} strokeWidth="0.9" />

        {/* RIGHT DELTOID + UPPER ARM */}
        <path d="M78 50 Q86 52 88 60 Q88 68 80 66 Q80 58 76 52 Z" fill={`url(#skC-${uid})`} stroke={OUT} strokeWidth="0.9" strokeLinejoin="round" />
        <path d="M88 60 Q92 74 90 90 Q86 98 80 96 Q80 80 80 66 Z" fill={`url(#skC-${uid})`} stroke={OUT} strokeWidth="0.9" strokeLinejoin="round" />
        {/* RIGHT FOREARM — crosses left under torso */}
        <path d="M90 90 Q90 104 38 112 Q33 110 35 104 Q82 98 80 96 Z" fill={`url(#skC-${uid})`} stroke={OUT} strokeWidth="0.9" strokeLinejoin="round" />
        <ellipse cx="36" cy="109" rx="6.5" ry="5" fill={`url(#skC-${uid})`} stroke={OUT} strokeWidth="0.9" />

        {/* Arm highlights */}
        <path d="M8 64 Q6 78 8 90" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M92 64 Q94 78 92 90" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.7" strokeLinecap="round" />

        {/* NECK */}
        <path d="M44 39 L43 50 Q50 54 57 50 L56 39 Z" fill={`url(#fC-${uid})`} stroke={OUT} strokeWidth="0.9" strokeLinejoin="round" />

        {/* HEAD */}
        <motion.g
          animate={{ rotate: [-1.2, 1.2, -1.2] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 39px' }}
        >
          <Face uid={uid} blink={blink} outline={OUT} outlineW={0.9} faceGrad={`url(#fC-${uid})`} hairGrad={`url(#hrC-${uid})`} />
        </motion.g>
      </motion.g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON SCREEN
// ─────────────────────────────────────────────────────────────────────────────
const STYLES = [
  { id: 'A', name: 'Cinematic 3D', sub: 'No outlines · Gradient shading · Idle stance', tag: 'RECOMMENDED', color: '#5EEAD4', Component: StyleA },
  { id: 'B', name: 'Anime Clean',  sub: 'Crisp lines · Blue tank · Hands on hips',      tag: 'CLEAN',       color: '#3B82F6', Component: StyleB },
  { id: 'C', name: 'Street Mode',  sub: 'Bold lines · Black tank · Arms crossed',        tag: 'COOL',        color: '#A78BFA', Component: StyleC },
];

export function AvatarStyleCompare() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const baseId = useId().replace(/[:]/g, '');
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Background>
      <div style={{ height: '100%', overflowY: 'auto', padding: '52px 0 84px' }}>
        <div style={{ padding: '0 20px', marginBottom: 18 }}>
          <motion.div whileTap={{ scale: 0.94 }} onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 12, cursor: 'pointer', color: theme.textMute, fontSize: 12 }}>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 2L4 6l4 4" /></svg>
            Back
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono, letterSpacing: 2.5, marginBottom: 5 }}>AVATAR REDESIGN</div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.7 }}>Pick Your Style</div>
            <div style={{ fontSize: 12, color: theme.textDim, marginTop: 4 }}>
              Athletic proportions · Blink · Breathe · Head sway
            </div>
          </motion.div>
        </div>

        <div style={{ padding: '0 10px', display: 'flex', gap: 8 }}>
          {STYLES.map((style, i) => {
            const uid = `${baseId}${i}`;
            const isSel = selected === style.id;
            return (
              <motion.div key={style.id} style={{ flex: 1 }}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4, ease: [0.22, 0.8, 0.22, 1] }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(isSel ? null : style.id)}
              >
                <motion.div
                  animate={{ boxShadow: isSel ? `0 0 0 2px ${style.color}, 0 8px 28px ${style.color}30` : `0 0 0 1px ${style.color}30, 0 4px 12px rgba(0,0,0,0.3)` }}
                  style={{ borderRadius: 16, overflow: 'hidden', background: `linear-gradient(160deg, ${style.color}12, rgba(255,255,255,0.02))`, position: 'relative', cursor: 'pointer' }}
                >
                  <div style={{ padding: '8px 6px 0', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ fontSize: 8, fontFamily: theme.mono, fontWeight: 700, letterSpacing: 1, color: style.color, background: `${style.color}18`, padding: '2px 7px', borderRadius: 4 }}>
                      {style.tag}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 0' }}>
                    <style.Component uid={uid} />
                  </div>
                  <div style={{ padding: '4px 8px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 3 }}>{style.name}</div>
                    <div style={{ fontSize: 8.5, color: theme.textMute, lineHeight: 1.5 }}>{style.sub}</div>
                  </div>
                  <AnimatePresence>
                    {isSel && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: style.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7.5L8 3" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <div style={{ padding: '16px 14px 0' }}>
          <AnimatePresence>
            {selected && (
              <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(-1)}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 16, border: 'none',
                  background: `linear-gradient(135deg, ${STYLES.find(s => s.id === selected)!.color}, ${theme.accent2})`,
                  color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: theme.font,
                }}>
                Use {STYLES.find(s => s.id === selected)!.name} →
              </motion.button>
            )}
          </AnimatePresence>
          {!selected && <div style={{ textAlign: 'center', fontSize: 11, color: theme.textMute }}>Tap a style to select</div>}
        </div>
      </div>
    </Background>
  );
}
