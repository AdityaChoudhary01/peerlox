import SupportersPageClient from "./SupportersPageClient";

// ✅ 1. HIGH-OCTANE SEO METADATA
const APP_URL = process.env.NEXTAUTH_URL || "https://peernotez.netlify.app";

export const metadata = {
    title: "Wall of Fame | Our Community Heroes",
    description: "Meet the visionaries supporting PeerNotez. Our Wall of Fame celebrates students and donors who keep open-access academic resources free for everyone.",
    keywords: ["PeerNotez Supporters", "Education Philanthropy", "Wall of Fame", "Student Community", "Academic Visionaries"],
    alternates: {
        canonical: `${APP_URL}/supporters`,
    },
    openGraph: {
        title: "PeerNotez Wall of Fame",
        description: "Celebrating the individuals fueling the future of collaborative learning.",
        url: `${APP_URL}/supporters`,
        type: "website",
        images: [{ url: `${APP_URL}/og-supporters.jpg` }]
    },
};

export default function SupportersPage() {
    // 2. SEO Bonus: JSON-LD for ItemList (Tells Google this is a list of significant entities)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "PeerNotez Community Supporters",
        "description": "A list of individuals who have contributed to the PeerNotez open education mission."
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <SupportersPageClient />
        </>
    );
}