import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserFeed } from "@/actions/user.actions";
import FeedView from "@/components/feed/FeedView"; // Client Component

export const metadata = {
  title: "My Feed | PeerNotez",
};

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  // Fetch feed (Notes + Blogs combined)
  const feedContent = await getUserFeed(session.user.id);

  return (
    <div className="container py-8 max-w-5xl min-h-screen">
      <div className="mb-8 text-center">
         <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600 mb-2">
            Your Daily Stream
         </h1>
         <p className="text-muted-foreground">Fresh updates from authors you follow.</p>
      </div>
      
      <FeedView initialContent={feedContent} />
    </div>
  );
}