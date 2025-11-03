export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  author: string;
  category: string;
  tags: string[];
  readingTime: number;
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "understanding-government-tenders",
    title: "Understanding Government Tenders: A Complete Guide",
    excerpt: "Learn everything you need to know about government procurement processes in South Africa.",
    content: "This is a comprehensive guide to understanding government tenders...",
    publishedAt: "2024-01-15",
    author: "ProTenders Team",
    category: "Education",
    tags: ["tenders", "government", "procurement"],
    readingTime: 5
  },
  {
    slug: "bee-compliance-guide",
    title: "BEE Compliance Guide for Government Tenders",
    excerpt: "Navigate Broad-Based Black Economic Empowerment requirements for tender submissions.",
    content: "Understanding BEE compliance is crucial for successful tender submissions...",
    publishedAt: "2024-01-20",
    author: "ProTenders Team",
    category: "Compliance",
    tags: ["BEE", "compliance", "tenders"],
    readingTime: 7
  }
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getBlogPost(slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter(post => post.category === category);
}

export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  const currentPost = getBlogPost(currentSlug);
  if (!currentPost) return [];

  return blogPosts
    .filter(post => post.slug !== currentSlug)
    .filter(post => post.category === currentPost.category)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  blogPosts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

export function getAllCategories(): string[] {
  const categorySet = new Set<string>();
  blogPosts.forEach(post => {
    categorySet.add(post.category);
  });
  return Array.from(categorySet).sort();
}