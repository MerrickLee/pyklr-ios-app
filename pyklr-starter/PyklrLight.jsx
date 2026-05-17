import React, { useState } from 'react';
import {
  Home, MapPin, MessageCircle, User, Plus, Search, Bell, Heart,
  ChevronLeft, ChevronRight, Settings, Edit3, Send, Eye, X,
  Apple, Chrome, Facebook, Check, MoreVertical, Trophy, Target,
  Flame, Sparkles, Volume2, VolumeX, Calendar, Filter, ArrowUp,
} from 'lucide-react';

// ============================================================
// PYKLR — Light Mode Mockup
// Brand colors: Green #67BF69 · Blue #4493CC
// Inspired by Pickleplay UI Kit aesthetic
// ============================================================

const GREEN = '#67BF69';
const GREEN_DARK = '#4FA547';
const GREEN_LIGHT = '#EAF5E5';
const BLUE = '#4493CC';
const BLUE_LIGHT = '#E4F0F8';

// PYKLR Logo as inline SVG (paddle + ball on blue triangle)
const PyklrLogo = ({ size = 80, monochrome = false }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <polygon points="5,12 5,80 60,46" fill={monochrome ? GREEN : BLUE} opacity={monochrome ? 1 : 0.95} />
    <ellipse cx="48" cy="34" rx="24" ry="28" fill="none" stroke={GREEN} strokeWidth="5" />
    <circle cx="32" cy="34" r="11" fill="none" stroke={GREEN} strokeWidth="4" />
    <circle cx="28" cy="32" r="1.8" fill={GREEN} />
    <circle cx="34" cy="30" r="1.8" fill={GREEN} />
    <circle cx="32" cy="37" r="1.8" fill={GREEN} />
    <rect x="44" y="62" width="5" height="18" fill={GREEN} />
  </svg>
);

const Wordmark = ({ size = 24 }) => (
  <span
    style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontWeight: 900,
      fontStyle: 'italic',
      fontSize: size,
      letterSpacing: '-0.04em',
      color: GREEN_DARK,
    }}
  >
    PYKLR
  </span>
);

// Phone frame wrapper
const Phone = ({ children, label }) => (
  <div className="flex flex-col items-center">
    <div
      className="relative bg-white"
      style={{
        width: 320,
        height: 680,
        borderRadius: 44,
        border: '8px solid #1a1a1a',
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,0.12)',
      }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-black"
           style={{ width: 110, height: 24, borderRadius: '0 0 14px 14px' }} />
      <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <style>{`::-webkit-scrollbar { display: none; }`}</style>
        {children}
      </div>
    </div>
    <div className="mt-3 text-sm font-medium text-stone-600">{label}</div>
  </div>
);

const StatusBar = () => (
  <div className="flex justify-between items-center px-6 pt-3 pb-1 text-[10px] font-semibold text-stone-700">
    <span>9:41</span>
    <span className="tracking-tighter">●●●● ▮▮</span>
  </div>
);

const HeaderLogo = () => (
  <div className="flex items-center gap-1.5 py-2">
    <PyklrLogo size={22} />
    <Wordmark size={16} />
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
      className="absolute bottom-3 left-4 right-4 bg-white flex justify-around items-center"
      style={{
        borderRadius: 28,
        padding: '12px 0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '0.5px solid #f0f0f0',
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
                background: GREEN, marginTop: -18,
                boxShadow: `0 6px 16px ${GREEN}66`,
              }}
            >
              <Icon size={20} color="#0F2A0C" strokeWidth={2.5} />
            </div>
          );
        }
        const isActive = id === active;
        return (
          <Icon
            key={id}
            size={20}
            color={isActive ? GREEN_DARK : '#9ca3af'}
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
  <div className="h-full flex flex-col bg-white">
    <StatusBar />
    <div className="flex-1 flex flex-col items-center justify-center px-8 gap-7">
      <div
        className="flex items-center justify-center"
        style={{
          width: 140, height: 140, background: BLUE,
          borderRadius: 32,
        }}
      >
        <PyklrLogo size={100} />
      </div>
      <div className="text-center">
        <div
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: 44,
            color: GREEN_DARK,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          PYKLR
        </div>
        <div
          className="mt-1.5"
          style={{
            fontFamily: 'monospace',
            fontSize: 9,
            color: BLUE,
            letterSpacing: '0.18em',
            fontWeight: 700,
          }}
        >
          MEET PLAYERS. START MATCHES.
        </div>
      </div>
      <p className="text-center text-stone-600 text-sm leading-relaxed max-w-[80%]">
        Find players. Find courts. Find your game.
      </p>
      <div className="w-full flex flex-col gap-2.5 mt-2">
        <button
          className="w-full py-3.5 rounded-2xl font-semibold text-sm"
          style={{ background: GREEN, color: '#0F2A0C' }}
        >
          Get started
        </button>
        <button className="w-full py-3.5 rounded-2xl font-medium text-sm border border-stone-200 text-stone-800">
          I already have an account
        </button>
      </div>
    </div>
  </div>
);

