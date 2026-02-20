"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function NoteFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    university: searchParams.get("university") || "",
    course: searchParams.get("course") || "",
    subject: searchParams.get("subject") || "",
    year: searchParams.get("year") || "",
  });

  const handleApply = () => {
    const params = new URLSearchParams();
    // Only push non-empty values to URL
    Object.keys(filters).forEach(key => {
        if (filters[key]) params.set(key, filters[key]);
    });
    router.push(`/search?${params.toString()}`);
  };

  const handleClear = () => {
    setFilters({ search: "", university: "", course: "", subject: "", year: "" });
    router.push("/search");
  };

  return (
    <div className="space-y-4 bg-card border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold flex items-center gap-2"><Search className="w-4 h-4" /> Filter Notes</h3>
        {Array.from(searchParams).length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 text-xs text-muted-foreground hover:text-destructive">
                <X className="w-3 h-3 mr-1" /> Clear
            </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase">Keywords</Label>
            <Input 
                placeholder="Search titles..." 
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase">University</Label>
            <Input 
                placeholder="e.g. IIT Bombay" 
                value={filters.university}
                onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value }))}
                className="bg-background/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
             <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Course</Label>
                <Input 
                    placeholder="e.g. CSE" 
                    value={filters.course}
                    onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
                    className="bg-background/50"
                />
             </div>
             <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Year</Label>
                <Input 
                    type="number"
                    placeholder="1-5" 
                    value={filters.year}
                    onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                    className="bg-background/50"
                />
             </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase">Subject Code</Label>
            <Input 
                placeholder="e.g. CS101" 
                value={filters.subject}
                onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                className="bg-background/50"
            />
          </div>
      </div>

      <Button onClick={handleApply} className="w-full mt-2 font-bold bg-primary/90 hover:bg-primary">
        Apply Filters
      </Button>
    </div>
  );
}