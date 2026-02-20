import TermsPageClient from "./TermsPageClient";

// ✅ HIGH-OCTANE SEO METADATA
export const metadata = {
  title: "Terms of Service | User Agreement",
  description: "Review the PeerNotez Terms of Service. Understand our user covenant, content ownership licenses, academic integrity standards, and user conduct policies.",
  keywords: ["Terms of Service", "User Agreement", "Academic Integrity", "Content License", "PeerNotez Terms", "Student Contract"],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://peernotez.netlify.app/terms",
  },
  openGraph: {
    title: "Terms of Power | PeerNotez Legal",
    description: "Our legal binding contract for using the PeerNotez academic ecosystem.",
    url: "https://peernotez.netlify.app/terms",
    type: "website",
  },
};

export default function TermsPage() {
  return <TermsPageClient />;
}