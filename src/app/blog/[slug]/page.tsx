"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react";
import { getPostBySlug, getRelatedPosts } from "@/data/blogPosts";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function BlogPost() {
  const params = useParams();
  const slug = params?.slug as string;

  if (!slug) {
    notFound();
  }

  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.slug, 3);

  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${post.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: url,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied!", {
          description: "Article link copied to clipboard",
        });
      } catch (err) {
        toast.error("Failed to copy", {
          description: "Please copy the URL manually",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge>{post.category}</Badge>
            {post.featured && <Badge variant="outline">Featured</Badge>}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(post.publishedDate).toLocaleDateString("en-ZA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 leading-relaxed text-foreground">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="ml-4 text-foreground">{children}</li>
              ),
              a: ({ href, children }) => (
                <Link
                  href={href || "#"}
                  className="text-primary hover:underline font-medium"
                >
                  {children}
                </Link>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-foreground">{children}</strong>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* CTA Section */}
        <Card className="p-8 mb-12 bg-gradient-to-br from-primary/10 to-primary/5">
          <h3 className="text-2xl font-bold mb-4 text-center">
            Ready to Find Your Next Tender?
          </h3>
          <p className="text-muted-foreground text-center mb-6">
            Start searching thousands of government tenders and get instant alerts for opportunities that match your business.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/">
              <Button size="lg">Start Searching Tenders</Button>
            </Link>
            <Link href="/alerts">
              <Button variant="outline" size="lg">
                Create Alert
              </Button>
            </Link>
          </div>
        </Card>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                  <Card className="p-4 h-full hover:shadow-lg transition-shadow">
                    <Badge className="mb-2 text-xs">{relatedPost.category}</Badge>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {relatedPost.readTime}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="mt-12 text-center">
          <Link href="/blog">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              View All Articles
            </Button>
          </Link>
        </div>
      </article>
    </div>
  );
}
