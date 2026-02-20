import Link from 'next/link';
import { FaExclamationTriangle, FaHome, FaSearch, FaBook, FaPenNib } from 'react-icons/fa';

export const metadata = {
  title: 'Page Not Found | PeerNotez Archive',
  description: 'The requested academic material could not be found. Explore our library for other university notes and study guides.',
  robots: {
    index: false, // ✅ SEO: Prevents 404s from cluttering search results
    follow: true, // ✅ SEO: Allows bots to follow the links on this page to go back home
  },
};

export default function NotFound() {
    const styles = {
        wrapper: { 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh', 
            padding: '2rem', 
            textAlign: 'center', 
            position: 'relative', 
            overflow: 'hidden',
        },
        container: { 
            background: 'rgba(255, 255, 255, 0.02)', 
            backdropFilter: 'blur(20px)', 
            borderRadius: '40px', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            padding: '5rem 2rem', 
            maxWidth: '700px', 
            width: '100%', 
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)', 
            position: 'relative', 
            zIndex: 1 
        },
        errorCode: { 
            fontSize: 'clamp(5rem, 20vw, 12rem)', 
            fontWeight: '950', 
            background: 'linear-gradient(to bottom, #00d4ff, #333399)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            margin: '0', 
            lineHeight: 0.8, 
            letterSpacing: '-8px',
            filter: 'drop-shadow(0 0 30px rgba(0, 212, 255, 0.3))'
        },
        blob1: { position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0, 212, 255, 0.1), transparent 70%)', filter: 'blur(80px)', zIndex: 0 },
        blob2: { position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1), transparent 70%)', filter: 'blur(80px)', zIndex: 0 }
    };

    return (
        <main style={styles.wrapper}>
            <div style={styles.blob1}></div>
            <div style={styles.blob2}></div>
            
            <div style={styles.container}>
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-yellow-500">
                        <FaExclamationTriangle size={40} />
                    </div>
                </div>

                <h1 style={styles.errorCode}>404</h1>
                
                <div className="mt-8 space-y-4">
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">
                        Material Not Found
                    </h2>
                    <p className="text-white/40 text-sm sm:text-lg max-w-md mx-auto font-medium leading-relaxed">
                        The requested link has either expired or moved into the decentralized archive. Try searching our indexed library.
                    </p>
                </div>

                {/* ✅ SEO: Internal Linking to High-Value Pages */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-12 mb-12">
                    <Link href="/search" className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-primary/30 transition-all group">
                        <FaSearch className="text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Search Notes</span>
                    </Link>
                    <Link href="/blogs" className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-primary/30 transition-all group">
                        <FaPenNib className="text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Read Blogs</span>
                    </Link>
                    <Link href="/" className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-primary/30 transition-all group">
                        <FaHome className="text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Dashboard</span>
                    </Link>
                </div>

                <Link 
                    href="/" 
                    className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-white text-black font-black uppercase tracking-widest text-xs hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all active:scale-95"
                >
                    Back to Safety
                </Link>
            </div>
        </main>
    );
}