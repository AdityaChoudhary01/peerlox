import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import ProfileDashboard from "@/components/profile/ProfileDashboard";
import { getUserProfile, getUserNotes, getSavedNotes } from "@/actions/user.actions";
import { getBlogsForUser } from "@/actions/blog.actions";
import { getUserCollections } from "@/actions/collection.actions";

export const metadata = {
  title: "Dashboard | PeerNotez",
  description: "Manage your notes, collections, and profile.",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/profile");
  }

  // Fetch all user data in parallel for maximum speed
  const [userProfile, userNotesRes, savedNotesRes, myBlogs, userCollections] = await Promise.all([
    getUserProfile(session.user.id),
    getUserNotes(session.user.id),
    getSavedNotes(session.user.id), 
    getBlogsForUser(session.user.id),
    getUserCollections(session.user.id)
  ]);

  if (!userProfile) {
    redirect("/login");
  }

  // --- SERIALIZATION LAYER ---
  
  // 1. Serialize User (Including R2 Avatar Key)
  const serializedUser = {
    ...userProfile,
    _id: userProfile._id.toString(),
    avatarKey: userProfile.avatarKey || null, // Needed for R2 cleanup when changing pics
  };

  // 2. Serialize My Uploaded Notes (Including R2 File Keys)
  const serializedMyNotes = userNotesRes.notes.map(note => ({
    ...note,
    _id: note._id.toString(),
    user: note.user?._id ? { ...note.user, _id: note.user._id.toString() } : note.user?.toString(),
    fileKey: note.fileKey || null,           // ✅ Added for R2
    thumbnailKey: note.thumbnailKey || null, // ✅ Added for R2
    uploadDate: note.uploadDate instanceof Date ? note.uploadDate.toISOString() : new Date(note.uploadDate || Date.now()).toISOString(),
  }));

  // 3. Serialize Saved Notes
  const serializedSavedNotes = savedNotesRes.notes.map(note => ({
    ...note,
    _id: note._id.toString(),
    user: note.user?._id ? { ...note.user, _id: note.user._id.toString() } : note.user?.toString(),
    uploadDate: note.uploadDate instanceof Date ? note.uploadDate.toISOString() : new Date(note.uploadDate || Date.now()).toISOString(),
  }));

  // 4. Serialize Collections
  const serializedCollections = userCollections.map(col => ({
    ...col,
    _id: col._id.toString(),
    user: col.user?.toString(),
    notes: col.notes?.map(n => n.toString()) || [],
    createdAt: col.createdAt instanceof Date 
      ? col.createdAt.toISOString() 
      : col.createdAt 
        ? new Date(col.createdAt).toISOString() 
        : new Date().toISOString(),
  }));

  // 5. Serialize My Blogs (Including R2 Cover Keys)
  const serializedMyBlogs = myBlogs.map(blog => ({
    ...blog,
    _id: blog._id.toString(),
    author: blog.author?._id ? blog.author._id.toString() : blog.author?.toString(),
    coverImageKey: blog.coverImageKey || null, // ✅ Added for R2
    createdAt: blog.createdAt instanceof Date ? blog.createdAt.toISOString() : new Date(blog.createdAt).toISOString(),
  }));

  return (
    <main className="min-h-screen bg-background pt-20">
      <ProfileDashboard 
        user={serializedUser} 
        initialMyNotes={serializedMyNotes} 
        initialSavedNotes={serializedSavedNotes} 
        initialMyBlogs={serializedMyBlogs} 
        initialCollections={serializedCollections}
      />
    </main>
  );
}