import { notFound } from "next/navigation";
import Image from "next/image"; // ✅ Next.js Image component
import { getBlogBySlug, getRelatedBlogs, incrementBlogViews } from "@/actions/blog.actions"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BlogInteractions from "@/components/blog/BlogInteractions";
import AuthorInfoBlock from "@/components/common/AuthorInfoBlock";
import RelatedBlog from "@/components/blog/RelatedBlogs"; 
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Star, MessageCircle, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

// --- Markdown & Syntax Highlighting Imports ---
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

// 🚀 CACHE STRATEGY: Cache at the Edge for fast TTFB, refreshing every 60s
export const revalidate = 60;

const APP_URL = process.env.NEXTAUTH_URL || "https://stuhive.in";

// ✅ 1. DYNAMIC SEO METADATA
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const blog = await getBlogBySlug(resolvedParams.slug, false);
  
  if (!blog) return { title: "Blog Not Found" };

  const ogImage = blog.coverImage || `${APP_URL}/default-blog-og.jpg`;

  return {
    title: blog.title,
    description: blog.summary,
    keywords: blog.tags?.join(", ") || "academic blog, study tips, StuHive",
    alternates: {
        canonical: `${APP_URL}/blogs/${resolvedParams.slug}`,
    },
    openGraph: {
      title: blog.title,
      description: blog.summary,
      url: `${APP_URL}/blogs/${resolvedParams.slug}`,
      type: "article",
      publishedTime: blog.createdAt,
      authors: [blog.author?.name],
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.summary,
      images: [ogImage],
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const resolvedParams = await params;
  
  // 🚀 PARALLEL FETCHING: Fetch everything at once to minimize TTFB
  const [session, blog] = await Promise.all([
    getServerSession(authOptions),
    getBlogBySlug(resolvedParams.slug)
  ]);

  if (!blog) notFound();

  // Fire and forget view increment
  incrementBlogViews(blog._id).catch(() => {});

  const relatedBlogs = await getRelatedBlogs(blog._id);

  const readTime = blog.readTime || Math.ceil((blog.content?.split(/\s+/).length || 0) / 200) || 3;
  
  const totalReviews = blog.reviews?.length || 0;
  const averageRating = totalReviews > 0
    ? (blog.reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / totalReviews).toFixed(1)
    : 0;

  // ✅ 2. ARTICLE SCHEMA
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.summary,
    "image": blog.coverImage || `${APP_URL}/default-blog-og.jpg`,
    "datePublished": blog.createdAt,
    "dateModified": blog.updatedAt || blog.createdAt,
    "author": {
      "@type": "Person",
      "name": blog.author?.name,
      "url": `${APP_URL}/profile/${blog.author?._id}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "StuHive",
      "logo": {
        "@type": "ImageObject",
        "url": `${APP_URL}/logo192.png`
      }
    }
  };

  const MarkdownComponents = {
    // ✅ 3. ACCESSIBILITY: Fixed heading levels (starting from H2 inside the article)
    h1: ({ node, ...props }) => <h2 className="text-3xl md:text-4xl font-extrabold mt-12 mb-6 text-foreground tracking-tight" {...props} />,
    h2: ({ node, ...props }) => <h3 className="text-2xl md:text-3xl font-bold mt-10 mb-4 pb-2 border-b border-border text-foreground/90 tracking-tight" {...props} />,
    h3: ({ node, ...props }) => <h4 className="text-xl md:text-2xl font-semibold mt-8 mb-3 text-foreground/90" {...props} />,
    
    p: ({ node, ...props }) => <p className="leading-7 md:leading-8 text-base md:text-lg text-gray-300 mb-6 last:mb-0" {...props} />,
    
    // ✅ 4. OPTIMIZATION: Custom Markdown Image Handler
    img: ({ node, ...props }) => {
      return (
        <figure className="relative w-full my-10">
          <img 
            className="rounded-2xl shadow-lg border border-border w-full h-auto object-cover" 
            alt={props.alt || "Article illustration"} 
            loading="lazy" // Ensures external images (like Wikimedia) don't block the initial render
            decoding="async" // Pulls decoding off the main thread
            {...props} 
          />
          {props.alt && (
            <figcaption className="block text-center text-sm text-gray-400 mt-3 italic">{props.alt}</figcaption>
          )}
        </figure>
      );
    },

    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      if (!inline && match) {
        return (
          <div className="relative my-8 rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              customStyle={{ margin: 0, padding: "1.5rem" }}
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          </div>
        );
      }
      return <code className="bg-white/10 text-cyan-400 font-mono text-sm px-1.5 py-0.5 rounded" {...props}>{children}</code>;
    },
  };

  return (
    <article className="container max-w-5xl py-12 px-4 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <header className="flex flex-col items-center text-center mb-12 space-y-8">
        <div className="flex flex-wrap justify-center gap-2">
          {blog.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold shadow-sm bg-white/5 text-gray-300">
              {tag}
            </Badge>
          ))}
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] text-white max-w-4xl">
          {blog.title}
        </h1>

        <div className="w-full max-w-4xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
           <AuthorInfoBlock user={blog.author} />
           <div className="hidden md:block w-px h-12 bg-white/10" />
           <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-3 text-sm font-medium text-gray-400">
             <span className="flex items-center gap-2">
               <Calendar className="w-4 h-4 text-primary" aria-hidden="true" />
               <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time>
             </span>
             <span className="flex items-center gap-2">
               <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
               {readTime} min read
             </span>
             <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                {blog.viewCount + 1 || 1}
             </span>
             <span className="flex items-center gap-2 text-white bg-white/5 px-3 py-1 rounded-full border border-white/5">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" aria-hidden="true" />
                <span>
                   {averageRating} <span className="text-gray-500 font-normal">({totalReviews})</span>
                </span>
             </span>
           </div>
        </div>
      </header>

      {blog.coverImage && (
        <figure className="relative w-full aspect-video mb-20 rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/10 bg-white/5">
          {/* ✅ 5. PERFORMANCE: Using Next.js Image with high priority for LCP */}
          <Image
            src={blog.coverImage}
            alt={`${blog.title} cover`}
            fill
            priority // Preloads the image to fix the "Resource load delay"
            fetchPriority="high" // Tells the browser this is the most important image
            unoptimized // Since you mentioned you optimize externally
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
        </figure>
      )}

      <section className="max-w-none mb-24 prose prose-invert prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-2xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
            {blog.content}
          </ReactMarkdown>
      </section>

      <footer className="space-y-16">
        <div className="border-t border-white/10 pt-12">
            {/* ✅ FIXED ACCESSIBILITY: Changed h3 to h2 */}
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-white">
              <MessageCircle className="w-6 h-6 text-primary" aria-hidden="true"/> Discussion
            </h2>
            <div className="bg-white/[0.02] rounded-3xl p-6 md:p-10 border border-white/5">
              <BlogInteractions blogId={blog._id} initialComments={blog.reviews} userId={session?.user?.id} />
            </div>
        </div>

        <section className="border-t border-white/10 pt-12">
          <RelatedBlog blogs={relatedBlogs} />
        </section>
      </footer>
    </article>
  );
}