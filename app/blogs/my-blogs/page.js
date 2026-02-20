import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyBlogs, deleteBlog } from "@/actions/blog.actions";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/blog/BlogCard"; // Importing your existing BlogCard
import { FaEdit, FaTrash, FaPenNib } from "react-icons/fa";
import { revalidatePath } from "next/cache";

export default async function MyBlogsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  // Fetch blogs created by the logged-in user
  const rawBlogs = await getMyBlogs(session.user.id);

  // Inject the session user data into the blogs so the BlogCard can display the author's avatar/name
  const blogs = rawBlogs.map(blog => ({
      ...blog,
      author: {
          _id: session.user.id,
          name: session.user.name,
          avatar: session.user.image || session.user.avatar,
          role: session.user.role
      }
  }));

  return (
    <div className="container py-12 min-h-screen max-w-7xl">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div className="text-center md:text-left">
                <h1 className="text-4xl font-extrabold tracking-tight">My Articles</h1>
                <p className="text-muted-foreground mt-2">Manage and track the performance of your published content.</p>
            </div>
            <Link href="/blogs/post"> {/* Or /blogs/post depending on your route */}
                <Button className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 border-0 shadow-lg hover:shadow-pink-500/25">
                    <FaPenNib className="mr-2" /> Write New Blog
                </Button>
            </Link>
        </div>

        {/* --- Content Section --- */}
        {blogs.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-secondary/5">
                <p className="text-xl text-muted-foreground mb-6 font-medium">You haven't written any articles yet.</p>
                <Link href="/blogs/post">
                    <Button variant="outline" className="rounded-full px-8">Start Writing</Button>
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                    <div key={blog._id} className="flex flex-col h-full group">
                        
                        {/* 1. Standard Blog Card Component */}
                        <div className="flex-grow">
                            <BlogCard blog={blog} />
                        </div>

                        {/* 2. Admin/Author Action Bar (Placed outside the BlogCard Link) */}
                        <div className="flex justify-end items-center gap-3 mt-4 px-2">
                            
                            {/* Edit Button */}
                            <Link href={`/blogs/edit/${blog.slug}`}> 
                                <Button variant="secondary" size="sm" className="rounded-full shadow-sm">
                                    <FaEdit className="mr-2 w-3.5 h-3.5" /> Edit
                                </Button>
                            </Link>

                            {/* Delete Button (Using inline Server Action) */}
                            <form action={async () => {
                                "use server";
                                await deleteBlog(blog._id, session.user.id);
                                revalidatePath('/blogs/my-blogs'); 
                            }}>
                                <Button variant="destructive" size="sm" className="rounded-full shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                                    <FaTrash className="mr-2 w-3.5 h-3.5" /> Delete
                                </Button>
                            </form>

                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}