export default function robots() {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://peernotez.netlify.app";
  
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/api/",       // Protect backend routes 
            "/settings/",  // Private user settings
            "/admin/",     // Sensitive admin area
            "/*?search=",  // Prevent indexing of infinite search variations
          ],
        },
      ],
      sitemap: `${BASE_URL}/sitemap.xml`,
    };
  }