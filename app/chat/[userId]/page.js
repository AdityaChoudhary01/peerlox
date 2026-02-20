import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserProfile } from "@/actions/user.actions";
import { getConversationWithMessages } from "@/services/chat.service";
import ChatBox from "@/components/chat/ChatBox";

export async function generateMetadata({ params }) {
  const user = await getUserProfile(params.userId);
  return { title: user ? `Chat with ${user.name}` : "Chat" };
}

export default async function ChatPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  // Prevent user from chatting with themselves
  if (session.user.id === params.userId) redirect("/chat");

  const recipient = await getUserProfile(params.userId);

  if (!recipient) notFound();

  const { conversationId, messages } = await getConversationWithMessages(
    session.user.id,
    params.userId
  );

  return (
    // 1. Full viewport wrapper that centers the widget on desktop and stretches on mobile
    <div className="min-h-[100dvh] flex justify-center items-start sm:items-center p-0 sm:p-6 md:p-12 overflow-hidden">
      
      {/* 2. Ambient Background Glows (Matches the ChatList page) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 3. The Sizing Container for ChatBox */}
      <div className="w-full max-w-4xl h-[100dvh] sm:h-[85vh] sm:max-h-[850px] relative z-10 flex flex-col">
        <ChatBox
          currentUser={session.user}
          recipient={recipient}
          conversationId={conversationId}
          initialMessages={messages}
        />
      </div>
      
    </div>
  );
}