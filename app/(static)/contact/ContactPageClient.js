"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
    FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaCheckCircle, 
    FaPaperPlane, FaSpinner, FaGlobe, FaTwitter, FaGithub, 
    FaLinkedin, FaArrowRight, FaLock, FaShieldAlt, FaGavel, FaFileAlt 
} from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitContactForm } from '@/actions/contact.actions'; 
import { useToast } from '@/hooks/use-toast';

export default function ContactPageClient() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = {
            name: e.target.name.value,
            email: e.target.email.value,
            message: e.target.message.value
        };

        const result = await submitContactForm(formData);

        if (result.success) {
            setIsSubmitted(true);
            toast({ title: "Signal Received", description: "Your message is in our queue." });
        } else {
            toast({ title: "Transmission Failed", description: result.error, variant: "destructive" });
        }
        setLoading(false);
    };

    const styles = {
        wrapper: { paddingTop: '6rem', paddingBottom: '8rem', minHeight: '100vh' },
        navBox: { display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '8rem' },
        navLink: {
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50px', color: '#fff', textDecoration: 'none', fontSize: '0.8rem',
            fontWeight: '600', transition: '0.3s'
        }
    };

    return (
        <main className="container mx-auto px-4" style={styles.wrapper}>
            <header className="text-center mb-20">
                <div className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-black uppercase tracking-[0.3em] mb-6 border border-cyan-500/20">
                    Communication Terminal
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter">
                    Connect with <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">Us.</span>
                </h1>
                <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
                    Whether you have a bug report, a partnership proposal, or just want to discuss the future of PeerNotez, our lines are open.
                </p>
            </header>

            <div className="grid lg:grid-cols-5 gap-8 items-stretch max-w-7xl mx-auto">
                
                {/* 1. Technical Info - Using <address> for SEO */}
                <address className="lg:col-span-2 space-y-6 not-italic">
                    <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl h-full flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                                <FaGlobe className="text-cyan-400" aria-hidden="true" /> Channels
                            </h2>
                            
                            <div className="space-y-8">
                                <div className="flex gap-5 group">
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 transition-colors group-hover:bg-cyan-400 group-hover:text-black">
                                        <FaEnvelope size={20} aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold mb-1">Electronic Mail</h3>
                                        <a href="mailto:aadiwrld01@gmail.com" title="Email Aditya Choudhary" className="text-white/40 hover:text-cyan-400 transition-colors">aadiwrld01@gmail.com</a>
                                    </div>
                                </div>

                                <div className="flex gap-5 group">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-400/10 flex items-center justify-center text-purple-400 transition-colors group-hover:bg-purple-400 group-hover:text-black">
                                        <FaMapMarkerAlt size={20} aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold mb-1">Physical Access</h3>
                                        <p className="text-white/40 leading-relaxed text-sm">PeerNotez HQ, Ghaziabad,<br/>Uttar Pradesh, India - 201009</p>
                                    </div>
                                </div>

                                <div className="flex gap-5 group">
                                    <div className="w-12 h-12 rounded-2xl bg-pink-400/10 flex items-center justify-center text-pink-400 transition-colors group-hover:bg-pink-400 group-hover:text-black">
                                        <FaPhoneAlt size={20} aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold mb-1">Direct Voice Line</h3>
                                        <p className="text-white/40 text-sm">Mon-Fri, 9am - 6pm IST</p>
                                        <a href="tel:+911234567890" className="text-pink-400 font-bold hover:underline">+91 (1234) 567-890</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5 flex gap-4">
                            <a href="https://github.com/AdityaChoudhary01" title="GitHub" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white hover:text-black transition-all">
                                <FaGithub aria-hidden="true" />
                            </a>
                            <a href="https://twitter.com/your-handle" title="Twitter" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white hover:text-black transition-all">
                                <FaTwitter aria-hidden="true" />
                            </a>
                            <a href="https://www.linkedin.com/in/aditya-kumar-38093a304/" title="LinkedIn" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white hover:text-black transition-all">
                                <FaLinkedin aria-hidden="true" />
                            </a>
                        </div>
                    </div>
                </address>

                {/* 2. Message Uplink Section */}
                <section className="lg:col-span-3">
                    <div className="p-10 rounded-[40px] bg-gradient-to-br from-white/[0.07] to-transparent border border-white/10 h-full relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" aria-hidden="true"></div>
                        
                        <h2 className="text-3xl font-black text-white mb-8">Send Transmissions</h2>
                        
                        {isSubmitted ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-6">
                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 border border-green-500/30 animate-pulse">
                                    <FaCheckCircle size={40} aria-hidden="true" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Message Uplinked</h3>
                                <p className="text-white/50 max-w-xs mx-auto">We've received your request and our team will analyze it shortly.</p>
                                <Button variant="outline" onClick={() => setIsSubmitted(false)} className="rounded-full border-white/10 hover:bg-white/5">
                                    New Message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] font-black text-white/40 ml-1">Identity</label>
                                        <Input id="name" name="name" placeholder="Full Name" required className="bg-white/[0.03] border-white/10 h-14 rounded-2xl focus:border-cyan-400 transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-black text-white/40 ml-1">Email Address</label>
                                        <Input id="email" name="email" type="email" placeholder="email@example.com" required className="bg-white/[0.03] border-white/10 h-14 rounded-2xl focus:border-cyan-400 transition-colors" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-[10px] uppercase tracking-[0.2em] font-black text-white/40 ml-1">Message Content</label>
                                    <Textarea id="message" name="message" placeholder="Describe your inquiry..." required className="bg-white/[0.03] border-white/10 min-h-[180px] rounded-2xl focus:border-cyan-400 transition-colors" />
                                </div>
                                
                                <Button 
                                    type="submit" 
                                    className="w-full h-16 text-lg font-black bg-white text-black hover:bg-cyan-400 transition-all rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] group"
                                    disabled={loading}
                                >
                                    {loading ? <FaSpinner className="animate-spin mr-3" /> : <FaPaperPlane className="mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                    {loading ? 'Processing...' : 'Send Message'}
                                </Button>
                            </form>
                        )}
                    </div>
                </section>
            </div>

            {/* LEGAL HUB INTERLINKING */}
            <nav style={styles.navBox} aria-label="Support Navigation">
                <Link href="/privacy" style={styles.navLink} title="Privacy Policy">
                    <FaLock aria-hidden="true" /> Privacy Engine <FaArrowRight size={8} />
                </Link>
                <Link href="/terms" style={styles.navLink} title="Terms of Service">
                    <FaGavel aria-hidden="true" /> Terms of Service <FaArrowRight size={8} />
                </Link>
                <Link href="/dmca" style={styles.navLink} title="IP Protection">
                    <FaShieldAlt aria-hidden="true" /> IP Protection <FaArrowRight size={8} />
                </Link>
                <Link href="/about" style={styles.navLink} title="Our Story">
                    <FaFileAlt aria-hidden="true" /> Our Story <FaArrowRight size={8} />
                </Link>
            </nav>

            <footer className="text-center mt-12 text-white/10 text-[10px] font-black uppercase tracking-[0.5em]">
                Encrypted Communication • PeerNotez
            </footer>
        </main>
    );
}