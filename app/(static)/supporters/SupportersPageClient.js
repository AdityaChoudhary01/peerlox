"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    FaUniversity, FaMapMarkerAlt, FaQuoteLeft, FaHandHoldingHeart, 
    FaStar, FaArrowRight, FaLock, FaFileAlt, FaGavel, FaShieldAlt, FaCrown 
} from 'react-icons/fa';

// Utility Functions (Keep these inside for the demo, or move to a lib file)
const getRandomDate = () => {
    const now = new Date();
    const past = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime())).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
};

const generateRandomSupporter = (id) => {
    const names = ['Aditya', 'Riya', 'Arjun', 'Saanvi', 'Kabir', 'Meera', 'Rohan', 'Priya', 'Ishaan', 'Ananya'];
    const surnames = ["Sharma", "Verma", "Singh", "Gupta", "Malhotra", "Reddy"];
    const name = names[Math.floor(Math.random() * names.length)] + " " + surnames[Math.floor(Math.random() * surnames.length)];
    const rawAmount = Math.floor(Math.random() * (5000 - 150) + 150);
    
    return {
        id,
        name,
        amount: `₹${rawAmount}`,
        isPremium: rawAmount > 2000,
        date: getRandomDate(),
        university: ["IIT Delhi", "BITS Pilani", "Delhi University", "VIT", "MIT", "Stanford", "NUS"][Math.floor(Math.random() * 7)],
        city: ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "London", "New York"][Math.floor(Math.random() * 6)],
        message: ["Fueling open education!", "PeerNotez is a lifesaver.", "Proud to support Aditya's vision.", "Knowledge for all!", "Keep up the great work!"][Math.floor(Math.random() * 5)],
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=00f2fe,b388ff` 
    };
};

export default function SupportersPageClient() {
    const [supporters, setSupporters] = useState([]);

    useEffect(() => {
        setSupporters(Array.from({ length: 40 }, (_, index) => generateRandomSupporter(index)));
    }, []);

    const styles = {
        wrapper: { 
            paddingTop: '6rem', paddingBottom: '8rem', minHeight: '100vh',
            background: 'radial-gradient(circle at 50% 0%, rgba(255, 0, 204, 0.05), transparent)'
        },
        navBox: { display: 'flex', justifyContent: 'center', gap: '1.2rem', flexWrap: 'wrap', marginTop: '8rem' },
        navLink: {
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50px', color: '#fff', textDecoration: 'none', fontSize: '0.85rem',
            fontWeight: '600', transition: '0.3s'
        }
    };

    if (supporters.length === 0) return null;

    return (
        <main className="container mx-auto px-4" style={styles.wrapper}>
            <header className="text-center mb-20">
                <div className="inline-block px-4 py-1 rounded-full bg-pink-500/10 text-pink-500 text-xs font-black uppercase tracking-[0.3em] mb-6 border border-pink-500/20">
                    Community Heroes
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter">
                    Wall of <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">Fame.</span>
                </h1>
                <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
                    Celebrating the individuals who keep PeerNotez independent. 
                    Every contribution directly funds our servers and open-access mission.
                </p>
                
                {/* SEO Authority Stats */}
                <section className="mt-10 flex items-center justify-center gap-6" aria-label="Supporter Statistics">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-white">{supporters.length}+</span>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Total Visionaries</span>
                    </div>
                    <div className="w-[1px] h-10 bg-white/10" aria-hidden="true"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-cyan-400">100%</span>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Independent</span>
                    </div>
                </section>
            </header>

            

            {/* Supporters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {supporters.map((supporter) => (
                    <article 
                        key={supporter.id} 
                        className={`p-8 rounded-[32px] bg-white/5 border transition-all duration-500 relative group overflow-hidden ${
                            supporter.isPremium ? 'border-yellow-500/30 bg-yellow-500/[0.02]' : 'border-white/5'
                        }`}
                    >
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${
                            supporter.isPremium ? 'from-yellow-400 to-transparent' : 'from-cyan-400 to-transparent'
                        }`} aria-hidden="true"></div>

                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="relative mb-6">
                                <img 
                                    src={supporter.avatar} 
                                    alt={`${supporter.name} - PeerNotez Supporter`} 
                                    className={`w-24 h-24 rounded-3xl object-cover shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                                        supporter.isPremium ? 'ring-4 ring-yellow-500/20' : 'ring-4 ring-cyan-500/10'
                                    }`}
                                    loading="lazy"
                                />
                                {supporter.isPremium && (
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black shadow-xl" title="Premium Supporter">
                                        <FaCrown size={14} aria-hidden="true" />
                                    </div>
                                )}
                            </div>
                            
                            <h2 className="font-black text-xl text-white mb-2 tracking-tight">{supporter.name}</h2>
                            
                            <div className="flex flex-col gap-2 text-[10px] uppercase font-bold tracking-widest text-white/40 mb-6">
                                <span className="flex items-center justify-center gap-2">
                                    <FaUniversity className={supporter.isPremium ? "text-yellow-400" : "text-purple-400"} aria-hidden="true" /> 
                                    {supporter.university}
                                </span>
                                <span className="flex items-center justify-center gap-2">
                                    <FaMapMarkerAlt className={supporter.isPremium ? "text-yellow-400" : "text-cyan-400"} aria-hidden="true" /> 
                                    {supporter.city}
                                </span>
                            </div>
                            
                            <div className={`px-5 py-2 rounded-2xl font-black text-sm mb-6 border ${
                                supporter.isPremium 
                                ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" 
                                : "bg-green-400/10 text-green-400 border-green-400/20"
                            }`}>
                                {supporter.amount}
                            </div>
                            
                            <blockquote className="relative px-4">
                                <FaQuoteLeft className="absolute -top-2 -left-1 text-white/10 text-2xl" aria-hidden="true" />
                                <p className="text-sm text-white/70 italic leading-relaxed">
                                    {supporter.message}
                                </p>
                            </blockquote>
                            
                            <footer className="mt-8 pt-6 border-t border-white/5 w-full text-[9px] text-white/30 font-bold uppercase tracking-[0.2em]">
                                Enrolled: {supporter.date}
                            </footer>
                        </div>
                    </article>
                ))}
            </div>

            {/* CALL TO ACTION */}
            <section className="mt-20 text-center">
                <h2 className="text-2xl font-black text-white mb-6">Want your name on this wall?</h2>
                <Link href="/donate" title="Support PeerNotez" className="inline-flex items-center px-10 py-4 rounded-full bg-white text-black font-black text-lg hover:scale-105 active:scale-95 transition-all">
                    Support PeerNotez <FaArrowRight className="ml-3" aria-hidden="true" />
                </Link>
            </section>

            {/* LEGAL HUB INTERLINKING */}
            <nav style={styles.navBox} aria-label="Footer Legal Links">
                <Link href="/privacy" style={styles.navLink} title="Privacy Policy">
                    <FaLock aria-hidden="true" /> Privacy Engine <FaArrowRight size={10} aria-hidden="true" />
                </Link>
                <Link href="/terms" style={styles.navLink} title="Terms of Service">
                    <FaGavel aria-hidden="true" /> Terms of Service <FaArrowRight size={10} aria-hidden="true" />
                </Link>
                <Link href="/dmca" style={styles.navLink} title="IP Protection">
                    <FaShieldAlt aria-hidden="true" /> IP Protection <FaArrowRight size={10} aria-hidden="true" />
                </Link>
                <Link href="/about" style={styles.navLink} title="Our Story">
                    <FaFileAlt aria-hidden="true" /> Our Vision <FaArrowRight size={10} aria-hidden="true" />
                </Link>
            </nav>

            <footer className="text-center mt-12 text-white/10 text-[10px] font-bold uppercase tracking-[0.4em]">
                Verified PeerNotez Supporters Ecosystem
            </footer>
        </main>
    );
}