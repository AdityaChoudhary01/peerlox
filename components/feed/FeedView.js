"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FaBook, FaPenNib, FaFilter, FaSearch } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import NoteCard from "@/components/notes/NoteCard";
import BlogCard from "@/components/blog/BlogCard";
import Pagination from "@/components/common/Pagination";

export default function FeedView({ initialContent }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [filter, setFilter] = useState('all');

  // --- Pagination Logic ---
  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 6;

  // 1. Filter Logic
  const filteredContent = initialContent.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  // 2. Calculate Slicing
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  
  // Safety Check: If current page is higher than total pages (due to filtering), 
  // we force the view to the last available page or page 1
  const activePage = currentPage > totalPages ? 1 : currentPage;
  
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedContent = filteredContent.slice(startIndex, startIndex + itemsPerPage);

  // Function to change filter AND reset page to 1
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // Reset pagination to page 1
    router.push(`${pathname}?${params.toString()}`);
  };

  if (initialContent.length === 0) {
    return (
      <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed">
        <h2 className="text-2xl font-bold mb-4">Your Feed is Quiet... 😴</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          You haven't followed any users yet, or your followed authors haven't posted recently.
        </p>
        <Link href="/search">
          <Button className="rounded-full gap-2 pl-6 pr-6">
            <FaSearch /> Discover Authors
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex justify-center gap-2 mb-8">
        <span className="flex items-center gap-2 text-muted-foreground font-semibold mr-2">
          <FaFilter /> Show:
        </span>
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          onClick={() => handleFilterChange('all')} 
          className="rounded-full"
        >
          All
        </Button>
        <Button 
          variant={filter === 'note' ? 'default' : 'outline'} 
          onClick={() => handleFilterChange('note')} 
          className="rounded-full gap-2"
        >
          <FaBook /> Notes
        </Button>
        <Button 
          variant={filter === 'blog' ? 'default' : 'outline'} 
          onClick={() => handleFilterChange('blog')} 
          className="rounded-full gap-2"
        >
          <FaPenNib /> Blogs
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedContent.map((item) => (
          <div key={`${item.type}-${item._id}`} className="relative group">
            <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded flex items-center gap-1">
              {item.type === 'note' ? <><FaBook /> Note</> : <><FaPenNib /> Blog</>}
            </div>
            
            {item.type === 'note' ? (
              <NoteCard note={item} />
            ) : (
              <div className="h-full">
                <BlogCard blog={item} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State for Filters */}
      {filteredContent.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No content found for this filter.
        </div>
      )}

      {/* Pagination Component */}
      <div className="mt-8">
        <Pagination 
          currentPage={activePage} 
          totalPages={totalPages} 
        />
      </div>
    </div>
  );
}