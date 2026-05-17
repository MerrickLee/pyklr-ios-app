import React, { useState } from 'react';
import {
  Home, MapPin, MessageCircle, User, Plus, Search, Bell, Heart,
  ChevronLeft, ChevronRight, Settings, Edit3, Send, Eye, X,
  Apple, Chrome, Facebook, Check, MoreVertical, Trophy, Target,
  Flame, Sparkles, Volume2, VolumeX, Calendar, Filter, ArrowUp,
} from 'lucide-react';

// ============================================================
// PYKLR — Dark Mode Mockup
// Brand colors: Green #67BF69 (logo) · Lime #A8E66A (dark mode accent)
// Blue #4493CC
// Inspired by Pickleplay UI Kit + your AI mockup energy
// ============================================================

const LIME = '#A8E66A';         // Punchy lime — dark mode primary
const LIME_DARK = '#0A1F08';    // Text on lime buttons
const GREEN = '#67BF69';        // Logo green
const GREEN_DARK = '#4FA547';
const BLUE = '#4493CC';
const BLUE_LIGHT = '#5BA5DE';

const BG = '#0B0B0B';           // Page bg
const SURFACE = '#161616';      // Cards
const SURFACE_2 = '#1F1F1F';    // Elevated
const BORDER = '#262626';
const TEXT = '#FFFFFF';
const TEXT_MUTED = '#9A9A9A';
const TEXT_FAINT = '#666666';

// PYKLR Logo SVG (paddle + ball on triangle wedge)
const PyklrLogo = ({ size = 80, paddleColor = LIME, triangleColor = BLUE }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <polygon points="5,12 5,80 60,46" fill={triangleColor} opacity="0.95" />
    <ellipse cx="48" cy="34" rx="24" ry="28" fill="none" stroke={paddleColor} strokeWidth="5" />
    <circle cx="32" cy="34" r="11" fill="none" stroke={paddleColor} strokeWidth="4" />
    <circle cx="28" cy="32" r="1.8" fill={paddleColor} />
    <circle cx="34" cy="30" r="1.8" fill={paddleColor} />
    <circle cx="32" cy="37" r="1.8" fill={paddleColor} />
    <rect x="44" y="62" width="5" height="18" fill={paddleColor} />
  </svg>
);

