"use client";

import { 
    FaShieldAlt, FaGavel, FaEnvelope, FaExclamationTriangle, 
    FaFileContract, FaCheckCircle, FaUserSecret, 
    FaHistory, FaGlobe, FaArrowRight, FaLock, FaFileAlt, FaBookOpen, FaPenNib
} from 'react-icons/fa';
import Link from 'next/link';

export default function DMCAPageClient() {
    const designatedAgentEmail = "peerlox.support@gmail.com"; 
    const takedownDeadline = "36 hours"; 

    const styles = {
        wrapper: { paddingTop: 'clamp(2rem, 5vw, 4rem)', paddingBottom: 'clamp(4rem, 8vw, 8rem)', minHeight: '100vh' },
        header: { 
            textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)', padding: 'clamp(2rem, 5vw, 5rem) clamp(1rem, 4vw, 2rem)', 
            background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(12px)', 
            border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '40px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
        },
        title: { 
            fontSize: 'clamp(2rem, 6vw, 4.5rem)', fontWeight: '900', letterSpacing: '-2px',
            background: 'linear-gradient(135deg, #fff 0%, #00d4ff 50%, #ff00cc 100%)', 
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', 
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', gap: '20px', flexWrap: 'wrap'
        },
        subtitle: { 
            fontSize: 'clamp(1rem, 3vw, 1.25rem)', color: 'rgba(255, 255, 255, 0.6)', maxWidth: '800px', 
            margin: '0 auto', lineHeight: 1.8, fontWeight: '400'
        },
        grid: {
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
            gap: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: 'clamp(2rem, 5vw, 4rem)'
        },
        glassSection: { 
            background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', 
            border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '32px', 
            padding: 'clamp(1.5rem, 5vw, 3rem)', height: '100%'
        },
        sectionHeading: { 
            fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', fontWeight: '800', color: '#fff', 
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px' 
        },
        text: { color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.9, fontSize: '1.05rem', marginBottom: '1.2rem' },
        agentCard: { 
            background: 'linear-gradient(145deg, rgba(0, 212, 255, 0.1), rgba(255, 0, 204, 0.05))', 
            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', 
            padding: 'clamp(1.5rem, 5vw, 2.5rem)', textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 4rem)'
        },
        emailLink: { 
            color: '#00d4ff', fontWeight: '800', fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', textDecoration: 'none', 
            display: 'inline-block', marginTop: '1rem', padding: '10px 25px',
            background: 'rgba(0, 212, 255, 0.1)', borderRadius: '50px', wordBreak: 'break-all'
        },
        listItem: { 
            display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '1.2rem', 
            color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem', background: 'rgba(255,255,255,0.03)', 
            padding: '15px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'
        },
        warningBox: { 
            background: 'linear-gradient(to right, rgba(255, 0, 85, 0.15), transparent)', 
            borderLeft: '4px solid #ff0055', padding: 'clamp(1.2rem, 4vw, 2rem)', 
            borderRadius: '0 20px 20px 0', marginTop: '2rem' 
        },
        // 🔹 FIX: Adjusted spacing and layout for the navigation links
        navBox: { 
            display: 'flex', justifyContent: 'center', flexWrap: 'wrap', 
            gap: 'clamp(1rem, 3vw, 2rem)', marginTop: 'clamp(4rem, 8vw, 6rem)' 
        },
        navLink: {
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50px', color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600'
        },
        footerNotes: { 
            textAlign: 'center', marginTop: 'clamp(3rem, 6vw, 5rem)', 
            color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' 
        }
    };

    return (
        <article className="container mx-auto px-4" style={styles.wrapper}>
            <header style={styles.header}>
                <h1 style={styles.title}>
                    <FaShieldAlt aria-hidden="true" /> IP Protection & DMCA
                </h1>
                <p style={styles.subtitle}>
                    PeerLox is an academic ecosystem built on respect. We strictly abide by the Digital Millennium Copyright Act (DMCA), the EU Copyright Directive, and Section 79 of the Indian IT Act (2000).
                </p>
            </header>

            <div style={styles.grid}>
                <section style={styles.glassSection}>
                    <h2 style={styles.sectionHeading}><FaGavel style={{color: '#ffcc00'}} aria-hidden="true" /> Safe Harbor Compliance</h2>
                    <div style={styles.text}>
                        <p>
                            PeerLox operates strictly as an intermediary service provider. Under the <strong>&quot;Safe Harbor&quot;</strong> provisions of international copyright law, PeerLox is not directly liable for the materials users upload, provided we act expeditiously to remove or disable access to infringing material upon receiving a valid legal notice.
                        </p>
                    </div>
                </section>

                <section style={styles.glassSection}>
                    <h2 style={styles.sectionHeading}><FaBookOpen style={{color: '#00d4ff'}} aria-hidden="true" /> Fair Use in Education</h2>
                    <div style={styles.text}>
                        <p>
                            Because PeerLox is an educational platform, certain user uploads may fall under <strong>&quot;Fair Use&quot;</strong> (or &quot;Fair Dealing&quot; under Indian law). This includes brief quotations, transformative commentary, or the sharing of self-written notes that reference factual data. We evaluate all takedown requests with this academic context in mind.
                        </p>
                    </div>
                </section>
            </div>

            <section style={{...styles.glassSection, marginBottom: 'clamp(2rem, 5vw, 4rem)'}}>
                <h2 style={styles.sectionHeading}><FaFileContract style={{color: '#ff00cc'}} aria-hidden="true" /> Filing a Takedown Notice</h2>
                <div style={styles.text}>
                    <p>If you are a copyright owner, or authorized to act on behalf of one, and you believe that material on PeerLox infringes upon your copyrights, you must submit a formal notice containing the following elements:</p>
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                        <div style={styles.listItem}><FaCheckCircle style={{color: '#00ffaa', flexShrink: 0}} aria-hidden="true" /> <div><strong>Identification:</strong> A physical or electronic signature of the copyright owner.</div></div>
                        <div style={styles.listItem}><FaCheckCircle style={{color: '#00ffaa', flexShrink: 0}} aria-hidden="true" /> <div><strong>Specific URLs:</strong> The exact PeerLox URLs of the infringing material. General site links are invalid.</div></div>
                        <div style={styles.listItem}><FaCheckCircle style={{color: '#00ffaa', flexShrink: 0}} aria-hidden="true" /> <div><strong>Contact Info:</strong> Your full name, mailing address, telephone number, and email address.</div></div>
                        <div style={styles.listItem}><FaCheckCircle style={{color: '#00ffaa', flexShrink: 0}} aria-hidden="true" /> <div><strong>Good Faith Statement:</strong> A statement that the use of the material is not authorized by the copyright owner or the law.</div></div>
                    </div>
                    <p className="mt-4 text-sm opacity-70">
                        * Under 17 U.S.C. § 512(f), any person who knowingly materially misrepresents that material or activity is infringing may be subject to severe legal liability and damages.
                    </p>
                </div>
            </section>

            <address style={styles.agentCard}>
                <FaEnvelope size={40} style={{color: '#00d4ff', marginBottom: '1rem'}} aria-hidden="true" />
                <h3 style={{color: '#fff', fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', fontWeight: '800', fontStyle: 'normal'}}>Designated Copyright Agent</h3>
                <p style={{color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '1rem auto', fontStyle: 'normal'}}>
                    Please email formal legal notices to the address below. To ensure immediate attention, use the subject line <strong>&quot;URGENT: COPYRIGHT TAKEDOWN&quot;</strong>.
                </p>
                <a href={`mailto:${designatedAgentEmail}`} style={styles.emailLink}>{designatedAgentEmail}</a>
                <p style={{marginTop: '1.5rem', color: '#ff00cc', fontSize: '0.9rem', fontWeight: '600', fontStyle: 'normal'}}>
                    Average Processing Time: {takedownDeadline}
                </p>
            </address>

            <div style={{...styles.grid, marginBottom: '0'}}>
                <section style={{...styles.glassSection, borderColor: 'rgba(255, 0, 85, 0.3)'}}>
                    <h2 style={styles.sectionHeading}><FaExclamationTriangle style={{color: '#ff0055'}} aria-hidden="true" /> Repeat Infringer Policy</h2>
                    <div style={styles.text}>
                        <p>PeerLox actively protects creators by maintaining a strict &quot;Three-Strikes&quot; policy.</p>
                        <aside style={styles.warningBox}>
                            <div className="flex gap-4 items-center">
                                <FaUserSecret size={40} style={{color: '#ff0055', flexShrink: 0}} aria-hidden="true" />
                                <div>
                                    <strong style={{color: '#ff0055', display: 'block'}}>Account Termination</strong>
                                    <p className="text-sm m-0 mt-1" style={{color: 'rgba(255,255,255,0.8)'}}>Users identified as repeat infringers will have their accounts permanently terminated, their OAuth tokens revoked, and their IP addresses blacklisted from future registration.</p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </section>

                <section style={styles.glassSection}>
                    <h2 style={styles.sectionHeading}><FaPenNib style={{color: '#00ffaa'}} aria-hidden="true" /> Filing a Counter-Notice</h2>
                    <div style={styles.text}>
                        <p>
                            If you are a student whose notes were removed by mistake or misidentification, you have the right to file a Counter-Notice.
                        </p>
                        <ul className="mt-4 space-y-2 opacity-80 text-sm list-disc pl-4">
                            <li>You must explicitly state under penalty of perjury that you possess the rights to the removed content.</li>
                            <li>You must consent to the jurisdiction of the courts where you reside.</li>
                            <li>Upon receiving a valid Counter-Notice, PeerLox will restore the material in 10-14 business days, unless the original claimant files a court order against you.</li>
                        </ul>
                    </div>
                </section>
            </div>

            <nav aria-label="Legal Navigation" style={styles.navBox}>
                <Link href="/privacy" style={styles.navLink} title="Privacy Policy">
                    <FaLock /> Privacy Engine <FaArrowRight size={12} />
                </Link>
                <Link href="/terms" style={styles.navLink} title="Terms of Service">
                    <FaGavel /> Terms of Service <FaArrowRight size={12} />
                </Link>
                <Link href="/about" style={styles.navLink} title="About Us">
                    <FaFileAlt /> About PeerLox <FaArrowRight size={12} />
                </Link>
            </nav>

            <footer style={styles.footerNotes}>
                <p><FaHistory style={{marginRight: '8px', display: 'inline'}} aria-hidden="true" /> Last Updated: February 2026</p>
                <p style={{marginTop: '0.5rem'}}>Designed for academic integrity and the protection of student creators.</p>
            </footer>
        </article>
    );
}