import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserConversations } from "@/services/chat.service";
import ChatList from "@/components/chat/ChatList";
import NewChatDialog from "@/components/chat/NewChatDialog"; // 🔹 Import the new modal

export const metadata = {
  title: "Messages | PeerNotez",
};

export default async function ChatListPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const conversations = await getUserConversations(session.user.id);

  return (
    <div className="min-h-screen flex justify-center items-start sm:items-center p-0 sm:p-6 md:p-12 overflow-hidden">
      
      {/* Ambient Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-2xl flex flex-col h-[100dvh] sm:h-[85vh] sm:max-h-[850px] bg-card sm:bg-background/60 sm:backdrop-blur-2xl sm:border sm:border-border/40 sm:rounded-[2.5rem] sm:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.2)] overflow-hidden relative z-10">
        
        {/* Header */}
        <div className="px-6 py-5 sm:pt-8 border-b border-border/40 bg-background/80 backdrop-blur-xl flex justify-between items-center z-20 shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Messages
            </h1>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              {conversations.length} active {conversations.length === 1 ? 'conversation' : 'conversations'}
            </p>
          </div>
          
          {/* 🔹 Use the new component here */}
          <NewChatDialog currentUserId={session.user.id} />
          
        </div>

        {/* ChatList Wrapper */}
        <div className="flex-1 overflow-hidden relative bg-background/40">
          <ChatList
            initialConversations={conversations}
            currentUserId={session.user.id}
          />
        </div>

      </div>
    </div>
  );
}