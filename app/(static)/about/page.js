import Link from 'next/link';
import { 
    FaRocket, FaUsers, FaGlobe, FaCode, FaLightbulb, 
    FaArrowRight, FaShieldAlt, FaLock, FaGavel, FaHeart, FaLayerGroup 
} from 'react-icons/fa';
import connectDB from '@/lib/db';
import Note from '@/lib/models/Note';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

// ✅ 1. HIGH-OCTANE SEO METADATA & SCHEMA
const APP_URL = process.env.NEXTAUTH_URL || "https://peernotez.netlify.app";

export const metadata = {
    title: 'About PeerNotez | Mission, Vision, and the Future of Learning',
    description: 'Discover the story behind PeerNotez. Founded by Aditya Choudhary, we are a global community platform dedicated to making academic resources free and accessible.',
    keywords: ["About PeerNotez", "Aditya Choudhary Developer", "Academic Community", "Free University Notes", "Mission and Vision"],
    alternates: {
        canonical: `${APP_URL}/about`,
    },
};

async function getAboutStats() {
    await connectDB();
    try {
        const [totalNotes, totalUsers, totalDownloadsResult] = await Promise.all([
            Note.estimatedDocumentCount(),
            User.estimatedDocumentCount(),
            Note.aggregate([{ $group: { _id: null, total: { $sum: "$downloadCount" } } }])
        ]);
        
        const totalDownloads = totalDownloadsResult[0]?.total || 0;
        return { totalNotes, totalUsers, totalDownloads };
    } catch (error) {
        return { totalNotes: 0, totalUsers: 0, totalDownloads: 0 };
    }
}