const AuthScreen = () => (
  <div className="h-full flex flex-col bg-white px-5">
    <StatusBar />
    <HeaderLogo />
    <div className="flex-1 flex flex-col gap-3 pt-2">
      <div>
        <div className="text-2xl font-bold leading-tight">Create your<br />account</div>
        <div className="text-stone-500 text-xs mt-1.5">Join 12,000+ players nearby</div>
      </div>
      {[
        { Icon: Apple, label: 'Continue with Apple' },
        { Icon: Chrome, label: 'Continue with Google' },
        { Icon: Facebook, label: 'Continue with Facebook' },
      ].map(({ Icon, label }) => (
        <button
          key={label}
          className="w-full py-3 rounded-2xl border border-stone-200 flex items-center justify-center gap-2 text-sm font-medium text-stone-800"
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
      <div className="text-center text-stone-400 text-xs">— or —</div>
      <input
        placeholder="Email address"
        className="w-full px-4 py-3 rounded-2xl text-sm"
        style={{ background: '#F4F4F2', border: 'none' }}
      />
      <input
        placeholder="Password (min. 8 characters)"
        type="password"
        className="w-full px-4 py-3 rounded-2xl text-sm"
        style={{ background: '#F4F4F2', border: 'none' }}
      />
      <button
        className="w-full py-3.5 rounded-2xl font-semibold text-sm mt-1"
        style={{ background: GREEN, color: '#0F2A0C' }}
      >
        Sign up
      </button>
      <div className="text-center text-[10px] text-stone-400 mt-1">
        By signing up you agree to Terms & Privacy
      </div>
    </div>
  </div>
);

const SurveyScreen = () => (
  <div className="h-full flex flex-col bg-white px-5">
    <StatusBar />
    <HeaderLogo />
    <div className="flex-1 flex flex-col gap-3">
      <div className="text-xs text-stone-500 mt-1">Step 2 of 4</div>
      <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: '50%', background: GREEN }} />
      </div>
      <div className="text-2xl font-bold leading-tight mt-2">What's<br />your game?</div>
      <div className="text-stone-500 text-xs">Pick all that apply — we'll match you better</div>
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
              background: selected ? GREEN_LIGHT : '#F4F4F2',
              border: selected ? `1.5px solid ${GREEN}` : '1.5px solid transparent',
            }}
          >
            <div className="text-2xl">{emoji}</div>
            <div className="text-sm font-semibold mt-1" style={{ color: selected ? GREEN_DARK : '#1c1917' }}>
              {label}
            </div>
          </div>
        ))}
      </div>
      <div className="text-stone-600 text-xs font-medium mt-3">When do you play?</div>
      <div className="flex flex-wrap gap-1.5">
        {['Mornings', 'Afternoons', 'Evenings', 'Weekends'].map((t) => {
          const on = ['Mornings', 'Evenings', 'Weekends'].includes(t);
          return (
            <span
              key={t}
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{
                background: on ? GREEN : '#F4F4F2',
                color: on ? '#0F2A0C' : '#525252',
              }}
            >
              {t}
            </span>
          );
        })}
      </div>
      <div className="text-stone-600 text-xs font-medium mt-2">DUPR rating (if known)</div>
      <input
        placeholder="3.5"
        defaultValue="3.5"
        className="w-full px-4 py-3 rounded-2xl text-sm"
        style={{ background: '#F4F4F2', border: 'none' }}
      />
      <button
        className="w-full py-3.5 rounded-2xl font-semibold text-sm mt-auto mb-2"
        style={{ background: GREEN, color: '#0F2A0C' }}
      >
        Continue
      </button>
    </div>
  </div>
);

