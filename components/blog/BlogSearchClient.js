"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { FaSearch, FaTimes } from "react-icons/fa";

export default function BlogSearchClient({ initialSearch }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(initialSearch || "");

    // Update local state if URL changes externally
    useEffect(() => {
        setSearchTerm(searchParams.get("search") || "");
    }, [searchParams]);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm) {
            params.set("search", searchTerm);
        } else {
            params.delete("search");
        }
        params.delete("page"); // Reset to page 1 on new search
        router.push(`/blogs?${params.toString()}`);
    };

    const handleClear = () => {
        setSearchTerm("");
        const params = new URLSearchParams(searchParams.toString());
        params.delete("search");
        params.delete("page");
        router.push(`/blogs?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className="relative flex items-center">
            <FaSearch className="absolute left-4 text-muted-foreground" />
            <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search articles..." 
                className="pl-12 pr-12 h-12 rounded-full bg-secondary/10 border-primary/20 focus:border-pink-500 transition-colors w-full"
            />
            {searchTerm && (
                <button 
                    type="button" 
                    onClick={handleClear}
                    className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label="Clear search"
                >
                    <FaTimes />
                </button>
            )}
            <button type="submit" className="hidden">Search</button>
        </form>
    );
}