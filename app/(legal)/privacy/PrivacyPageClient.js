"use client";

import { 
    FaLock, FaUserShield, FaEnvelopeOpenText, FaUserCheck, 
    FaShieldAlt, FaCookieBite, FaServer, FaUserSecret, 
    FaArrowRight, FaFileAlt, FaGavel 
} from 'react-icons/fa';
import Link from 'next/link';

export default function PrivacyPageClient() {
    const contactEmail = "aadiwrld01@gmail.com"; 

    const styles = {
        wrapper: { paddingTop: '4rem', paddingBottom: '8rem', minHeight: '100vh' },
        header: { textAlign: 'center', marginBottom: '5rem' },
        title: { 
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900', letterSpacing: '-2px',
            background: 'linear-gradient(135deg, #fff 0%, #00d4ff 50%, #ff00cc 100%)', 
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', 
            marginBottom: '1rem', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', gap: '20px' 
        },
        badge: {
            background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff',
            padding: '5px 15px', borderRadius: '50px', fontSize: '0.8rem',
            fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'
        },
        sectionCard: { 
            background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(15px)', 
            borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.08)', 
            padding: '3.5rem', marginBottom: '3rem', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            position: 'relative', overflow: 'hidden'
        },
        sectionHeading: { 
            fontSize: '2rem', fontWeight: '800', color: '#fff', 
            marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px' 
        },
        subHeading: { 
            fontSize: '1.4rem', fontWeight: '700', color: '#00d4ff', 
            marginTop: '2.5rem', marginBottom: '1.2rem', display: 'flex',
            alignItems: 'center', gap: '10px'
        },
        listItem: { 
            background: 'rgba(255, 255, 255, 0.03)', borderLeft: '4px solid #ff00cc', 
            padding: '1.2rem 1.5rem', marginBottom: '1rem', borderRadius: '0 16px 16px 0', 
            color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.7, fontSize: '1.05rem'
        },
        contactCard: { 
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(255, 0, 204, 0.05))', 
            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', 
            padding: '3rem', textAlign: 'center', marginTop: '4rem' 
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
                <div style={{marginBottom: '1rem'}}><span style={styles.badge}>Security Verified</span></div>
                <h1 style={styles.title}><FaLock aria-hidden="true" /> Privacy Engine</h1>
                <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem'}}>
                    Your data is your property. We are just the custodians. <br/>
                    <span style={{fontSize: '0.9rem', color: '#ff00cc'}}>Version 2.0.1 • Updated Feb 2026</span>
                </p>
            </header>

            

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaUserShield style={{color: '#00ffaa'}} aria-hidden="true" /> Data Architecture</h2>
                <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: '2rem'}}>
                    We follow the principle of <strong>Data Minimization</strong>. We only collect what is strictly necessary to run the PeerNotez ecosystem.
                </p>
                
                <h3 style={styles.subHeading}><FaUserSecret aria-hidden="true" /> Information You Provide</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div style={styles.listItem}>
                        <strong>Identity:</strong> Google Profile data (Name, Email, Avatar) via OAuth 2.0.
                    </div>
                    <div style={styles.listItem}>
                        <strong>Academic:</strong> University name, course details, and subject interests.
                    </div>
                    <div style={styles.listItem}>
                        <strong>Content:</strong> Any notes, blogs, or reviews you choose to publish.
                    </div>
                    <div style={styles.listItem}>
                        <strong>Social:</strong> Your followers, following list, and saved collections.
                    </div>
                </div>

                <h3 style={styles.subHeading}><FaServer aria-hidden="true" /> System Logs</h3>
                <p style={{color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem'}}>
                    Our servers automatically log your IP address and browser type to prevent DDoS attacks and account hijacking. This data is purged every 30 days.
                </p>
            </section>
            
            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaShieldAlt style={{color: '#ff00cc'}} aria-hidden="true" /> Security Infrastructure</h2>
                <p style={{color: 'rgba(255,255,255,0.7)', marginBottom: '2rem'}}>
                    We utilize industry-standard encryption and trusted third-party sub-processors to handle your assets.
                </p>
                <div className="space-y-4">
                    <div style={styles.listItem}>
                        <strong>Encryption:</strong> All data in transit is protected via TLS 1.3 (SSL).
                    </div>
                    <div style={styles.listItem}>
                        <strong>Storage:</strong> Assets are decentralized across Azure Blob Storage and Cloudflare R2.
                    </div>
                    <div style={styles.listItem}>
                        <strong>Database:</strong> Azure Cosmos DB with Field Level Encryption (FLE).
                    </div>
                </div>
            </section>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaCookieBite style={{color: '#ffdd00'}} aria-hidden="true" /> Cookie Policy</h2>
                <div style={{color: 'rgba(255,255,255,0.7)', lineHeight: 1.8}}>
                    <p>We do not use tracking cookies for advertising. We only use <strong>Essential Cookies</strong> for:</p>
                    <ul className="mt-4 space-y-2">
                        <li>• Maintaining your active login session.</li>
                        <li>• Remembering your "Dark Mode" preferences.</li>
                        <li>• Preventing Cross-Site Request Forgery (CSRF).</li>
                    </ul>
                </div>
            </section>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaUserCheck style={{color: '#00d4ff'}} aria-hidden="true" /> Your Sovereignty</h2>
                <p style={{color: 'rgba(255,255,255,0.7)', marginBottom: '2rem'}}>Under GDPR and the Digital Personal Data Protection Act, you hold total control over your digital footprint.</p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div style={{...styles.listItem, borderLeftColor: '#00d4ff'}}>
                        <strong>Right to Portability:</strong> Request a JSON export of all your notes and data.
                    </div>
                    <div style={{...styles.listItem, borderLeftColor: '#00d4ff'}}>
                        <strong>Right to Erasure:</strong> Delete your account to instantly purge your data from our active database.
                    </div>
                </div>
            </section>
            
            <address style={styles.contactCard}>
                <FaEnvelopeOpenText size={40} style={{color: '#00d4ff', marginBottom: '1.5rem'}} aria-hidden="true" />
                <h2 style={{color: '#fff', fontSize: '1.8rem', fontWeight: '800', fontStyle: 'normal'}}>Privacy Inquiries</h2>
                <p style={{color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', maxWidth: '500px', margin: '1rem auto', fontStyle: 'normal'}}>
                    Need to exercise your data rights? Our privacy officer is available for direct communication.
                </p>
                <a href={`mailto:${contactEmail}`} style={{
                    color: '#fff', fontWeight: '800', textDecoration: 'none', 
                    fontSize: '1.2rem', background: '#ff00cc', padding: '12px 30px',
                    borderRadius: '50px', display: 'inline-block'
                }}>{contactEmail}</a>
            </address>

            <nav aria-label="Legal Directory" style={styles.navBox}>
                <Link href="/terms" style={styles.navLink} title="Terms of Service">
                    <FaGavel aria-hidden="true" /> Terms of Service <FaArrowRight size={12} />
                </Link>
                <Link href="/dmca" style={styles.navLink} title="DMCA Policy">
                    <FaShieldAlt aria-hidden="true" /> DMCA Policy <FaArrowRight size={12} />
                </Link>
                <Link href="/about" style={styles.navLink} title="About Us">
                    <FaFileAlt aria-hidden="true" /> About PeerNotez <FaArrowRight size={12} />
                </Link>
            </nav>

            <footer style={{textAlign: 'center', marginTop: '4rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem'}}>
                &copy; 2026 PeerNotez. Designed for privacy, built for students.
            </footer>
        </article>
    );
}