const HomeScreen = () => (
  <div className="h-full flex flex-col bg-white px-5 pb-24">
    <StatusBar />
    <div className="flex justify-between items-center py-2">
      <div>
        <div className="text-xs text-stone-500">Welcome back,</div>
        <div className="text-lg font-bold">Merrick 👋</div>
      </div>
      <div className="flex items-center gap-3">
        <Bell size={20} className="text-stone-600" />
        <div
          className="w-9 h-9 rounded-full"
          style={{ background: `linear-gradient(135deg, ${GREEN}, ${BLUE})` }}
        />
      </div>
    </div>
    <div className="relative">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
      <input
        placeholder="Search courts, players, events"
        className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm"
        style={{ background: '#F4F4F2', border: 'none' }}
      />
    </div>

    {/* Featured event card */}
    <div
      className="rounded-3xl p-5 mt-4 relative overflow-hidden"
      style={{ background: BLUE }}
    >
      <div className="text-[10px] font-bold text-white/80 tracking-widest">TODAY · 6:00 PM</div>
      <div className="text-base font-bold text-white mt-1">Open play @ Flowers Park</div>
      <div className="text-xs text-white/80 mt-0.5">3 players in · 3.0–3.5 · 0.8 mi</div>
      <button
        className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold"
        style={{ background: GREEN, color: '#0F2A0C' }}
      >
        Join game →
      </button>
      <div className="absolute -right-4 -bottom-4 opacity-20">
        <PyklrLogo size={100} monochrome />
      </div>
    </div>

    <div className="text-sm font-bold mt-4">Quick actions</div>
    <div className="grid grid-cols-2 gap-2.5 mt-2">
      <div className="rounded-2xl p-4" style={{ background: GREEN_LIGHT }}>
        <div className="text-2xl">👥</div>
        <div className="font-semibold text-sm mt-1.5" style={{ color: GREEN_DARK }}>Find players</div>
        <div className="text-[10px]" style={{ color: GREEN_DARK, opacity: 0.7 }}>8 online nearby</div>
      </div>
      <div className="rounded-2xl p-4" style={{ background: BLUE_LIGHT }}>
        <div className="text-2xl">📍</div>
        <div className="font-semibold text-sm mt-1.5" style={{ color: '#1A4D75' }}>Find courts</div>
        <div className="text-[10px]" style={{ color: '#1A4D75', opacity: 0.7 }}>12 within 5 mi</div>
      </div>
    </div>

    <div className="flex justify-between items-center mt-4">
      <div className="text-sm font-bold">Popular near you</div>
      <div className="text-xs font-medium" style={{ color: GREEN_DARK }}>See all →</div>
    </div>
    <div className="rounded-2xl p-3 mt-2 border border-stone-100">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-sm">Flowers Park</div>
          <div className="text-xs text-stone-500">4 courts · Free · 0.8 mi · ⭐ 4.6</div>
        </div>
        <span
          className="text-[10px] px-3 py-1 rounded-full font-semibold"
          style={{ background: GREEN, color: '#0F2A0C' }}
        >
          Open
        </span>
      </div>
    </div>
    <div className="rounded-2xl p-3 mt-2 border border-stone-100">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-sm">New Roc Pickleball</div>
          <div className="text-xs text-stone-500">6 indoor · $8/hr · 1.2 mi · ⭐ 4.8</div>
        </div>
        <span className="text-[10px] px-3 py-1 rounded-full font-medium text-stone-600 bg-stone-100">
          $8/hr
        </span>
      </div>
    </div>

    <TabBar active="home" />
  </div>
);