// Phone frame
const Phone = ({ children, label }) => (
  <div className="flex flex-col items-center">
    <div
      className="relative"
      style={{
        width: 320,
        height: 680,
        borderRadius: 44,
        background: BG,
        border: '8px solid #000',
        overflow: 'hidden',
        boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${BORDER}`,
      }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-black"
           style={{ width: 110, height: 24, borderRadius: '0 0 14px 14px' }} />
      <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <style>{`::-webkit-scrollbar { display: none; }`}</style>
        {children}
      </div>
    </div>
    <div className="mt-3 text-sm font-medium text-stone-400">{label}</div>
  </div>
);

const StatusBar = () => (
  <div className="flex justify-between items-center px-6 pt-3 pb-1 text-[10px] font-semibold" style={{ color: TEXT }}>
    <span>9:41</span>
    <span className="tracking-tighter">●●●● ▮▮</span>
  </div>
);

const HeaderLogo = () => (
  <div className="flex items-center gap-1.5 py-2">
    <PyklrLogo size={22} paddleColor={LIME} triangleColor={BLUE} />
    <span style={{
      fontFamily: 'system-ui, sans-serif',
      fontWeight: 900,
      fontStyle: 'italic',
      fontSize: 16,
      letterSpacing: '-0.04em',
      color: LIME,
    }}>PYKLR</span>
  </div>
);

const TabBar = ({ active = 'home' }) => {
  const tabs = [
    { id: 'home', icon: Home },
    { id: 'map', icon: MapPin },
    { id: 'add', icon: Plus, fab: true },
    { id: 'chat', icon: MessageCircle },
    { id: 'profile', icon: User },
  ];
  return (
    <div
      className="absolute bottom-3 left-4 right-4 flex justify-around items-center"
      style={{
        background: SURFACE,
        borderRadius: 28,
        padding: '12px 0',
        border: `0.5px solid ${BORDER}`,
      }}
    >
      {tabs.map(({ id, icon: Icon, fab }) => {
        if (fab) {
          return (
            <div
              key={id}
              className="flex items-center justify-center"
              style={{
                width: 44, height: 44, borderRadius: 22,
                background: LIME, marginTop: -18,
                boxShadow: `0 6px 16px ${LIME}55`,
              }}
            >
              <Icon size={20} color={LIME_DARK} strokeWidth={2.5} />
            </div>
          );
        }
        const isActive = id === active;
        return (
          <Icon
            key={id}
            size={20}
            color={isActive ? LIME : TEXT_FAINT}
            strokeWidth={isActive ? 2.5 : 2}
          />
        );
      })}
    </div>
  );
};

// ============================================================
// SCREENS
// ============================================================

const SplashScreen = () => (
  <div className="h-full flex flex-col" style={{ background: BG }}>
    <StatusBar />
    <div className="flex-1 flex flex-col items-center justify-center px-8 gap-7">
      {/* Ambient glow */}
      <div className="absolute" style={{
        width: 280, height: 280, borderRadius: '50%',
        background: `radial-gradient(circle, ${LIME}22 0%, transparent 70%)`,
        filter: 'blur(20px)',
        top: '20%',
      }} />
      <div
        className="flex items-center justify-center relative"
        style={{
          width: 140, height: 140, background: BLUE,
          borderRadius: 32,
          boxShadow: `0 12px 40px ${BLUE}55`,
        }}
      >
        <PyklrLogo size={100} paddleColor={LIME} triangleColor={BLUE} />
      </div>
      <div className="text-center relative">
        <div style={{
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 900,
          fontStyle: 'italic',
          fontSize: 44,
          color: LIME,
          letterSpacing: '-0.04em',
          lineHeight: 1,
        }}>PYKLR</div>
        <div className="mt-1.5" style={{
          fontFamily: 'monospace',
          fontSize: 9,
          color: LIME,
          opacity: 0.7,
          letterSpacing: '0.18em',
          fontWeight: 700,
        }}>MEET PLAYERS. START MATCHES.</div>
      </div>
      <p className="text-center text-sm leading-relaxed max-w-[80%] relative" style={{ color: TEXT_MUTED }}>
        Find players. Find courts. Find your game.
      </p>
      <div className="w-full flex flex-col gap-2.5 mt-2 relative">
        <button
          className="w-full py-3.5 rounded-2xl font-semibold text-sm"
          style={{ background: LIME, color: LIME_DARK }}
        >
          Get started
        </button>
        <button
          className="w-full py-3.5 rounded-2xl font-medium text-sm"
          style={{ border: `1px solid ${BORDER}`, color: TEXT, background: 'transparent' }}
        >
          I already have an account
        </button>
      </div>
    </div>
  </div>
);

const AuthScreen = () => (
  <div className="h-full flex flex-col px-5" style={{ background: BG, color: TEXT }}>
    <StatusBar />
    <HeaderLogo />
    <div className="flex-1 flex flex-col gap-3 pt-2">
      <div>
        <div className="text-2xl font-bold leading-tight">Create your<br />account</div>
        <div className="text-xs mt-1.5" style={{ color: TEXT_MUTED }}>Join 12,000+ players nearby</div>
      </div>
      {[
        { Icon: Apple, label: 'Continue with Apple' },
        { Icon: Chrome, label: 'Continue with Google' },
        { Icon: Facebook, label: 'Continue with Facebook' },
      ].map(({ Icon, label }) => (
        <button
          key={label}
          className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium"
          style={{ border: `1px solid ${BORDER}`, color: TEXT, background: 'transparent' }}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
      <div className="text-center text-xs" style={{ color: TEXT_FAINT }}>— or —</div>
      <input
        placeholder="Email address"
        className="w-full px-4 py-3 rounded-2xl text-sm"
        style={{ background: SURFACE, border: 'none', color: TEXT }}
      />
      <input
        placeholder="Password (min. 8 characters)"
        type="password"
        className="w-full px-4 py-3 rounded-2xl text-sm"
        style={{ background: SURFACE, border: 'none', color: TEXT }}
      />
      <button
        className="w-full py-3.5 rounded-2xl font-semibold text-sm mt-1"
        style={{ background: LIME, color: LIME_DARK }}
      >
        Sign up
      </button>
      <div className="text-center text-[10px] mt-1" style={{ color: TEXT_FAINT }}>
        By signing up you agree to Terms & Privacy
      </div>
    </div>
  </div>
);

const SurveyScreen = () => (
  <div className="h-full flex flex-col px-5" style={{ background: BG, color: TEXT }}>
    <StatusBar />
    <HeaderLogo />
    <div className="flex-1 flex flex-col gap-3">
      <div className="text-xs mt-1" style={{ color: TEXT_MUTED }}>Step 2 of 4</div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: SURFACE }}>
        <div className="h-full rounded-full" style={{ width: '50%', background: LIME }} />
      </div>
      <div className="text-2xl font-bold leading-tight mt-2">What's<br />your game?</div>
      <div className="text-xs" style={{ color: TEXT_MUTED }}>Pick all that apply — we'll match you better</div>
      <div className="grid grid-cols-2 gap-2.5 mt-2">
        {[
          { emoji: '🎯', label: 'Competitive', selected: true },
          { emoji: '🎉', label: 'Fun social', selected: false },
          { emoji: '🏃', label: 'Drills', selected: true },
          { emoji: '🌀', label: 'Open play', selected: false },
        ].map(({ emoji, label, selected }) => (
          <div
            key={label}
            className="rounded-2xl p-4 text-center"
            style={{
              background: selected ? `${LIME}15` : SURFACE,
              border: selected ? `1.5px solid ${LIME}` : `1.5px solid transparent`,
            }}
          >
            <div className="text-2xl">{emoji}</div>
            <div className="text-sm font-semibold mt-1" style={{ color: selected ? LIME : TEXT }}>
              {label}
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs font-medium mt-3" style={{ color: TEXT_MUTED }}>When do you play?</div>
      <div className="flex flex-wrap gap-1.5">
        {['Mornings', 'Afternoons', 'Evenings', 'Weekends'].map((t) => {
          const on = ['Mornings', 'Evenings', 'Weekends'].includes(t);
          return (
            <span
              key={t}
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{
                background: on ? LIME : SURFACE,
                color: on ? LIME_DARK : TEXT_MUTED,
              }}
            >
              {t}
            </span>
          );
        })}
      </div>
      <div className="text-xs font-medium mt-2" style={{ color: TEXT_MUTED }}>DUPR rating (if known)</div>
      <input
        placeholder="3.5"
        defaultValue="3.5"
        className="w-full px-4 py-3 rounded-2xl text-sm"
        style={{ background: SURFACE, border: 'none', color: TEXT }}
      />
      <button
        className="w-full py-3.5 rounded-2xl font-semibold text-sm mt-auto mb-2"
        style={{ background: LIME, color: LIME_DARK }}
      >
        Continue
      </button>
    </div>
  </div>
);

const HomeScreen = () => (
  <div className="h-full flex flex-col px-5 pb-24" style={{ background: BG, color: TEXT }}>
    <StatusBar />
    <div className="flex justify-between items-center py-2">
      <div>
        <div className="text-xs" style={{ color: TEXT_MUTED }}>Welcome back,</div>
        <div className="text-lg font-bold">Merrick 👋</div>
      </div>
      <div className="flex items-center gap-3">
        <Bell size={20} color={TEXT_MUTED} />
        <div className="w-9 h-9 rounded-full"
             style={{ background: `linear-gradient(135deg, ${LIME}, ${BLUE})` }} />
      </div>
    </div>
    <div className="relative">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" color={TEXT_FAINT} />
      <input
        placeholder="Search courts, players, events"
        className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm"
        style={{ background: SURFACE, border: 'none', color: TEXT }}
      />
    </div>

    {/* Featured event card */}
    <div className="rounded-3xl p-5 mt-4 relative overflow-hidden" style={{ background: BLUE }}>
      <div className="text-[10px] font-bold text-white/80 tracking-widest relative z-10">TODAY · 6:00 PM</div>
      <div className="text-base font-bold text-white mt-1 relative z-10">Open play @ Flowers Park</div>
      <div className="text-xs text-white/80 mt-0.5 relative z-10">3 players in · 3.0–3.5 · 0.8 mi</div>
      <button
        className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold relative z-10"
        style={{ background: LIME, color: LIME_DARK }}
      >
        Join game →
      </button>
      <div className="absolute -right-4 -bottom-4 opacity-25">
        <PyklrLogo size={100} paddleColor="white" triangleColor="white" />
      </div>
    </div>

    <div className="text-sm font-bold mt-4">Quick actions</div>
    <div className="grid grid-cols-2 gap-2.5 mt-2">
      <div className="rounded-2xl p-4" style={{ background: `${LIME}12`, border: `0.5px solid ${LIME}33` }}>
        <div className="text-2xl">👥</div>
        <div className="font-semibold text-sm mt-1.5" style={{ color: LIME }}>Find players</div>
        <div className="text-[10px]" style={{ color: LIME, opacity: 0.7 }}>8 online nearby</div>
      </div>
      <div className="rounded-2xl p-4" style={{ background: `${BLUE}15`, border: `0.5px solid ${BLUE}44` }}>
        <div className="text-2xl">📍</div>
        <div className="font-semibold text-sm mt-1.5" style={{ color: BLUE_LIGHT }}>Find courts</div>
        <div className="text-[10px]" style={{ color: BLUE_LIGHT, opacity: 0.7 }}>12 within 5 mi</div>
      </div>
    </div>

    <div className="flex justify-between items-center mt-4">
      <div className="text-sm font-bold">Popular near you</div>
      <div className="text-xs font-medium" style={{ color: LIME }}>See all →</div>
    </div>
    <div className="rounded-2xl p-3 mt-2" style={{ background: SURFACE }}>
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-sm">Flowers Park</div>
          <div className="text-xs" style={{ color: TEXT_MUTED }}>4 courts · Free · 0.8 mi · ⭐ 4.6</div>
        </div>
        <span
          className="text-[10px] px-3 py-1 rounded-full font-semibold"
          style={{ background: LIME, color: LIME_DARK }}
        >
          Open
        </span>
      </div>
    </div>
    <div className="rounded-2xl p-3 mt-2" style={{ background: SURFACE }}>
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-sm">New Roc Pickleball</div>
          <div className="text-xs" style={{ color: TEXT_MUTED }}>6 indoor · $8/hr · 1.2 mi · ⭐ 4.8</div>
        </div>
        <span className="text-[10px] px-3 py-1 rounded-full font-medium"
              style={{ background: SURFACE_2, color: TEXT_MUTED }}>$8/hr</span>
      </div>
    </div>

    <TabBar active="home" />
  </div>
);

const MapScreen = () => (
  <div className="h-full flex flex-col px-5 pb-24" style={{ background: BG, color: TEXT }}>
    <StatusBar />
    <div className="flex justify-between items-center py-2">
      <div>
        <div className="text-base font-bold">Find courts</div>
        <div className="text-xs" style={{ color: TEXT_MUTED }}>12 within 5 miles</div>
      </div>
      <Filter size={20} color={TEXT_MUTED} />
    </div>
    <div className="flex gap-1.5 flex-wrap mt-1">
      {[
        { l: '5 mi', on: true },
        { l: 'Indoor', on: false },
        { l: 'Lights', on: false },
        { l: 'Free', on: false },
        { l: '+ More', on: false },
      ].map(({ l, on }) => (
        <span
          key={l}
          className="text-xs px-3 py-1.5 rounded-full font-medium"
          style={{
            background: on ? LIME : SURFACE,
            color: on ? LIME_DARK : TEXT_MUTED,
          }}
        >
          {l}
        </span>
      ))}
    </div>

    {/* Map */}
    <div className="flex-1 rounded-3xl mt-3 relative overflow-hidden min-h-[280px]"
         style={{ background: '#0F1A0F' }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.04) 95%), linear-gradient(0deg, transparent 95%, rgba(255,255,255,0.04) 95%)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute top-[40%] left-0 right-0 h-[3px]" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute top-0 bottom-0 left-[45%] w-[3px]" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute top-[70%] left-0 right-[20%] h-[2px]" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Pins */}
      <div className="absolute top-[28%] left-[18%] px-2 py-1 rounded-full text-[10px] font-semibold"
           style={{ background: LIME, color: LIME_DARK }}>
        Free · 0.8 mi
      </div>
      <div className="absolute top-[52%] left-[48%] px-2 py-1 rounded-full text-[10px] font-semibold"
           style={{ background: 'white', color: LIME_DARK, boxShadow: `0 0 0 3px ${LIME}55` }}>
        ⭐ Flowers · 0.8mi
      </div>
      <div className="absolute top-[68%] left-[28%] px-2 py-1 rounded-full text-[10px] font-semibold"
           style={{ background: LIME, color: LIME_DARK }}>
        $8/hr · 1.2 mi
      </div>
      <div className="absolute top-[22%] left-[62%] px-2 py-1 rounded-full text-[10px] font-semibold"
           style={{ background: LIME, color: LIME_DARK }}>
        Free · 2.4 mi
      </div>

      {/* User location */}
      <div className="absolute top-[45%] left-[42%] w-4 h-4 rounded-full"
           style={{ background: BLUE, border: '3px solid white', boxShadow: `0 0 0 10px ${BLUE}33` }} />
    </div>

    {/* Selected card */}
    <div className="rounded-2xl p-3 mt-3" style={{ background: SURFACE }}>
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-sm">Flowers Park Courts</div>
          <div className="text-xs" style={{ color: TEXT_MUTED }}>4 outdoor · Free · 0.8 mi</div>
          <div className="flex gap-1.5 mt-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: SURFACE_2, color: TEXT_MUTED }}>💡 Lights</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: SURFACE_2, color: TEXT_MUTED }}>🚻 Restroom</span>
          </div>
        </div>
        <button
          className="px-3 py-2 rounded-xl text-xs font-semibold"
          style={{ background: LIME, color: LIME_DARK }}
        >
          Directions
        </button>
      </div>
    </div>
    <TabBar active="map" />
  </div>
);

const CourtDetailScreen = () => (
  <div className="h-full flex flex-col px-5 pb-24" style={{ background: BG, color: TEXT }}>
    <StatusBar />
    <div className="flex justify-between items-center py-2">
      <ChevronLeft size={22} color={TEXT} />
      <Heart size={20} color={TEXT_MUTED} />
    </div>
    {/* Photo */}
    <div className="rounded-3xl aspect-[1.6] relative overflow-hidden"
         style={{ background: `linear-gradient(135deg, ${LIME}, ${BLUE})` }}>
      <div className="absolute bottom-3 left-3 right-3 flex gap-1.5">
        <div className="w-7 h-1 rounded-full bg-white" />
        <div className="w-7 h-1 rounded-full bg-white/40" />
        <div className="w-7 h-1 rounded-full bg-white/40" />
        <div className="w-7 h-1 rounded-full bg-white/40" />
      </div>
    </div>
    <div className="font-bold text-lg mt-3">Flowers Park Courts</div>
    <div className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>📍 0.8 mi · ⭐ 4.6 (47) · Free</div>
    <div className="flex flex-wrap gap-1.5 mt-2">
      {['4 outdoor', '💡 Lights', '🚻 Restroom', '🅿️ Parking'].map((t) => (
        <span key={t} className="text-[11px] px-3 py-1 rounded-full font-medium"
              style={{ background: SURFACE, color: TEXT_MUTED }}>
          {t}
        </span>
      ))}
    </div>
    <div className="text-sm font-bold mt-4">Open play happening</div>
    <div className="rounded-2xl p-3 mt-2" style={{ background: SURFACE }}>
      <div className="flex items-center gap-2.5">
        <div className="flex">
          {[LIME, BLUE, '#A8E66A'].map((c, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${c}, ${BLUE})`,
                border: `2px solid ${SURFACE}`,
                marginLeft: i === 0 ? 0 : -8
              }}
            />
          ))}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-xs">Wednesday social</div>
          <div className="text-[10px]" style={{ color: TEXT_MUTED }}>3 in · needs 1 more · 3.0–3.5</div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2.5 mt-auto mb-2">
      <button className="py-3 rounded-2xl text-sm font-medium"
              style={{ border: `1px solid ${BORDER}`, color: TEXT, background: 'transparent' }}>
        Directions
      </button>
      <button className="py-3 rounded-2xl text-sm font-semibold"
              style={{ background: LIME, color: LIME_DARK }}>
        Join game
      </button>
    </div>
    <TabBar active="map" />
  </div>
);

