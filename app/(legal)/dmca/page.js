import DMCAPageClient from "./DMCAPageClient";

// ✅ 1. HIGH-OCTANE SEO METADATA
// This establishes PeerNotez as a legally compliant, trustworthy entity.
export const metadata = {
  title: "DMCA & Intellectual Property Protection",
  description: "Learn about PeerNotez's commitment to copyright protection. Our DMCA policy outlines the takedown process for infringing academic materials and study notes.",
  keywords: ["DMCA", "Copyright Infringement", "IP Protection", "Legal Notice", "Safe Harbor", "PeerNotez Legal"],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://peernotez.netlify.app/dmca",
  },
  openGraph: {
    title: "IP Protection & DMCA | PeerNotez",
    description: "Our policy for protecting student creators and intellectual property.",
    url: "https://peernotez.netlify.app/dmca",
    type: "website",
  },
};

export default function DMCAPage() {
  return <DMCAPageClient />;
}