import { getBlogBySlug } from "@/actions/blog.actions";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import EditBlogForm from "@/components/blog/EditBlogForm"; // Assuming this wraps or IS the PostBlogPage we just updated
import { FaShieldAlt } from "react-icons/fa";

export default async function EditBlogPage({ params }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session) redirect("/login");

  // Fetch the blog details
  const blog = await getBlogBySlug(slug, false); // false = don't increment view count

  if (!blog) notFound();

  // Security: Author only or Admin
  const isOwner = session.user.id === (blog.author?._id || blog.author);
  const isAdmin = session.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return (
      <div className="container min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
            <FaShieldAlt className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Access Denied</h1>
        <p className="text-muted-foreground font-medium">You don't have clearance to edit this secure document.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-12 px-4">
      {/* We pass the blog data to the client form */}
      <EditBlogForm blog={blog} />
    </div>
  );
}