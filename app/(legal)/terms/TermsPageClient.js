"use client";

import Link from 'next/link';
import { 
    FaBookReader, FaGavel, FaBan, FaShieldAlt, 
    FaUserCheck, FaBalanceScale, FaHandshake, FaExclamationCircle, 
    FaArrowRight, FaLock, FaFileAlt 
} from 'react-icons/fa';

export default function TermsPageClient() {
    const styles = {
        wrapper: { paddingTop: '4rem', paddingBottom: '8rem', minHeight: '100vh' },
        header: { textAlign: 'center', marginBottom: '5rem' },
        title: { 
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900', letterSpacing: '-2px',
            background: 'linear-gradient(135deg, #fff 0%, #00d4ff 50%, #ffcc00 100%)', 
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', 
            marginBottom: '1rem', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', gap: '20px' 
        },
        badge: {
            background: 'rgba(255, 204, 0, 0.1)', color: '#ffcc00', padding: '5px 15px', 
            borderRadius: '50px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase'
        },
        sectionCard: { 
            background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(15px)', 
            borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.08)', 
            padding: '3.5rem', marginBottom: '3rem', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' 
        },
        sectionHeading: { 
            fontSize: '2rem', fontWeight: '800', color: '#fff', 
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px' 
        },
        text: { color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.8, fontSize: '1.05rem' },
        listItem: { 
            background: 'rgba(255, 255, 255, 0.03)', borderLeft: '4px solid #ffcc00', 
            padding: '1.2rem 1.5rem', marginBottom: '1rem', borderRadius: '0 16px 16px 0', 
            color: 'rgba(255, 255, 255, 0.85)', fontSize: '1rem'
        },
        warningBox: { 
            background: 'linear-gradient(to right, rgba(255, 0, 85, 0.1), transparent)', 
            borderLeft: '4px solid #ff0055', padding: '2rem', borderRadius: '0 20px 20px 0', 
            marginTop: '2rem', color: '#ffb3c1'
        },
        navBox: { display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginTop: '5rem' },
        navLink: {
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50px', color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600'
        }
    };

    return (
        <article className='container mx-auto px-4' style={styles.wrapper}>
            <header style={styles.header}>
                <div style={{marginBottom: '1rem'}}><span style={styles.badge}>User Agreement</span></div>
                <h1 style={styles.title}><FaBookReader aria-hidden="true" /> Terms of Power</h1>
                <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem'}}>
                    Please read carefully. By using PeerNotez, you enter a legal binding contract. <br/>
                    <span style={{fontSize: '0.9rem', color: '#ffcc00'}}>Revision: Feb 2026</span>
                </p>
            </header>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaHandshake style={{color: '#00ffaa'}} aria-hidden="true" /> 1. The Covenant</h2>
                <div style={styles.text}>
                    <p>
                        By accessing PeerNotez, you confirm that you are at least 13 years of age (or the minimum age of digital consent in your country). You agree to be bound by these Terms, our <Link href="/privacy" title="Privacy Policy" style={{color: '#00d4ff', fontWeight: 'bold'}}>Privacy Engine</Link>, and our <Link href="/dmca" title="DMCA Policy" style={{color: '#ff00cc', fontWeight: 'bold'}}>Copyright Policy</Link>.
                    </p>
                </div>
            </section>
            
            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaShieldAlt style={{color: '#ffcc00'}} aria-hidden="true" /> 2. Content Ownership & License</h2>
                <div style={styles.text}>
                    <p className="mb-6">You retain all ownership rights to the original academic materials you upload. However, by posting content to PeerNotez, you grant us a worldwide, non-exclusive, royalty-free license to host, store, and display your work.</p>
                    
                    <h3 style={{color: '#fff', fontSize: '1.2rem', marginBottom: '1rem'}}>Prohibited Content:</h3>
                    <div style={styles.listItem}><strong>Stolen IP:</strong> You must not upload textbooks, paid course materials, or work that is not yours.</div>
                    <div style={styles.listItem}><strong>Academic Integrity:</strong> You must not upload live exam answers or materials that facilitate active cheating.</div>
                    <div style={styles.listItem}><strong>Malicious Data:</strong> No scripts, viruses, or automated scraping bots.</div>

                    <aside style={styles.warningBox}>
                        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                            <FaExclamationCircle size={24} aria-hidden="true" />
                            <span><strong>Indemnification:</strong> You are legally responsible for your uploads. You agree to protect PeerNotez from any legal fees arising from your breach of copyright.</span>
                        </div>
                    </aside>
                </div>
            </section>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaUserCheck style={{color: '#00d4ff'}} aria-hidden="true" /> 3. User Conduct</h2>
                <div style={styles.text}>
                    <p>PeerNotez is a sanctuary for learners. We reserve the right to ban any user who engages in:</p>
                    <ul className="mt-4 space-y-3">
                        <li>• Harassment or hate speech in the Blog or Chat sections.</li>
                        <li>• Attempting to circumvent our download or view limits.</li>
                        <li>• Impersonating other students or professors.</li>
                    </ul>
                </div>
            </section>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaBan style={{color: '#ff0055'}} aria-hidden="true" /> 4. Termination of Access</h2>
                <div style={styles.text}>
                    <p>
                        We may suspend or terminate your access to PeerNotez at any time, without notice, if we believe you have violated these terms. Specifically, any violation of our <strong>Repeat Infringer Policy</strong> (as detailed in our <Link href="/dmca" title="DMCA Policy" style={{color: '#ff00cc'}}>DMCA page</Link>) will result in an immediate and permanent ban.
                    </p>
                </div>
            </section>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaBalanceScale style={{color: '#00ffaa'}} aria-hidden="true" /> 5. Limitation of Liability</h2>
                <div style={styles.text}>
                    <p>
                        PeerNotez provides its service "AS IS." We do not guarantee the accuracy of any user-uploaded notes. Use of materials found on this site for graded assignments is at your own risk. We are not responsible for any academic disciplinary actions taken against you by your institution.
                    </p>
                </div>
            </section>

            {/* LEGAL HUB INTERLINKING */}
            <nav aria-label="Legal Directory" style={styles.navBox}>
                <Link href="/privacy" style={styles.navLink} title="Privacy Policy">
                    <FaLock aria-hidden="true" /> Privacy Engine <FaArrowRight size={12} />
                </Link>
                <Link href="/dmca" style={styles.navLink} title="DMCA Policy">
                    <FaShieldAlt aria-hidden="true" /> IP Protection <FaArrowRight size={12} />
                </Link>
                <Link href="/about" style={styles.navLink} title="About Us">
                    <FaFileAlt aria-hidden="true" /> About PeerNotez <FaArrowRight size={12} />
                </Link>
            </nav>

            <footer style={{textAlign: 'center', marginTop: '4rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem'}}>
                &copy; 2026 PeerNotez Legal. Build your future, respect the past.
            </footer>
        </article>
    );
}