const FindPlayersScreen = () => {
  const players = [
    { name: 'Sarah K.', rating: 'DUPR 3.85', verified: true, dist: '1.2 mi', tag: 'Verified', grad: [LIME, BLUE] },
    { name: 'Marcus T.', rating: '3.5 self', verified: false, dist: '2.4 mi', tag: 'Mornings', grad: [BLUE, LIME] },
    { name: 'Priya L.', rating: 'DUPR 4.12', verified: true, dist: '0.6 mi', tag: 'Verified', grad: ['#A8E66A', BLUE] },
    { name: 'Devon R.', rating: '3.0 self', verified: false, dist: '3.1 mi', tag: 'Weekends', grad: [BLUE, '#A8E66A'] },
  ];
  return (
    <div className="h-full flex flex-col px-5 pb-24" style={{ background: BG, color: TEXT }}>
      <StatusBar />
      <div className="py-2">
        <div className="text-lg font-bold">Find players</div>
        <div className="text-xs" style={{ color: TEXT_MUTED }}>8 nearby · matched to your style</div>
      </div>
      <div className="flex gap-1.5 mt-1">
        <span className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: LIME, color: LIME_DARK }}>Nearby</span>
        <span className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: SURFACE, color: TEXT_MUTED }}>3.0–4.0</span>
        <span className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: SURFACE, color: TEXT_MUTED }}>Verified</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 mt-3">
        {players.map((p, i) => (
          <div key={i}>
            <div
              className="aspect-[1.1] rounded-2xl relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${p.grad[0]}, ${p.grad[1]})` }}
            >
              <div
                className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold"
                style={p.verified
                  ? { background: LIME, color: LIME_DARK }
                  : { background: 'rgba(255,255,255,0.95)', color: '#0F2A0C' }}
              >
                {p.rating}
              </div>
              <div className="absolute inset-0"
                   style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.55))' }} />
              <div className="absolute bottom-7 left-2.5 text-[9px] text-white/90">{p.dist} · {p.tag}</div>
              <div className="absolute bottom-2 left-2.5 text-xs font-bold text-white">{p.name}</div>
            </div>
            <button
              className="w-full py-2 mt-1.5 rounded-xl text-xs font-semibold"
              style={p.verified
                ? { background: LIME, color: LIME_DARK }
                : { background: 'transparent', border: `1px solid ${BORDER}`, color: TEXT }}
            >
              {p.verified ? 'Match' : 'View'}
            </button>
          </div>
        ))}
      </div>
      <TabBar active="map" />
    </div>
  );
};

