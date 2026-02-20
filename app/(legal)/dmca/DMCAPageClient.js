"use client";

import { 
    FaShieldAlt, FaGavel, FaEnvelope, FaExclamationTriangle, 
    FaFileContract, FaCheckCircle, FaBalanceScale, FaUserSecret, 
    FaHistory, FaGlobe, FaArrowRight, FaLock, FaFileAlt 
} from 'react-icons/fa';
import Link from 'next/link';

export default function DMCAPageClient() {
    const designatedAgentEmail = "aadiwrld01@gmail.com"; 
    const takedownDeadline = "36 hours"; 

    const styles = {
        wrapper: { paddingTop: '4rem', paddingBottom: '8rem', minHeight: '100vh' },
        header: { 
            textAlign: 'center', marginBottom: '5rem', padding: '5rem 2rem', 
            background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(12px)', 
            border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '40px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
        },
        title: { 
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900', letterSpacing: '-2px',
            background: 'linear-gradient(135deg, #fff 0%, #00d4ff 50%, #ff00cc 100%)', 
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', 
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', gap: '20px' 
        },
        subtitle: { 
            fontSize: '1.25rem', color: 'rgba(255, 255, 255, 0.6)', maxWidth: '800px', 
            margin: '0 auto', lineHeight: 1.8, fontWeight: '400'
        },
        grid: {
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem', marginBottom: '4rem'
        },
        glassSection: { 
            background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', 
            border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '32px', 
            padding: '3rem', height: '100%'
        },
        sectionHeading: { 
            fontSize: '1.6rem', fontWeight: '800', color: '#fff', 
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px' 
        },
        text: { color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.9, fontSize: '1.05rem', marginBottom: '1.2rem' },
        agentCard: { 
            background: 'linear-gradient(145deg, rgba(0, 212, 255, 0.1), rgba(255, 0, 204, 0.05))', 
            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', 
            padding: '2.5rem', textAlign: 'center', marginTop: '3rem'
        },
        emailLink: { 
            color: '#00d4ff', fontWeight: '800', fontSize: '1.4rem', textDecoration: 'none', 
            display: 'inline-block', marginTop: '1rem', padding: '10px 25px',
            background: 'rgba(0, 212, 255, 0.1)', borderRadius: '50px'
        },
        listItem: { 
            display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '1.2rem', 
            color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem', background: 'rgba(255,255,255,0.03)', 
            padding: '15px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'
        },
        warningBox: { 
            background: 'linear-gradient(to right, rgba(255, 0, 85, 0.15), transparent)', 
            borderLeft: '4px solid #ff0055', padding: '2rem', borderRadius: '0 20px 20px 0', marginTop: '2rem' 
        },
        navBox: { display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginTop: '5rem' },
        navLink: {
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50px', color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600'
        },
        footerNotes: { textAlign: 'center', marginTop: '4rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }
    };

    return (
        <article className="container mx-auto px-4" style={styles.wrapper}>
            <header style={styles.header}>
                <h1 style={styles.title}>
                    <FaShieldAlt aria-hidden="true" /> IP Protection & DMCA
                </h1>
                <p style={styles.subtitle}>
                    PeerNotez is committed to the protection of intellectual property rights. We abide by the Digital Millennium Copyright Act (DMCA), the EU Copyright Directive, and Section 79 of the Indian IT Act (2000).
                </p>
            </header>

            <div style={styles.grid}>
                <section style={styles.glassSection}>
                    <h2 style={styles.sectionHeading}><FaGavel style={{color: '#ffcc00'}} aria-hidden="true" /> Safe Harbor Compliance</h2>
                    <div style={styles.text}>
                        <p>
                            PeerNotez is an intermediary platform. Under the <strong>"Safe Harbor"</strong> provisions, we are not liable for user-uploaded content, provided we act expeditiously to remove infringing material.
                        </p>
                    </div>
                </section>

                <section style={styles.glassSection}>
                    <h2 style={styles.sectionHeading}><FaGlobe style={{color: '#00d4ff'}} aria-hidden="true" /> Global Jurisdiction</h2>
                    <div style={styles.text}>
                        <p>
                            We comply with the <strong>Information Technology Rules, 2021</strong>. All legal notices are reviewed by our compliance team to ensure validity before access to content is restricted.
                        </p>
                    </div>
                </section>
            </div>

            <section style={styles.glassSection}>
                <h2 style={styles.sectionHeading}><FaFileContract style={{color: '#ff00cc'}} aria-hidden="true" /> Takedown Requirements</h2>
                <div style={styles.text}>
                    <p>Your claim <strong>must</strong> include the following elements to be legally valid:</p>
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                        <div style={styles.listItem}><FaCheckCircle style={{color: '#00ffaa'}} aria-hidden="true" /> Identification of the copyrighted work.</div>
                        <div style={styles.listItem}><FaCheckCircle style={{color: '#00ffaa'}} aria-hidden="true" /> Specific URLs of the infringing material.</div>
                        <div style={styles.listItem}><FaCheckCircle style={{color: '#00ffaa'}} aria-hidden="true" /> Your contact info (Phone/Email).</div>
                        <div style={styles.listItem}><FaCheckCircle style={{color: '#00ffaa'}} aria-hidden="true" /> Statement of "Good Faith Belief".</div>
                    </div>
                </div>
            </section>

            <address style={styles.agentCard}>
                <FaEnvelope size={40} style={{color: '#00d4ff', marginBottom: '1rem'}} aria-hidden="true" />
                <h3 style={{color: '#fff', fontSize: '1.8rem', fontWeight: '800', fontStyle: 'normal'}}>Designated Copyright Agent</h3>
                <p style={{color: 'rgba(255,255,255,0.6)', maxWidth: '500px', margin: '1rem auto', fontStyle: 'normal'}}>
                    Please email formal legal notices to the address below. Priority is given to emails with the subject line "URGENT: COPYRIGHT TAKEDOWN".
                </p>
                <a href={`mailto:${designatedAgentEmail}`} style={styles.emailLink}>{designatedAgentEmail}</a>
                <p style={{marginTop: '1.5rem', color: '#ff00cc', fontSize: '0.9rem', fontWeight: '600', fontStyle: 'normal'}}>
                    Average Processing Time: {takedownDeadline}
                </p>
            </address>

            <section style={{...styles.glassSection, borderColor: 'rgba(255, 0, 85, 0.3)', marginTop: '4rem'}}>
                <h2 style={styles.sectionHeading}><FaExclamationTriangle style={{color: '#ff0055'}} aria-hidden="true" /> Repeat Infringer Policy</h2>
                <div style={styles.text}>
                    <p>PeerNotez implements a strict "Three-Strikes" policy regarding copyright infringement.</p>
                    <aside style={styles.warningBox}>
                        <div className="flex gap-4 items-center">
                            <FaUserSecret size={40} style={{color: '#ff0055'}} aria-hidden="true" />
                            <div>
                                <strong style={{color: '#ff0055', display: 'block'}}>Account Termination</strong>
                                <p className="text-sm m-0">Users identified as repeat infringers will have their accounts and IP addresses permanently blacklisted.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            {/* LEGAL HUB INTERLINKING - CRITICAL FOR SEO */}
            <nav aria-label="Legal Navigation" style={styles.navBox}>
                <Link href="/privacy" style={styles.navLink} title="Privacy Policy">
                    <FaLock /> Privacy Engine <FaArrowRight size={12} />
                </Link>
                <Link href="/terms" style={styles.navLink} title="Terms of Service">
                    <FaGavel /> Terms of Service <FaArrowRight size={12} />
                </Link>
                <Link href="/about" style={styles.navLink} title="About Us">
                    <FaFileAlt /> About PeerNotez <FaArrowRight size={12} />
                </Link>
            </nav>

            <footer style={styles.footerNotes}>
                <p><FaHistory style={{marginRight: '8px'}} aria-hidden="true" /> Last Updated: February 2026</p>
                <p>Designed for academic integrity and the protection of student creators.</p>
            </footer>
        </article>
    );
}