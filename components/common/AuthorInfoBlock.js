import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RoleBadge from "./RoleBadge"; 

export default function AuthorInfoBlock({ user }) {
  if (!user) return null;

  // ✅ 1. SEO: Person Schema (JSON-LD)
  // This helps Google's Knowledge Graph connect this user to their uploaded content
  const authorSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": user.name,
    "url": `https://peernotez.netlify.app/profile/${user._id}`,
    "image": user.avatar,
    "jobTitle": user.role || "Student Contributor",
    "affiliation": {
      "@type": "Organization",
      "name": "PeerNotez"
    }
  };

  return (
    <div 
      className="flex items-center gap-4 group p-3 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-primary/20 transition-all duration-300"
      // ✅ 2. Semantic Microdata
      itemScope 
      itemType="https://schema.org/Person"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />

      <Link href={`/profile/${user._id}`} title={`View profile of ${user.name}`}>
        <Avatar className="w-14 h-14 border-2 border-primary/10 group-hover:border-primary/40 transition-all duration-500 cursor-pointer shadow-lg">
            <AvatarImage src={user.avatar} alt={user.name} itemProp="image" />
            <AvatarFallback className="bg-primary/10 text-primary font-black">
              {user.name?.charAt(0)}
            </AvatarFallback>
        </Avatar>
      </Link>
      
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${user._id}`} className="block">
            <h4 className="font-black text-white/90 text-base truncate group-hover:text-primary transition-colors duration-300" itemProp="name">
              {user.name}
            </h4>
        </Link>
        <div className="flex items-center gap-2 mt-1">
            {/* ✅ 3. Role/Job Title Microdata */}
            <div itemProp="jobTitle">
               <RoleBadge role={user.role} />
            </div>
            
            {/* Semantic Divider for bots */}
            <span className="sr-only">Verified Contributor at PeerNotez</span>
        </div>
      </div>
    </div>
  );
}