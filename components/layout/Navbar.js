"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { FaBars, FaTimes, FaSearch, FaSignOutAlt, FaPaperPlane } from 'react-icons/fa';
// 👇 Ably hooks
import { useChannel, usePresence, ChannelProvider } from "ably/react"; 
// 👇 Server Action
import { getUnreadCount } from "@/services/chat.service";

/**
 * 1. AblyLogic Component
 */
function AblyLogic({ userId, setUnreadTotal }) {
  useChannel(`notifications:${userId}`, (message) => {
    if (message.name === "new-message") {
      setUnreadTotal(prev => prev + 1);
    }
  });

  usePresence("online-users");
  return null; 
}

/**
 * 2. Main Navbar Component
 */
export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);

  const LOGO_URL = 'https://res.cloudinary.com/dmtnonxtt/image/upload/w_300,f_auto,q_auto/v1771749043/vshx4isacdlfv6x6aaqv.png';

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [menuOpen]);

  // Fetch initial unread count from DB
  useEffect(() => {
    if (session?.user?.id) {
      getUnreadCount(session.user.id).then((count) => setUnreadTotal(count));
    }
  }, [session?.user?.id]);

  // Handle Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50 !== scrolled) {
        setScrolled(window.scrollY > 50);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Reset unread count when visiting chat
  useEffect(() => {
    if (pathname.startsWith('/chat')) {
      const timer = setTimeout(() => {
        setUnreadTotal((prev) => (prev > 0 ? 0 : prev));
      }, 0);
      return () => clearTimeout(timer);
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

  const navLinks = [
    { path: '/search', label: 'Notes' },
    { path: '/shared-collections', label: 'Archives' }, 
    { path: '/feed', label: 'Feed' }, 
    { path: '/blogs', label: 'Blogs' },
    { path: '/about', label: 'About' },
    { path: '/donate', label: 'Donate' },
    { path: '/admin', label: 'Admin', adminOnly: true }
  ];

  return (
    <>
      {status === "authenticated" && session?.user?.id && (
        <ChannelProvider channelName="online-users">
          <ChannelProvider channelName={`notifications:${session.user.id}`}>
            <AblyLogic userId={session.user.id} setUnreadTotal={setUnreadTotal} />
          </ChannelProvider>
        </ChannelProvider>
      )}

      <div className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${scrolled ? 'py-2' : 'py-3'}`}>
        <div 
          className="mx-4 md:mx-auto max-w-[1400px] rounded-[50px] transition-all duration-300 px-6 py-1.5 flex items-center justify-between gap-2 h-[46px]"
          style={{
            background: scrolled ? 'rgba(10, 1, 24, 0.90)' : 'rgba(10, 1, 24, 0.6)', 
            backdropFilter: 'blur(20px) saturate(180%)', 
            WebkitBackdropFilter: 'blur(20px) saturate(180%)', 
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: scrolled ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 20px rgba(102, 126, 234, 0.1)' : '0 10px 30px rgba(0, 0, 0, 0.2)'
          }}
        >
            
          <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center shrink-0">
            <Image 
              src={LOGO_URL} 
              alt="StuHive Logo" 
              width={140} 
              height={44} 
              unoptimized={true} 
              fetchPriority="high"
              className="object-contain drop-shadow-[0_0_15px_rgba(102,126,234,0.6)] transition-all duration-300"
              style={{ width: scrolled ? '120px' : '140px', height: scrolled ? '38px' : '44px' }}
              priority
            />
          </Link>

          {/* Desktop Links - 🚀 FIXED: Hides below 1085px */}
          <div className="max-[1085px]:hidden flex items-center justify-center flex-1 gap-0.5 lg:gap-1">
            {navLinks.map(link => {
              if (link.adminOnly && session?.user?.role !== 'admin') return null;
              return (
                <Link 
                  key={link.path} 
                  href={link.path} 
                  className={`px-3 lg:px-4 py-2 text-[0.85rem] lg:text-[0.9rem] font-medium rounded-full transition-all duration-300 whitespace-nowrap font-sans
                    ${isActive(link.path) ? 'bg-white/10 text-white font-semibold shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'text-[#e0e0e0] hover:bg-white/5'}
                    ${link.adminOnly ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-[#1a1a1a] font-bold border border-[#FFD700]/50 shadow-[0_0_15px_rgba(255,215,0,0.3)]' : ''}
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Search - 🚀 FIXED: Hides below 1085px */}
          <form onSubmit={handleSearch} className="max-[1085px]:hidden flex items-center bg-black/20 p-[3px] rounded-full border border-white/15 transition-all min-w-[200px] xl:min-w-[220px] shadow-inner">
            <input type="text" placeholder="Search..." aria-label="Search term" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none text-white outline-none flex-1 text-[0.85rem] px-2.5 font-sans min-w-0" />
            <button type="submit" aria-label="Submit search" className="bg-gradient-to-br from-[#667eea] to-[#764ba2] border-none rounded-full w-[30px] h-[30px] flex items-center justify-center cursor-pointer text-white shadow-[0_2px_10px_rgba(102,126,234,0.4)] transition-transform hover:scale-105 shrink-0">
              <FaSearch aria-hidden="true" size={14} />
            </button>
          </form>

          {/* User Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {status === "loading" ? (
              <div className="w-[38px] h-[38px] rounded-full bg-white/10 animate-pulse" />
            ) : status === "authenticated" && session ? (
              <>
                <Link href="/notes/upload" className="max-[1085px]:hidden flex px-4 py-1.5 text-white font-bold text-[0.8rem] rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors mr-1">
                  Upload
                </Link>
                <Link href="/chat" aria-label="Messages" className="max-[1085px]:hidden relative w-[38px] h-[38px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                  <FaPaperPlane aria-hidden="true" size={14} />
                  {unreadTotal > 0 && <span className="absolute -top-1 -right-1 bg-[#ff3b30] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-[#0a0118] shadow-[0_0_10px_rgba(255,59,48,0.4)]">{unreadTotal}</span>}
                </Link>
                <Link href="/profile" aria-label="View Profile" className="max-[1085px]:hidden">
                  <Image 
                    src={session.user.image || session.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name)}&size=80`} 
                    alt={`${session.user.name}'s Profile`} 
                    width={38} 
                    height={38} 
                    className="w-[38px] h-[38px] rounded-full border-2 border-[#667eea]/50 object-cover shadow-[0_0_15px_rgba(102,126,234,0.2)]"
                  />
                </Link>
                <button onClick={handleLogout} aria-label="Logout" className="max-[1085px]:hidden flex w-[38px] h-[38px] rounded-full bg-[#ff3b30]/10 border border-[#ff3b30]/30 text-[#ff3b30] items-center justify-center hover:bg-[#ff3b30]/20 transition-colors cursor-pointer">
                  <FaSignOutAlt aria-hidden="true" size={14} />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="max-[1085px]:hidden block px-4 py-2 text-[#e0e0e0] font-medium text-[0.9rem] hover:text-white transition-colors">Login</Link>
                <Link href="/signup" className="max-[1085px]:hidden block px-4 py-2 text-white font-medium text-[0.9rem] rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] shadow-[0_4px_15px_rgba(102,126,234,0.4)] transition-transform hover:scale-105">Sign Up</Link>
              </>
            )}

            {/* Hamburger Button - 🚀 FIXED: Shows below 1085px */}
            <button aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)} className="min-[1086px]:hidden flex items-center justify-center bg-transparent border-none text-white text-2xl cursor-pointer p-1 pl-2">
              {menuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      <div className={`min-[1086px]:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMenuOpen(false)} />

      {/* Mobile Menu Slide-out Panel - 🚀 FIXED: Dynamic Viewport Height (dvh) avoids bottom bar clipping */}
      <div className={`min-[1086px]:hidden fixed top-0 right-0 w-full max-w-[320px] h-[100dvh] bg-[#0c0c10]/95 backdrop-blur-xl p-6 z-[1001] flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         
         <div className="flex justify-between items-center mb-6 shrink-0 pt-2">
            <span className="text-white font-bold text-xl">Menu</span>
            <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="bg-transparent border-none text-white/60 hover:text-white transition-colors cursor-pointer p-1">
              <FaTimes aria-hidden="true" size={24} />
            </button>
         </div>
         
        <div className="mb-6 shrink-0">
          <form onSubmit={handleSearch} className="flex items-center w-full bg-black/20 p-2 rounded-full border border-white/15">
            <input type="text" placeholder="Search..." aria-label="Search term" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none text-white outline-none flex-1 text-[0.9rem] px-2 font-sans" />
            <button type="submit" aria-label="Submit search" className="bg-gradient-to-br from-[#667eea] to-[#764ba2] border-none rounded-full w-[30px] h-[30px] flex items-center justify-center text-white shrink-0 cursor-pointer">
              <FaSearch aria-hidden="true" size={14} />
            </button>
          </form>
        </div>

        {/* 🚀 FIXED: Scrollable area for links, ensures it doesn't get cut off on tiny screens */}
        <div className="flex flex-col gap-2 overflow-y-auto pb-6 flex-1 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <Link href="/notes/upload" onClick={() => setMenuOpen(false)} className="p-3.5 rounded-2xl text-[1.05rem] font-bold flex items-center gap-4 text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 hover:bg-cyan-400/20 transition-colors mb-2">
            + Upload Note
          </Link>

          {navLinks.map(link => {
            if (link.adminOnly && session?.user?.role !== 'admin') return null;
            return (
              <Link key={link.path} href={link.path} onClick={() => setMenuOpen(false)} className={`p-3.5 rounded-2xl text-[1.05rem] font-medium flex items-center gap-4 transition-colors ${isActive(link.path) ? 'bg-[#667eea]/15 border border-[#667eea]/30 text-white' : 'text-white border border-transparent hover:bg-white/5'} ${link.adminOnly ? 'text-[#FFD700]' : ''}`}>
                {link.label}
              </Link>
            );
          })}
          
          <div className="h-[1px] bg-white/10 my-4 shrink-0" />
          
          {session ? (
            <>
              <Link href="/chat" onClick={() => setMenuOpen(false)} className="p-3.5 text-white rounded-2xl text-[1.05rem] font-medium flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3 w-full">
                    <FaPaperPlane aria-hidden="true" color="#667eea"/> Messages 
                    {unreadTotal > 0 && <span className="ml-auto bg-[#ff3b30] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">{unreadTotal}</span>}
                  </div>
              </Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="p-3.5 text-white rounded-2xl text-[1.05rem] font-medium flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="relative w-6 h-6 overflow-hidden rounded-full shrink-0">
                  <Image src={session.user.image || session.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name)}`} alt={`${session.user.name}'s Profile`} fill className="object-cover" />
                </div> Profile
              </Link>
              <button onClick={handleLogout} className="mt-4 p-3.5 rounded-2xl text-[1.05rem] font-medium flex items-center justify-center gap-2 text-[#ff3b30] bg-[#ff3b30]/5 hover:bg-[#ff3b30]/10 w-full transition-colors cursor-pointer shrink-0">
                <FaSignOutAlt aria-hidden="true" /> Logout
              </button>
            </>
          ) : (
            <div className="mt-auto shrink-0 space-y-2 pt-4">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="p-3.5 text-white rounded-2xl text-[1.05rem] font-medium flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">Login</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="p-3.5 text-white rounded-2xl text-[1.05rem] font-medium flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] hover:opacity-90 transition-opacity">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}