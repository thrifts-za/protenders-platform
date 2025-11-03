"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Calendar, Clock, Tag } from "lucide-react";
import { useState, useMemo } from "react";
import { blogPosts, getAllTags, getAllCategories } from "@/data/blogPosts";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const categories = getAllCategories();
  const tags = getAllTags();

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === null || post.category === selectedCategory;

      const matchesTag =
        selectedTag === null || post.tags.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [searchQuery, selectedCategory, selectedTag]);

  const featuredPosts = blogPosts.filter((post) => post.featured);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
          <div className="max-w-3xl">
            <Badge className="mb-4">Blog & Resources</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Tender Intelligence Insights
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Expert guidance on finding etenders, winning government contracts, and mastering procurement in South Africa.
            </p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-4 space-y-6">
              {/* Categories */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Categories
                </h3>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Categories
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "ghost"
                      }
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Tags */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedTag(selectedTag === tag ? null : tag)
                      }
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* Quick Links */}
              <Card className="p-4 bg-primary/5">
                <h3 className="font-semibold mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <Link href="/how-it-works">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      How It Works
                    </Button>
                  </Link>
                  <Link href="/faq">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      FAQ
                    </Button>
                  </Link>
                  <Link href="/alerts">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Create Alerts
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Featured Posts */}
            {searchQuery === "" && selectedCategory === null && selectedTag === null && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  Featured Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`}>
                      <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                        <Badge className="mb-3">{post.category}</Badge>
                        <h3 className="text-xl font-bold mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.publishedAt).toLocaleDateString("en-ZA", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readingTime + " min read"}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All Posts */}
            <div>
              <h2 className="text-2xl font-bold mb-6">
                {searchQuery || selectedCategory || selectedTag
                  ? `${filteredPosts.length} Article${filteredPosts.length !== 1 ? "s" : ""} Found`
                  : "All Articles"}
              </h2>

              {filteredPosts.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No articles found matching your criteria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(null);
                      setSelectedTag(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`}>
                      <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge>{post.category}</Badge>
                              {post.featured && (
                                <Badge variant="outline">Featured</Badge>
                              )}
                            </div>
                            <h3 className="text-2xl font-bold mb-2">
                              {post.title}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span>By {post.author}</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.publishedAt).toLocaleDateString("en-ZA", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.readingTime + " min read"}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {post.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
