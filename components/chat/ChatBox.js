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
  getOlderMessages,
  getChatPresignedUrl
} from "@/services/chat.service";

import { 
  Send, MoreHorizontal, Edit2, Trash2, Check, CheckCheck, 
  Loader2, Reply, X, Paperclip, FileText, Download
} from "lucide-react";
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
function MessageMenu({ message, isMe, clickY, onReact, onEdit, onDelete, onReply, close }) {
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  // Make the detection area a bit more forgiving
  const openUpwards = clickY > viewportHeight * 0.6;

  const handleAction = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    close();
  };

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = message.fileUrl || message.imageUrl;
    if (url) {
      window.open(url, '_blank');
    }
    close();
  };

  return (
    <>
      {/* Invisible overlay to catch clicks outside the menu */}
      <div 
        className="fixed inset-0 z-[99]" 
        onClick={(e) => {
          e.stopPropagation();
          close();
        }} 
        onTouchStart={(e) => {
          e.stopPropagation();
          close();
        }}
      />
      
      {/* 🚀 FIX: Increased z-index dramatically (z-[100]) so it breaks out of the scroll container */}
      <div 
        className={`absolute z-[100] w-56 sm:w-64 bg-background/95 backdrop-blur-2xl border border-border/50 shadow-2xl rounded-2xl p-3 animate-in fade-in zoom-in-95 duration-200 ${
          isMe ? "right-0" : "left-0"
        } ${
          openUpwards 
            ? "bottom-[calc(100%+0.5rem)] origin-bottom"
            : "top-[calc(100%+0.5rem)] origin-top"
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent menu clicks from closing the menu
        onTouchStart={(e) => e.stopPropagation()} // 🚀 FIX: Essential for mobile so touches don't bubble
      >
        <div className="flex justify-between items-center mb-3 px-1">
          {EMOJIS.map((e, index) => (
            <button
              key={e}
              style={{ animationDelay: `${index * 30}ms` }}
              onClick={(ev) => handleAction(ev, () => onReact(e))}
              onTouchEnd={(ev) => handleAction(ev, () => onReact(e))} // 🚀 FIX: Mobile touch handling
              className={`text-xl hover:scale-150 hover:-translate-y-2 active:scale-95 transition-all duration-300 animate-in fade-in ${openUpwards ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'}`}
            >
              {e}
            </button>
          ))}
        </div>

        <div className="border-t border-border/50 pt-2 space-y-1 text-sm font-medium">
          
          <button
            onClick={(ev) => handleAction(ev, onReply)}
            onTouchEnd={(ev) => handleAction(ev, onReply)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/80 transition-colors text-foreground"
          >
            <Reply className="w-4 h-4 text-muted-foreground" /> Reply
          </button>

          {(message.fileUrl || message.imageUrl) && (
             <button
              onClick={handleDownload}
              onTouchEnd={handleDownload}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/80 transition-colors text-foreground"
            >
              <Download className="w-4 h-4 text-muted-foreground" /> Download
            </button>
          )}

          {isMe && !message.fileUrl && !message.imageUrl && (
            <button
              onClick={(ev) => handleAction(ev, onEdit)}
              onTouchEnd={(ev) => handleAction(ev, onEdit)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/80 transition-colors text-foreground"
            >
              <Edit2 className="w-4 h-4 text-muted-foreground" /> Edit Message
            </button>
          )}

          {isMe && (
            <button
              onClick={(ev) => handleAction(ev, onDelete)}
              onTouchEnd={(ev) => handleAction(ev, onDelete)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete for Everyone
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/* ============================= */
/* 🔹 Individual Message Component */
/* ============================= */
function MessageItem({ msg, isMe, isRead, isDelivered, currentUser, recipient, onReply, onReact, onEdit, onDelete, activeMenu, setActiveMenu }) {
  const [dragX, setDragX] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const isDraggingRef = useRef(false);
  const pressTimerRef = useRef(null); 

  const handleDragStart = (clientX, clientY) => {
    startX.current = clientX;
    startY.current = clientY;
    isDraggingRef.current = true;
  };

  const handleDragMove = (clientX, clientY) => {
    if (!isDraggingRef.current) return;
    const diffX = clientX - startX.current;
    const diffY = clientY - startY.current;

    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(dragX) < 10) {
      isDraggingRef.current = false;
      setDragX(0);
      return;
    }

    if (diffX > 0 && diffX < 80) {
      setDragX(diffX);
    }
  };

  const handleDragEnd = () => {
    if (!isDraggingRef.current) return;
    if (dragX > 50) {
      onReply(msg);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
    setDragX(0);
    isDraggingRef.current = false;
  };

  const transitionStyle = dragX > 0 ? 'none' : 'transform 0.2s ease-out';

  const handleTouchStart = (e) => {
    // Only start drag tracking if the menu isn't already open
    if (activeMenu) return; 
    
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    pressTimerRef.current = setTimeout(() => {
        if (Math.abs(dragX) < 10) {
           setActiveMenu({ id: msg._id, y: e.touches[0].clientY });
        }
    }, 500); 
  };

  const handleTouchEnd = () => {
    clearTimeout(pressTimerRef.current);
    handleDragEnd();
  };

  return (
    <div
      className={`flex w-full ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300 relative`}
      onTouchStart={handleTouchStart}
      onTouchMove={(e) => {
          clearTimeout(pressTimerRef.current); 
          handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center bg-secondary/80 rounded-full w-8 h-8 transition-opacity"
        style={{ 
          opacity: dragX / 60,
          transform: `translate(${dragX - 40}px, -50%)`
        }}
      >
        <Reply className="w-4 h-4 text-foreground" />
      </div>

      {/* 🚀 FIX: Ensure the relative container doesn't trap the z-index of the menu */}
      <div 
        className={`relative group max-w-[85%] sm:max-w-[70%] flex flex-col ${activeMenu?.id === msg._id ? 'z-50' : 'z-10'}`}
        style={{ transform: `translateX(${dragX}px)`, transition: transitionStyle }}
        onContextMenu={(e) => {
          e.preventDefault();
          setActiveMenu({ id: msg._id, y: e.clientY });
        }}
      >
        <div
          className={`relative px-2.5 pt-2 pb-1.5 shadow-sm text-[15px] leading-relaxed break-words flex flex-col ${
            isMe
              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm shadow-primary/20"
              : "bg-muted text-foreground border border-border/40 rounded-2xl rounded-bl-sm"
          }`}
        >
          {msg.deletedForEveryone ? (
            <span className="italic opacity-60 flex items-center gap-2 text-sm pb-1 px-1">
              <Trash2 className="w-3.5 h-3.5" /> This message was deleted
            </span>
          ) : (
            <>
              {msg.replyTo && (
                <div className={`mb-1.5 p-2 rounded-xl text-sm border-l-[3px] ${isMe ? 'bg-primary-foreground/15 border-primary-foreground/70 text-primary-foreground/90' : 'bg-background/80 border-primary/60 text-muted-foreground'} flex flex-col gap-0.5 pointer-events-none select-none`}>
                  <span className={`font-bold text-[11px] uppercase tracking-wider ${isMe ? 'text-primary-foreground/90' : 'text-primary'}`}>
                    {String(msg.replyTo.sender) === String(currentUser?.id) ? "You" : recipient.name}
                  </span>
                  <span className="line-clamp-2 text-xs opacity-90">{msg.replyTo.content || "Attachment"}</span>
                </div>
              )}

              {msg.imageUrl && (
                <div className="mb-1 rounded-xl overflow-hidden bg-black/10 flex items-center justify-center">
                  <img src={msg.imageUrl} alt="attachment" className="max-w-full h-auto object-cover max-h-64 rounded-xl border border-white/5 shadow-sm" loading="lazy" />
                </div>
              )}

              {msg.fileUrl && (
                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-2.5 rounded-xl mb-1 mt-1 border transition-colors ${isMe ? 'bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20' : 'bg-background border-border hover:bg-muted'}`}>
                   <div className={`p-2 rounded-lg ${isMe ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                     <FileText className="w-5 h-5" />
                   </div>
                   <div className="flex-1 overflow-hidden">
                     <span className="text-sm font-semibold truncate block w-[150px] sm:w-[200px]">{msg.fileName}</span>
                     <span className="text-[10px] uppercase tracking-wider opacity-70">Document</span>
                   </div>
                   <Download className={`w-4 h-4 opacity-50 ${isMe ? 'text-primary-foreground' : 'text-foreground'}`} />
                </a>
              )}

              <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
                {msg.content && <span className="whitespace-pre-wrap pl-1.5">{msg.content}</span>}
                
                <div className={`flex items-center gap-1 shrink-0 ml-auto pt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                  {msg.edited && <span className="text-[10px] italic">Edited</span>}
                  <span className="text-[10px] font-medium tracking-wide">
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
            </>
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
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu?.id === msg._id ? null : { id: msg._id, y: e.clientY });
            }}
            className={`absolute top-1 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-full hover:bg-muted bg-background border shadow-sm text-muted-foreground ${
              isMe ? "-left-10" : "-right-10"
            } hidden lg:flex items-center justify-center hover:scale-110 active:scale-95`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}

        {/* Render Smart Menu */}
        {activeMenu?.id === msg._id && (
          <MessageMenu
            message={msg}
            isMe={isMe}
            clickY={activeMenu.y}
            onReact={onReact}
            onEdit={onEdit}
            onDelete={onDelete}
            onReply={() => onReply(msg)}
            close={() => setActiveMenu(null)}
          />
        )}
      </div>
    </div>
  );
}


/* ============================= */
/* 🔹 Chat Content */
/* ============================= */
function ChatBoxContent({ currentUser, recipient, conversationId, initialMessages }) {
  const ably = useAbly();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [messages, setMessages] = useState(initialMessages || []);
  const [text, setText] = useState("");
  const [activeMenu, setActiveMenu] = useState(null); 
  const [replyingTo, setReplyingTo] = useState(null);
  
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const [lastSeen, setLastSeen] = useState(recipient.lastSeen || null);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(initialMessages?.length >= MESSAGES_PER_PAGE);
  const [page, setPage] = useState(1);
  const previousScrollHeight = useRef(0);
  
  const typingTimeoutRef = useRef(null);
  const channelName = `chat:${conversationId}`;

  useEffect(() => {
    const handleGlobalClick = () => {
      if (activeMenu) setActiveMenu(null);
    };

    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("touchstart", handleGlobalClick); 
    
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("touchstart", handleGlobalClick);
    };
  }, [activeMenu]);

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
        
        if (scrollRef.current) {
          setTimeout(() => {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
          }, 100);
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
  useEffect(() => {
    if (scrollRef.current && page === 1 && !isLoadingMore) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isRecipientTyping, page, isLoadingMore]);

  const handleScroll = useCallback(async () => {
    if (!scrollRef.current || isLoadingMore || !hasMoreMessages) return;

    if (scrollRef.current.scrollTop === 0) {
      setIsLoadingMore(true);
      previousScrollHeight.current = scrollRef.current.scrollHeight;

      try {
        const nextPage = page + 1;
        const olderMessages = await getOlderMessages(conversationId, nextPage);
        
        if (olderMessages && olderMessages.length > 0) {
          setMessages(prev => [...olderMessages, ...prev]);
          setPage(nextPage);
          if (olderMessages.length < MESSAGES_PER_PAGE) {
            setHasMoreMessages(false); 
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

  useEffect(() => {
    if (scrollRef.current && page > 1) {
      const currentScrollHeight = scrollRef.current.scrollHeight;
      const heightDifference = currentScrollHeight - previousScrollHeight.current;
      scrollRef.current.scrollTop = heightDifference;
    }
  }, [messages, page]);


  /* ============================= */
  /* 🔹 Actions */
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Maximum size is 10MB.");
      return;
    }

    setAttachment(file);
    if (file.type.startsWith("image/")) {
      setAttachmentPreview(URL.createObjectURL(file));
    } else {
      setAttachmentPreview(null);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !attachment) return; 

    setIsUploading(true);
    let finalImageUrl = null;
    let finalFileUrl = null;
    let finalFileName = null;

    try {
      if (attachment) {
        const fileType = attachment.type;
        const fileName = attachment.name;
        
        const { uploadUrl, publicUrl } = await getChatPresignedUrl(fileName, fileType);
        
        const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": fileType },
            body: attachment,
        });

        if (!uploadRes.ok) throw new Error("Cloudflare R2 Upload Failed");

        if (fileType.startsWith("image/")) {
            finalImageUrl = publicUrl;
        } else {
            finalFileUrl = publicUrl;
            finalFileName = fileName;
        }
      }

      const currentText = text;
      const currentReply = replyingTo;
      
      setText("");
      setReplyingTo(null);
      setAttachment(null);
      setAttachmentPreview(null);

      const saved = await sendMessage({
        senderId: currentUser.id,
        receiverId: recipient._id,
        content: currentText,
        imageUrl: finalImageUrl, 
        fileUrl: finalFileUrl,
        fileName: finalFileName,
        replyTo: currentReply ? { _id: currentReply._id, content: currentReply.content, sender: currentReply.sender } : null
      });

      const chatChannel = ably.channels.get(channelName);
      chatChannel.publish("message", saved);

      const notifyChannel = ably.channels.get(`notifications:${recipient._id}`);
      notifyChannel.publish("new-message", { conversationId, content: currentText || (finalImageUrl ? "Sent an image" : "Sent a document") });

      chatChannel.publish("typing", { senderId: currentUser.id, isTyping: false });
      clearTimeout(typingTimeoutRef.current);
      
      if (scrollRef.current) {
        setTimeout(() => {
          scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }, 50);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const initiateReply = (msg) => {
    setReplyingTo(msg);
    if (inputRef.current) {
      inputRef.current.focus();
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
    <div className="absolute inset-0 flex flex-col bg-background sm:border sm:border-border/40 sm:rounded-[2.5rem] sm:shadow-2xl overflow-hidden">
      
      <div className="absolute inset-0 z-0 opacity-[0.04] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      {/* 1. HEADER */}
      <div className="w-full z-20 px-4 py-3 border-b border-border/50 bg-background/90 backdrop-blur-2xl flex items-center justify-between shadow-sm shrink-0">
        <Link 
          href={`/profile/${recipient._id}`} 
          className="flex items-center gap-3 hover:bg-muted/50 p-1.5 pr-4 rounded-full transition-colors group cursor-pointer"
        >
          <div className="relative">
            <Avatar className="w-11 h-11 border border-border/50 shadow-sm transition-transform group-hover:scale-105">
              <AvatarImage src={recipient.avatar} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {recipient.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span 
              className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-[2.5px] border-background transition-colors duration-300 ${
                isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-muted-foreground/40"
              }`}
            />
          </div>

          <div className="flex flex-col">
            <h2 className="text-[16px] font-bold text-foreground leading-none tracking-tight group-hover:text-primary transition-colors">
              {recipient.name}
            </h2>
            <div className="text-[12px] text-muted-foreground mt-1.5 font-medium min-h-[16px]">
              {isRecipientTyping ? (
                <span className="text-primary animate-pulse font-bold tracking-wide">typing...</span>
              ) : isOnline ? (
                <span className="text-emerald-500 font-bold tracking-wide">Online</span>
              ) : (
                <span>{formatLastSeen(lastSeen)}</span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* 2. MESSAGES AREA - 🚀 FIX: Made overflow visible when a menu is open so it doesn't clip */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex-1 px-4 py-6 space-y-4 scrollbar-thin bg-secondary/5 relative ${activeMenu ? 'overflow-hidden' : 'overflow-y-auto'}`}
      >
        {isLoadingMore && (
           <div className="w-full flex justify-center py-3">
               <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
           </div>
        )}

        {messages.map((msg) => {
          const isMe = String(msg.sender) === String(currentUser.id);
          const isRead = msg.readBy && msg.readBy.some(id => String(id) === String(recipient._id));
          const isDelivered = isOnline || isRead; 

          return (
            <MessageItem 
               key={msg._id}
               msg={msg}
               isMe={isMe}
               isRead={isRead}
               isDelivered={isDelivered}
               currentUser={currentUser}
               recipient={recipient}
               onReply={initiateReply}
               onReact={(emoji) => handleReaction(msg, emoji)}
               onEdit={() => handleEdit(msg)}
               onDelete={() => handleDelete(msg._id)}
               activeMenu={activeMenu}
               setActiveMenu={setActiveMenu}
            />
          );
        })}
      </div>

      {/* 3. INPUT AREA */}
      <div className="w-full p-3 md:p-5 bg-background border-t border-border/40 shrink-0 z-20 relative">
        
        {/* Reply Preview Banner */}
        {replyingTo && (
          <div className="max-w-4xl mx-auto mb-2 flex items-center bg-secondary/40 border-l-[3px] border-primary rounded-r-xl p-2.5 relative animate-in slide-in-from-bottom-2 fade-in">
            <div className="flex-1 overflow-hidden pr-8">
              <span className="text-xs font-bold text-primary block mb-0.5">
                {String(replyingTo.sender) === String(currentUser.id) ? "Replying to yourself" : `Replying to ${recipient.name}`}
              </span>
              <span className="text-sm text-muted-foreground line-clamp-1">{replyingTo.content || "Attachment"}</span>
            </div>
            <button 
              onClick={() => setReplyingTo(null)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-full text-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Attachment Preview Banner */}
        {attachment && (
          <div className="max-w-4xl mx-auto mb-2 flex items-center bg-secondary/20 border border-border/50 rounded-xl p-2.5 relative animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-background flex items-center justify-center mr-3 border border-border">
              {attachmentPreview ? (
                <img src={attachmentPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <span className="text-sm font-medium text-foreground truncate block">{attachment.name}</span>
              <span className="text-xs text-muted-foreground">{(attachment.size / 1024).toFixed(1)} KB</span>
            </div>
            <button 
              onClick={() => { setAttachment(null); setAttachmentPreview(null); }}
              className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-full text-muted-foreground transition-colors absolute right-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* The Input Form */}
        <form
          onSubmit={handleSend}
          className="flex items-end gap-2 max-w-4xl mx-auto"
        >
          {/* Hidden File Input & Trigger */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/*,application/pdf,.doc,.docx" 
            className="hidden" 
          />
          <Button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            variant="ghost" 
            size="icon" 
            className="shrink-0 rounded-full h-11 w-11 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <div className="flex-1 bg-secondary/20 border border-border/60 rounded-3xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all flex items-center min-h-[44px]">
            <Input
              ref={inputRef}
              value={text}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type a message"
              className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 text-[15px] px-4 py-3 placeholder:text-muted-foreground/60 h-auto"
              autoComplete="off"
            />
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={(!text.trim() && !attachment) || isUploading}
            className="rounded-full w-11 h-11 shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-md"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
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