const MessagesScreen = () => (
  <div className="h-full flex flex-col px-5 pb-24" style={{ background: BG, color: TEXT }}>
    <StatusBar />
    <div className="flex justify-between items-center py-2">
      <div className="text-lg font-bold">Messages</div>
      <Edit3 size={20} color={TEXT_MUTED} />
    </div>
    <div className="relative mt-1">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" color={TEXT_FAINT} />
      <input
        placeholder="Search messages"
        className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm"
        style={{ background: SURFACE, border: 'none', color: TEXT }}
      />
    </div>
    <div className="flex gap-1.5 mt-3">
      <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: LIME, color: LIME_DARK }}>My groups</span>
      <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: SURFACE, color: TEXT_MUTED }}>DMs</span>
      <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: SURFACE, color: TEXT_MUTED }}>Requests</span>
    </div>
    <div className="flex flex-col gap-2 mt-3">
      <div className="rounded-2xl p-3" style={{ background: `${BLUE}1A`, border: `0.5px solid ${BLUE}44` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs"
               style={{ background: BLUE }}>NR</div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-sm">New Roc Open Play</div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: BLUE, color: 'white' }}>3</span>
            </div>
            <div className="text-xs" style={{ color: TEXT_MUTED }}>Sarah: anyone for 7pm? 🎾</div>
          </div>
        </div>
      </div>
      {[
        { initials: 'WL', name: 'Westchester 4.0+ ladder', sub: '12 members · 2 muted by you', bg: LIME, fg: LIME_DARK },
        { initials: 'SB', name: 'Sunday brunch & pickle', sub: '8 members · all caught up', bg: '#555', fg: 'white' },
      ].map((g) => (
        <div key={g.initials} className="rounded-2xl p-3" style={{ background: SURFACE }}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs"
                 style={{ background: g.bg, color: g.fg }}>{g.initials}</div>
            <div>
              <div className="font-semibold text-sm">{g.name}</div>
              <div className="text-xs" style={{ color: TEXT_MUTED }}>{g.sub}</div>
            </div>
          </div>
        </div>
      ))}
      <div className="rounded-2xl p-3" style={{ background: SURFACE }}>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full"
               style={{ background: `linear-gradient(135deg, ${LIME}, ${BLUE})` }} />
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-sm">Marcus T.</div>
              <span className="text-[10px]" style={{ color: TEXT_FAINT }}>2m</span>
            </div>
            <div className="text-xs" style={{ color: TEXT_MUTED }}>good game today 🎾</div>
          </div>
        </div>
      </div>
    </div>
    <TabBar active="chat" />
  </div>
);

const ChatThreadScreen = () => (
  <div className="h-full flex flex-col" style={{ background: BG, color: TEXT }}>
    <StatusBar />
    <div className="flex items-center gap-2.5 px-5 py-2 border-b" style={{ borderColor: BORDER }}>
      <ChevronLeft size={20} color={TEXT} />
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs"
           style={{ background: BLUE }}>NR</div>
      <div className="flex-1">
        <div className="font-bold text-sm">New Roc Open Play</div>
        <div className="text-[10px] flex items-center gap-1" style={{ color: TEXT_MUTED }}>
          14 members · <VolumeX size={9} /> 2 muted
        </div>
      </div>
      <MoreVertical size={18} color={TEXT_MUTED} />
    </div>
    <div className="flex-1 px-4 py-3 flex flex-col gap-2.5 overflow-y-auto">
      <div className="text-center text-[10px]" style={{ color: TEXT_FAINT }}>Today</div>
      {/* Sarah */}
      <div className="flex gap-2 items-start">
        <div className="w-7 h-7 rounded-full flex-shrink-0"
             style={{ background: `linear-gradient(135deg, ${LIME}, ${BLUE})` }} />
        <div>
          <div className="text-[10px] mb-0.5" style={{ color: TEXT_MUTED }}>Sarah K. · 9:32am</div>
          <div className="px-3 py-2 rounded-2xl rounded-bl-md text-xs max-w-[220px]"
               style={{ background: SURFACE }}>
            anyone for 7pm at flowers park? 🎾
          </div>
        </div>
      </div>
      {/* Muted message */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2"
           style={{ background: '#101015', opacity: 0.6 }}>
        <VolumeX size={12} color={TEXT_FAINT} className="flex-shrink-0" />
        <div className="text-[10px] italic flex-1" style={{ color: TEXT_MUTED }}>
          Big Mike sent a message — muted
        </div>
        <Eye size={12} color={TEXT_FAINT} />
      </div>
      {/* Devon */}
      <div className="flex gap-2 items-start">
        <div className="w-7 h-7 rounded-full flex-shrink-0"
             style={{ background: `linear-gradient(135deg, ${BLUE}, ${LIME})` }} />
        <div>
          <div className="text-[10px] mb-0.5" style={{ color: TEXT_MUTED }}>Devon R. · 9:36am</div>
          <div className="px-3 py-2 rounded-2xl rounded-bl-md text-xs max-w-[220px]"
               style={{ background: SURFACE }}>
            I'm in 👍 bring extra balls?
          </div>
        </div>
      </div>
      {/* Smart suggestion */}
      <div className="rounded-2xl p-3 my-1"
           style={{ background: `linear-gradient(135deg, ${LIME}, ${GREEN})` }}>
        <div className="flex items-center gap-1 text-[9px] font-bold tracking-widest" style={{ color: LIME_DARK }}>
          <Sparkles size={10} /> SMART SUGGESTION
        </div>
        <div className="font-bold text-sm mt-0.5" style={{ color: LIME_DARK }}>
          Create event "7pm @ Flowers Park"
        </div>
        <div className="text-[11px] mt-0.5" style={{ color: LIME_DARK, opacity: 0.8 }}>
          3 likely RSVPs · tap to schedule
        </div>
      </div>
      {/* Your reply */}
      <div className="flex justify-end">
        <div className="px-3 py-2 rounded-2xl rounded-br-md text-xs font-medium max-w-[220px]"
             style={{ background: LIME, color: LIME_DARK }}>
          I'm in 🙌 +1 friend
        </div>
      </div>
    </div>
    <div className="px-4 pb-4 pt-2 flex items-center gap-2 border-t" style={{ borderColor: BORDER }}>
      <input
        placeholder="Message…"
        className="flex-1 px-4 py-2.5 rounded-2xl text-sm"
        style={{ background: SURFACE, border: 'none', color: TEXT }}
      />
      <button className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: LIME }}>
        <Send size={16} color={LIME_DARK} />
      </button>
    </div>
  </div>
);