export default async function AboutPage() {
    const stats = await getAboutStats();

    // 2. JSON-LD Structured Data (Massive for SEO)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "mainEntity": {
            "@type": "Organization",
            "name": "PeerNotez",
            "url": APP_URL,
            "logo": `${APP_URL}/logo192.png`,
            "founder": {
                "@type": "Person",
                "name": "Aditya Choudhary"
            },
            "description": "A collaborative ecosystem designed to dismantle the barriers to academic success."
        }
    };

    const styles = {
        wrapper: { paddingTop: '4rem', paddingBottom: '8rem', minHeight: '100vh' },
        header: { textAlign: 'center', marginBottom: '6rem' },
        title: {
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900', letterSpacing: '-2px',
            background: 'linear-gradient(135deg, #fff 0%, #00d4ff 50%, #ff00cc 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '1.5rem', display: 'inline-block',
        },
        glassSection: {
            background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '40px',
            padding: '4rem 2rem', marginBottom: '4rem', position: 'relative',
            overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        },
        devBadge: {
            background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff', padding: '6px 16px',
            borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800',
            textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '1rem'
        },
        statCard: {
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px', padding: '2rem', textAlign: 'center'
        },
        statNumber: {
            fontSize: '2.8rem', fontWeight: '900', background: 'linear-gradient(to bottom, #fff, #667eea)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.2rem'
        },
        navBox: { display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginTop: '5rem' },
        navLink: {
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50px', color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600'
        }
    };

    return (
        <main className="container mx-auto px-4" style={styles.wrapper}>
            {/* Inject JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <header style={styles.header}>
                <h1 style={styles.title}>The Future of Learning.</h1>
                <p className="text-white/60 text-xl max-w-3xl mx-auto leading-relaxed">
                    PeerNotez is a collaborative ecosystem designed to dismantle the barriers to academic success. One student, one note, and one community at a time.
                </p>
            </header>

            <section style={styles.glassSection} aria-label="About the Creator">
                <article className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl mx-auto">
                    <figure className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#00d4ff] to-[#ff00cc] rounded-full blur opacity-40 group-hover:opacity-70 transition duration-1000"></div>
                        <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-white/20 overflow-hidden bg-black">
                            <img 
                                src="/images/developer.jpg" 
                                alt="Aditya Choudhary - Founder of PeerNotez" 
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                            />
                        </div>
                    </figure>
                    
                    <div className="flex-1 text-center lg:text-left">
                        <span style={styles.devBadge}>Architect & Visionary</span>
                        <h2 className="text-4xl font-black text-white mb-4">Aditya Choudhary</h2>
                        <div className="space-y-4 text-white/70 text-lg leading-relaxed">
                            <p>
                                PeerNotez was born from a singular vision: <strong>Academic knowledge should be free, accessible, and community-driven.</strong>
                            </p>
                            <p>
                                As a solo developer, I’ve built PeerNotez from the first line of code to the scalable infrastructure it stands on today. This project is more than just a website; it’s a commitment to every student who has ever struggled to find the right resources.
                            </p>
                        </div>
                    </div>
                </article>
            </section>
            
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" aria-label="Core Values">
                <div style={styles.glassSection} className="!mb-0 !py-10">
                    <FaLayerGroup size={40} className="text-[#00d4ff] mb-6 mx-auto" aria-hidden="true" />
                    <h3 className="text-xl font-bold text-white text-center mb-4">Open Infrastructure</h3>
                    <p className="text-sm text-center text-white/50 leading-relaxed">
                        We leverage high-performance cloud storage and Azure Cosmos DB to ensure your academic materials are always available.
                    </p>
                </div>
                <div style={styles.glassSection} className="!mb-0 !py-10">
                    <FaHeart size={40} className="text-[#ff00cc] mb-6 mx-auto" aria-hidden="true" />
                    <h3 className="text-xl font-bold text-white text-center mb-4">Built with Passion</h3>
                    <p className="text-sm text-center text-white/50 leading-relaxed">
                        Every feature is designed with a student-first approach, prioritizing speed, simplicity, and academic integrity.
                    </p>
                </div>
                <div style={styles.glassSection} className="!mb-0 !py-10">
                    <FaGlobe size={40} className="text-[#00ffaa] mb-6 mx-auto" aria-hidden="true" />
                    <h3 className="text-xl font-bold text-white text-center mb-4">Global Reach</h3>
                    <p className="text-sm text-center text-white/50 leading-relaxed">
                        PeerNotez bridges the gap between universities, allowing knowledge to flow across borders and disciplines.
                    </p>
                </div>
            </section>

            

            <section className="mb-20" aria-label="Statistics">
                <h2 className="text-3xl font-black text-center text-white mb-12 uppercase tracking-widest">Our Global Impact</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>{stats.totalUsers.toLocaleString()}</div>
                        <p className="text-[#00d4ff] text-xs font-bold uppercase tracking-widest">Global Members</p>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>{stats.totalNotes.toLocaleString()}</div>
                        <p className="text-[#ff00cc] text-xs font-bold uppercase tracking-widest">Study Materials</p>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>10+</div>
                        <p className="text-[#ffcc00] text-xs font-bold uppercase tracking-widest">Partner Institutions</p>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>{stats.totalDownloads.toLocaleString()}</div>
                        <p className="text-[#00ffaa] text-xs font-bold uppercase tracking-widest">Direct Downloads</p>
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#0a0118] to-[#1a1a2e] border border-white/10 p-12 text-center">
                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white mb-6">Start Your Journey Today.</h2>
                    <p className="text-white/60 max-w-2xl mx-auto mb-10 text-lg">
                        The PeerNotez mission is powered by students like you. Upload your first note or discover resources that change your academic path.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/signup" title="Create a Free Account" className="px-10 py-4 rounded-full bg-white text-black font-black text-lg hover:scale-105 transition-transform">
                            Join the Community
                        </Link>
                        <Link href="/search" title="Search Study Materials" className="px-10 py-4 rounded-full bg-transparent border border-white/20 text-white font-black text-lg hover:bg-white/5 transition-colors">
                            Browse Materials
                        </Link>
                    </div>
                </div>
            </section>

            <nav style={styles.navBox} aria-label="Legal and About Navigation">
                <Link href="/privacy" style={styles.navLink} title="Privacy Policy">
                    <FaLock aria-hidden="true" /> Privacy Engine <FaArrowRight size={12} />
                </Link>
                <Link href="/terms" style={styles.navLink} title="Terms of Service">
                    <FaGavel aria-hidden="true" /> Terms of Service <FaArrowRight size={12} />
                </Link>
                <Link href="/dmca" style={styles.navLink} title="IP Protection">
                    <FaShieldAlt aria-hidden="true" /> IP Protection <FaArrowRight size={12} />
                </Link>
            </nav>

            <footer style={{textAlign: 'center', marginTop: '4rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem'}}>
                PeerNotez. Built for the students of today, by the student who dared to code.
            </footer>
        </main>
    );
}