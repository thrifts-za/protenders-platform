/**
 * GuidePostClient Component
 * Phase 3: ProTender Fund Finder - Guide Content Renderer
 *
 * Displays individual funding guide with rich content, CTAs, and lead capture
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Breadcrumbs from "@/components/Breadcrumbs";
import { GuideStructuredData } from "@/components/funding/GuideStructuredData";
import { DownloadCTA } from "@/components/funding/DownloadCTA";
import type { FundingGuide } from "@/data/fundingGuides";
import {
  Clock,
  BookOpen,
  Calendar,
  Target,
  ArrowRight,
  Share2,
  TrendingUp,
} from "lucide-react";
import { fundingGuides } from "@/data/fundingGuides";

interface GuidePostClientProps {
  guide: FundingGuide;
}

export default function GuidePostClient({ guide }: GuidePostClientProps) {
  const [copied, setCopied] = useState(false);

  const guideUrl = `https://protenders.co.za/funding/guides/${guide.slug}`;

  // Get related guides (same category or target audience)
  const relatedGuides = fundingGuides
    .filter(
      (g) =>
        g.id !== guide.id &&
        (g.category === guide.category ||
          g.targetAudience?.some((audience) => guide.targetAudience?.includes(audience)))
    )
    .slice(0, 3);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: guide.title,
          text: guide.excerpt,
          url: guideUrl,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(guideUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <GuideStructuredData guide={guide} url={guideUrl} />

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Funding", href: "/funding" },
              { label: "Guides", href: "/funding/guides" },
              { label: guide.title, href: `/funding/guides/${guide.slug}` },
            ]}
          />

          {/* Header */}
          <header className="mt-8 mb-12">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300">
                {guide.category}
              </Badge>
              <Badge variant="outline">{guide.difficulty}</Badge>
              {guide.featured && (
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  ⭐ Featured
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {guide.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-600 mb-8">{guide.excerpt}</p>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-6 border-b">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={guide.publishedDate}>
                  {new Date(guide.publishedDate).toLocaleDateString("en-ZA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{guide.readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{guide.author}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="ml-auto"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Share"}
              </Button>
            </div>

            {/* Target Audience */}
            {guide.targetAudience && guide.targetAudience.length > 0 && (
              <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Perfect for:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {guide.targetAudience.map((audience, idx) => (
                      <Badge key={idx} variant="outline" className="bg-white">
                        {audience}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* Main Content */}
          <article className="prose prose-lg max-w-none mb-16 guide-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {guide.content}
            </ReactMarkdown>
          </article>

          {/* Download CTA (if available) */}
          {guide.downloadableResource && (
            <DownloadCTA
              resourceTitle={guide.downloadableResource.title}
              resourceDescription={guide.downloadableResource.description}
              resourceFileName={guide.downloadableResource.fileName}
              resourceFileSize={guide.downloadableResource.fileSize}
              variant="prominent"
            />
          )}

          {/* Fund Finder CTA */}
          <Card className="p-8 my-12 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold">
                Ready to Find Your Perfect Funding Match?
              </h3>
              <p className="text-lg text-indigo-100">
                Answer 5 quick questions and get personalized recommendations in 60 seconds
              </p>
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold px-8"
                onClick={() => (window.location.href = "/funding/match")}
              >
                Start Fund Finder Tool
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>

          {/* Tags */}
          {guide.tags && guide.tags.length > 0 && (
            <div className="mb-12">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {guide.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Guides */}
          {relatedGuides.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Related Guides</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedGuides.map((relatedGuide) => (
                  <Link
                    key={relatedGuide.id}
                    href={`/funding/guides/${relatedGuide.slug}`}
                    className="group"
                  >
                    <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                      <Badge className="mb-3">{relatedGuide.category}</Badge>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {relatedGuide.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedGuide.excerpt}
                      </p>
                      <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{relatedGuide.readTime}</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back to Guides */}
          <div className="mt-12 text-center">
            <Button variant="outline" asChild>
              <Link href="/funding/guides">← Browse All Funding Guides</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Custom styles for guide content */}
      <style jsx global>{`
        .guide-content h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          color: #111827;
        }
        .guide-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #374151;
        }
        .guide-content h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #4b5563;
        }
        .guide-content p {
          margin-bottom: 1.25rem;
          line-height: 1.75;
          color: #374151;
        }
        .guide-content a {
          color: #4f46e5;
          text-decoration: underline;
          font-weight: 500;
        }
        .guide-content a:hover {
          color: #4338ca;
        }
        .guide-content ul {
          margin-bottom: 1.5rem;
          padding-left: 2rem;
          list-style-type: disc;
        }
        .guide-content ol {
          margin-bottom: 1.5rem;
          padding-left: 2rem;
          list-style-type: decimal;
        }
        .guide-content ul ul {
          list-style-type: circle;
          margin-top: 0.5rem;
        }
        .guide-content ol ol {
          list-style-type: lower-alpha;
          margin-top: 0.5rem;
        }
        .guide-content li {
          margin-bottom: 0.5rem;
          line-height: 1.75;
          display: list-item;
        }
        .guide-content strong {
          font-weight: 600;
          color: #111827;
        }
        .guide-content em {
          font-style: italic;
        }
        .guide-content blockquote {
          border-left: 4px solid #4f46e5;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #6b7280;
        }
        .guide-content table {
          width: 100%;
          margin: 2rem 0;
          border-collapse: collapse;
        }
        .guide-content th {
          background-color: #f3f4f6;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          border: 1px solid #e5e7eb;
        }
        .guide-content td {
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
        }
        .guide-content code {
          background-color: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875em;
        }
      `}</style>
    </>
  );
}
