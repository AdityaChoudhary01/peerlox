import SignupForm from "@/components/auth/SignupForm";

// ✅ HIGH-OCTANE SEO METADATA
export const metadata = {
  title: "Create an Account",
  description: "Join the PeerNotez community today. Create an account to share your study materials, download university notes, and start collaborating with students worldwide.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://peernotez.netlify.app/signup",
  },
};

export default function SignupPage() {
  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-12">
      <SignupForm />
    </div>
  );
}