"use client";

import * as Ably from "ably";
import { AblyProvider as Provider } from "ably/react";
import { useSession } from "next-auth/react";
import { useMemo, useEffect } from "react";
import { updateLastSeen } from "@/actions/user.actions";

export default function AblyGlobalProvider({ children }) {
  const { data: session, status } = useSession();

  const client = useMemo(() => {
    if (status !== "authenticated" || !session?.user?.id) return null;

    return new Ably.Realtime({
      authUrl: "/api/chat/auth",
      authMethod: "GET",
      autoConnect: true,
      clientId: String(session.user.id),
    });
  }, [session?.user?.id, status]);

  // ===============================
  // ✅ TRACK ONLINE PRESENCE
  // ===============================
  useEffect(() => {
    if (!client || !session?.user?.id) return;

    const channel = client.channels.get("presence:global");


    channel.presence.enter();

    const handleLeave = async () => {
      await updateLastSeen(session.user.id);
    };

    client.connection.on("closed", handleLeave);
    client.connection.on("disconnected", handleLeave);

    return () => {
      channel.presence.leave();
      handleLeave();
    };
  }, [client, session?.user?.id]);

  if (status === "loading") return null;
  if (status === "unauthenticated") return children;
  if (!client) return null;

  return <Provider client={client}>{children}</Provider>;
}
