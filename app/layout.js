import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/components/providers/AuthProvider";
import AblyProvider from "@/components/providers/AblyProvider";
import PWARegister from "@/components/common/PWARegister";

const inter = Inter({ subsets: ["latin"] });

// ✅ 1. FIXED VIEWPORT FOR 100/100 BEST PRACTICES & ACCESSIBILITY
// Lighthouse strictly requires users to be able to zoom in up to 5x for visual accessibility.
export const viewport = {
  themeColor: "#00d4ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Increased from 1 to 5 to pass Lighthouse Best Practices
  // userScalable: false, // REMOVED: This is flagged as an accessibility violation by Google
};

// ✅ Global SEO Safety Net
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://stuhive.in"),
  title: {
    default: "StuHive | Free Academic Notes & Study Materials",
    template: "%s | StuHive"
  },
  description: "Join StuHive to discover, share, and review university notes, PDFs, and study materials.",
  manifest: "/manifest.json", 
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StuHive",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stuhive.in",
    siteName: "StuHive",
    images: [
      {
        url: "/logo512.png",
        width: 512,
        height: 512,
        alt: "StuHive Logo",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* ✅ 2. NETWORK PRECONNECTS FOR LCP SPEED BOOST */}
        {/* Tells the mobile browser to connect to your image servers immediately, bypassing the critical render path delay */}
        <link rel="preconnect" href="https://cdn.stuhive.in" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      </head>
      
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