"use client";

import { useState } from 'react';
import { Loader2, AlertCircle, FileX } from 'lucide-react';

export default function PDFViewer({ url, fileType, title }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Determine viewer strategy
  const isImage = fileType?.startsWith('image/');
  const isPDF = fileType === 'application/pdf';
  const isOffice = fileType?.includes('word') || fileType?.includes('presentation') || fileType?.includes('officedocument');

  // Google Docs Viewer Base URL
  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

  if (!url) return (
    <div className="w-full h-[600px] flex items-center justify-center bg-muted text-muted-foreground">
        <FileX className="w-10 h-10 mb-2" />
        <p>File unavailable</p>
    </div>
  );

  return (
    <div className="w-full h-[600px] bg-secondary/5 relative group">
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/50 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground font-medium">Loading Preview...</p>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-background">
          <AlertCircle className="h-10 w-10 text-destructive mb-2" />
          <p className="text-sm text-destructive font-medium">Preview unavailable</p>
          <a href={url} target="_blank" className="mt-4 text-primary underline text-sm">Download to view</a>
        </div>
      )}

      {/* Render Logic */}
      {isImage ? (
        <img 
          src={url} 
          alt={title} 
          className="w-full h-full object-contain"
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
        />
      ) : (
        <iframe
          src={googleViewerUrl}
          className="w-full h-full border-none"
          title="Document Viewer"
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }} // Note: Google Viewer iframes might not trigger onError reliably due to CORS, but this catches network errors.
        />
      )}
    </div>
  );
}