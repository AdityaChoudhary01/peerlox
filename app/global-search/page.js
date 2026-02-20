import { performGlobalSearch } from "@/actions/search.actions";
import NoteCard from "@/components/notes/NoteCard";
import BlogCard from "@/components/blog/BlogCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { FileText, Rss, Users, Search as SearchIcon } from "lucide-react";

export default async function GlobalSearchPage({ searchParams }) {
  const query = searchParams.q || "";
  const { notes, blogs, users } = await performGlobalSearch(query);

  const totalResults = notes.length + blogs.length + users.length;

  return (
    <div className="container max-w-7xl py-24 min-h-screen">
      {/* Search Header */}
      <div className="mb-12 border-b pb-8">
        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
          <SearchIcon className="w-8 h-8 text-primary" />
          Search Results
        </h1>
        <p className="text-muted-foreground">
          Showing {totalResults} results for <span className="text-primary font-bold">"{query}"</span>
        </p>
      </div>

      {totalResults === 0 ? (
        <div className="text-center py-20 bg-secondary/10 rounded-3xl border-2 border-dashed">
          <p className="text-xl text-muted-foreground">No matches found for your search.</p>
          <Link href="/" className="text-primary hover:underline mt-4 block">Return Home</Link>
        </div>
      ) : (
        <div className="space-y-16">
          
          {/* 1. NOTES RESULTS */}
          {notes.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FileText className="text-cyan-400" /> Study Notes ({notes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(note => <NoteCard key={note._id} note={note} />)}
              </div>
            </section>
          )}

          {/* 2. BLOG RESULTS */}
          {blogs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Rss className="text-pink-500" /> Community Blogs ({blogs.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map(blog => <BlogCard key={blog._id} blog={blog} />)}
              </div>
            </section>
          )}

          {/* 3. USER RESULTS */}
          {users.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="text-purple-500" /> Students & Contributors ({users.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                  <Link href={`/profile/${user._id}`} key={user._id}>
                    <Card className="hover:border-primary/50 transition-all group">
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12 border group-hover:border-primary transition-colors">
                          <AvatarImage src={user.avatar || user.image} />
                          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                          <h3 className="font-bold truncate group-hover:text-primary transition-colors">
                            {user.name}
                          </h3>
                          <p className="text-xs text-muted-foreground capitalize">
                            {user.role} • {user.noteCount || 0} uploads
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}