import { getRequests } from "@/actions/request.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import RequestBoard from "@/components/requests/RequestBoard"; 
import { HelpCircle } from "lucide-react"; 

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.stuhive.in";

// 🚀 ULTRA HYPER SEO METADATA MATRIX
export const metadata = {
  title: "Request Study Notes & PDFs | Community Wishlist | StuHive",
  description: "Can't find the specific university notes or PDF you need? Post a request on the StuHive Community Wishlist and let top students help you ace your exams.",
  keywords: [
    "request study notes", "community wishlist", "ask for study materials", 
    "university PYQs", "handwritten notes request", "StuHive community", 
    "student help forum", "academic Q&A", "find college PDFs"
  ],
  authors: [{ name: "StuHive Organization", url: APP_URL }],
  creator: "StuHive",
  publisher: "StuHive Academic Network",
  category: "Education Forum",
  alternates: {
    canonical: `${APP_URL}/requests`,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Community Wishlist | Request Study Materials",
    description: "Post a request and let the StuHive community help you find the exact notes you need.",
    url: `${APP_URL}/requests`,
    siteName: "StuHive",
    type: "website",
    images: [
      {
        url: `${APP_URL}/logo512.png`,
        width: 1200,
        height: 630,
        alt: "StuHive Community Wishlist",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Wishlist | Request Study Materials",
    description: "Post a request and let the StuHive community help you find the exact notes you need.",
    images: [`${APP_URL}/logo512.png`],
  }
};

export default async function RequestsPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  
  // 🚀 SEO: Allow page queries for Googlebot crawling
  const sp = await searchParams;
  const currentPage = parseInt(sp?.page) || 1;
  const limit = 20;

  // Fetch paginated data
  const { requests = [], totalCount = 0 } = await getRequests({ page: currentPage, limit });
  const totalPages = Math.ceil(totalCount / limit);

  // 🚀 QAPage JSON-LD: Tells Google this is a Question & Answer/Fulfillment board
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "mainEntity": requests.slice(0, 10).map(req => ({
      "@type": "Question",
      "name": req.title,
      "text": req.description,
      "dateCreated": req.createdAt || new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": req.requester?.name || "StuHive Student",
        "url": req.requester?._id ? `${APP_URL}/profile/${req.requester._id}` : APP_URL
      },
      "answerCount": req.status === 'fulfilled' ? 1 : 0,
      // 🚀 FIXED: Now uses the SEO slug if it exists, otherwise falls back to ID
      ...(req.status === 'fulfilled' && req.fulfillmentNote && {
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `This request was fulfilled with the study material: ${req.fulfillmentNote.title || 'Note Document'}.`,
          "url": `${APP_URL}/notes/${req.fulfillmentNote.slug || req.fulfillmentNote._id}`, 
          "dateCreated": req.updatedAt || new Date().toISOString(),
          "author": {
            "@type": "Organization",
            "name": "StuHive Community",
            "url": APP_URL
          }
        }
      })
    }))
  };

  return (
    <main className="min-h-screen bg-background">
      {/* 🚀 INJECT KNOWLEDGE GRAPH */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
         <div className="absolute top-0 left-1/4 w-[50%] h-[50%] bg-orange-500/5 blur-[120px] rounded-full" />
         <div className="absolute bottom-0 right-1/4 w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="container relative z-10 max-w-6xl py-20 px-4 sm:px-6">
        
        {/* Header */}
        <header className="text-center mb-16 space-y-6">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 mb-4 animate-in fade-in slide-in-from-top-4">
              <HelpCircle size={16} aria-hidden="true" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Community Board</span>
           </div>
           
           <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground mb-4 drop-shadow-sm">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">Wishlist.</span>
           </h1>
           
           <h2 className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
              Can&apos;t find a specific resource? Ask the community. 
              <br className="hidden md:block" />
              Earn reputation points by fulfilling open requests.
           </h2>
        </header>

        {/* Client Side Board */}
        <section aria-label="Student Material Requests">
            <RequestBoard 
              initialRequests={requests || []} 
              currentUser={session?.user || null} 
              initialPage={currentPage}
              totalPages={totalPages}
            />
        </section>

      </div>
    </main>
  );
}