const MapScreen = () => (
  <div className="h-full flex flex-col bg-white px-5 pb-24">
    <StatusBar />
    <div className="flex justify-between items-center py-2">
      <div>
        <div className="text-base font-bold">Find courts</div>
        <div className="text-xs text-stone-500">12 within 5 miles</div>
      </div>
      <Filter size={20} className="text-stone-700" />
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
            background: on ? GREEN : '#F4F4F2',
            color: on ? '#0F2A0C' : '#525252',
          }}
        >
          {l}
        </span>
      ))}
    </div>

    {/* Map */}
    <div className="flex-1 rounded-3xl mt-3 relative overflow-hidden min-h-[280px]"
         style={{ background: '#EBF0E8' }}>
      {/* Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(90deg, transparent 95%, rgba(0,0,0,0.04) 95%), linear-gradient(0deg, transparent 95%, rgba(0,0,0,0.04) 95%)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Roads */}
      <div className="absolute top-[40%] left-0 right-0 h-[3px] bg-white/60" />
      <div className="absolute top-0 bottom-0 left-[45%] w-[3px] bg-white/60" />
      <div className="absolute top-[70%] left-0 right-[20%] h-[2px] bg-white/40" />

      {/* Pins */}
      <div className="absolute top-[28%] left-[18%] flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold shadow-md"
           style={{ background: 'white', border: `1.5px solid ${GREEN}`, color: '#0F2A0C' }}>
        Free · 0.8 mi
      </div>
      <div className="absolute top-[52%] left-[48%] flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold shadow-lg"
           style={{ background: GREEN, color: '#0F2A0C', border: `1.5px solid #0F2A0C` }}>
        ⭐ Flowers · 0.8mi
      </div>
      <div className="absolute top-[68%] left-[28%] flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold shadow-md"
           style={{ background: 'white', border: `1.5px solid ${GREEN}`, color: '#0F2A0C' }}>
        $8/hr · 1.2 mi
      </div>
      <div className="absolute top-[22%] left-[62%] flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold shadow-md"
           style={{ background: 'white', border: `1.5px solid ${GREEN}`, color: '#0F2A0C' }}>
        Free · 2.4 mi
      </div>

      {/* User location */}
      <div
        className="absolute top-[45%] left-[42%] w-4 h-4 rounded-full"
        style={{ background: BLUE, border: '3px solid white', boxShadow: `0 0 0 8px ${BLUE}33` }}
      />
    </div>

    {/* Selected card */}
    <div className="rounded-2xl p-3 mt-3 border border-stone-100 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-sm">Flowers Park Courts</div>
          <div className="text-xs text-stone-500">4 outdoor · Free · 0.8 mi</div>
          <div className="flex gap-1.5 mt-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">💡 Lights</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">🚻 Restroom</span>
          </div>
        </div>
        <button
          className="px-3 py-2 rounded-xl text-xs font-semibold"
          style={{ background: GREEN, color: '#0F2A0C' }}
        >
          Directions
        </button>
      </div>
    </div>
    <TabBar active="map" />
  </div>
);

const CourtDetailScreen = () => (
  <div className="h-full flex flex-col bg-white px-5 pb-24">
    <StatusBar />
    <div className="flex justify-between items-center py-2">
      <ChevronLeft size={22} />
      <Heart size={20} className="text-stone-600" />
    </div>
    {/* Photo */}
    <div
      className="rounded-3xl aspect-[1.6] relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${GREEN}, ${BLUE})` }}
    >
      <div className="absolute bottom-3 left-3 right-3 flex gap-1.5">
        <div className="w-7 h-1 rounded-full bg-white" />
        <div className="w-7 h-1 rounded-full bg-white/40" />
        <div className="w-7 h-1 rounded-full bg-white/40" />
        <div className="w-7 h-1 rounded-full bg-white/40" />
      </div>
    </div>
    <div className="font-bold text-lg mt-3">Flowers Park Courts</div>
    <div className="text-xs text-stone-500 mt-0.5">📍 0.8 mi · ⭐ 4.6 (47) · Free</div>
    <div className="flex flex-wrap gap-1.5 mt-2">
      {['4 outdoor', '💡 Lights', '🚻 Restroom', '🅿️ Parking'].map((t) => (
        <span key={t} className="text-[11px] px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-medium">
          {t}
        </span>
      ))}
    </div>
    <div className="text-sm font-bold mt-4">Open play happening</div>
    <div className="rounded-2xl p-3 mt-2 border border-stone-100">
      <div className="flex items-center gap-2.5">
        <div className="flex">
          {[GREEN, BLUE, '#9C7BC4'].map((c, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full border-2 border-white"
              style={{ background: `linear-gradient(135deg, ${c}, ${BLUE})`, marginLeft: i === 0 ? 0 : -8 }}
            />
          ))}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-xs">Wednesday social</div>
          <div className="text-[10px] text-stone-500">3 in · needs 1 more · 3.0–3.5</div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2.5 mt-auto mb-2">
      <button className="py-3 rounded-2xl border border-stone-200 text-sm font-medium">
        Directions
      </button>
      <button
        className="py-3 rounded-2xl text-sm font-semibold"
        style={{ background: GREEN, color: '#0F2A0C' }}
      >
        Join game
      </button>
    </div>
    <TabBar active="map" />
  </div>
);

