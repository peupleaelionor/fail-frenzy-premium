/**
 * FAIL FRENZY - Premium Home Page
 * Investor-ready landing with game showcase
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { ChevronDown, Zap, Target, Users, Gamepad2, TrendingUp, Share2, Sparkles, Play, Award, Globe } from 'lucide-react';

export default function Home() {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px),
              linear-gradient(0deg, rgba(0,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }} />
        </div>
        
        {/* Glitch scanlines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-transparent animate-pulse" style={{ backgroundSize: '100% 4px' }} />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-7xl md:text-9xl font-black mb-4 glitch-text" style={{ 
              textShadow: '4px 4px 0 #ff00ff, 8px 8px 0 #00ffff, 12px 12px 0 #ffff00',
              letterSpacing: '0.05em'
            }}>
              FAIL FRENZY
            </h1>
            <p className="text-3xl md:text-5xl font-bold mb-2" style={{ 
              background: 'linear-gradient(90deg, #00ffff, #ff00ff, #ffff00, #00ffff)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 3s linear infinite'
            }}>
              PREMIUM ENGINE EDITION
            </p>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 font-mono leading-relaxed">
            Edge-First Game Engine • <span className="text-cyan-400">&lt;2s Load</span> • <span className="text-magenta-400">Infinite Scale</span>
            <br />
            <span className="text-sm text-gray-500">Cloudflare Workers • React 19 • Canvas • D1/KV/R2</span>
          </p>
          
          <div className="flex gap-6 justify-center flex-wrap mb-8">
            <Link href="/game">
              <button className="group relative px-10 py-5 text-xl font-bold bg-gradient-to-r from-cyan-500 to-magenta-500 rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,255,0.6)]">
                <span className="relative z-10 flex items-center gap-3">
                  <Play className="w-6 h-6" /> PLAY NOW
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-magenta-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>
            
            <button className="px-10 py-5 text-xl font-bold border-2 border-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-all hover:shadow-[0_0_30px_rgba(0,255,255,0.4)]">
              📊 METRICS
            </button>
            
            <button className="px-10 py-5 text-xl font-bold border-2 border-magenta-400 rounded-lg hover:bg-magenta-500/20 transition-all hover:shadow-[0_0_30px_rgba(255,0,255,0.4)]">
              📖 DOCS
            </button>
          </div>
          
          {/* Stats banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { label: 'Load Time', value: '<2s', icon: Zap, color: 'cyan' },
              { label: 'API Latency', value: '~50ms', icon: TrendingUp, color: 'green' },
              { label: 'Global Scale', value: '∞', icon: Globe, color: 'magenta' },
              { label: 'Cost/100K', value: '€0', icon: Award, color: 'yellow' },
            ].map((stat) => (
              <div key={stat.label} className={`bg-${stat.color}-500/10 border border-${stat.color}-400 rounded-lg p-4 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all`}>
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
                </div>
                <div className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Overview */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="glitch-text text-4xl md:text-5xl text-center mb-12" style={{ color: '#00ffff' }}>
            ⚡ Game Overview
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="glitch-card">
              <h3 className="text-2xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6" /> Core Concept
              </h3>
              <p className="text-white font-mono text-sm leading-relaxed">
                Players navigate extremely short loops (2.5–5 seconds) where failure is the main reward. The loop resets instantly upon fail. Players are incentivized to fail via a "Fail Streak" system, cosmetic progression, and humorous animations.
              </p>
            </div>

            <div className="glitch-card">
              <h3 className="text-2xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
                <Target className="w-6 h-6" /> Target Audience
              </h3>
              <p className="text-white font-mono text-sm leading-relaxed">
                10–50 years old, global, casual mobile gamers. Designed to be immediately understandable and fun for children, teens, and adults. Perfect for short play sessions during daily commutes or breaks.
              </p>
            </div>

            <div className="glitch-card">
              <h3 className="text-2xl font-bold text-magenta-300 mb-4 flex items-center gap-2">
                <Gamepad2 className="w-6 h-6" /> Platforms
              </h3>
              <p className="text-white font-mono text-sm leading-relaxed">
                iOS + Android. Optimized for vertical orientation with touch-based controls. Lightweight and memory-efficient for a wide range of devices.
              </p>
            </div>

            <div className="glitch-card">
              <h3 className="text-2xl font-bold text-lime-300 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" /> Goal
              </h3>
              <p className="text-white font-mono text-sm leading-relaxed">
                Maximize retention, virality, and monetization. Create an experience so engaging that players return daily and encourage friends to download.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Game Loop Visualization */}
      <section className="py-20 px-4 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="glitch-text text-4xl md:text-5xl text-center mb-12" style={{ color: '#ff00ff' }}>
            🔄 The Core Loop
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <img src="/images/game-loop-visual.png" alt="Game Loop" className="w-full max-w-md mx-auto pulse-glow" />
            </div>
            
            <div className="space-y-4">
              <div className="glitch-card">
                <h4 className="text-cyan-400 font-bold text-lg mb-2">1. Start Screen</h4>
                <p className="text-white text-sm">One-touch start launches immediately into action</p>
              </div>
              <div className="glitch-card">
                <h4 className="text-magenta-400 font-bold text-lg mb-2">2. Single Challenge</h4>
                <p className="text-white text-sm">Player faces one obstacle: tap, swipe, or hold</p>
              </div>
              <div className="glitch-card">
                <h4 className="text-yellow-400 font-bold text-lg mb-2">3. Instant Feedback</h4>
                <p className="text-white text-sm">Success or fail in a fraction of second with animation, sound, haptics</p>
              </div>
              <div className="glitch-card">
                <h4 className="text-lime-400 font-bold text-lg mb-2">4. Restart in &lt;0.3s</h4>
                <p className="text-white text-sm">Quasi-instant restart keeps players in flow state</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Systems */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="glitch-text text-4xl md:text-5xl text-center mb-12" style={{ color: '#00ffff' }}>
            ⚙️ Game Systems
          </h2>

          <div className="space-y-4">
            {[
              { id: 'controller', title: '🎮 Player Controller', desc: 'Handles input detection (tap/swipe/hold), calculates success/failure, sends events to Fail Streak manager' },
              { id: 'streak', title: '📊 Fail Streak Manager', desc: 'Tracks consecutive fails, unlocks cosmetics/environments, triggers animations, updates leaderboards' },
              { id: 'obstacles', title: '🎯 Obstacle Generator', desc: 'Procedural generation with varied speed, type, position, and random animations for infinite replayability' },
              { id: 'difficulty', title: '📈 Dynamic Difficulty Manager', desc: 'Adjusts speed, spacing, reaction windows based on player skill to maintain "edge of frustration"' },
              { id: 'score', title: '🏆 Score & Leaderboard Manager', desc: 'Tracks loops, streaks, percentiles, generates data for social sharing, real-time or daily reset' },
              { id: 'cosmetics', title: '✨ Cosmetic & Progression Manager', desc: 'Unlocks skins, environments, sound packs - purely cosmetic, no gameplay advantages' },
              { id: 'audio', title: '🔊 Audio & Haptics Manager', desc: 'Funny sounds on fail, rewarding sounds on rare success, strong haptic feedback' },
              { id: 'save', title: '💾 Save/Load Manager', desc: 'Auto-saves player progress, cosmetics unlocked, fail streak history' },
            ].map((system) => (
              <div key={system.id} className="glitch-card cursor-pointer hover:border-cyan-400 transition-colors" onClick={() => toggleSection(system.id)}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-cyan-300">{system.title}</h3>
                  <ChevronDown className={`w-5 h-5 text-cyan-400 transition-transform ${expandedSection === system.id ? 'rotate-180' : ''}`} />
                </div>
                {expandedSection === system.id && (
                  <p className="text-white text-sm mt-3 font-mono">{system.desc}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Modes */}
      <section className="py-20 px-4 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="glitch-text text-4xl md:text-5xl text-center mb-12" style={{ color: '#ff00ff' }}>
            🎮 Game Modes
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glitch-card">
              <h3 className="text-xl font-bold text-cyan-300 mb-3">Classic Loop</h3>
              <p className="text-white text-sm mb-3">Infinite procedural loops with increasing difficulty. Survive as long as possible and accumulate the longest Fail Streak.</p>
              <div className="text-xs text-cyan-400 font-mono">Perfect for quick sessions</div>
            </div>

            <div className="glitch-card">
              <h3 className="text-xl font-bold text-magenta-300 mb-3">Daily Fail</h3>
              <p className="text-white text-sm mb-3">All players face the same challenge for 24 hours. Leaderboard resets daily, giving everyone a fresh chance.</p>
              <div className="text-xs text-magenta-400 font-mono">Competitive daily reset</div>
            </div>

            <div className="glitch-card">
              <h3 className="text-xl font-bold text-yellow-300 mb-3">Chaos Mode</h3>
              <p className="text-white text-sm mb-3">Weekly event with random modifiers: speed changes, inverted gravity, reduced visibility, reversed controls, and more.</p>
              <div className="text-xs text-yellow-400 font-mono">Unpredictable weekly event</div>
            </div>

            <div className="glitch-card">
              <h3 className="text-xl font-bold text-lime-300 mb-3">Streak Challenge</h3>
              <p className="text-white text-sm mb-3">Pure focus on accumulating consecutive fails. Compete for the longest Fail Streak on the global leaderboard.</p>
              <div className="text-xs text-lime-400 font-mono">Fail mastery competition</div>
            </div>
          </div>
        </div>
      </section>

      {/* Monetization */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="glitch-text text-4xl md:text-5xl text-center mb-12" style={{ color: '#00ffff' }}>
            💰 Monetization Strategy
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="glitch-card">
              <h3 className="text-xl font-bold text-cyan-300 mb-4">In-App Purchases</h3>
              <ul className="text-white text-sm space-y-2 font-mono">
                <li>✓ Remove Ads (one-time)</li>
                <li>✓ Cosmetic Packs (skins, effects)</li>
                <li>✓ Environments/Themes</li>
                <li>✓ Rare Sound Packs</li>
              </ul>
            </div>

            <div className="glitch-card">
              <h3 className="text-xl font-bold text-magenta-300 mb-4">Rewarded Ads</h3>
              <ul className="text-white text-sm space-y-2 font-mono">
                <li>✓ Second Chance After Fail</li>
                <li>✓ Double Cosmetic Reward</li>
                <li>✓ Instant Replay Option</li>
                <li>✓ Optional, Player-Initiated</li>
              </ul>
            </div>

            <div className="glitch-card">
              <h3 className="text-xl font-bold text-yellow-300 mb-4">Shop Features</h3>
              <ul className="text-white text-sm space-y-2 font-mono">
                <li>✓ One-Tap Purchase</li>
                <li>✓ Seasonal Packs</li>
                <li>✓ Trending Items</li>
                <li>✓ Social Proof Display</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Virality & Social */}
      <section className="py-20 px-4 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="glitch-text text-4xl md:text-5xl text-center mb-12" style={{ color: '#ff00ff' }}>
            📱 Virality & Social Integration
          </h2>

          <div className="glitch-card mb-8">
            <img src="/images/fail-streak-graphic.png" alt="Fail Streak" className="w-full max-w-md mx-auto mb-8" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glitch-card">
              <h3 className="text-lg font-bold text-cyan-300 mb-3 flex items-center gap-2">
                <Share2 className="w-5 h-5" /> Automatic Video Generation
              </h3>
              <p className="text-white text-sm">Automatically generates 3–5 second clips of notable fails, streaks, and rare successes. Pre-fills hashtags for TikTok, Instagram Reels, and YouTube Shorts.</p>
            </div>

            <div className="glitch-card">
              <h3 className="text-lg font-bold text-magenta-300 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" /> Social Sharing
              </h3>
              <p className="text-white text-sm">One-tap sharing to major platforms. Includes Fail Streak counter and funny captions. Encourages challenges between friends.</p>
            </div>

            <div className="glitch-card">
              <h3 className="text-lg font-bold text-yellow-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Rare Fail Highlights
              </h3>
              <p className="text-white text-sm">System detects particularly unique or comedic fails. These "Rare Fails" are highlighted and encouraged for sharing, creating viral moments.</p>
            </div>

            <div className="glitch-card">
              <h3 className="text-lg font-bold text-lime-300 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Trending Content
              </h3>
              <p className="text-white text-sm">Shop displays trending cosmetic items that appear frequently in shared videos, creating social proof and driving purchases.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Style */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="glitch-text text-4xl md:text-5xl text-center mb-12" style={{ color: '#00ffff' }}>
            🎨 Graphic Style
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glitch-card">
              <h3 className="text-lg font-bold text-cyan-300 mb-3">Aesthetic</h3>
              <ul className="text-white text-sm space-y-2 font-mono">
                <li>• Minimalist, colorful, high contrast</li>
                <li>• Cartoonish, humorous fail animations</li>
                <li>• Procedural environments (urban, nature, futuristic)</li>
                <li>• Visually striking cosmetic skins</li>
                <li>• Ultra-minimalist UI, no clutter</li>
                <li>• Dynamic lighting & particle effects</li>
              </ul>
            </div>

            <div className="glitch-card">
              <h3 className="text-lg font-bold text-magenta-300 mb-3">Design Principles</h3>
              <ul className="text-white text-sm space-y-2 font-mono">
                <li>• Exaggerated, satisfying fail animations</li>
                <li>• Instantly recognizable cosmetics</li>
                <li>• High-contrast colors for clarity</li>
                <li>• Responsive to player actions</li>
                <li>• Culturally neutral art style</li>
                <li>• Optimized for mobile screens</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="py-20 px-4 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="glitch-text text-4xl md:text-5xl text-center mb-12" style={{ color: '#ff00ff' }}>
            ⚙️ Technical Specifications
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glitch-card">
              <h3 className="text-lg font-bold text-cyan-300 mb-4">Engine & Architecture</h3>
              <div className="space-y-3 text-white text-sm font-mono">
                <div><span className="text-yellow-300">Engine:</span> Unity</div>
                <div><span className="text-yellow-300">Architecture:</span> ECS (Entity Component System)</div>
                <div><span className="text-yellow-300">Platforms:</span> iOS + Android</div>
                <div><span className="text-yellow-300">Input:</span> Touch-based</div>
                <div><span className="text-yellow-300">Frame Rate:</span> 60+ FPS</div>
                <div><span className="text-yellow-300">Orientation:</span> Vertical (Portrait)</div>
              </div>
            </div>

            <div className="glitch-card">
              <h3 className="text-lg font-bold text-magenta-300 mb-4">Performance & Features</h3>
              <div className="space-y-3 text-white text-sm font-mono">
                <div><span className="text-yellow-300">Memory:</span> Lightweight & optimized</div>
                <div><span className="text-yellow-300">Leaderboards:</span> Cloud-based save</div>
                <div><span className="text-yellow-300">Analytics:</span> Loops, fails, shares tracked</div>
                <div><span className="text-yellow-300">Progression:</span> Cosmetic-only</div>
                <div><span className="text-yellow-300">Accessibility:</span> One-handed play</div>
                <div><span className="text-yellow-300">Monetization:</span> Ethical & non-intrusive</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Notes */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="glitch-text text-4xl md:text-5xl text-center mb-12" style={{ color: '#00ffff' }}>
            🎯 Strategic Principles
          </h2>

          <div className="space-y-4">
            <div className="glitch-card">
              <h3 className="text-lg font-bold text-cyan-300 mb-2">Focus on Speed & Virality</h3>
              <p className="text-white text-sm">Resist adding complex mechanics. Every feature must enhance speed, fun, and shareability.</p>
            </div>

            <div className="glitch-card">
              <h3 className="text-lg font-bold text-magenta-300 mb-2">Failure is Rewarding</h3>
              <p className="text-white text-sm">Every aspect—animations, sounds, haptics—must make failure positive, humorous, and addictive.</p>
            </div>

            <div className="glitch-card">
              <h3 className="text-lg font-bold text-yellow-300 mb-2">Lightweight Meta-Game</h3>
              <p className="text-white text-sm">Progression is purely cosmetic. Ensures balance, accessibility, and skill-based gameplay.</p>
            </div>

            <div className="glitch-card">
              <h3 className="text-lg font-bold text-lime-300 mb-2">One-Handed, Intuitive UI</h3>
              <p className="text-white text-sm">Playable with one hand in portrait mode. No tutorials needed. Instant comprehension.</p>
            </div>

            <div className="glitch-card">
              <h3 className="text-lg font-bold text-cyan-300 mb-2">Global Appeal</h3>
              <p className="text-white text-sm">No language barriers. Culturally neutral art. Universal design for 10M+ downloads.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-950 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="glitch-text text-4xl md:text-5xl mb-8" style={{ color: '#ffff00' }}>
            Ready to Experience the Frenzied Loop?
          </h2>
          <p className="text-white text-lg mb-8 font-mono">
            Download Fail Frenzy: The Loop and join millions of players celebrating failure.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="glitch-button px-8 py-4 text-lg hover:scale-105 transition-transform">
              📥 Download iOS
            </button>
            <button className="glitch-button px-8 py-4 text-lg hover:scale-105 transition-transform">
              📥 Download Android
            </button>
            <button className="glitch-button px-8 py-4 text-lg border-magenta-500 hover:scale-105 transition-transform" style={{ borderColor: '#ff00ff' }}>
              📧 Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8 px-4 text-center border-t-4 border-cyan-400">
        <div className="max-w-6xl mx-auto">
          <p className="text-cyan-400 font-mono text-sm mb-2">
            © 2026 Fail Frenzy Studios. All rights reserved.
          </p>
          <p className="text-gray-500 font-mono text-xs">
            Where Failure is the Main Reward | Made with ❤️ and Glitches
          </p>
          <div className="mt-4 flex justify-center gap-4 text-cyan-400">
            <a href="#" className="hover:text-magenta-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-magenta-400 transition-colors">TikTok</a>
            <a href="#" className="hover:text-magenta-400 transition-colors">Instagram</a>
            <a href="#" className="hover:text-magenta-400 transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