const CreateEventScreen = () => (
  <div className="h-full flex flex-col px-5" style={{ background: BG, color: TEXT }}>
    <StatusBar />
    <div className="flex justify-between items-center py-2">
      <X size={22} color={TEXT} />
      <div className="font-bold text-sm">New event</div>
      <div className="w-6" />
    </div>
    <div className="text-xs mt-1" style={{ color: TEXT_MUTED }}>Step 2 of 5 · Details</div>
    <div className="h-1 rounded-full overflow-hidden mt-1" style={{ background: SURFACE }}>
      <div className="h-full rounded-full" style={{ width: '40%', background: LIME }} />
    </div>
    <div className="flex flex-col gap-3 mt-4">
      <div>
        <label className="text-xs font-medium" style={{ color: TEXT_MUTED }}>Event name</label>
        <input
          defaultValue="Saturday morning doubles"
          className="w-full px-4 py-3 rounded-2xl text-sm mt-1"
          style={{ background: SURFACE, border: 'none', color: TEXT }}
        />
      </div>
      <div>
        <label className="text-xs font-medium" style={{ color: TEXT_MUTED }}>Format</label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {[
            { l: 'Doubles', on: true },
            { l: 'Singles', on: false },
            { l: 'Mixed', on: false },
          ].map(({ l, on }) => (
            <div
              key={l}
              className="py-3 rounded-2xl text-center text-xs font-semibold"
              style={{
                background: on ? LIME : SURFACE,
                color: on ? LIME_DARK : TEXT_MUTED,
              }}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium" style={{ color: TEXT_MUTED }}>Court</label>
        <div className="w-full px-4 py-3 rounded-2xl text-sm mt-1 flex items-center gap-2"
             style={{ background: SURFACE }}>
          <MapPin size={14} color={LIME} />
          <span>Flowers Park · 0.8 mi</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-xs font-medium" style={{ color: TEXT_MUTED }}>Skill range</label>
          <input
            defaultValue="3.0 – 3.5"
            className="w-full px-4 py-3 rounded-2xl text-sm mt-1"
            style={{ background: SURFACE, border: 'none', color: TEXT }}
          />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: TEXT_MUTED }}>Max players</label>
          <input
            defaultValue="8"
            className="w-full px-4 py-3 rounded-2xl text-sm mt-1"
            style={{ background: SURFACE, border: 'none', color: TEXT }}
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium" style={{ color: TEXT_MUTED }}>Date & time</label>
        <div className="w-full px-4 py-3 rounded-2xl text-sm mt-1 flex items-center gap-2"
             style={{ background: SURFACE }}>
          <Calendar size={14} color={LIME} />
          <span>Sat, Apr 12 · 9:00 AM</span>
        </div>
      </div>
    </div>
    <button className="w-full py-3.5 rounded-2xl font-semibold text-sm mt-auto mb-4"
            style={{ background: LIME, color: LIME_DARK }}>
      Continue → Schedule
    </button>
  </div>
);

const ForumScreen = () => (
  <div className="h-full flex flex-col px-5 pb-24" style={{ background: BG, color: TEXT }}>
    <StatusBar />
    <div className="flex justify-between items-center py-2">
      <div className="text-lg font-bold">Community</div>
      <Search size={20} color={TEXT_MUTED} />
    </div>
    <div className="flex gap-1.5 mt-1 flex-wrap">
      {[
        { l: 'All', on: true },
        { l: 'Gear', on: false },
        { l: 'Strategy', on: false },
        { l: 'Courts', on: false },
      ].map(({ l, on }) => (
        <span key={l} className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: on ? LIME : SURFACE, color: on ? LIME_DARK : TEXT_MUTED }}>
          {l}
        </span>
      ))}
    </div>
    <div className="flex flex-col gap-2.5 mt-3">
      {[
        { user: 'jenL', time: '2h', tag: 'Gear', title: 'Joola Ben Johns Perseus — worth $280?',
          preview: 'Been on the fence for months. Anyone playing with it…', up: 42, c: 18 },
        { user: 'marcusT', time: '5h', tag: 'Strategy', title: 'Third shot drop or drive — when?',
          preview: 'Coach says drop, my partner says drive. What\'s the rule of…', up: 89, c: 34, hot: true },
        { user: 'sarahK', time: '1d', tag: 'Courts', title: 'New courts at Glen Island Park! 🎉',
          preview: '', up: 156, c: 22, hot: true },
      ].map((p, i) => (
        <div key={i} className="rounded-2xl p-3" style={{ background: SURFACE }}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full"
                 style={{ background: `linear-gradient(135deg, ${LIME}, ${BLUE})` }} />
            <div className="text-[10px]" style={{ color: TEXT_MUTED }}>u/{p.user} · {p.time}</div>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: `${LIME}22`, color: LIME }}>
              {p.tag}
            </span>
          </div>
          <div className="font-semibold text-sm">{p.title}</div>
          {p.preview && <div className="text-xs mt-1" style={{ color: TEXT_MUTED }}>{p.preview}</div>}
          <div className="flex gap-4 mt-2 text-xs" style={{ color: TEXT_MUTED }}>
            <span className="flex items-center gap-1" style={p.hot ? { color: LIME, fontWeight: 600 } : {}}>
              <ArrowUp size={12} /> {p.up}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={12} /> {p.c}
            </span>
          </div>
        </div>
      ))}
    </div>
    <TabBar active="chat" />
  </div>
);

