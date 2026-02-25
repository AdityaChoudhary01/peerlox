import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RoleBadge from "./RoleBadge"; 

const APP_URL = process.env.NEXTAUTH_URL || "https://www.stuhive.in";

export default function AuthorInfoBlock({ user }) {
  if (!user) return null;

  const profileUrl = `${APP_URL}/profile/${user._id}`;
  const defaultAvatar = `${APP_URL}/default-avatar.png`; // Fallback for SEO schema

  // 🚀 1. HYPER-ADVANCED SEO: Extended Person Schema (JSON-LD)
  // Establishes absolute E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
  const authorSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": user.name,
    "url": profileUrl,
    "mainEntityOfPage": profileUrl,
    "image": user.avatar || defaultAvatar,
    "jobTitle": user.role || "Verified Academic Contributor",
    "worksFor": {
      "@type": "Organization",
      "name": "StuHive",
      "url": APP_URL
    },
    "memberOf": {
      "@type": "Organization",
      "name": "StuHive Academic Community"
    }
  };

  return (
    <div 
      className="flex items-center gap-4 group p-3 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-cyan-500/20 transition-all duration-300"
      // 🚀 2. DUAL-LAYER SEO: Semantic Microdata embedded directly into DOM
      itemScope 
      itemType="https://schema.org/Person"
    >
      {/* JSON-LD Payload */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />

      {/* 🚀 3. rel="author" is critical for linking content ownership to profiles */}
      <Link 
        href={profileUrl} 
        rel="author" 
        itemProp="url"
        title={`View ${user.name}'s verified contributor profile and academic resources`}
        className="shrink-0 outline-none rounded-full focus-visible:ring-2 focus-visible:ring-cyan-500"
      >
        <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border border-white/10 group-hover:border-cyan-500/40 transition-all duration-500 cursor-pointer shadow-lg">
            <AvatarImage 
                src={user.avatar} 
                // 🚀 4. Keyword-rich alt text
                alt={`Profile picture of ${user.name}, StuHive Contributor`} 
                itemProp="image" 
            />
            <AvatarFallback className="bg-cyan-950 text-cyan-400 font-bold text-sm">
              {user.name?.charAt(0) || "U"}
            </AvatarFallback>
        </Avatar>
      </Link>
      
      <div className="flex-1 min-w-0">
        <Link 
            href={profileUrl} 
            rel="author"
            className="block outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-sm w-fit"
            title={`Visit ${user.name}'s academic profile`}
        >
            {/* ✅ ACCESSIBILITY & SEO: <span> avoids heading hierarchy issues, itemProp tags the name */}
            <span 
                className="block font-bold text-white/90 text-sm sm:text-base truncate group-hover:text-cyan-400 transition-colors duration-300 tracking-tight" 
                itemProp="name"
            >
              {user.name}
            </span>
        </Link>
        <div className="flex items-center gap-2 mt-1">
            {/* 🚀 5. Job Title mapping for E-E-A-T */}
            <div itemProp="jobTitle">
               <RoleBadge role={user.role} />
            </div>
            
            {/* 🚀 6. Invisible semantic context for search engine crawlers & screen readers */}
            <span className="sr-only">, Verified Academic Contributor at StuHive Community</span>
        </div>
      </div>
    </div>
  );
}