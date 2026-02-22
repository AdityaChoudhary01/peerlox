import { notFound } from "next/navigation";
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

const APP_URL = process.env.NEXTAUTH_URL || "https://stuhive.in";

// ✅ 1. HIGH-OCTANE DYNAMIC SEO METADATA
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
  
  // 🚀 PARALLEL FETCHING: Fetch session and blog at the exact same time
  const [session, blog] = await Promise.all([
    getServerSession(authOptions),
    getBlogBySlug(resolvedParams.slug)
  ]);

  if (!blog) notFound();

  // 🚀 NON-BLOCKING INCREMENT: Fire and forget the view counter
  incrementBlogViews(blog._id).catch(() => {});

  // Fetch related blogs AFTER we have the main blog ID
  const relatedBlogs = await getRelatedBlogs(blog._id);

  // --- Metrics ---
  const readTime = Math.ceil((blog.content?.split(/\s+/).length || 0) / 200);
  const totalReviews = blog.reviews?.length || 0;
  const averageRating = totalReviews > 0
    ? (blog.reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / totalReviews).toFixed(1)
    : 0;

  // ✅ 2. ARTICLE SCHEMA (JSON-LD)
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
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${APP_URL}/blogs/${resolvedParams.slug}`
    }
  };

  const MarkdownComponents = {
    h1: ({ node, ...props }) => <h1 className="text-3xl md:text-4xl font-extrabold mt-12 mb-6 text-foreground tracking-tight" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 pb-2 border-b border-border text-foreground/90 tracking-tight" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-xl md:text-2xl font-semibold mt-8 mb-3 text-foreground/90" {...props} />,
    p: ({ node, ...props }) => <p className="leading-7 md:leading-8 text-base md:text-lg text-muted-foreground mb-6 last:mb-0" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 mb-6 space-y-2 text-muted-foreground marker:text-primary" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 text-muted-foreground marker:font-bold" {...props} />,
    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary bg-secondary/30 px-6 py-4 my-8 rounded-r-lg italic text-lg text-foreground/80 shadow-sm" {...props} />,
    a: ({ node, ...props }) => <a className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors" {...props} />,
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      if (!inline && match) {
        return (
          <div className="relative my-8 rounded-xl overflow-hidden shadow-2xl border border-border/50">
            <div className="bg-[#1e1e1e] px-4 py-2 flex items-center gap-2 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-auto text-xs text-white/40 font-mono">{match[1]}</span>
            </div>
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              customStyle={{ margin: 0, padding: "1.5rem", borderRadius: "0 0 0.75rem 0.75rem" }}
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          </div>
        );
      }
      return <code className="bg-primary/10 text-primary font-mono text-sm px-1.5 py-0.5 rounded border border-primary/20" {...props}>{children}</code>;
    },
    img: ({ node, ...props }) => (
      <figure className="relative w-full my-10">
        <img className="rounded-2xl shadow-lg border border-border w-full h-auto object-cover" alt={props.alt || blog.title} referrerPolicy="no-referrer" {...props} />
        {props.alt && <figcaption className="block text-center text-sm text-muted-foreground mt-2 italic">{props.alt}</figcaption>}
      </figure>
    ),
    table: ({ node, ...props }) => <div className="overflow-x-auto my-8 border border-border rounded-lg shadow-sm"><table className="w-full text-left text-sm" {...props} /></div>,
    th: ({ node, ...props }) => <th className="bg-secondary/50 p-4 font-semibold text-foreground border-b border-border" {...props} />,
    td: ({ node, ...props }) => <td className="p-4 border-b border-border/50 text-muted-foreground" {...props} />,
  };

  return (
    <article className="container max-w-5xl py-12 px-4 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <header className="flex flex-col items-center text-center mb-12 space-y-8">
        <div className="flex flex-wrap justify-center gap-2">
          {blog.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold shadow-sm">
              {tag}
            </Badge>
          ))}
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] text-foreground max-w-4xl">
          {blog.title}
        </h1>

        <div className="w-full max-w-4xl bg-secondary/5 border border-border/60 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
           <AuthorInfoBlock user={blog.author} />
           <div className="hidden md:block w-px h-12 bg-border/50" />
           <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground">
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
                {/* 🚀 FIXED: Now uses viewCount and updates optimistically */}
                {blog.viewCount + 1 || 1}
             </span>
             <span className="flex items-center gap-2 text-foreground bg-secondary/50 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" aria-hidden="true" />
                <span>
                   {averageRating} <span className="text-muted-foreground font-normal">({totalReviews})</span>
                </span>
             </span>
           </div>
        </div>
      </header>

      {blog.coverImage && (
        <figure className="relative w-full aspect-video mb-20 rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-border/50">
          <img
            src={blog.coverImage}
            alt={`${blog.title} cover image`}
            referrerPolicy="no-referrer"
            className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-1000 ease-out"
          />
        </figure>
      )}

      <section className="max-w-none mb-24 prose prose-invert prose-headings:tracking-tight prose-a:text-primary">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
            {blog.content}
          </ReactMarkdown>
      </section>

      <footer className="space-y-16">
        <div className="border-t border-border/60 pt-12">
           <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
             <MessageCircle className="w-6 h-6 text-primary" aria-hidden="true"/> Discussion
           </h3>
           <div className="bg-secondary/5 rounded-3xl p-6 md:p-10 border border-primary/10">
             <BlogInteractions blogId={blog._id} initialComments={blog.reviews} userId={session?.user?.id} />
           </div>
        </div>

        <section className="border-t border-border/60 pt-12">
          <RelatedBlog blogs={relatedBlogs} />
        </section>
      </footer>
    </article>
  );
}