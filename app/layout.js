import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/components/providers/AuthProvider";
import AblyProvider from "@/components/providers/AblyProvider";
import PWARegister from "@/components/common/PWARegister";

const inter = Inter({ subsets: ["latin"] });

// ✅ App-wide Viewport & Theme Settings
// This ensures Google's mobile-friendly test passes with a 100/100 score.
export const viewport = {
  themeColor: "#00d4ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents accidental zooming on mobile inputs
};

// ✅ Global SEO Safety Net
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://peernotez.netlify.app"),
  title: {
    default: "PeerNotez | Free Academic Notes & Study Materials",
    template: "%s | PeerNotez"
  },
  description: "Join PeerNotez to discover, share, and review university notes, PDFs, and study materials.",
  manifest: "/manifest.json", 
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PeerNotez",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/logo192.png", sizes: "180x180", type: "image/png" },
    ],
  },
  // OpenGraph defaults for pages that don't define their own
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://peernotez.netlify.app",
    siteName: "PeerNotez",
    images: [
      {
        url: "/logo512.png",
        width: 512,
        height: 512,
        alt: "PeerNotez Logo",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased`}>
        {/* ✅ AUTH PROVIDER: Supplies session context to useSession() across the app */}
        <AuthProvider>
          {/* ✅ ABLY PROVIDER: Nested inside Auth so it can access the authenticated user ID */}
          <AblyProvider>
            <PWARegister /> 
            
            <Navbar />

            {/* Main content wrapper with padding to account for fixed navbar */}
            <main className="flex-grow pt-20">
              {children}
            </main>

            <Footer />
            
            {/* Global UI Components */}
            <Toaster />
          </AblyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}