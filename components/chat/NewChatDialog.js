"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // 🔹 Import createPortal
import { useRouter } from "next/navigation";
import { searchUsersForChat } from "@/services/chat.service"; 
import { Edit, X, Search, Loader2, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function NewChatDialog({ currentUserId }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false); // 🔹 Prevents Next.js hydration mismatch

  // Set mounted to true once the component renders on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔹 Debounced Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const dbUsers = await searchUsersForChat(searchQuery, currentUserId);
        setResults(dbUsers);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentUserId]);

  const handleStartChat = (userId) => {
    setIsOpen(false);
    setSearchQuery("");
    router.push(`/chat/${userId}`);
  };

  // 🔹 The Modal UI
  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-background/95 backdrop-blur-3xl border border-border/50 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <h2 className="text-lg font-semibold tracking-tight">New Message</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for users..."
              className="pl-11 h-12 rounded-2xl bg-muted/50 border-transparent focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 text-[15px]"
            />
            {isSearching && (
              <Loader2 className="absolute right-4 w-4 h-4 text-muted-foreground animate-spin" />
            )}
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto max-h-[400px] min-h-[250px] p-2">
          {!searchQuery.trim() ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
              <MessageCircle className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm font-medium">Type a name to start a chat</p>
            </div>
          ) : results.length === 0 && !isSearching ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
              <p className="text-sm">No users found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleStartChat(user._id)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-primary/5 transition-all group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-border/50">
                      <AvatarImage src={user.avatar} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-[15px] group-hover:text-primary transition-colors">
                      {user.name}
                    </span>
                  </div>
                  
                  {/* Arrow indicator */}
                  <span className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  ) : null;

  return (
    <>
      {/* 🔹 The Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
        aria-label="New Message"
      >
        <Edit className="w-5 h-5 ml-0.5 mt-0.5" />
      </button>

      {/* 🔹 Mount the Portal exactly on document.body */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}