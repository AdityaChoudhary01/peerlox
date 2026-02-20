"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button"; // Import the variants for styling
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Pagination({ currentPage, totalPages }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  // ✅ Helper to generate the SEO-friendly URL
  const createPageURL = (pageNumber) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <nav 
      className="flex items-center justify-center gap-4 py-6" 
      aria-label="Pagination" // ✅ SEO & A11y: Identifies the nav block
    >
      {/* --- PREVIOUS PAGE LINK --- */}
      {currentPage > 1 ? (
        <Link
          href={createPageURL(currentPage - 1)}
          rel="prev" // ✅ SEO: Tells Google this is the previous logical page
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Previous</span>
        </Link>
      ) : (
        <div className={cn(buttonVariants({ variant: "outline" }), "gap-2 opacity-50 cursor-not-allowed")}>
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Previous</span>
        </div>
      )}
      
      {/* --- PAGE INDICATOR --- */}
      <span className="text-sm font-black uppercase tracking-widest text-white/40">
        Page <span className="text-primary">{currentPage}</span> of {totalPages}
      </span>
      
      {/* --- NEXT PAGE LINK --- */}
      {currentPage < totalPages ? (
        <Link
          href={createPageURL(currentPage + 1)}
          rel="next" // ✅ SEO: Tells Google this is the next logical page
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      ) : (
        <div className={cn(buttonVariants({ variant: "outline" }), "gap-2 opacity-50 cursor-not-allowed")}>
          <span>Next</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </div>
      )}
    </nav>
  );
}