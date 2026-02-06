/**
 * FAIL FRENZY - Premium Landing Page
 * Immersive game-first experience, mobile-first responsive
 */

import { useState, useEffect } from 'react';
import { Link } from 'wouter';

export default function Home() {
  const [glitchActive, setGlitchActive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [highScore] = useState(() => {
    try {
      const data = localStorage.getItem('failfrenzy_highscores');
      if (data) {
        const parsed = JSON.parse(data);
        return Math.max(0, ...Object.values(parsed).map(Number));
      }
    } catch {}
    return 0;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white overflow-hidden" onMouseMove={handleMouseMove}>
      
      {/* === HERO SECTION === */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        
        {/* Animated neon grid background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(0,240,255,0.06) 1px, transparent 1px),
              linear-gradient(0deg, rgba(0,240,255,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: `perspective(500px) rotateX(${20 + mousePos.y * 5}deg)`,
            transformOrigin: 'center 120%',
          }} />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e27] via-transparent to-[#0a0e27]/80" />
          {/* City background */}
          <div className="absolute bottom-0 left-0 right-0 h-[40vh] opacity-30"
            style={{
              backgroundImage: 'url(/images/game-bg-neon-city.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center bottom',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
            }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: ['#00f0ff', '#ff00ff', '#ffff00', '#00ff88'][i % 4],
                boxShadow: `0 0 ${6 + Math.random() * 10}px currentColor`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          
          {/* Logo */}
          <div className="mb-6 sm:mb-8">
            <img 
              src="/images/logo-main.png" 
              alt="Fail Frenzy" 
              className="w-48 sm:w-64 md:w-80 mx-auto drop-shadow-[0_0_40px_rgba(0,240,255,0.4)]"
              style={{
                filter: glitchActive ? 'hue-rotate(90deg) brightness(1.5)' : 'none',
                transition: 'filter 0.1s',
              }}
            />
          </div>

          {/* Tagline */}
          <p className="text-lg sm:text-xl md:text-2xl font-bold mb-2 tracking-wide"
            style={{
              background: 'linear-gradient(90deg, #00f0ff, #ff00ff, #ffff00)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 4s linear infinite',
            }}>
            WHERE FAILURE IS THE MAIN REWARD
          </p>
          <p className="text-gray-500 text-xs sm:text-sm font-mono mb-8 sm:mb-10">
            Dodge. Fail. Repeat. Compete.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 sm:mb-14">
            <Link href="/game">
              <button className="group relative w-64 sm:w-auto px-10 py-4 sm:py-5 text-lg sm:text-xl font-black rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #00f0ff 0%, #0080ff 50%, #ff00ff 100%)',
                  boxShadow: '0 0 30px rgba(0,240,255,0.4), 0 0 60px rgba(255,0,255,0.2)',
                }}>
                <span className="relative z-10 flex items-center justify-center gap-3 text-black">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  PLAY NOW
                </span>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#00f0ff]" style={{ textShadow: '0 0 20px rgba(0,240,255,0.6)' }}>
                60
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 font-mono tracking-wider mt-1">FPS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#ff00ff]" style={{ textShadow: '0 0 20px rgba(255,0,255,0.6)' }}>
                4
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 font-mono tracking-wider mt-1">MODES</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#ffff00]" style={{ textShadow: '0 0 20px rgba(255,255,0,0.6)' }}>
                {highScore > 0 ? highScore : '---'}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 font-mono tracking-wider mt-1">BEST</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
          </svg>
        </div>
      </section>

      {/* === GAME PREVIEW SECTION === */}
      <section className="relative py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            <span style={{ color: '#00f0ff', textShadow: '0 0 30px rgba(0,240,255,0.5)' }}>NEON</span>
            <span className="text-white mx-2">GLITCH</span>
            <span style={{ color: '#ff00ff', textShadow: '0 0 30px rgba(255,0,255,0.5)' }}>ENGINE</span>
          </h2>
          <p className="text-center text-gray-500 text-sm sm:text-base mb-12 max-w-xl mx-auto">
            A brutally fast arcade experience powered by a custom neon rendering engine with real-time particle effects and procedural audio.
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: 'NEON RENDERER',
                desc: 'Custom canvas engine with dynamic glow, chromatic aberration, scanlines and shockwave effects at 60 FPS.',
                color: '#00f0ff',
                icon: 'M13 10V3L4 14h7v7l9-11h-7z',
              },
              {
                title: 'PROCEDURAL AUDIO',
                desc: 'Real-time synthwave soundtrack generated via Web Audio API. No loading, no buffering, pure vibes.',
                color: '#ff00ff',
                icon: 'M9 18V5l12-2v13M9 18c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zM21 16c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z',
              },
              {
                title: 'COMBO SYSTEM',
                desc: '7 combo tiers from Good to Godlike. Near-miss detection rewards precision with massive score multipliers.',
                color: '#ffff00',
                icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
              },
              {
                title: 'POWER-UPS',
                desc: 'Shield, SlowMo, Magnet, Multiplier, Bomb and more. Each with unique visual effects and strategic value.',
                color: '#00ff88',
                icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
              },
              {
                title: 'ADAPTIVE DIFFICULTY',
                desc: 'AI-driven difficulty that keeps you in the flow state. From Easy to Nightmare, the game adapts to YOU.',
                color: '#ff6600',
                icon: 'M2 20h20L12 4 2 20zm11-3h-2v-2h2v2zm0-4h-2V9h2v4z',
              },
              {
                title: 'PARTICLE SYSTEM',
                desc: 'Up to 1000 simultaneous particles. Explosions, trails, sparkles and confetti for every action.',
                color: '#ff2d7b',
                icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative p-5 sm:p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${feature.color}08 0%, ${feature.color}03 100%)`,
                  borderColor: `${feature.color}30`,
                  boxShadow: `inset 0 0 30px ${feature.color}05`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${feature.color}80`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${feature.color}20, inset 0 0 30px ${feature.color}10`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${feature.color}30`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 0 30px ${feature.color}05`;
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={feature.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base tracking-wider" style={{ color: feature.color }}>
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === GAME MODES SECTION === */}
      <section className="relative py-16 sm:py-24 px-4" style={{ background: 'linear-gradient(180deg, transparent 0%, #0d1230 50%, transparent 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            <span className="text-white">CHOOSE YOUR</span>
            <span className="ml-3" style={{ color: '#ff00ff', textShadow: '0 0 30px rgba(255,0,255,0.5)' }}>CHALLENGE</span>
          </h2>
          <p className="text-center text-gray-500 text-sm sm:text-base mb-12 max-w-xl mx-auto">
            Four distinct game modes, each designed to test a different aspect of your reflexes and strategy.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              { name: 'CLASSIC', desc: '3 lives. Progressive difficulty. How far can you go before the neon consumes you?', color: '#00f0ff', tag: 'MOST POPULAR' },
              { name: 'TIME TRIAL', desc: '60 seconds on the clock. Every millisecond counts. Pure speed, pure pressure.', color: '#00ff88', tag: '60 SECONDS' },
              { name: 'INFINITE', desc: 'No game over. No limits. Just you, the obstacles, and an ever-growing score.', color: '#ff00ff', tag: 'ENDLESS' },
              { name: 'SEEDS', desc: 'Reproducible challenges. Share your seed code and compete on the exact same run.', color: '#ffff00', tag: 'COMPETITIVE' },
            ].map((mode) => (
              <Link key={mode.name} href="/game">
                <div
                  className="group relative p-6 sm:p-8 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${mode.color}08 0%, #0a0e27 100%)`,
                    borderColor: `${mode.color}30`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${mode.color}80`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${mode.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${mode.color}30`;
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl sm:text-2xl font-black tracking-wider" style={{ color: mode.color }}>
                      {mode.name}
                    </h3>
                    <span className="text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-full tracking-wider"
                      style={{ background: `${mode.color}15`, color: mode.color, border: `1px solid ${mode.color}30` }}>
                      {mode.tag}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
                    {mode.desc}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: mode.color }}>
                    <span>PLAY NOW</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === ASSETS SHOWCASE === */}
      <section className="relative py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-black mb-12 tracking-tight">
            <span style={{ color: '#ffff00', textShadow: '0 0 30px rgba(255,255,0,0.5)' }}>PREMIUM</span>
            <span className="text-white ml-3">ASSETS</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Player character */}
            <div className="rounded-xl border border-[#00f0ff30] p-6 text-center" style={{ background: 'linear-gradient(135deg, #00f0ff08 0%, #0a0e27 100%)' }}>
              <img src="/images/player-character.png" alt="Player" className="w-32 sm:w-40 mx-auto mb-4 drop-shadow-[0_0_30px_rgba(0,240,255,0.5)]" />
              <h3 className="font-bold text-[#00f0ff] tracking-wider mb-1">PLAYER CHARACTER</h3>
              <p className="text-gray-500 text-xs">Neon diamond with energy shield and particle trail</p>
            </div>

            {/* Obstacles */}
            <div className="rounded-xl border border-[#ff00ff30] p-6 text-center" style={{ background: 'linear-gradient(135deg, #ff00ff08 0%, #0a0e27 100%)' }}>
              <img src="/images/obstacles-sheet.png" alt="Obstacles" className="w-full max-w-xs mx-auto mb-4 drop-shadow-[0_0_20px_rgba(255,0,255,0.3)]" />
              <h3 className="font-bold text-[#ff00ff] tracking-wider mb-1">OBSTACLE TYPES</h3>
              <p className="text-gray-500 text-xs">Barriers, saw blades, electric fences and laser grids</p>
            </div>

            {/* Power-ups */}
            <div className="rounded-xl border border-[#ffff0030] p-6 text-center" style={{ background: 'linear-gradient(135deg, #ffff0008 0%, #0a0e27 100%)' }}>
              <img src="/images/powerups-sheet.png" alt="Power-ups" className="w-full max-w-xs mx-auto mb-4 drop-shadow-[0_0_20px_rgba(255,255,0,0.3)]" />
              <h3 className="font-bold text-[#ffff00] tracking-wider mb-1">POWER-UPS</h3>
              <p className="text-gray-500 text-xs">Shield, SlowMo, Speed Boost, Magnet and Bomb</p>
            </div>

            {/* Game Over */}
            <div className="rounded-xl border border-[#ff2d7b30] p-6 text-center" style={{ background: 'linear-gradient(135deg, #ff2d7b08 0%, #0a0e27 100%)' }}>
              <img src="/images/game-over-screen.png" alt="Game Over" className="w-full max-w-xs mx-auto mb-4 drop-shadow-[0_0_20px_rgba(255,45,123,0.3)]" />
              <h3 className="font-bold text-[#ff2d7b] tracking-wider mb-1">GAME OVER</h3>
              <p className="text-gray-500 text-xs">Glitch shatter effect with score breakdown</p>
            </div>
          </div>
        </div>
      </section>

      {/* === FINAL CTA === */}
      <section className="relative py-20 sm:py-32 px-4 text-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'url(/images/hero-glitch.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(30px)',
            }}
          />
          <div className="absolute inset-0 bg-[#0a0e27]/80" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            <span className="text-white">READY TO</span><br />
            <span style={{
              background: 'linear-gradient(90deg, #00f0ff, #ff00ff, #ffff00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>FAIL FORWARD?</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-10 max-w-md mx-auto">
            Join the loop. Master the chaos. Celebrate every failure.
          </p>
          <Link href="/game">
            <button className="px-12 py-5 text-xl font-black rounded-xl transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00f0ff 0%, #ff00ff 100%)',
                boxShadow: '0 0 40px rgba(0,240,255,0.3), 0 0 80px rgba(255,0,255,0.2)',
                color: '#000',
              }}>
              ENTER THE FRENZY
            </button>
          </Link>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="border-t border-[#00f0ff15] py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/images/logo-icon.png" alt="FF" className="w-8 h-8" />
            <span className="text-gray-600 text-xs font-mono">Fail Frenzy Studios 2026</span>
          </div>
          <div className="flex gap-6 text-gray-600 text-xs font-mono">
            <a href="#" className="hover:text-[#00f0ff] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[#ff00ff] transition-colors">TikTok</a>
            <a href="#" className="hover:text-[#ffff00] transition-colors">Discord</a>
          </div>
        </div>
      </footer>

      {/* Global animations */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
