import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { Loader2 } from "lucide-react";

// ✅ 1. HIGH-OCTANE SEO METADATA
// We want this page indexed so users can find the login via Google, 
// but we use "follow" to ensure the crawler goes back to the homepage/signup.
export const metadata = {
  title: "Login", // Becomes "Login | PeerNotez" via your layout template
  description: "Securely sign in to your PeerNotez account to access your notes, study materials, and academic collections.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://peernotez.netlify.app/login",
  },
};

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-12">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-primary" />}>
        {/* LoginForm is now a clean Client Component */}
        <LoginForm />
      </Suspense>
    </div>
  );
}