"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FaBolt, FaStar, FaRocket, FaArrowRight, FaFeatherAlt } from 'react-icons/fa';

export default function HeroSection() {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [fade, setFade] = useState(true);

  const activities = useMemo(() => ([
    { user: 'Aditya', action: 'uploaded React Notes', icon: <FaBolt className="text-amber-400" /> },
    { user: 'Sneha', action: 'shared DBMS PDF', icon: <FaStar className="text-cyan-400" /> },
    { user: 'Rahul', action: 'joined PeerNotez', icon: <FaRocket className="text-purple-400" /> }
  ]), []);

  // Handle the smooth fade transition for the live ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentActivity((prev) => (prev + 1) % activities.length);
        setFade(true);
      }, 300); // Wait for fade out
    }, 4000);
    return () => clearInterval(interval);
  }, [activities.length]);

  return (
    <>
      {/* INJECTED CUSTOM ANIMATIONS FOR PREMIUM EFFECTS */}
      <style jsx>{`
        @keyframes text-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-text-gradient {
          background-size: 200% auto;
          animation: text-gradient 4s linear infinite;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}</style>

      <section className="relative w-full pt-10 pb-20 md:pt-6 md:pb-30 flex flex-col items-center justify-center overflow-hidden">
        
        {/* --- SUBTLE AMBIENT GLOWS --- */}
        <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* --- MAIN CONTENT --- */}
        <div className="text-center z-10 max-w-5xl px-4 sm:px-6">
          
          {/* Professional Live Activity Badge */}
          <div className="mx-auto w-fit mb-8">
            <div className="relative inline-flex items-center gap-3 glass-panel rounded-full px-4 py-2 sm:px-5 sm:py-2.5 overflow-hidden transition-colors">
              <div className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </div>
              
              <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] text-white/80 flex items-center gap-2 transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                 {activities[currentActivity].icon}
                 <span className="truncate max-w-[200px] sm:max-w-none">
                    <strong className="text-white">{activities[currentActivity].user}</strong> {activities[currentActivity].action}
                 </span>
              </div>
            </div>
          </div>

          {/* Ultra-Premium Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-6 sm:mb-8 leading-[1.1] tracking-tight drop-shadow-lg">
            Master Your Coursework <br className="hidden sm:block" />
            <span className="animate-text-gradient bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 pb-2 inline-block">
                with PeerNotez
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed font-medium px-2">
            The decentralized archive for high-performing students. <br className="hidden md:block"/>
            <span className="text-white/90">Share notes, publish insights, and conquer exams together.</span>
          </p>

          {/* Action Buttons Container */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto px-4 sm:px-0">
            {/* Supercharged Primary Button */}
            <Link 
              href="/search" 
              className="group relative px-6 py-3.5 sm:px-8 sm:py-4 w-full sm:w-auto rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-sm sm:text-base overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
            >
              <FaRocket className="relative z-10 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" /> 
              <span className="relative z-10">Start Learning</span>
              <FaArrowRight size={14} className="relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
            
            {/* Sleek Glassmorphism Secondary Button */}
            <Link 
              href="/notes/upload" 
              className="group relative px-6 py-3.5 sm:px-8 sm:py-4 w-full sm:w-auto rounded-xl sm:rounded-2xl glass-panel text-white font-bold text-sm sm:text-base hover:bg-white/[0.05] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <FaFeatherAlt className="text-cyan-400 transition-transform group-hover:rotate-12" /> 
              <span>Share Notes</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}