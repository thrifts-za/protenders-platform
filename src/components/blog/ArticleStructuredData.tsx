import { generateArticleSchema, renderStructuredData, BlogPostData } from '@/lib/structured-data';

interface ArticleStructuredDataProps {
  post: BlogPostData;
}

/**
 * Component to inject Article structured data (JSON-LD) into blog posts
 * This helps search engines understand the content and display rich snippets
 */
export default function ArticleStructuredData({ post }: ArticleStructuredDataProps) {
  const schema = generateArticleSchema(post);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: renderStructuredData(schema),
      }}
    />
  );
}
