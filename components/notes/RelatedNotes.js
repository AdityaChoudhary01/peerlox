import Link from "next/link";
import { FileText, Download, Star } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function RelatedNotes({ notes }) {
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center p-6 bg-secondary/10 rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">No related notes found for this subject yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {notes.map((note) => (
        <Link key={note._id} href={`/notes/${note._id}`} className="group block">
          <div className="p-3 rounded-lg border bg-card hover:bg-secondary/20 transition-colors">
            <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary mb-1">
              {note.title}
            </h4>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" /> {note.university}
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1" title="Downloads">
                  <Download className="w-3 h-3" /> {note.downloadCount || 0}
                </span>
                {note.rating > 0 && (
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3 h-3 fill-current" /> {note.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}