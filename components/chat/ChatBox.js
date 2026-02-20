"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useChannel, useAbly, ChannelProvider } from "ably/react";
import {
  sendMessage,
  markConversationRead,
  editMessage,
  deleteMessageForEveryone,
  toggleReaction,
  // 🔹 You will need to create this function in your chat.service.js
  getOlderMessages 
} from "@/services/chat.service";

import { Send, MoreHorizontal, Edit2, Trash2, Check, CheckCheck, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMOJIS = ["👍", "❤️", "😂", "😮", "🔥", "😢"];
const MESSAGES_PER_PAGE = 20;

/* ============================= */
/* 🔹 Helpers */
/* ============================= */
function formatLastSeen(dateString) {
  if (!dateString) return "Offline";
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / 60000);

  if (diffInMinutes < 1) return "Last seen just now";
  if (diffInMinutes < 60) return `Last seen ${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `Last seen ${Math.floor(diffInMinutes / 60)}h ago`;
  
  return `Last seen ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
}

function formatTime(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ============================= */
/* 🔹 Message Action Menu */
/* ============================= */
function MessageMenu({ message, isMe, onReact, onEdit, onDelete, close }) {
  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-transparent" 
        onClick={(e) => {
          e.stopPropagation();
          close();
        }} 
      />
      
      <div 
        className={`absolute z-50 bottom-[calc(100%+0.5rem)] w-64 bg-background/95 backdrop-blur-2xl border border-border/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] rounded-2xl p-3 animate-in fade-in zoom-in-95 duration-200 origin-bottom ${
          isMe ? "right-0" : "left-0"
        }`}
      >
        <div className="flex justify-between items-center mb-3 px-1">
          {EMOJIS.map((e, index) => (
            <button
              key={e}
              style={{ animationDelay: `${index * 40}ms` }}
              onClick={(ev) => {
                ev.stopPropagation();
                onReact(e);
                close();
              }}
              className="text-xl hover:scale-150 hover:-translate-y-2 active:scale-95 transition-all duration-300 animate-in slide-in-from-bottom-2 fade-in"
            >
              {e}
            </button>
          ))}
        </div>

        {isMe && (
          <div className="border-t border-border/50 pt-2 space-y-1 text-sm font-medium">
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                onEdit();
                close();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted/80 transition-colors text-foreground"
            >
              <Edit2 className="w-4 h-4 text-muted-foreground" /> Edit Message
            </button>

            <button
              onClick={(ev) => {
                ev.stopPropagation();
                onDelete();
                close();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete for Everyone
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ============================= */
/* 🔹 Chat Content */
/* ============================= */
function ChatBoxContent({ currentUser, recipient, conversationId, initialMessages }) {
  const ably = useAbly();
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState(initialMessages || []);
  const [text, setText] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const [lastSeen, setLastSeen] = useState(recipient.lastSeen || null);

  // 🔹 Pagination States
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(initialMessages?.length >= MESSAGES_PER_PAGE);
  const [page, setPage] = useState(1);
  const previousScrollHeight = useRef(0);
  
  const typingTimeoutRef = useRef(null);
  const channelName = `chat:${conversationId}`;

  /* ============================= */
  /* 🔹 Presence Logic */
  /* ============================= */
  useEffect(() => {
    if (!ably) return;
    const channel = ably.channels.get("presence:global");
    
    const init = async () => {
      const members = await channel.presence.get();
      setOnlineUsers(members.map((m) => m.clientId));
    };
    init();

    channel.presence.subscribe("enter", (m) => {
      setOnlineUsers((prev) => [...prev, m.clientId]);
    });

    channel.presence.subscribe("leave", (m) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== m.clientId));
      if (m.clientId === recipient._id) {
        setLastSeen(new Date().toISOString());
      }
    });

    return () => {
      channel.presence.unsubscribe("enter");
      channel.presence.unsubscribe("leave");
    };
  }, [ably, recipient._id]);

  const isOnline = onlineUsers.includes(recipient._id);

  /* ============================= */
  /* 🔹 Mark Read on Mount */
  /* ============================= */
  useEffect(() => {
    if (!conversationId) return;
    markConversationRead(conversationId, currentUser.id);
    
    const notifyChannel = ably.channels.get(`notifications:${currentUser.id}`);
    notifyChannel.publish("conversation-read", { conversationId });

    const chatChannel = ably.channels.get(channelName);
    chatChannel.publish("messages-read", { readerId: currentUser.id });
  }, [conversationId, currentUser.id, ably, channelName]);

  /* ============================= */
  /* 🔹 Realtime Listener */
  /* ============================= */
  useChannel(channelName, (message) => {
    switch (message.name) {
      case "message":
        setMessages((prev) => prev.some((m) => String(m._id) === String(message.data._id)) ? prev : [...prev, message.data]);
        
        if (String(message.data.sender) !== String(currentUser.id)) {
          markConversationRead(conversationId, currentUser.id);
          
          const notifyChannel = ably.channels.get(`notifications:${currentUser.id}`);
          notifyChannel.publish("conversation-read", { conversationId });

          const chatChannel = ably.channels.get(channelName);
          chatChannel.publish("messages-read", { readerId: currentUser.id });
        }
        break;

      case "reaction-updated":
        setMessages((prev) => prev.map((m) => String(m._id) === String(message.data.messageId) ? { ...m, reactions: message.data.reactions } : m));
        break;

      case "message-edited":
        setMessages((prev) => prev.map((m) => String(m._id) === String(message.data.messageId) ? { ...m, content: message.data.content, edited: true } : m));
        break;

      case "message-deleted":
        setMessages((prev) => prev.map((m) => String(m._id) === String(message.data.messageId) ? { ...m, deletedForEveryone: true } : m));
        break;

      case "typing":
        if (String(message.data.senderId) === String(recipient._id)) {
          setIsRecipientTyping(message.data.isTyping);
        }
        break;

      case "messages-read": 
        if (String(message.data.readerId) === String(recipient._id)) {
           setMessages(prev => prev.map(m => 
             String(m.sender) === String(currentUser.id) && !m.readBy?.includes(recipient._id)
              ? { ...m, readBy: [...(m.readBy || []), recipient._id] }
              : m
           ));
        }
        break;
        
      default:
        break;
    }
  });

  /* ============================= */
  /* 🔹 Pagination Logic */
  /* ============================= */
  
  // 1. Initial Scroll to Bottom
  useEffect(() => {
    if (scrollRef.current && page === 1 && !isLoadingMore) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isRecipientTyping, page, isLoadingMore]);

  // 2. Handle Scroll Event to Load Older Messages
  const handleScroll = useCallback(async () => {
    if (!scrollRef.current || isLoadingMore || !hasMoreMessages) return;

    // If we hit the absolute top of the container
    if (scrollRef.current.scrollTop === 0) {
      setIsLoadingMore(true);
      
      // Save current height so we know how much to offset after new messages load
      previousScrollHeight.current = scrollRef.current.scrollHeight;

      try {
        const nextPage = page + 1;
        // 🚨 YOU NEED TO IMPLEMENT THIS IN chat.service.js
        const olderMessages = await getOlderMessages(conversationId, nextPage);
        
        if (olderMessages && olderMessages.length > 0) {
          // Prepend older messages to the top
          setMessages(prev => [...olderMessages, ...prev]);
          setPage(nextPage);
          
          if (olderMessages.length < MESSAGES_PER_PAGE) {
            setHasMoreMessages(false); // No more history
          }
        } else {
          setHasMoreMessages(false);
        }
      } catch (error) {
        console.error("Failed to load older messages:", error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [isLoadingMore, hasMoreMessages, page, conversationId]);

  // 3. Maintain Scroll Position after loading old messages
  useEffect(() => {
    if (scrollRef.current && page > 1) {
      // Calculate the difference in height and adjust scrollTop so the view stays locked
      const currentScrollHeight = scrollRef.current.scrollHeight;
      const heightDifference = currentScrollHeight - previousScrollHeight.current;
      scrollRef.current.scrollTop = heightDifference;
    }
  }, [messages, page]);


  /* ============================= */
  /* 🔹 Send & Typing Actions */
  /* ============================= */
  const handleTyping = (value) => {
    setText(value);
    const channel = ably.channels.get(channelName);
    channel.publish("typing", { senderId: currentUser.id, isTyping: true });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      channel.publish("typing", { senderId: currentUser.id, isTyping: false });
    }, 1500);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const saved = await sendMessage({
      senderId: currentUser.id,
      receiverId: recipient._id,
      content: text,
    });

    const chatChannel = ably.channels.get(channelName);
    chatChannel.publish("message", saved);

    const notifyChannel = ably.channels.get(`notifications:${recipient._id}`);
    notifyChannel.publish("new-message", { conversationId, content: saved.content });

    setText("");
    chatChannel.publish("typing", { senderId: currentUser.id, isTyping: false });
    clearTimeout(typingTimeoutRef.current);
    
    // Force scroll to bottom when sending a new message
    if (scrollRef.current) {
        setTimeout(() => {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }, 50);
    }
  };

  const handleReaction = async (msg, emoji) => {
    const updated = await toggleReaction(msg._id, currentUser.id, emoji);
    const channel = ably.channels.get(channelName);
    channel.publish("reaction-updated", updated);
  };

  const handleEdit = async (msg) => {
    const newContent = prompt("Edit message:", msg.content);
    if (!newContent || newContent === msg.content) return;
    await editMessage(msg._id, newContent);
    const channel = ably.channels.get(channelName);
    channel.publish("message-edited", { messageId: msg._id, content: newContent });
  };

  const handleDelete = async (id) => {
    await deleteMessageForEveryone(id);
    const channel = ably.channels.get(channelName);
    channel.publish("message-deleted", { messageId: id });
  };


  /* ============================= */
  /* 🔹 UI */
  /* ============================= */
  return (
    // 🔹 FIX: Removed relative absolute positioning traps. Flex column layout strictly partitions the header, messages, and input.
    <div className="flex flex-col h-full w-full max-h-[100dvh] bg-background sm:border sm:border-border/40 sm:rounded-3xl sm:shadow-2xl overflow-hidden relative">
      
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      {/* 1. HEADER (Fixed at top, sibling to scroll area) */}
      <div className="w-full z-20 px-4 py-3 border-b border-border/40 bg-background/80 backdrop-blur-xl flex items-center justify-between shadow-sm shrink-0">
        <Link 
          href={`/profile/${recipient._id}`} 
          className="flex items-center gap-3 hover:bg-muted/50 p-1.5 pr-4 rounded-full transition-colors group cursor-pointer"
        >
          <div className="relative">
            <Avatar className="w-10 h-10 border border-border/50 shadow-sm transition-transform group-hover:scale-105">
              <AvatarImage src={recipient.avatar} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {recipient.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span 
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background transition-colors duration-300 ${
                isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground/50"
              }`}
            />
          </div>

          <div className="flex flex-col">
            <h2 className="font-semibold text-foreground leading-none tracking-tight group-hover:text-primary transition-colors">
              {recipient.name}
            </h2>
            <div className="text-[11px] text-muted-foreground mt-1 font-medium min-h-[16px]">
              {isRecipientTyping ? (
                <span className="text-primary animate-pulse font-semibold tracking-wide">Typing...</span>
              ) : isOnline ? (
                <span className="text-emerald-500 font-medium tracking-wide">Active now</span>
              ) : (
                <span>{formatLastSeen(lastSeen)}</span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* 2. MESSAGES AREA (Independent scrolling container) */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-5 scrollbar-thin z-10"
      >
        {/* Loading Spinner for old messages */}
        {isLoadingMore && (
           <div className="w-full flex justify-center py-2">
               <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
           </div>
        )}

        {messages.map((msg) => {
          const isMe = String(msg.sender) === String(currentUser.id);
          
          const isRead = msg.readBy && msg.readBy.some(id => String(id) === String(recipient._id));
          const isDelivered = isOnline || isRead; 

          return (
            <div
              key={msg._id}
              className={`flex w-full ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div 
                className="relative group max-w-[85%] sm:max-w-[70%] flex flex-col"
                onContextMenu={(e) => {
                  e.preventDefault();
                  setActiveMenu(msg._id);
                }}
              >
                <div
                  className={`relative px-4 py-2.5 shadow-sm text-[15px] leading-relaxed break-words ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm shadow-primary/20"
                      : "bg-muted/80 text-foreground border border-border/50 rounded-2xl rounded-bl-sm"
                  }`}
                >
                  {msg.deletedForEveryone ? (
                    <span className="italic opacity-60 flex items-center gap-2 text-sm">
                      <Trash2 className="w-3.5 h-3.5" /> This message was deleted
                    </span>
                  ) : (
                    <div className="flex flex-col">
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      
                      <div className={`flex items-center gap-1 mt-1 -mb-1 ${isMe ? 'justify-end text-primary-foreground/80' : 'justify-start text-muted-foreground'}`}>
                        {msg.edited && <span className="text-[10px] mr-1 opacity-70">Edited</span>}
                        <span className="text-[10px] opacity-80 font-medium">
                          {formatTime(msg.createdAt)}
                        </span>
                        
                        {isMe && (
                          isRead ? (
                            <CheckCheck className="w-[14px] h-[14px] text-blue-300 drop-shadow-sm ml-0.5" />
                          ) : isDelivered ? (
                            <CheckCheck className="w-[14px] h-[14px] opacity-70 ml-0.5" />
                          ) : (
                            <Check className="w-[14px] h-[14px] opacity-70 ml-0.5" />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {msg.reactions?.length > 0 && (
                    <div className={`absolute -bottom-3 flex gap-1 flex-wrap z-10 ${isMe ? "right-2" : "left-2"}`}>
                      {msg.reactions.map((r, i) => (
                        <span
                          key={i}
                          className="text-[12px] bg-background text-foreground border border-border shadow-md px-1.5 py-0.5 rounded-full cursor-default animate-in zoom-in duration-300 hover:scale-125 transition-transform origin-bottom"
                        >
                          {r.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {!msg.deletedForEveryone && (
                  <button
                    onClick={() => setActiveMenu(activeMenu === msg._id ? null : msg._id)}
                    className={`absolute top-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-full hover:bg-muted bg-background border shadow-sm text-muted-foreground ${
                      isMe ? "-left-10" : "-right-10"
                    } hidden md:flex items-center justify-center hover:scale-110 active:scale-95`}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                )}

                {activeMenu === msg._id && (
                  <MessageMenu
                    message={msg}
                    isMe={isMe}
                    onReact={(emoji) => handleReaction(msg, emoji)}
                    onEdit={() => handleEdit(msg)}
                    onDelete={() => handleDelete(msg._id)}
                    close={() => setActiveMenu(null)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. INPUT AREA (Fixed at bottom, sibling to scroll area) */}
      <div className="w-full p-4 bg-gradient-to-t from-background via-background/95 to-transparent shrink-0 z-20">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 max-w-4xl mx-auto bg-background/90 backdrop-blur-xl border border-border/60 p-1.5 pl-5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all"
        >
          <Input
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Message..."
            className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 text-[15px] px-0 h-10 placeholder:text-muted-foreground/60"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!text.trim()}
            className="rounded-full w-10 h-10 shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-md"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
      </div>
      
    </div>
  );
}

/* ============================= */
/* 🔹 Wrapper */
/* ============================= */
export default function ChatBox(props) {
  return (
    <ChannelProvider channelName={`chat:${props.conversationId}`}>
      <ChatBoxContent {...props} />
    </ChannelProvider>
  );
}