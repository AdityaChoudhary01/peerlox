"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { FaBolt, FaStar, FaRocket, FaArrowRight, FaFeatherAlt, FaUsers } from 'react-icons/fa';

export default function HeroSection() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  
  const [currentActivity, setCurrentActivity] = useState(0);
  const activities = useMemo(() => ([
    { user: 'Aditya', action: 'uploaded React Notes', icon: <FaBolt color="#ffcc00" /> },
    { user: 'Sneha', action: 'shared DBMS PDF', icon: <FaStar color="#00d4ff" /> },
    { user: 'Rahul', action: 'just joined PeerNotez', icon: <FaRocket color="#ff00cc" /> }
  ]), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activities.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activities.length]);

  const handleMouseMove = (e) => {
    if (window.innerWidth < 1024 || !heroRef.current) return;
    const { left, top, width, height } = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 45;
    const y = -(e.clientY - top - height / 2) / 45;
    setTilt({ x, y });
  };

  return (
    <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        // REDUCED HEIGHT: min-h changed to 75vh and adjusted margin-bottom to make room for stats
        className="relative min-h-[75vh] flex flex-col items-center justify-center -mt-10 mb-20 overflow-hidden bg-[#0a0118]"
    >
        {/* --- DYNAMIC BACKGROUND ELEMENTS --- */}
        <div className="absolute inset-0 z-0 opacity-20" 
             style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full z-0" />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full z-0" />

        {/* --- MAIN CONTENT --- */}
        <div 
          className="text-center z-10 max-w-6xl px-6 transition-transform duration-200 ease-out"
          style={{ 
            transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            perspective: '1000px'
          }}
        >
            {/* Live Activity Badge */}
            <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-full px-5 py-2 mb-8 shadow-2xl transition-all hover:border-cyan-400/50 group">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 flex items-center gap-2">
                   {activities[currentActivity].icon}
                   <span>
                      <strong className="text-white">{activities[currentActivity].user}</strong> {activities[currentActivity].action}
                   </span>
                </span>
            </div>

            {/* Main Headline with Brand Name */}
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tighter drop-shadow-2xl">
                Master Your Coursework <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-purple-500">
                    with PeerNotez
                </span>
            </h1>

            {/* Subtext */}
            <p className="text-base md:text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                The decentralized archive for high-performing students. <br className="hidden md:block"/>
                <span className="text-white/80">Share notes, publish insights, and conquer exams together.</span>
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
                {/* ENHANCED BUTTON: Gradient primary button */}
                <Link href="/search" className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black text-base transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-[0_10px_30px_rgba(6,182,212,0.3)] hover:shadow-[0_15px_40px_rgba(168,85,247,0.4)]">
                    <FaRocket className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /> 
                    Start Learning
                    <FaArrowRight size={14} className="group-hover:translate-x-1 transition-all" />
                </Link>
                
                {/* ENHANCED BUTTON: Styled outline/glass button */}
                <Link href="/notes/upload" className="px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/10 text-white font-black text-base backdrop-blur-md hover:bg-white/[0.1] hover:border-cyan-400/50 transition-all flex items-center gap-3">
                    <FaFeatherAlt className="text-cyan-400" /> Share Notes
                </Link>
            </div>
        </div>
    </section>
  );
}