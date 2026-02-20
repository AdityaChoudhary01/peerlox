import { getAdminStats, getAllUsers } from "@/actions/admin.actions";
import { getNotes } from "@/actions/note.actions";
import { getBlogs } from "@/actions/blog.actions";
import AdminTabs from "@/components/admin/AdminTabs";
import StatsCard from "@/components/admin/StatsCards"; 
import { FaShieldAlt, FaUsers, FaFileAlt, FaPenNib } from "react-icons/fa";

export const metadata = {
  title: "Admin Panel | PeerNotez",
};

export default async function AdminDashboardPage() {
  const [stats, users, notesData, blogsData] = await Promise.all([
    getAdminStats(),
    getAllUsers(),
    getNotes({ limit: 100 }), 
    getBlogs({ limit: 100 })  
  ]);

  // --- SERIALIZATION LAYER ---
  const serializedUsers = users.map(user => ({
    ...user,
    _id: user._id.toString(),
    avatarKey: user.avatarKey || null,
  }));

  const serializedNotes = notesData.notes.map(note => ({
    ...note,
    _id: note._id.toString(),
    user: note.user ? {
      ...note.user,
      _id: note.user._id?.toString() || note.user.toString()
    } : null,
    fileKey: note.fileKey || null,
    thumbnailKey: note.thumbnailKey || null,
    uploadDate: note.uploadDate instanceof Date ? note.uploadDate.toISOString() : new Date(note.uploadDate).toISOString(),
  }));

  const serializedBlogs = blogsData.blogs.map(blog => ({
    ...blog,
    _id: blog._id.toString(),
    author: blog.author ? {
        ...blog.author,
        _id: blog.author._id?.toString() || blog.author.toString()
    } : null,
    coverImageKey: blog.coverImageKey || null,
    createdAt: blog.createdAt instanceof Date ? blog.createdAt.toISOString() : new Date(blog.createdAt).toISOString(),
  }));

  return (
    // Adjust padding-top for mobile vs desktop nav heights
    <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10 pt-20 sm:pt-28">
      
      {/* Page Header - Responsive Flex Direction */}
      <div className="flex flex-col md:flex-row items-center md:items-start lg:items-center justify-between gap-6 border-b border-white/5 pb-8 sm:pb-10">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            {/* Shield Icon - Scales slightly for mobile */}
            <div className="p-3 sm:p-4 bg-cyan-500/10 rounded-2xl sm:rounded-[2rem] text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                <FaShieldAlt className="text-3xl sm:text-4xl" />
            </div>
            <div>
                {/* ✅ Responsive Font Size: 
                  text-3xl on mobile, text-5xl on desktop.
                  tracking-tighter prevents wrapping issues.
                */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase leading-none">
                    System Administration
                </h1>
                <p className="text-white/40 font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[9px] sm:text-[10px] mt-2">
                    Cloudflare R2 • MongoDB Atlas • Global Moderation
                </p>
            </div>
        </div>
      </div>

      {/* Stats Overview - Automatically stacks on mobile via grid-cols-1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard 
            icon={<FaUsers />} 
            label="Total Users" 
            value={stats.userCount} 
            color="bg-blue-500/10 text-blue-400" 
            description="Global registered student accounts"
        />
        <StatsCard 
            icon={<FaFileAlt />} 
            label="Note Repository" 
            value={stats.noteCount} 
            color="bg-cyan-500/10 text-cyan-400" 
            description="R2 hosted academic documents"
        />
        <StatsCard 
            icon={<FaPenNib />} 
            label="Blog Articles" 
            value={stats.blogCount} 
            color="bg-pink-500/10 text-pink-400" 
            description="Published community insights"
        />
      </div>

      {/* Management Section - AdminTabs should handle internal scrolling for its tables */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
          <AdminTabs 
            users={serializedUsers} 
            notes={serializedNotes} 
            blogs={serializedBlogs} 
          />
      </div>
    </div>
  );
}