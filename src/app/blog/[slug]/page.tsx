import { Metadata } from 'next';
import { getPostBySlug, blogPosts } from '@/data/blogPosts';
import { notFound } from 'next/navigation';
import BlogPostClient from './BlogPostClient';

/**
 * Generate static params for all blog posts
 * This enables static generation at build time
 */
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * Generate metadata for each blog post
 * Includes Article schema for rich snippets
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | ProTenders Blog',
      description: 'The requested blog post could not be found.',
    };
  }

  // Build keywords from post data
  const keywords = [
    ...post.tags,
    'etenders',
    'etenders guide',
    'government tenders guide',
    `${post.category.toLowerCase()} guide`,
    'tender guide south africa',
    'procurement guide',
  ];

  return {
    title: `${post.title} | ProTenders Blog`,
    description: post.excerpt,
    keywords: keywords.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedDate,
      authors: [post.author],
      tags: post.tags,
      url: `https://protenders.co.za/blog/${slug}`,
      images: [
        {
          url: '/images/og-image.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: ['/images/og-image.png'],
    },
    alternates: {
      canonical: `https://protenders.co.za/blog/${slug}`,
    },
  };
}

/**
 * Server Component - Renders the blog post client component
 */
export default function BlogPostPage() {
  return <BlogPostClient />;
}
