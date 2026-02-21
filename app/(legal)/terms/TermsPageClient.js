"use client";

import Link from 'next/link';
import { 
    FaBookReader, FaGavel, FaBan, FaShieldAlt, 
    FaUserCheck, FaBalanceScale, FaHandshake, FaExclamationCircle, 
    FaArrowRight, FaLock, FaFileAlt, FaGlobe, FaGoogle, FaEnvelope
} from 'react-icons/fa';

export default function TermsPageClient() {
    const styles = {
        // 🔹 Reduced vertical padding on mobile, stays 4rem/8rem on desktop
        wrapper: { paddingTop: 'clamp(2rem, 5vw, 4rem)', paddingBottom: 'clamp(4rem, 8vw, 8rem)', minHeight: '100vh' },
        header: { textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)' },
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
            // 🔹 Padding shrinks to 1.5rem on mobile, maxes out at 3.5rem on desktop
            padding: 'clamp(1.5rem, 5vw, 3.5rem)', 
            marginBottom: 'clamp(2rem, 5vw, 3rem)', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)' 
        },
        sectionHeading: { 
            // 🔹 Heading shrinks slightly on mobile to fit better
            fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800', color: '#fff', 
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px' 
        },
        text: { color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.8, fontSize: '1.05rem' },
        listItem: { 
            background: 'rgba(255, 255, 255, 0.03)', borderLeft: '4px solid #ffcc00', 
            // 🔹 Inner list padding shrinks slightly on mobile
            padding: 'clamp(1rem, 3vw, 1.2rem) clamp(1rem, 4vw, 1.5rem)', 
            marginBottom: '1rem', borderRadius: '0 16px 16px 0', 
            color: 'rgba(255, 255, 255, 0.85)', fontSize: '1rem'
        },
        warningBox: { 
            background: 'linear-gradient(to right, rgba(255, 0, 85, 0.1), transparent)', 
            borderLeft: '4px solid #ff0055', 
            // 🔹 Warning box padding shrinks to 1.2rem on mobile
            padding: 'clamp(1.2rem, 4vw, 2rem)', 
            borderRadius: '0 20px 20px 0', 
            marginTop: '2rem', color: '#ffb3c1'
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
                <div style={{marginBottom: '1rem'}}><span style={styles.badge}>User Agreement</span></div>
                <h1 style={styles.title}><FaBookReader aria-hidden="true" /> Terms of Power</h1>
                <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem'}}>
                    Please read carefully. By using PeerLox, you enter a legally binding contract. <br/>
                    <span style={{fontSize: '0.9rem', color: '#ffcc00'}}>Revision 2.1.0 • Updated Feb 2026</span>
                </p>
            </header>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaHandshake style={{color: '#00ffaa'}} aria-hidden="true" /> 1. The Covenant</h2>
                <div style={styles.text}>
                    <p className="mb-4">
                        By accessing PeerLox (&quot;the Service&quot;), you confirm that you are at least 13 years of age. You agree to be bound by these Terms of Service, our <Link href="/privacy" title="Privacy Policy" style={{color: '#00d4ff', fontWeight: 'bold'}}>Privacy Engine (Policy)</Link>, and our <Link href="/dmca" title="DMCA Policy" style={{color: '#ff00cc', fontWeight: 'bold'}}>Copyright Policy</Link>.
                    </p>
                    <p>
                        PeerLox is an academic note-sharing and communication platform designed to foster collaborative learning. We provide the infrastructure; you provide the intellect.
                    </p>
                </div>
            </section>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaGoogle style={{color: '#4285F4'}} aria-hidden="true" /> 2. Google OAuth & API Services</h2>
                <div style={styles.text}>
                    <p className="mb-4">
                        PeerLox utilizes Google OAuth 2.0 for secure, seamless user authentication. By choosing to &quot;Continue with Google&quot;, you authorize us to access specific, limited data from your Google Account (primarily your Name, Email Address, and Profile Picture) strictly for the purpose of account creation, identification, and communication within our platform.
                    </p>
                    <p className="mb-4">
                        <strong>Google API Services User Data Policy Compliance:</strong><br />
                        PeerLox&apos;s use and transfer to any other app of information received from Google APIs will adhere strictly to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" style={{color: '#00d4ff', textDecoration: 'underline'}}>Google API Services User Data Policy</a>, including the Limited Use requirements. 
                    </p>
                    <ul className="mt-4 space-y-3">
                        <li>• <strong>No Data Selling:</strong> We do not sell, rent, or trade your Google data to third parties, advertising networks, or data brokers under any circumstances.</li>
                        <li>• <strong>Restricted Use:</strong> The data retrieved via Google OAuth is used exclusively to provide and improve the core functionality of PeerLox (e.g., displaying your avatar next to your notes and chat messages).</li>
                        <li>• <strong>Data Deletion:</strong> You have the right to revoke our access to your Google data at any time via your Google Account Permissions settings, and you may request full deletion of your PeerLox profile and associated data by contacting us.</li>
                    </ul>
                </div>
            </section>
            
            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaShieldAlt style={{color: '#ffcc00'}} aria-hidden="true" /> 3. Content Ownership & License</h2>
                <div style={styles.text}>
                    <p className="mb-6">You retain all ownership rights to the original academic materials you upload. However, by posting content to PeerLox, you grant us a worldwide, non-exclusive, royalty-free license to host, store, and display your work for the purpose of academic sharing.</p>
                    
                    <h3 style={{color: '#fff', fontSize: '1.2rem', marginBottom: '1rem'}}>Prohibited Content:</h3>
                    <div style={styles.listItem}><strong>Stolen IP:</strong> You must not upload textbooks, paid course materials, or work that is not your own creation.</div>
                    <div style={styles.listItem}><strong>Academic Integrity:</strong> You must not upload live exam answers or materials that facilitate active cheating/plagiarism.</div>
                    <div style={styles.listItem}><strong>Malicious Data:</strong> No scripts, viruses, or automated scraping bots.</div>

                    <aside style={styles.warningBox}>
                        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                            <FaExclamationCircle size={24} aria-hidden="true" style={{flexShrink: 0}} />
                            <span><strong>Indemnification:</strong> You are legally responsible for your uploads. You agree to protect PeerLox from any legal fees or damages arising from your breach of copyright or academic policies.</span>
                        </div>
                    </aside>
                </div>
            </section>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaUserCheck style={{color: '#00d4ff'}} aria-hidden="true" /> 4. User Conduct</h2>
                <div style={styles.text}>
                    <p>PeerLox is a sanctuary for learners. We reserve the right to ban any user who engages in:</p>
                    <ul className="mt-4 space-y-3">
                        <li>• Harassment, bullying, or hate speech in Blogs or Chat sections.</li>
                        <li>• Attempting to circumvent our download, view, or API limits.</li>
                        <li>• Impersonating other students, faculty members, or professors.</li>
                        <li>• Commercial use of PeerLox content without explicit permission.</li>
                        <li>• Exploiting vulnerabilities or reverse-engineering the platform.</li>
                    </ul>
                </div>
            </section>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaGlobe style={{color: '#ffcc00'}} aria-hidden="true" /> 5. Governing Law</h2>
                <div style={styles.text}>
                    <p>
                        These Terms are governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in <strong>Gautam Buddh Nagar (Greater Noida), Uttar Pradesh</strong>.
                    </p>
                </div>
            </section>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaBan style={{color: '#ff0055'}} aria-hidden="true" /> 6. Termination</h2>
                <div style={styles.text}>
                    <p>
                        We may suspend or terminate your access to PeerLox at any time, without notice, if we believe you have violated these terms. Specifically, any violation of our <strong>Repeat Infringer Policy</strong> will result in an immediate and permanent account ban, revocation of OAuth tokens, and complete data deletion.
                    </p>
                </div>
            </section>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaBalanceScale style={{color: '#00ffaa'}} aria-hidden="true" /> 7. Limitation of Liability</h2>
                <div style={styles.text}>
                    <p>
                        PeerLox provides its service &quot;AS IS&quot; and &quot;AS AVAILABLE.&quot; We do not guarantee the accuracy, completeness, or validity of any user-uploaded notes. Use of materials found on this site for graded assignments is entirely at your own risk. We are not responsible for any academic disciplinary actions taken against you by your institution.
                    </p>
                </div>
            </section>

            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaEnvelope style={{color: '#fff'}} aria-hidden="true" /> 8. Developer & Contact Information</h2>
                <div style={styles.text}>
                    <p className="mb-4">
                        PeerLox is independently developed and maintained by <strong>Aditya Choudhary</strong>. We are committed to transparency and user privacy.
                    </p>
                    <p>
                        If you have any questions regarding these Terms, require assistance with your account, or wish to submit a data deletion request regarding your Google OAuth information, please contact us at:
                    </p>
                    <div style={{...styles.listItem, marginTop: '1.5rem', display: 'inline-block'}}>
                        <strong>Email:</strong> peerlox.support@gmail.com <br/>
                        <span style={{fontSize: '0.85rem', opacity: 0.7}}>(Please replace with your actual support email before deployment)</span>
                    </div>
                </div>
            </section>

            <nav aria-label="Legal Directory" style={styles.navBox}>
                <Link href="/privacy" style={styles.navLink} title="Privacy Policy">
                    <FaLock aria-hidden="true" /> Privacy Engine <FaArrowRight size={12} />
                </Link>
                <Link href="/dmca" style={styles.navLink} title="DMCA Policy">
                    <FaShieldAlt aria-hidden="true" /> IP Protection <FaArrowRight size={12} />
                </Link>
                <Link href="/about" style={styles.navLink} title="About Us">
                    <FaFileAlt aria-hidden="true" /> About PeerLox <FaArrowRight size={12} />
                </Link>
            </nav>

            <footer style={{textAlign: 'center', marginTop: '4rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem'}}>
                &copy; {new Date().getFullYear()} PeerLox Legal. Build your future, respect the past.
            </footer>
        </article>
    );
}