const FindPlayersScreen = () => {
  const players = [
    { name: 'Sarah K.', rating: 'DUPR 3.85', verified: true, dist: '1.2 mi', tag: 'Verified',
      grad: [GREEN, BLUE] },
    { name: 'Marcus T.', rating: '3.5 self', verified: false, dist: '2.4 mi', tag: 'Mornings',
      grad: [BLUE, GREEN] },
    { name: 'Priya L.', rating: 'DUPR 4.12', verified: true, dist: '0.6 mi', tag: 'Verified',
      grad: ['#A8E66A', BLUE] },
    { name: 'Devon R.', rating: '3.0 self', verified: false, dist: '3.1 mi', tag: 'Weekends',
      grad: [BLUE, '#A8E66A'] },
  ];
  return (
    <div className="h-full flex flex-col bg-white px-5 pb-24">
      <StatusBar />
      <div className="py-2">
        <div className="text-lg font-bold">Find players</div>
        <div className="text-xs text-stone-500">8 nearby · matched to your style</div>
      </div>
      <div className="flex gap-1.5 mt-1">
        <span className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: GREEN, color: '#0F2A0C' }}>Nearby</span>
        <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-stone-100 text-stone-600">3.0–4.0</span>
        <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-stone-100 text-stone-600">Verified</span>
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
                style={{ background: p.verified ? GREEN : 'rgba(255,255,255,0.95)', color: '#0F2A0C' }}
              >
                {p.rating}
              </div>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.55))' }} />
              <div className="absolute bottom-7 left-2.5 text-[9px] text-white/90">{p.dist} · {p.tag}</div>
              <div className="absolute bottom-2 left-2.5 text-xs font-bold text-white">{p.name}</div>
            </div>
            <button
              className="w-full py-2 mt-1.5 rounded-xl text-xs font-semibold"
              style={p.verified ? { background: GREEN, color: '#0F2A0C' } : { background: 'transparent', border: '1px solid #e5e5e5', color: '#1c1917' }}
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
  <div className="h-full flex flex-col bg-white px-5 pb-24">
    <StatusBar />
    <div className="flex justify-between items-center py-2">
      <div className="text-lg font-bold">Messages</div>
      <Edit3 size={20} className="text-stone-600" />
    </div>
    <div className="relative mt-1">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
      <input
        placeholder="Search messages"
        className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm"
        style={{ background: '#F4F4F2', border: 'none' }}
      />
    </div>
    <div className="flex gap-1.5 mt-3">
      <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: GREEN, color: '#0F2A0C' }}>My groups</span>
      <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-stone-100 text-stone-600">DMs</span>
      <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-stone-100 text-stone-600">Requests</span>
    </div>
    <div className="flex flex-col gap-2 mt-3">
      <div className="rounded-2xl p-3" style={{ background: BLUE_LIGHT }}>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs"
               style={{ background: BLUE }}>NR</div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-sm">New Roc Open Play</div>
              <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold" style={{ background: BLUE }}>3</span>
            </div>
            <div className="text-xs text-stone-600">Sarah: anyone for 7pm? 🎾</div>
          </div>
        </div>
      </div>
      {[
        { initials: 'WL', name: 'Westchester 4.0+ ladder', sub: '12 members · 2 muted by you', bg: GREEN },
        { initials: 'SB', name: 'Sunday brunch & pickle', sub: '8 members · all caught up', bg: '#9C9C9C' },
      ].map((g) => (
        <div key={g.initials} className="rounded-2xl p-3 border border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs"
                 style={{ background: g.bg, color: g.bg === GREEN ? '#0F2A0C' : 'white' }}>{g.initials}</div>
            <div>
              <div className="font-semibold text-sm">{g.name}</div>
              <div className="text-xs text-stone-500">{g.sub}</div>
            </div>
          </div>
        </div>
      ))}
      <div className="rounded-2xl p-3 border border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full"
               style={{ background: `linear-gradient(135deg, ${GREEN}, ${BLUE})` }} />
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-sm">Marcus T.</div>
              <span className="text-[10px] text-stone-400">2m</span>
            </div>
            <div className="text-xs text-stone-500">good game today 🎾</div>
          </div>
        </div>
      </div>
    </div>
    <TabBar active="chat" />
  </div>
);

