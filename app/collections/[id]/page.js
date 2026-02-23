import { notFound, redirect } from "next/navigation";
import { getCollectionById } from "@/actions/collection.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NoteCard from "@/components/notes/NoteCard";
import CollectionActions from "@/components/notes/CollectionActions"; // Client Component
import { FolderOpen, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { removeNoteFromCollection } from "@/actions/collection.actions"; 
import Link from "next/link";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  
  const collection = await getCollectionById(resolvedParams.id);
  return {
    title: collection ? `${collection.name} | Collections` : "Collection Not Found",
  };
}

export default async function ViewCollectionPage({ params }) {
  const resolvedParams = await params;

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const collection = await getCollectionById(resolvedParams.id);
  
  if (!collection) {
    return notFound();
  }

  // 🚀 THE FIX: Safely extract and convert the MongoDB ObjectId to a string
  // This handles both populated (user._id) and unpopulated (user) mongoose queries.
  const collectionOwnerId = collection.user?._id?.toString() || collection.user?.toString();

  // Security: Only owner can view
  if (collectionOwnerId !== session.user.id) {
    return notFound();
  }

  return (
    <div className="container py-8 min-h-[80vh] pt-24">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b">
        <div>
           <div className="flex items-center gap-2 text-primary mb-2">
              <FolderOpen className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Collection</span>
           </div>
           <h1 className="text-4xl font-extrabold tracking-tight">{collection.name}</h1>
           <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Created {formatDate(collection.createdAt)} 
              <span className="text-border mx-2">|</span> 
              {collection.notes.length} Notes
           </p>
        </div>

        {/* Client Component for Edit/Delete Buttons */}
        <CollectionActions collection={collection} />
      </div>

      {/* Notes Grid */}
      {collection.notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collection.notes.map((note) => (
            <div key={note._id} className="relative group">
               {/* Note Card */}
               <NoteCard note={note} />
               
               {/* Remove Button (Overlay) */}
               <form action={async () => {
                  "use server";
                  await removeNoteFromCollection(collection._id, note._id, session.user.id);
               }}>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 text-xs"
                  >
                    Remove
                  </Button>
               </form>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary/5 rounded-3xl border border-dashed">
            <FolderOpen className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-xl font-bold text-muted-foreground">This collection is empty</h3>
            <p className="text-sm text-muted-foreground/70 mb-6">Start browsing to add notes here.</p>
            <Button asChild>
                <Link href="/search">Explore Notes</Link>
            </Button>
        </div>
      )}
    </div>
  );
}