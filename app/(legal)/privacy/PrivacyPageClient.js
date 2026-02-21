"use client";

import { 
    FaLock, FaUserShield, FaEnvelopeOpenText, FaUserCheck, 
    FaShieldAlt, FaCookieBite, FaServer, FaUserSecret, 
    FaArrowRight, FaFileAlt, FaGavel, FaGoogle, FaTrashAlt, FaShareAlt
} from 'react-icons/fa';
import Link from 'next/link';

export default function PrivacyPageClient() {
    const contactEmail = "peerlox.support@gmail.com"; 

    const styles = {
        // 🔹 Responsive paddings using clamp()
        wrapper: { paddingTop: 'clamp(2rem, 5vw, 4rem)', paddingBottom: 'clamp(4rem, 8vw, 8rem)', minHeight: '100vh' },
        header: { textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)' },
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
            // 🔹 Shrinks to 1.5rem on mobile, 3.5rem on desktop
            padding: 'clamp(1.5rem, 5vw, 3.5rem)', 
            marginBottom: 'clamp(2rem, 5vw, 3rem)', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            position: 'relative', overflow: 'hidden'
        },
        sectionHeading: { 
            fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800', color: '#fff', 
            marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px' 
        },
        subHeading: { 
            fontSize: 'clamp(1.2rem, 3vw, 1.4rem)', fontWeight: '700', color: '#00d4ff', 
            marginTop: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '1.2rem', display: 'flex',
            alignItems: 'center', gap: '10px'
        },
        listItem: { 
            background: 'rgba(255, 255, 255, 0.03)', borderLeft: '4px solid #ff00cc', 
            // 🔹 Inner list padding shrinks on mobile
            padding: 'clamp(1rem, 3vw, 1.2rem) clamp(1rem, 4vw, 1.5rem)', 
            marginBottom: '1rem', borderRadius: '0 16px 16px 0', 
            color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.7, fontSize: '1.05rem'
        },
        contactCard: { 
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(255, 0, 204, 0.05))', 
            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', 
            padding: 'clamp(1.5rem, 5vw, 3rem)', textAlign: 'center', marginTop: 'clamp(2rem, 5vw, 4rem)' 
        },
        navBox: { display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginTop: 'clamp(3rem, 6vw, 5rem)' },
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
                    <span style={{fontSize: '0.9rem', color: '#ff00cc'}}>Version 2.1.0 • Updated Feb 2026</span>
                </p>
            </header>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaUserShield style={{color: '#00ffaa'}} aria-hidden="true" /> 1. Data Architecture</h2>
                <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: '2rem'}}>
                    We follow the strict principle of <strong>Data Minimization</strong>. We only collect what is strictly necessary to run the PeerLox ecosystem in compliance with global privacy standards, including the Digital Personal Data Protection Act (DPDP) and GDPR.
                </p>
                
                <h3 style={styles.subHeading}><FaUserSecret aria-hidden="true" /> Information You Provide</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div style={styles.listItem}>
                        <strong>Identity:</strong> Google Profile data (Name, Email, Avatar) via OAuth 2.0. We do not process or store passwords.
                    </div>
                    <div style={styles.listItem}>
                        <strong>Academic:</strong> University name, course details, and subject interests you voluntarily add to your profile.
                    </div>
                    <div style={styles.listItem}>
                        <strong>Content:</strong> Any notes, PDFs, blogs, chat messages, or reviews you choose to publish on the platform.
                    </div>
                    <div style={styles.listItem}>
                        <strong>Social & Analytics:</strong> Your followers, following list, saved collections, and basic interaction telemetry to improve the app.
                    </div>
                </div>
            </section>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaGoogle style={{color: '#4285F4'}} aria-hidden="true" /> 2. Google OAuth & API Services Disclosure</h2>
                <p style={{color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', lineHeight: '1.8'}}>
                    PeerLox&apos;s use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" style={{color: '#00d4ff', textDecoration: 'underline'}}>Google API Services User Data Policy</a>, including the Limited Use requirements.
                </p>
                
                <h3 style={styles.subHeading}>Scope of Google Data Collected</h3>
                <div style={styles.listItem}>
                    We request the minimum necessary OAuth scopes: <code>openid</code>, <code>profile</code>, and <code>email</code>. This provides us solely with your public Google Name, Email Address, and Profile Picture URL.
                </div>

                <h3 style={styles.subHeading}>Limited Use & Strict Prohibitions</h3>
                <ul className="space-y-4">
                    <li style={styles.listItem}>
                        <strong>No Data Selling:</strong> We absolutely do not sell, rent, lease, or trade your Google data, or any derived data, to third-party advertising networks, data brokers, or marketing agencies.
                    </li>
                    <li style={styles.listItem}>
                        <strong>Strict Functional Use:</strong> Your Google data is used exclusively to provision your PeerLox account, visually identify you to other users (via your avatar and name), and send you essential service notifications.
                    </li>
                    <li style={styles.listItem}>
                        <strong>No Human Reading:</strong> No human will read your Google data or personal communications, unless explicitly required for security purposes, to comply with applicable law, or if you request technical support.
                    </li>
                </ul>
            </section>
            
            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaShareAlt style={{color: '#ffcc00'}} aria-hidden="true" /> 3. Third-Party Data Sharing</h2>
                <p style={{color: 'rgba(255,255,255,0.7)', marginBottom: '2rem'}}>
                    To operate PeerLox, we securely share necessary data fragments with trusted, compliance-verified infrastructure partners. <strong>We do not share your Google OAuth data for marketing.</strong>
                </p>
                <div className="space-y-4">
                    <div style={styles.listItem}>
                        <strong>Database Hosting (MongoDB Atlas):</strong> Stores your profile text, relationships, and chat histories securely.
                    </div>
                    <div style={styles.listItem}>
                        <strong>Media Hosting (Cloudinary / Vercel Blob):</strong> Stores files, PDFs, and images you upload.
                    </div>
                    <div style={styles.listItem}>
                        <strong>Real-time Infrastructure (Ably):</strong> Facilitates instant chat delivery and typing indicators. Messages are transmitted securely via WebSockets.
                    </div>
                </div>
            </section>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaServer style={{color: '#ff00cc'}} aria-hidden="true" /> 4. Security & Storage Infrastructure</h2>
                <p style={{color: 'rgba(255,255,255,0.7)', marginBottom: '2rem'}}>
                    We treat your data with military-grade respect.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div style={styles.listItem}>
                        <strong>In-Transit Encryption:</strong> All data moving between your device and our servers is encrypted using TLS 1.3 (SSL).
                    </div>
                    <div style={styles.listItem}>
                        <strong>At-Rest Encryption:</strong> Our databases utilize AES-256 encryption at rest.
                    </div>
                </div>
            </section>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaTrashAlt style={{color: '#ff5555'}} aria-hidden="true" /> 5. Data Retention & Deletion</h2>
                <div style={{color: 'rgba(255,255,255,0.7)', lineHeight: 1.8}}>
                    <p className="mb-4">
                        We keep your personal information only for as long as your account is active. 
                    </p>
                    <div style={styles.listItem}>
                        <strong>Account Deletion:</strong> If you choose to delete your account, your Google OAuth profile data, personal information, and chat histories are permanently and irreversibly purged from our active databases within 30 days.
                    </div>
                    <div style={styles.listItem}>
                        <strong>Revoking Access:</strong> You may instantly revoke PeerLox&apos;s access to your Google account at any time by visiting your Google Account Security settings (myaccount.google.com/permissions).
                    </div>
                </div>
            </section>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaCookieBite style={{color: '#ffdd00'}} aria-hidden="true" /> 6. Cookie Policy</h2>
                <div style={{color: 'rgba(255,255,255,0.7)', lineHeight: 1.8}}>
                    <p>We do not use invasive tracking cookies. We utilize <strong>Essential Cookies</strong> strictly for:</p>
                    <ul className="mt-4 space-y-2">
                        <li>• Securely maintaining your NextAuth.js active login session.</li>
                        <li>• Remembering your UI preferences (like Dark Mode).</li>
                        <li>• Preventing Cross-Site Request Forgery (CSRF) attacks.</li>
                    </ul>
                </div>
            </section>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaUserCheck style={{color: '#00d4ff'}} aria-hidden="true" /> 7. Your Sovereignty</h2>
                <p style={{color: 'rgba(255,255,255,0.7)', marginBottom: '2rem'}}>Under GDPR and the DPDP Act (India), you hold the status of a <strong>Data Principal</strong> and maintain total control over your digital footprint.</p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div style={{...styles.listItem, borderLeftColor: '#00d4ff'}}>
                        <strong>Right to Access:</strong> You can request a copy of the personal data we hold about you.
                    </div>
                    <div style={{...styles.listItem, borderLeftColor: '#00d4ff'}}>
                        <strong>Right to Erasure:</strong> You can request full deletion of your profile and data.
                    </div>
                </div>
            </section>
            
            <address style={styles.contactCard}>
                <FaEnvelopeOpenText size={40} style={{color: '#00d4ff', marginBottom: '1.5rem'}} aria-hidden="true" />
                <h2 style={{color: '#fff', fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', fontWeight: '800', fontStyle: 'normal'}}>Grievance Redressal & Support</h2>
                <p style={{color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', maxWidth: '600px', margin: '1rem auto', fontStyle: 'normal'}}>
                    Have questions about this Privacy Policy, your Google data, or wish to exercise your rights to data deletion? Contact our Data Protection Officer directly:
                </p>
                <a href={`mailto:${contactEmail}`} style={{
                    color: '#fff', fontWeight: '800', textDecoration: 'none', 
                    fontSize: 'clamp(1rem, 3vw, 1.2rem)', background: '#ff00cc', padding: '12px 30px',
                    borderRadius: '50px', display: 'inline-block', wordBreak: 'break-all'
                }}>{contactEmail}</a>
                <p style={{marginTop: '1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'normal'}}>
                    Please include &quot;Privacy Request&quot; in your subject line for faster routing.
                </p>
            </address>

            <nav aria-label="Legal Directory" style={styles.navBox}>
                <Link href="/terms" style={styles.navLink} title="Terms of Service">
                    <FaGavel aria-hidden="true" /> Terms of Service <FaArrowRight size={12} />
                </Link>
                <Link href="/dmca" style={styles.navLink} title="DMCA Policy">
                    <FaShieldAlt aria-hidden="true" /> DMCA Policy <FaArrowRight size={12} />
                </Link>
                <Link href="/about" style={styles.navLink} title="About Us">
                    <FaFileAlt aria-hidden="true" /> About PeerLox <FaArrowRight size={12} />
                </Link>
            </nav>

            <footer style={{textAlign: 'center', marginTop: '4rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem'}}>
                &copy; {new Date().getFullYear()} PeerLox. Designed for privacy, built for students. PeerLox is a Data Fiduciary.
            </footer>
        </article>
    );
}