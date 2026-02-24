"use client";

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { 
    FaServer, FaShieldAlt, FaCoffee, 
    FaHeart, FaRocket, FaGlobe, FaArrowRight, FaLock, 
    FaFileAlt, FaGavel, FaCheckCircle, FaUsers, FaCodeBranch, FaCubes
} from 'react-icons/fa';

export default function DonatePageClient() {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const heroRef = useRef(null);

    // ✅ PERFORMANCE FIX: Added Cloudinary w_400 parameter to drop size from ~90kb to ~15kb
    const bmacProfileUrl = "https://res.cloudinary.com/dmtnonxtt/image/upload/w_400,f_auto,q_auto/v1771760208/ycmuivb92hyqwqrwkaoi.webp";
    const bmacLink = "https://coff.ee/adityachoudhary";

    const handleMouseMove = (e) => {
        if (!heroRef.current || window.innerWidth < 768) return;
        const { left, top, width, height } = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / 35;
        const y = -(e.clientY - top - height / 2) / 35;
        setTilt({ x, y });
    };

    const styles = {
        wrapper: { 
            // 🔹 RESPONSIVE FIX: Used clamp to reduce vertical padding on mobile
            paddingTop: 'clamp(2rem, 5vw, 4rem)', paddingBottom: 'clamp(4rem, 8vw, 8rem)', minHeight: '100vh',
            background: 'radial-gradient(circle at 50% 50%, rgba(102, 126, 234, 0.05), transparent)'
        },
        navBox: { display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: 'clamp(4rem, 8vw, 8rem)' },
        navLink: {
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50px', color: '#fff', textDecoration: 'none', fontSize: '0.8rem',
            fontWeight: '600', transition: '0.3s'
        }
    };

    return (
        // 🔹 RESPONSIVE FIX: Minimum horizontal padding (px-2) on mobile, px-4 on larger screens
        <article className="container mx-auto px-2 sm:px-4 max-w-[100vw] overflow-x-hidden" style={styles.wrapper}>
            {/* Hero Section */}
            <header 
                ref={heroRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setTilt({ x: 0, y: 0 })}
                className="text-center py-12 sm:py-20 mb-10 sm:mb-12"
                style={{ perspective: '1000px' }}
            >
                <div style={{
                    transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                    transition: 'transform 0.1s ease-out'
                }}>
                    {/* 🔹 RESPONSIVE FIX: Scaled text down to 4xl on mobile to prevent layout breakage */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-6 drop-shadow-2xl leading-tight tracking-tight px-2">
                        Keep StuHive<br/>Independent.
                    </h1>
                </div>
                {/* 🔹 RESPONSIVE FIX: Reduced text size and max-width on mobile */}
                <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
                    StuHive isn&apos;t owned by a corporation. It&apos;s a student-led initiative dedicated to 
                    <strong className="text-white"> free, open, and accessible</strong> academic resources. 
                    Your support directly fuels the infrastructure that keeps us online.
                </p>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-2">
                    <Link href="/about" title="Read our story" className="inline-flex items-center px-6 py-3 sm:px-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all text-sm sm:text-base">
                        <FaRocket className="mr-2 text-cyan-400" aria-hidden="true" /> My Story
                    </Link>
                    <Link href="/supporters" title="View our wall of fame" className="inline-flex items-center px-6 py-3 sm:px-8 rounded-full bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 text-pink-400 font-bold transition-all text-sm sm:text-base">
                        <FaUsers className="mr-2" aria-hidden="true" /> Wall of Fame
                    </Link>
                </div>
            </header>

            {/* Monthly Goal Tracker */}
            {/* 🔹 RESPONSIVE FIX: Reduced p-8 to p-5 on mobile */}
            <section className="max-w-3xl mx-auto mb-16 sm:mb-24 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm" aria-labelledby="goal-heading">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 id="goal-heading" className="text-white font-bold text-base sm:text-lg">Server Sustainability Goal</h2>
                        <p className="text-white/40 text-xs sm:text-sm">Monthly Hosting & Maintenance</p>
                    </div>
                    <span className="text-cyan-400 font-black text-sm sm:text-base">65% Funded</span>
                </div>
                <div className="w-full h-3 sm:h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 w-[65%] rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)]"></div>
                </div>
                <p className="text-center text-white/30 text-[9px] sm:text-[10px] mt-4 uppercase tracking-[0.2em]">Next Server Upgrade: 100% Goal</p>
            </section>

            {/* Impact Grid */}
            <section className="mb-16 sm:mb-24 px-2" aria-labelledby="impact-heading">
                <div className="text-center mb-10 sm:mb-16">
                    <div className="inline-block p-3 rounded-full bg-pink-500/10 mb-4">
                        <FaHeart className="text-pink-500 text-2xl sm:text-3xl animate-pulse" aria-hidden="true" />
                    </div>
                    <h2 id="impact-heading" className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Where Your Money Goes</h2>
                    <p className="text-white/40 mt-2 text-sm sm:text-base">Zero profit. 100% infrastructure.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                        { icon: <FaServer />, title: "High-Speed Hosting", color: "text-cyan-400", text: "Keeping our 100ms response time consistent across the globe via Azure." },
                        { icon: <FaCubes />, title: "File Security", color: "text-purple-400", text: "Funding secure Cloudflare R2 storage for millions of student notes." },
                        { icon: <FaCodeBranch />, title: "Open Source Tools", color: "text-green-400", text: "Licensing professional dev software for AI-powered academic features." },
                        { icon: <FaShieldAlt />, title: "Safe Backups", color: "text-yellow-400", text: "Maintaining redundant backups so student materials are never lost." }
                    ].map((card, idx) => (
                        // 🔹 RESPONSIVE FIX: Reduced p-8 to p-5 on mobile
                        <div key={idx} className="p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
                            <div className={`text-3xl sm:text-4xl ${card.color} mb-4 sm:mb-6 transition-transform group-hover:scale-110`} aria-hidden="true">{card.icon}</div>
                            <h3 className="font-bold text-white text-base sm:text-lg mb-2 sm:mb-3">{card.title}</h3>
                            <p className="text-xs sm:text-sm text-white/50 leading-relaxed">{card.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Supporter Spotlight Section */}
            {/* 🔹 RESPONSIVE FIX: Reduced padding from p-12 to p-6 on mobile, adjusted gap */}
            <section className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto p-6 sm:p-10 lg:p-12 rounded-[32px] lg:rounded-[48px] bg-gradient-to-br from-[#0a0118] to-transparent border border-white/10 relative overflow-hidden backdrop-blur-2xl mx-2 sm:mx-0" aria-labelledby="dev-heading">
                 <div className="absolute -top-24 -left-24 w-40 sm:w-64 h-40 sm:h-64 bg-yellow-500/10 rounded-full blur-[100px]" aria-hidden="true"></div>
                 
                 <div className="text-center lg:text-left relative z-10">
                    <div className="inline-block px-3 py-1 sm:px-4 sm:py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-4 sm:mb-6 border border-yellow-500/20">
                        Lead Developer Spotlight
                    </div>
                    {/* 🔹 RESPONSIVE FIX: Scaled text down */}
                    <h2 id="dev-heading" className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6 leading-tight">Built for the<br/>Community.</h2>
                    <p className="text-white/60 mb-6 sm:mb-8 text-sm sm:text-lg leading-relaxed">
                        &quot;StuHive started as a small script on my laptop to help my classmates. Today, it serves students globally. 
                        As a solo developer, your support allows me to spend more time coding features and less time worrying about server bills.&quot;
                    </p>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-center lg:justify-start text-white/40 text-xs sm:text-sm mb-8 sm:mb-10">
                        <span className="flex items-center gap-2"><FaCheckCircle className="text-green-500 shrink-0" aria-hidden="true" /> Ad-Free Forever</span>
                        <span className="flex items-center gap-2"><FaCheckCircle className="text-green-500 shrink-0" aria-hidden="true" /> Student Focused</span>
                    </div>
                    <a 
                        href={bmacLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-4 sm:px-10 sm:py-5 rounded-full bg-yellow-400 text-black font-black text-base sm:text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(250,204,21,0.3)]"
                    >
                        <FaCoffee className="mr-2 sm:mr-3" aria-hidden="true" /> Buy me a coffee
                    </a>
                 </div>

                 <div className="relative flex justify-center mt-4 lg:mt-0">
                    <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-tr from-yellow-400 to-purple-500 rounded-[40px] sm:rounded-[50px] blur opacity-20 animate-pulse" aria-hidden="true"></div>
                    <div className="relative bg-[#0a0118] p-3 sm:p-4 rounded-[32px] sm:rounded-[40px] border border-white/10 w-full max-w-[260px] sm:max-w-[320px]">
                        <Image 
                            src={bmacProfileUrl} 
                            alt="Aditya Choudhary - Founder and Solo Architect" 
                            width={320}
                            height={320}
                            unoptimized
                            className="w-full rounded-[24px] sm:rounded-[32px] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" 
                        />
                        <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 w-[85%] sm:w-[80%] bg-black/60 backdrop-blur-md border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center">
                            <h3 className="text-white font-bold text-sm sm:text-base">Aditya Choudhary</h3>
                            <p className="text-yellow-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mt-0.5">Solo Architect</p>
                        </div>
                    </div>
                 </div>
            </section>

            {/* LEGAL & INFO HUB INTERLINKING */}
            <nav style={styles.navBox} aria-label="Legal and Informational links">
                <Link href="/supporters" style={{...styles.navLink, background: 'rgba(255, 0, 204, 0.1)', borderColor: 'rgba(255, 0, 204, 0.2)'}} title="Wall of Fame">
                    <FaUsers aria-hidden="true" /> Wall of Fame <FaArrowRight size={10} aria-hidden="true" />
                </Link>
                <Link href="/privacy" style={styles.navLink} title="Privacy Policy">
                    <FaLock aria-hidden="true" /> Privacy Engine <FaArrowRight size={10} aria-hidden="true" />
                </Link>
                <Link href="/terms" style={styles.navLink} title="Terms of Service">
                    <FaGavel aria-hidden="true" /> Terms of Service <FaArrowRight size={10} aria-hidden="true" />
                </Link>
                <Link href="/dmca" style={styles.navLink} title="IP Protection">
                    <FaShieldAlt aria-hidden="true" /> IP Protection <FaArrowRight size={10} aria-hidden="true" />
                </Link>
                <Link href="/about" style={styles.navLink} title="Our Mission">
                    <FaFileAlt aria-hidden="true" /> Our Story <FaArrowRight size={10} aria-hidden="true" />
                </Link>
            </nav>

            <footer className="text-center mt-12 mb-4 text-white/50 text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.3em] sm:tracking-[0.5em] px-2">
                Secure • Encrypted • Global Education Movement
            </footer>
        </article>
    );
}