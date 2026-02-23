import { notFound } from "next/navigation";
import Image from "next/image"; 
import { getBlogBySlug, getRelatedBlogs, incrementBlogViews } from "@/actions/blog.actions"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BlogInteractions from "@/components/blog/BlogInteractions";
import AuthorInfoBlock from "@/components/common/AuthorInfoBlock";
import RelatedBlog from "@/components/blog/RelatedBlogs"; 
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Star, MessageCircle, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw"; 
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"; // 🚀 NEW: Security Sanitizer
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

export const revalidate = 60;

const APP_URL = process.env.NEXTAUTH_URL || "https://stuhive.in";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const blog = await getBlogBySlug(resolvedParams.slug, false);
  if (!blog) return { title: "Blog Not Found" };
  const ogImage = blog.coverImage || `${APP_URL}/default-blog-og.jpg`;

  return {
    title: blog.title,
    description: blog.summary,
    alternates: { canonical: `${APP_URL}/blogs/${resolvedParams.slug}` },
    openGraph: {
      title: blog.title,
      description: blog.summary,
      url: `${APP_URL}/blogs/${resolvedParams.slug}`,
      type: "article",
      images: [{ url: ogImage }],
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const resolvedParams = await params;
  const [session, blog] = await Promise.all([
    getServerSession(authOptions),
    getBlogBySlug(resolvedParams.slug)
  ]);

  if (!blog) notFound();

  incrementBlogViews(blog._id).catch(() => {});
  const relatedBlogs = await getRelatedBlogs(blog._id);

  const readTime = blog.readTime || Math.ceil((blog.content?.split(/\s+/).length || 0) / 200) || 3;
  const totalReviews = blog.reviews?.length || 0;
  const averageRating = totalReviews > 0
    ? (blog.reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / totalReviews).toFixed(1)
    : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.summary,
    "image": blog.coverImage || `${APP_URL}/default-blog-og.jpg`,
    "datePublished": blog.createdAt,
    "author": { "@type": "Person", "name": blog.author?.name },
    "publisher": {
      "@type": "Organization",
      "name": "StuHive",
      "logo": { "@type": "ImageObject", "url": `${APP_URL}/logo192.png` }
    }
  };

  // 🚀 SECURITY: Configure Sanitizer to allow structural HTML and CSS styling, 
  // but strictly block <script>, iframes, and javascript: URIs.
  const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      // Allow inline styles and classes globally so your HTML/CSS request works
      '*': [...(defaultSchema.attributes['*'] || []), 'className', 'style'],
    }
  };

  const MarkdownComponents = {
    // ✅ ACCESSIBILITY: Heading hierarchy re-mapped to prevent skipping levels
    h1: ({ node, ...props }) => <h2 className="text-3xl md:text-4xl font-extrabold mt-12 mb-6 text-white tracking-tight" {...props} />,
    h2: ({ node, ...props }) => <h3 className="text-2xl md:text-3xl font-bold mt-10 mb-4 pb-2 border-b border-white/10 text-white/90 tracking-tight" {...props} />,
    h3: ({ node, ...props }) => <h4 className="text-xl md:text-2xl font-semibold mt-8 mb-3 text-white/90" {...props} />,
    
    // ✅ HYDRATION FIX: Prevent <p> from wrapping <figure> or <div> elements from raw HTML
    p: ({ node, children, ...props }) => {
      if (node.children[0]?.tagName === "img" || node.children[0]?.tagName === "div") {
        return <>{children}</>;
      }
      return <p className="leading-7 md:leading-8 text-base md:text-lg text-gray-200 mb-6 last:mb-0" {...props}>{children}</p>;
    },

    ul: ({ node, ...props }) => <ul className="list-disc list-outside pl-6 mb-6 space-y-2 text-gray-300 marker:text-cyan-400" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal list-outside pl-6 mb-6 space-y-2 text-gray-300 marker:text-cyan-400 font-medium" {...props} />,
    a: ({ node, ...props }) => <a className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
    
    // 🚀 NEW: Markdown Table Support
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-8 rounded-xl border border-white/10 bg-white/5 shadow-2xl">
        <table className="w-full text-left border-collapse text-sm md:text-base text-gray-200" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => <thead className="bg-white/10 border-b border-white/20" {...props} />,
    tbody: ({ node, ...props }) => <tbody className="divide-y divide-white/10" {...props} />,
    tr: ({ node, ...props }) => <tr className="hover:bg-white/[0.02] transition-colors" {...props} />,
    th: ({ node, ...props }) => <th className="px-6 py-4 font-bold text-white tracking-wider uppercase text-xs" {...props} />,
    td: ({ node, ...props }) => <td className="px-6 py-4 leading-relaxed" {...props} />,

    img: ({ node, ...props }) => (
      <figure className="relative w-full my-10">
        <img 
            className="rounded-2xl shadow-lg border border-white/10 w-full h-auto object-cover" 
            alt={props.alt && props.alt !== "Image" ? props.alt : `Illustration for ${blog.title}`}
            loading="lazy" 
            decoding="async"
            {...props} 
        />
        {props.alt && props.alt !== "Image" && (
          <figcaption className="block text-center text-sm text-gray-400 mt-3 italic">{props.alt}</figcaption>
        )}
      </figure>
    ),
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      if (!inline && match) {
        return (
          <div className="relative my-8 rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ margin: 0, padding: "1.5rem" }} {...props}>
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
            <Badge key={tag} variant="secondary" className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold shadow-sm bg-white/10 text-white">
              {tag}
            </Badge>
          ))}
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] text-white max-w-4xl">
          {blog.title}
        </h1>

        <div className="w-full max-w-4xl bg-white/[0.1] border border-white/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
           <AuthorInfoBlock user={blog.author} />
           <div className="hidden md:block w-px h-12 bg-white/20" />
           <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-3 text-sm font-medium text-gray-200">
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
             <span className="flex items-center gap-2 text-white bg-white/20 px-3 py-1 rounded-full border border-white/30">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" aria-hidden="true" />
                <span>
                   {averageRating} <span className="text-white/80 font-normal">({totalReviews})</span>
                </span>
             </span>
           </div>
        </div>
      </header>

      {blog.coverImage && (
        <figure className="relative w-full aspect-video mb-20 rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/20 bg-white/5">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            priority 
            fetchPriority="high"
            unoptimized 
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
        </figure>
      )}

      <section className="max-w-none mb-24 prose prose-invert prose-headings:tracking-tight prose-a:text-cyan-400">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            // 🚀 The order here is critical: Parse raw HTML first, THEN sanitize it securely
            rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]} 
            components={MarkdownComponents}
          >
            {blog.content}
          </ReactMarkdown>
      </section>

      <footer className="space-y-16">
        <div className="border-t border-white/20 pt-12">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-white">
              <MessageCircle className="w-6 h-6 text-primary" aria-hidden="true"/> Discussion
            </h2>
            <div className="bg-white/[0.05] rounded-3xl p-6 md:p-10 border border-white/10">
              <BlogInteractions blogId={blog._id} initialComments={blog.reviews} userId={session?.user?.id} />
            </div>
        </div>

        <section className="border-t border-white/20 pt-12">
          <h2 className="sr-only">Related Articles</h2>
          <RelatedBlog blogs={relatedBlogs} />
        </section>
      </footer>
    </article>
  );
}