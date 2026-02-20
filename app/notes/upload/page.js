import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UploadForm from "@/components/notes/UploadForm";

export const metadata = {
  title: "Upload Notes | PeerNotez",
  description: "Share your academic notes, PDFs, and study materials with the PeerNotez community.",
};

export default async function UploadPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login?callbackUrl=/notes/upload");
  }

  return (
    <div className="container py-12 md:py-20 min-h-[80vh] flex items-center justify-center">
      {/* The UploadForm component now handles its own layout, card styling, 
        and headers, so we just drop it straight into the page container! 
      */}
      <UploadForm />
    </div>
  );
}