const ChatThreadScreen = () => (
  <div className="h-full flex flex-col bg-white">
    <StatusBar />
    {/* Header */}
    <div className="flex items-center gap-2.5 px-5 py-2 border-b border-stone-100">
      <ChevronLeft size={20} />
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs"
           style={{ background: BLUE }}>NR</div>
      <div className="flex-1">
        <div className="font-bold text-sm">New Roc Open Play</div>
        <div className="text-[10px] text-stone-500 flex items-center gap-1">
          14 members · <VolumeX size={9} /> 2 muted
        </div>
      </div>
      <MoreVertical size={18} className="text-stone-600" />
    </div>
    {/* Messages */}
    <div className="flex-1 px-4 py-3 flex flex-col gap-2.5 overflow-y-auto">
      <div className="text-center text-[10px] text-stone-400">Today</div>
      {/* Sarah */}
      <div className="flex gap-2 items-start">
        <div className="w-7 h-7 rounded-full flex-shrink-0"
             style={{ background: `linear-gradient(135deg, ${GREEN}, ${BLUE})` }} />
        <div>
          <div className="text-[10px] text-stone-500 mb-0.5">Sarah K. · 9:32am</div>
          <div className="bg-stone-100 px-3 py-2 rounded-2xl rounded-bl-md text-xs max-w-[220px]">
            anyone for 7pm at flowers park? 🎾
          </div>
        </div>
      </div>
      {/* Muted message */}
      <div className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2 opacity-60">
        <VolumeX size={12} className="text-stone-400 flex-shrink-0" />
        <div className="text-[10px] text-stone-500 italic flex-1">Big Mike sent a message — muted</div>
        <Eye size={12} className="text-stone-400" />
      </div>
      {/* Devon */}
      <div className="flex gap-2 items-start">
        <div className="w-7 h-7 rounded-full flex-shrink-0"
             style={{ background: `linear-gradient(135deg, ${BLUE}, ${GREEN})` }} />
        <div>
          <div className="text-[10px] text-stone-500 mb-0.5">Devon R. · 9:36am</div>
          <div className="bg-stone-100 px-3 py-2 rounded-2xl rounded-bl-md text-xs max-w-[220px]">
            I'm in 👍 bring extra balls?
          </div>
        </div>
      </div>
      {/* Smart suggestion */}
      <div
        className="rounded-2xl p-3 my-1"
        style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})` }}
      >
        <div className="flex items-center gap-1 text-[9px] font-bold text-white/90 tracking-widest">
          <Sparkles size={10} /> SMART SUGGESTION
        </div>
        <div className="text-white font-bold text-sm mt-0.5">
          Create event "7pm @ Flowers Park"
        </div>
        <div className="text-white/85 text-[11px] mt-0.5">3 likely RSVPs · tap to schedule</div>
      </div>
      {/* Your reply */}
      <div className="flex justify-end">
        <div
          className="px-3 py-2 rounded-2xl rounded-br-md text-xs font-medium max-w-[220px]"
          style={{ background: GREEN, color: '#0F2A0C' }}
        >
          I'm in 🙌 +1 friend
        </div>
      </div>
    </div>
    {/* Input */}
    <div className="px-4 pb-4 pt-2 flex items-center gap-2 border-t border-stone-100">
      <input
        placeholder="Message…"
        className="flex-1 px-4 py-2.5 rounded-2xl text-sm"
        style={{ background: '#F4F4F2', border: 'none' }}
      />
      <button
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: GREEN }}
      >
        <Send size={16} color="#0F2A0C" />
      </button>
    </div>
  </div>
);

const CreateEventScreen = () => (
  <div className="h-full flex flex-col bg-white px-5">
    <StatusBar />
    <div className="flex justify-between items-center py-2">
      <X size={22} />
      <div className="font-bold text-sm">New event</div>
      <div className="w-6" />
    </div>
    <div className="text-xs text-stone-500 mt-1">Step 2 of 5 · Details</div>
    <div className="h-1 bg-stone-100 rounded-full overflow-hidden mt-1">
      <div className="h-full rounded-full" style={{ width: '40%', background: GREEN }} />
    </div>
    <div className="flex flex-col gap-3 mt-4">
      <div>
        <label className="text-xs text-stone-600 font-medium">Event name</label>
        <input
          defaultValue="Saturday morning doubles"
          className="w-full px-4 py-3 rounded-2xl text-sm mt-1"
          style={{ background: '#F4F4F2', border: 'none' }}
        />
      </div>
      <div>
        <label className="text-xs text-stone-600 font-medium">Format</label>
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
                background: on ? GREEN : '#F4F4F2',
                color: on ? '#0F2A0C' : '#525252',
              }}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-stone-600 font-medium">Court</label>
        <div
          className="w-full px-4 py-3 rounded-2xl text-sm mt-1 flex items-center gap-2"
          style={{ background: '#F4F4F2' }}
        >
          <MapPin size={14} style={{ color: GREEN_DARK }} />
          <span>Flowers Park · 0.8 mi</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-xs text-stone-600 font-medium">Skill range</label>
          <input
            defaultValue="3.0 – 3.5"
            className="w-full px-4 py-3 rounded-2xl text-sm mt-1"
            style={{ background: '#F4F4F2', border: 'none' }}
          />
        </div>
        <div>
          <label className="text-xs text-stone-600 font-medium">Max players</label>
          <input
            defaultValue="8"
            className="w-full px-4 py-3 rounded-2xl text-sm mt-1"
            style={{ background: '#F4F4F2', border: 'none' }}
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-stone-600 font-medium">Date & time</label>
        <div
          className="w-full px-4 py-3 rounded-2xl text-sm mt-1 flex items-center gap-2"
          style={{ background: '#F4F4F2' }}
        >
          <Calendar size={14} style={{ color: GREEN_DARK }} />
          <span>Sat, Apr 12 · 9:00 AM</span>
        </div>
      </div>
    </div>
    <button
      className="w-full py-3.5 rounded-2xl font-semibold text-sm mt-auto mb-4"
      style={{ background: GREEN, color: '#0F2A0C' }}
    >
      Continue → Schedule
    </button>
  </div>
);

const ForumScreen = () => (
  <div className="h-full flex flex-col bg-white px-5 pb-24">
    <StatusBar />
    <div className="flex justify-between items-center py-2">
      <div className="text-lg font-bold">Community</div>
      <Search size={20} className="text-stone-700" />
    </div>
    <div className="flex gap-1.5 mt-1 flex-wrap">
      {[
        { l: 'All', on: true },
        { l: 'Gear', on: false },
        { l: 'Strategy', on: false },
        { l: 'Courts', on: false },
      ].map(({ l, on }) => (
        <span
          key={l}
          className="text-xs px-3 py-1.5 rounded-full font-medium"
          style={{ background: on ? GREEN : '#F4F4F2', color: on ? '#0F2A0C' : '#525252' }}
        >
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
        <div key={i} className="rounded-2xl p-3 border border-stone-100">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full"
                 style={{ background: `linear-gradient(135deg, ${GREEN}, ${BLUE})` }} />
            <div className="text-[10px] text-stone-500">u/{p.user} · {p.time}</div>
            <span
              className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: GREEN_LIGHT, color: GREEN_DARK }}
            >
              {p.tag}
            </span>
          </div>
          <div className="font-semibold text-sm">{p.title}</div>
          {p.preview && <div className="text-xs text-stone-500 mt-1">{p.preview}</div>}
          <div className="flex gap-4 mt-2 text-xs text-stone-500">
            <span className="flex items-center gap-1" style={p.hot ? { color: GREEN_DARK, fontWeight: 600 } : {}}>
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
  <div className="h-full flex flex-col bg-white px-5 pb-24">
    <StatusBar />
    <div className="flex justify-between items-center py-2">
      <ChevronLeft size={22} />
      <Settings size={20} className="text-stone-700" />
    </div>
    <div className="flex flex-col items-center gap-1.5 mt-3">
      <div
        className="w-20 h-20 rounded-full"
        style={{ background: `linear-gradient(135deg, ${GREEN}, ${BLUE})`, border: `3px solid ${GREEN}` }}
      />
      <div className="font-bold text-base mt-1 flex items-center gap-1.5">
        Merrick Lee <Check size={14} style={{ color: GREEN_DARK }} />
      </div>
      <div className="text-xs text-stone-500">DUPR 3.85 · New Rochelle, NY</div>
      <div className="flex gap-1.5 mt-1">
        {['Competitive', 'Evenings', 'Drills'].map((t) => (
          <span key={t} className="text-[10px] px-2 py-1 rounded-full font-medium"
                style={{ background: GREEN_LIGHT, color: GREEN_DARK }}>
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
        <div key={s.l} className="rounded-2xl p-3 text-center" style={{ background: '#F4F4F2' }}>
          <div className="text-xl font-bold">{s.v}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">{s.l}</div>
        </div>
      ))}
    </div>
    <div className="text-sm font-bold mt-4">Achievements</div>
    <div className="flex gap-2 mt-2">
      {[
        { icon: Trophy, bg: '#FAEEDA', color: '#854F0B' },
        { icon: Target, bg: BLUE_LIGHT, color: '#1A4D75' },
        { icon: Flame, bg: GREEN_LIGHT, color: GREEN_DARK },
      ].map(({ icon: Icon, bg, color }, i) => (
        <div key={i} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: bg }}>
          <Icon size={18} color={color} />
        </div>
      ))}
      <div className="w-11 h-11 rounded-full flex items-center justify-center bg-stone-100 opacity-50">
        <div className="text-base">🔒</div>
      </div>
    </div>
    <div className="text-sm font-bold mt-4">Recent activity</div>
    <div className="rounded-2xl p-3 mt-2 border border-stone-100">
      <div className="font-medium text-sm flex items-center gap-1.5">
        <Trophy size={14} style={{ color: '#854F0B' }} /> Won doubles @ Flowers Park
      </div>
      <div className="text-xs text-stone-500 mt-0.5">2 days ago · partner Priya L.</div>
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
      style={{ background: on ? GREEN : '#E5E5E5' }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
        style={{ left: on ? 18 : 2 }}
      />
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white px-5">
      <StatusBar />
      <div className="flex justify-between items-center py-2">
        <ChevronLeft size={22} />
        <div className="font-bold text-base">Settings</div>
        <div className="w-6" />
      </div>
      <div className="flex flex-col gap-2.5 mt-3 overflow-y-auto">
        <div className="text-[10px] font-bold text-stone-500 tracking-widest mt-2">PRIVACY</div>
        {[
          { label: 'Show me to nearby players', state: a, set: setA },
          { label: 'Allow DMs from anyone', state: b, set: setB },
          { label: '"Available to match" status', state: c, set: setC },
        ].map(({ label, state, set }) => (
          <div key={label} className="rounded-2xl p-3 border border-stone-100 flex items-center">
            <div className="flex-1 font-medium text-sm">{label}</div>
            <Toggle on={state} onClick={() => set(!state)} />
          </div>
        ))}
        <div className="text-[10px] font-bold text-stone-500 tracking-widest mt-2">INTEGRATIONS</div>
        <div className="rounded-2xl p-3 border border-stone-100 flex items-center">
          <div className="flex-1">
            <div className="font-medium text-sm">DUPR sync</div>
            <div className="text-[10px] text-stone-500">Connected as merrick.lee</div>
          </div>
          <span className="text-xs font-bold" style={{ color: GREEN_DARK }}>✓ ON</span>
        </div>
        <div className="rounded-2xl p-3 border border-stone-100 flex items-center">
          <div className="flex-1">
            <div className="font-medium text-sm">Apple Calendar</div>
            <div className="text-[10px] text-stone-500">Sync match invites</div>
          </div>
          <span className="text-xs font-bold" style={{ color: GREEN_DARK }}>Connect</span>
        </div>
        <div className="rounded-2xl p-3 border border-stone-100 flex items-center">
          <div className="flex-1">
            <div className="font-medium text-sm">Push notifications</div>
            <div className="text-[10px] text-stone-500">3 of 5 enabled</div>
          </div>
          <ChevronRight size={16} className="text-stone-400" />
        </div>
        <div className="text-[10px] font-bold text-stone-500 tracking-widest mt-2">APPEARANCE</div>
        <div className="rounded-2xl p-3 border border-stone-100 flex items-center">
          <div className="flex-1 font-medium text-sm">Theme</div>
          <span className="text-sm font-medium" style={{ color: GREEN_DARK }}>Light ▾</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================

export default function PyklrLight() {
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
    <div className="min-h-screen p-8" style={{ background: '#FAFAF7', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex items-center gap-3 mb-2">
          <PyklrLogo size={48} />
          <div>
            <div style={{
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: 32,
              color: GREEN_DARK,
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}>PYKLR</div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: 9,
              color: BLUE,
              letterSpacing: '0.18em',
              fontWeight: 700,
              marginTop: 2,
            }}>MEET PLAYERS. START MATCHES.</div>
          </div>
        </div>
        <h1 className="text-2xl font-bold mt-6 text-stone-900">Light mode mockup</h1>
        <p className="text-sm text-stone-600 mt-1 max-w-2xl">
          13 screens · React Native target · iOS + Android · Brand colors{' '}
          <code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded">#67BF69</code> green,{' '}
          <code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded">#4493CC</code> blue
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

      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-stone-200 text-xs text-stone-500">
        PYKLR · Light Mode Reference · Generated for Antigravity handoff
      </div>
    </div>
  );
}
