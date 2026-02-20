"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { FaBars, FaTimes, FaSearch, FaSignOutAlt, FaPaperPlane, FaCloudUploadAlt } from 'react-icons/fa';
// 👇 Ably hooks
import { useChannel, usePresence, ChannelProvider } from "ably/react"; 
// 👇 Server Action
import { getUnreadCount } from "@/services/chat.service";

/**
 * 1. AblyLogic Component
 * We move the hooks here. This component is ONLY rendered inside the 
 * ChannelProvider, so it will never crash saying "Provider not found".
 */
function AblyLogic({ userId, setUnreadTotal }) {
  // Listen for new messages
  useChannel(`notifications:${userId}`, (message) => {
    if (message.name === "new-message") {
      setUnreadTotal(prev => prev + 1);
    }
  });

  // Track online status
  usePresence("online-users");

  return null; // Logic only, renders nothing visual
}

/**
 * 2. Main Navbar Component
 */
export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);

  const LOGO_URL = 'https://res.cloudinary.com/dmtnonxtt/image/upload/v1771173206/g0jgf1zk1mmguvzfwfnt.png';

  // Fetch initial unread count from DB
  useEffect(() => {
    if (session?.user?.id) {
      getUnreadCount(session.user.id).then((count) => setUnreadTotal(count));
    }
  }, [session?.user?.id]);

  // Standard UI Effects
  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth <= 768);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Reset unread count when visiting chat
  useEffect(() => {
    if (pathname.startsWith('/chat')) {
      setUnreadTotal(0);
    }
  }, [pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/global-search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
    setMenuOpen(false);
  };

  const isActive = (path) => pathname === path;

  // 👇 Restored Upload Button in Links
  const navLinks = [
    { path: '/search', label: 'Search Notes' },
    { path: '/notes/upload', label: 'Upload' }, // Added back
    { path: '/blogs', label: 'Blogs' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
    { path: '/donate', label: 'Donate' },
    { path: '/admin', label: 'Admin', adminOnly: true }
  ];

  const styles = {
    navWrapper: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', padding: scrolled ? '0.5rem 0' : '0.8rem 0' },
    navContainer: { background: scrolled ? 'rgba(10, 1, 24, 0.90)' : 'rgba(10, 1, 24, 0.6)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '50px', maxWidth: '1400px', margin: isMobile ? '0 1rem' : '0 auto', padding: '0.4rem 1.5rem', boxShadow: scrolled ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 20px rgba(102, 126, 234, 0.1)' : '0 10px 30px rgba(0, 0, 0, 0.2)', transition: 'all 0.3s ease' },
    navContent: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', height: '46px' },
    logoSection: { display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 },
    logo: { width: scrolled ? '120px' : '140px', height: scrolled ? '38px' : '44px', transition: 'all 0.3s ease', filter: 'drop-shadow(0 0 15px rgba(102, 126, 234, 0.6))', objectFit: 'contain' },
    navLinks: { display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: '0.2rem', flex: 1, justifyContent: 'center' },
    navLink: { padding: '0.5rem 1rem', color: '#e0e0e0', textDecoration: 'none', borderRadius: '20px', fontWeight: '500', fontSize: '0.9rem', transition: 'all 0.3s ease', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' },
    navLinkActive: { background: 'rgba(255, 255, 255, 0.1)', color: '#fff', fontWeight: '600', boxShadow: '0 0 15px rgba(255, 255, 255, 0.05)' },
    adminLink: { background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: '#1a1a1a', fontWeight: '700', boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)', border: '1px solid rgba(255, 215, 0, 0.5)' },
    searchForm: { display: isMobile ? 'none' : 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.2)', padding: '3px', borderRadius: '50px', border: '1px solid rgba(255, 255, 255, 0.15)', transition: 'all 0.3s ease', minWidth: '220px', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.2)' },
    searchInput: { background: 'transparent', border: 'none', color: '#fff', outline: 'none', flex: 1, fontSize: '0.85rem', padding: '0 10px', fontFamily: "'Inter', sans-serif", minWidth: 0 },
    
    // 👇 FIX: Added flexShrink: 0 to prevent oval shape on mobile
    searchButton: { background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', boxShadow: '0 2px 10px rgba(102, 126, 234, 0.4)', transition: 'transform 0.2s ease', flexShrink: 0 },
    
    rightSection: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 },
    iconButton: { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', textDecoration: 'none', position: 'relative' },
    notificationBadge: { position: 'absolute', top: '-4px', right: '-4px', background: '#ff3b30', color: '#fff', fontSize: '10px', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(10, 1, 24, 1)', boxShadow: '0 0 10px rgba(255, 59, 48, 0.4)' },
    userAvatar: { width: '38px', height: '38px', borderRadius: '50%', border: '2px solid rgba(102, 126, 234, 0.5)', cursor: 'pointer', objectFit: 'cover', boxShadow: '0 0 15px rgba(102, 126, 234, 0.2)' },
    logoutButton: { background: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.3)', color: '#ff3b30', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    mobileMenu: { position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '320px', height: '100vh', background: 'rgba(12, 12, 16, 0.95)', backdropFilter: 'blur(40px)', padding: '2rem', transform: menuOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: 1001, display: 'flex', flexDirection: 'column' },
    mobileMenuBackdrop: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'auto' : 'none', transition: 'opacity 0.3s ease', zIndex: 1000 },
    mobileLink: { padding: '1rem', color: '#fff', textDecoration: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }
  };

  return (
    <>
      {/* 👇 CRASH FIX: 
        We wrap the isolated logic component here. 
        This way, the Hooks inside AblyLogic can "see" the ChannelProvider context.
      */}
      {status === "authenticated" && session?.user?.id && (
        <ChannelProvider channelName="online-users">
          <ChannelProvider channelName={`notifications:${session.user.id}`}>
            <AblyLogic userId={session.user.id} setUnreadTotal={setUnreadTotal} />
          </ChannelProvider>
        </ChannelProvider>
      )}

      <div style={styles.navWrapper}>
        <div style={styles.navContainer}>
          <div style={styles.navContent}>
            
            <Link href="/" style={styles.logoSection} onClick={() => setMenuOpen(false)}>
              <img src={LOGO_URL} alt="PeerNotez Logo" style={styles.logo} />
            </Link>

            <div style={styles.navLinks}>
              {navLinks.map(link => {
                if (link.adminOnly && session?.user?.role !== 'admin') return null;
                const linkStyle = { ...styles.navLink, ...(isActive(link.path) ? styles.navLinkActive : {}) };
                if (link.adminOnly) Object.assign(linkStyle, styles.adminLink);

                return (
                  <Link key={link.path} href={link.path} style={linkStyle}>
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {!isMobile && (
              <form onSubmit={handleSearch} style={styles.searchForm}>
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
                <button type="submit" style={styles.searchButton}><FaSearch size={14} /></button>
              </form>
            )}

            <div style={styles.rightSection}>
              {!mounted || status === "loading" ? (
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} className="animate-pulse" />
              ) : session ? (
                <>
                  <Link href="/chat" style={styles.iconButton}>
                    <FaPaperPlane size={14} />
                    {unreadTotal > 0 && <span style={styles.notificationBadge}>{unreadTotal}</span>}
                  </Link>
                  <Link href="/profile">
                    <img src={session.user.image || session.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name)}&size=80`} alt="Profile" style={styles.userAvatar} />
                  </Link>
                  <button onClick={handleLogout} style={styles.logoutButton}><FaSignOutAlt size={14} /></button>
                </>
              ) : (
                <>
                  <Link href="/login" style={{...styles.navLink, display: isMobile ? 'none' : 'block'}}>Login</Link>
                  <Link href="/signup" style={{...styles.navLink, background: 'linear-gradient(135deg, #667eea, #764ba2)', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)', display: isMobile ? 'none' : 'block'}}>Sign Up</Link>
                </>
              )}

              {isMobile && (
                <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>
                  {menuOpen ? <FaTimes /> : <FaBars />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isMobile && <div style={styles.mobileMenuBackdrop} onClick={() => setMenuOpen(false)} />}

      {isMobile && (
        <div style={styles.mobileMenu}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>Menu</span>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}><FaTimes size={24} /></button>
           </div>
          <div style={{marginBottom: '2rem'}}>
            <form onSubmit={handleSearch} style={{...styles.searchForm, display: 'flex', width: '100%', padding: '8px'}}>
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
              <button type="submit" style={styles.searchButton}><FaSearch size={14} /></button>
            </form>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.2rem'}}>
            {navLinks.map(link => {
              if (link.adminOnly && session?.user?.role !== 'admin') return null;
              return (
                <Link key={link.path} href={link.path} onClick={() => setMenuOpen(false)} style={{...styles.mobileLink, background: isActive(link.path) ? 'rgba(102, 126, 234, 0.15)' : 'transparent', border: isActive(link.path) ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid transparent', color: link.adminOnly ? '#FFD700' : '#fff'}}>{link.label}</Link>
              );
            })}
            <div style={{height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '1.5rem 0'}} />
            {session ? (
              <>
                <Link href="/chat" onClick={() => setMenuOpen(false)} style={styles.mobileLink}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                      <FaPaperPlane color="#667eea"/> Messages 
                      {unreadTotal > 0 && <span style={{...styles.notificationBadge, position: 'static', marginLeft: 'auto'}}>{unreadTotal}</span>}
                    </div>
                </Link>
                <Link href="/profile" onClick={() => setMenuOpen(false)} style={styles.mobileLink}>
                  <img src={session.user.image || session.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name)}`} style={{width: '24px', height: '24px', borderRadius: '50%'}} alt="" /> Profile
                </Link>
                <button onClick={handleLogout} style={{...styles.mobileLink, color: '#ff3b30', background: 'rgba(255, 59, 48, 0.05)', border: 'none', justifyContent: 'center', width: '100%', marginTop: 'auto'}}><FaSignOutAlt /> Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} style={{...styles.mobileLink, justifyContent: 'center'}}>Login</Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} style={{...styles.mobileLink, background: 'linear-gradient(135deg, #667eea, #764ba2)', justifyContent: 'center'}}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}