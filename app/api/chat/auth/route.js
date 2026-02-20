import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Rest } from "ably"; 
export const dynamic = "force-dynamic";
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = new Rest(process.env.ABLY_API_KEY);

    // 🛠️ CRITICAL FIX: Explicitly cast the session user ID to a String.
    // This ensures Ably's Presence list matches your frontend String comparison.
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: String(session.user.id),
    });

    return NextResponse.json(tokenRequestData);
  } catch (error) {
    console.error("Ably Auth Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}