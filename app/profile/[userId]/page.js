import { notFound } from "next/navigation";
import { getUserProfile, getUserNotes } from "@/actions/user.actions";
import { getBlogsForUser } from "@/actions/blog.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PublicProfileView from "@/components/profile/PublicProfileView";

const APP_URL = process.env.NEXTAUTH_URL || "https://peernotez.netlify.app";

// ✅ 1. DYNAMIC SEO METADATA (Crawlable by Google without login)
export async function generateMetadata({ params }) {
  const { userId } = await params;
  const user = await getUserProfile(userId);
  if (!user) return { title: "User Not Found" };

  const profileTitle = `${user.name} | Portfolio & Study Materials | PeerNotez`;
  const profileDesc = user.bio 
    ? `${user.bio.substring(0, 150)}` 
    : `Explore academic notes and articles contributed by ${user.name} on PeerNotez.`;

  return {
    title: profileTitle,
    description: profileDesc,
    alternates: {
        canonical: `${APP_URL}/profile/${userId}`,
    },
    openGraph: {
      title: profileTitle,
      description: profileDesc,
      url: `${APP_URL}/profile/${userId}`,
      type: "profile",
      images: [user.avatar || `${APP_URL}/logo512.png`],
    },
    twitter: {
        card: "summary",
        title: profileTitle,
        description: profileDesc,
        images: [user.avatar || `${APP_URL}/logo512.png`],
    }
  };
}

export default async function PublicProfilePage({ params }) {
  const { userId } = await params;
  
  // ✅ Get session but DO NOT redirect if it's null
  const session = await getServerSession(authOptions);
  
  const [profile, notesData, blogs] = await Promise.all([
    getUserProfile(userId),
    getUserNotes(userId, 1, 50),
    getBlogsForUser(userId)
  ]);

  if (!profile) return notFound();

  // ✅ 2. PERSON & PROFILE SCHEMA (JSON-LD)
  // This allows Google to index the person's name and work portfolio
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": profile.name,
      "description": profile.bio,
      "image": profile.avatar,
      "url": `${APP_URL}/profile/${userId}`,
      "knowsAbout": ["Academic Research", "Study Materials"],
      "interactionStatistic": [
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/FollowAction",
          "userInteractionCount": profile.followers?.length || 0
        }
      ]
    }
  };

  // ✅ 3. LOGIC FOR GUESTS
  // If session is null, both these will safely be false
  const isOwnProfile = session?.user?.id === profile._id.toString();
  const isFollowing = session 
    ? profile.followers.some(f => (f._id?.toString() || f.toString()) === session.user.id) 
    : false;

  // --- 4. EXPLICIT SERIALIZATION ---
  const serializedProfile = {
    ...profile,
    _id: profile._id.toString(),
    followers: (profile.followers || []).map(f => ({
        ...f,
        _id: f._id?.toString() || f.toString()
    })),
    following: (profile.following || []).map(f => ({
        ...f,
        _id: f._id?.toString() || f.toString()
    }))
  };

  const serializedNotes = (notesData?.notes || []).map(note => ({
    ...note,
    _id: note._id.toString(),
    user: note.user?._id ? { ...note.user, _id: note.user._id.toString() } : note.user?.toString(),
    uploadDate: note.uploadDate instanceof Date ? note.uploadDate.toISOString() : new Date(note.uploadDate).toISOString(),
  }));

  const serializedBlogs = (blogs || []).map(blog => ({
    ...blog,
    _id: blog._id.toString(),
    author: blog.author?._id ? blog.author._id.toString() : blog.author?.toString(),
    createdAt: blog.createdAt instanceof Date ? blog.createdAt.toISOString() : new Date(blog.createdAt).toISOString(),
  }));

  return (
    <main className="container py-8 max-w-6xl pt-24">
      {/* Inject JSON-LD so Google understands the profile data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicProfileView 
        profile={serializedProfile}
        notes={serializedNotes}
        blogs={serializedBlogs}
        currentUser={session?.user} // Will be null for guests
        isOwnProfile={isOwnProfile}
        initialIsFollowing={isFollowing}
      />
    </main>
  );
}