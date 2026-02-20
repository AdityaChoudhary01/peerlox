"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { useChannel, useAbly, ChannelProvider } from "ably/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { deleteConversation } from "@/services/chat.service";
import { Trash2 } from "lucide-react";

// ==========================================
// 🔹 Smart Presence Hook
// ==========================================
function useSmartPresence(ably) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!ably) return;

    const channel = ably.channels.get("presence:global");

    const loadInitial = async () => {
      const members = await channel.presence.get();
      setOnlineUsers(members.map(m => m.clientId));
    };

    loadInitial();

    const onEnter = (member) =>
      setOnlineUsers(prev =>
        prev.includes(member.clientId)
          ? prev
          : [...prev, member.clientId]
      );

    const onLeave = (member) =>
      setOnlineUsers(prev =>
        prev.filter(id => id !== member.clientId)
      );

    channel.presence.subscribe("enter", onEnter);
    channel.presence.subscribe("leave", onLeave);

    return () => {
      channel.presence.unsubscribe("enter", onEnter);
      channel.presence.unsubscribe("leave", onLeave);
    };

  }, [ably]);

  return onlineUsers;
}

// ==========================================
// 🔹 Inner Component
// ==========================================
function ChatListContent({ initialConversations, currentUserId }) {
  const ably = useAbly();
  const router = useRouter(); 
  const [conversations, setConversations] = useState(initialConversations || []);
  const onlineUsers = useSmartPresence(ably);

  // 🔹 FIX 1: Bust the Next.js Back-Button Cache
  useEffect(() => {
    router.refresh();
  }, [router]);

  // 🔹 FIX 2: Sync Server Data with React State
  // When router.refresh() finishes fetching the fresh database data, 
  // this forces the local state to update and show the latest message preview!
  useEffect(() => {
    setConversations(initialConversations || []);
  }, [initialConversations]);

  // ==========================================
  // 🔹 Real-time Notifications
  // ==========================================
  useChannel(`notifications:${currentUserId}`, (message) => {
    switch (message.name) {
      case "new-message": {
        const data = message.data;
        
        setConversations(prev => {
          const existing = prev.find(c => String(c.conversationId) === String(data.conversationId));
          if (!existing) return prev;

          const updated = prev.map(c =>
            String(c.conversationId) === String(data.conversationId)
              ? {
                  ...c,
                  lastMessage: data.content,
                  unreadCount: c.unreadCount + 1
                }
              : c
          );

          const target = updated.find(c => String(c.conversationId) === String(data.conversationId));

          return [
            target,
            ...updated.filter(c => String(c.conversationId) !== String(data.conversationId))
          ];
        });
        break;
      }

      case "conversation-read": {
        setConversations(prev =>
          prev.map(c =>
            String(c.conversationId) === String(message.data.conversationId)
              ? { ...c, unreadCount: 0 }
              : c
          )
        );
        break;
      }

      case "conversation-deleted": {
        setConversations(prev =>
          prev.filter(c => String(c.conversationId) !== String(message.data.conversationId))
        );
        break;
      }

      default:
        break;
    }
  });

  // ==========================================
  // 🔹 Delete Handler
  // ==========================================
  const handleDeleteConversation = async (conversationId) => {
    const confirmDelete = confirm("Delete this conversation?");
    if (!confirmDelete) return;

    await deleteConversation(conversationId);

    const channel = ably.channels.get(`notifications:${currentUserId}`);
    channel.publish("conversation-deleted", {
      conversationId
    });

    setConversations(prev =>
      prev.filter(c => String(c.conversationId) !== String(conversationId))
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-2">
        {conversations.map(convo => {
          const isOnline = onlineUsers.includes(convo.user._id);

          return (
            <div
              key={convo.conversationId}
              className="relative group"
            >
              <Link
                href={`/chat/${convo.user._id}`}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary/50 transition pr-12"
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={convo.user.avatar} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {convo.user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <span
                    className={cn(
                      "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background transition-colors duration-300",
                      isOnline
                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        : "bg-zinc-400"
                    )}
                  />
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-semibold text-sm truncate pr-2 text-foreground">
                      {convo.user.name}
                    </span>

                    {convo.unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full shadow-sm animate-in zoom-in duration-200 shrink-0">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>

                  <p className={`text-xs truncate ${convo.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {convo.lastMessage}
                  </p>
                </div>
              </Link>

              {/* Modern Delete Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteConversation(convo.conversationId);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 hover:scale-110 active:scale-95 z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {conversations.length === 0 && (
          <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-2 animate-in fade-in duration-500">
            <span className="text-4xl">📭</span>
            <p className="text-sm font-medium">No conversations yet</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

// ==========================================
// 🔹 Wrapper
// ==========================================
export default function ChatList({ initialConversations, currentUserId }) {
  return (
    <ChannelProvider channelName={`notifications:${currentUserId}`}>
      <ChatListContent
        initialConversations={initialConversations}
        currentUserId={currentUserId}
      />
    </ChannelProvider>
  );
}