const ProfileScreen = () => (
  <div className="h-full flex flex-col px-5 pb-24" style={{ background: BG, color: TEXT }}>
    <StatusBar />
    <div className="flex justify-between items-center py-2">
      <ChevronLeft size={22} color={TEXT} />
      <Settings size={20} color={TEXT_MUTED} />
    </div>
    <div className="flex flex-col items-center gap-1.5 mt-3">
      <div className="w-20 h-20 rounded-full"
           style={{ background: `linear-gradient(135deg, ${LIME}, ${BLUE})`, border: `3px solid ${LIME}` }} />
      <div className="font-bold text-base mt-1 flex items-center gap-1.5">
        Merrick Lee <Check size={14} color={LIME} />
      </div>
      <div className="text-xs" style={{ color: TEXT_MUTED }}>DUPR 3.85 · New Rochelle, NY</div>
      <div className="flex gap-1.5 mt-1">
        {['Competitive', 'Evenings', 'Drills'].map((t) => (
          <span key={t} className="text-[10px] px-2 py-1 rounded-full font-medium"
                style={{ background: `${LIME}1A`, color: LIME }}>
            {t}
          </span>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2 mt-4">
      {[
        { v: '47', l: 'Matches' },
        { v: '68%', l: 'Win rate' },
        { v: '12', l: 'Followers' },
      ].map((s) => (
        <div key={s.l} className="rounded-2xl p-3 text-center" style={{ background: SURFACE }}>
          <div className="text-xl font-bold">{s.v}</div>
          <div className="text-[10px] mt-0.5" style={{ color: TEXT_MUTED }}>{s.l}</div>
        </div>
      ))}
    </div>
    <div className="text-sm font-bold mt-4">Achievements</div>
    <div className="flex gap-2 mt-2">
      {[
        { icon: Trophy, bg: '#3A2D0F', color: '#F2C97A' },
        { icon: Target, bg: `${BLUE}33`, color: BLUE_LIGHT },
        { icon: Flame, bg: `${LIME}22`, color: LIME },
      ].map(({ icon: Icon, bg, color }, i) => (
        <div key={i} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: bg }}>
          <Icon size={18} color={color} />
        </div>
      ))}
      <div className="w-11 h-11 rounded-full flex items-center justify-center opacity-40"
           style={{ background: SURFACE }}>
        <div className="text-base">🔒</div>
      </div>
    </div>
    <div className="text-sm font-bold mt-4">Recent activity</div>
    <div className="rounded-2xl p-3 mt-2" style={{ background: SURFACE }}>
      <div className="font-medium text-sm flex items-center gap-1.5">
        <Trophy size={14} color="#F2C97A" /> Won doubles @ Flowers Park
      </div>
      <div className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>2 days ago · partner Priya L.</div>
    </div>
    <TabBar active="profile" />
  </div>
);

const SettingsScreen = () => {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const [c, setC] = useState(true);

  const Toggle = ({ on, onClick }) => (
    <div
      onClick={onClick}
      className="w-10 h-6 rounded-full relative cursor-pointer transition-colors"
      style={{ background: on ? LIME : SURFACE_2 }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
        style={{ left: on ? 18 : 2 }}
      />
    </div>
  );

  return (
    <div className="h-full flex flex-col px-5" style={{ background: BG, color: TEXT }}>
      <StatusBar />
      <div className="flex justify-between items-center py-2">
        <ChevronLeft size={22} color={TEXT} />
        <div className="font-bold text-base">Settings</div>
        <div className="w-6" />
      </div>
      <div className="flex flex-col gap-2.5 mt-3 overflow-y-auto">
        <div className="text-[10px] font-bold tracking-widest mt-2" style={{ color: TEXT_MUTED }}>PRIVACY</div>
        {[
          { label: 'Show me to nearby players', state: a, set: setA },
          { label: 'Allow DMs from anyone', state: b, set: setB },
          { label: '"Available to match" status', state: c, set: setC },
        ].map(({ label, state, set }) => (
          <div key={label} className="rounded-2xl p-3 flex items-center" style={{ background: SURFACE }}>
            <div className="flex-1 font-medium text-sm">{label}</div>
            <Toggle on={state} onClick={() => set(!state)} />
          </div>
        ))}
        <div className="text-[10px] font-bold tracking-widest mt-2" style={{ color: TEXT_MUTED }}>INTEGRATIONS</div>
        <div className="rounded-2xl p-3 flex items-center" style={{ background: SURFACE }}>
          <div className="flex-1">
            <div className="font-medium text-sm">DUPR sync</div>
            <div className="text-[10px]" style={{ color: TEXT_MUTED }}>Connected as merrick.lee</div>
          </div>
          <span className="text-xs font-bold" style={{ color: LIME }}>✓ ON</span>
        </div>
        <div className="rounded-2xl p-3 flex items-center" style={{ background: SURFACE }}>
          <div className="flex-1">
            <div className="font-medium text-sm">Apple Calendar</div>
            <div className="text-[10px]" style={{ color: TEXT_MUTED }}>Sync match invites</div>
          </div>
          <span className="text-xs font-bold" style={{ color: LIME }}>Connect</span>
        </div>
        <div className="rounded-2xl p-3 flex items-center" style={{ background: SURFACE }}>
          <div className="flex-1">
            <div className="font-medium text-sm">Push notifications</div>
            <div className="text-[10px]" style={{ color: TEXT_MUTED }}>3 of 5 enabled</div>
          </div>
          <ChevronRight size={16} color={TEXT_FAINT} />
        </div>
        <div className="text-[10px] font-bold tracking-widest mt-2" style={{ color: TEXT_MUTED }}>APPEARANCE</div>
        <div className="rounded-2xl p-3 flex items-center" style={{ background: SURFACE }}>
          <div className="flex-1 font-medium text-sm">Theme</div>
          <span className="text-sm font-medium" style={{ color: LIME }}>Dark ▾</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================

export default function PyklrDark() {
  const screens = [
    { id: 'splash', label: '01 · Splash', Component: SplashScreen },
    { id: 'auth', label: '02 · Auth / sign up', Component: AuthScreen },
    { id: 'survey', label: '03 · Player survey', Component: SurveyScreen },
    { id: 'home', label: '04 · Home dashboard', Component: HomeScreen },
    { id: 'map', label: '05 · Discover map', Component: MapScreen },
    { id: 'court', label: '06 · Court detail', Component: CourtDetailScreen },
    { id: 'players', label: '07 · Find players', Component: FindPlayersScreen },
    { id: 'messages', label: '08 · Messages list', Component: MessagesScreen },
    { id: 'chat', label: '09 · Smart chat thread', Component: ChatThreadScreen },
    { id: 'event', label: '10 · Create event', Component: CreateEventScreen },
    { id: 'forum', label: '11 · Community forum', Component: ForumScreen },
    { id: 'profile', label: '12 · Profile', Component: ProfileScreen },
    { id: 'settings', label: '13 · Settings', Component: SettingsScreen },
  ];

  return (
    <div className="min-h-screen p-8" style={{
      background: '#050505',
      fontFamily: 'system-ui, sans-serif',
      backgroundImage: `radial-gradient(circle at 20% 30%, ${LIME}08 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${BLUE}08 0%, transparent 50%)`,
    }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex items-center gap-3 mb-2">
          <PyklrLogo size={48} paddleColor={LIME} triangleColor={BLUE} />
          <div>
            <div style={{
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: 32,
              color: LIME,
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}>PYKLR</div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: 9,
              color: LIME,
              opacity: 0.7,
              letterSpacing: '0.18em',
              fontWeight: 700,
              marginTop: 2,
            }}>MEET PLAYERS. START MATCHES.</div>
          </div>
        </div>
        <h1 className="text-2xl font-bold mt-6" style={{ color: TEXT }}>Dark mode mockup</h1>
        <p className="text-sm mt-1 max-w-2xl" style={{ color: TEXT_MUTED }}>
          13 screens · React Native target · iOS + Android · Brand colors{' '}
          <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: SURFACE, color: LIME }}>#A8E66A</code> lime,{' '}
          <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: SURFACE, color: BLUE_LIGHT }}>#4493CC</code> blue
        </p>
      </div>

      {/* Phones grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 justify-items-center">
        {screens.map(({ id, label, Component }) => (
          <Phone key={id} label={label}>
            <Component />
          </Phone>
        ))}
      </div>

      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t text-xs" style={{ borderColor: BORDER, color: TEXT_FAINT }}>
        PYKLR · Dark Mode Reference · Generated for Antigravity handoff
      </div>
    </div>
  );
}
