import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, HelpCircle, FileText, Lightbulb, GraduationCap, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Tender Resources & Guides | Protenders",
  description: "Learn how to win government tenders with our comprehensive guides, FAQs, glossary, and blog articles. Expert tips for South African businesses.",
};

export default function ResourcesHub() {
  const resources = [
    {
      title: "How It Works",
      description: "Step-by-step guide to using Protenders and finding tenders",
      icon: Lightbulb,
      href: "/how-it-works",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      type: "Guide",
    },
    {
      title: "Blog & Articles",
      description: "Expert insights, tips, and strategies for winning tenders",
      icon: BookOpen,
      href: "/blog",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      type: "Articles",
    },
    {
      title: "FAQ",
      description: "Frequently asked questions about tenders and our platform",
      icon: HelpCircle,
      href: "/faq",
      color: "text-green-600",
      bgColor: "bg-green-50",
      type: "Support",
    },
    {
      title: "Glossary",
      description: "Understand tender terminology and procurement jargon",
      icon: GraduationCap,
      href: "/glossary",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      type: "Reference",
    },
    {
      title: "About Us",
      description: "Learn about Protenders and our mission",
      icon: FileText,
      href: "/about",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      type: "Company",
    },
    {
      title: "Feedback",
      description: "Share your thoughts and help us improve",
      icon: MessageSquare,
      href: "/feedback",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      type: "Support",
    },
  ];

  const featuredGuides = [
    {
      title: "How to Submit eTenders in South Africa",
      description: "Complete step-by-step guide for 2025",
      href: "/blog/how-to-submit-etenders-south-africa-complete-guide-2025",
      readTime: "12 min read",
    },
    {
      title: "Tender Documents Checklist",
      description: "Required documents and templates for submissions",
      href: "/blog/tender-documents-south-africa-complete-checklist-guide-2025",
      readTime: "8 min read",
    },
    {
      title: "City of Johannesburg Tenders Guide",
      description: "How to win municipal tenders in Johannesburg",
      href: "/blog/city-of-johannesburg-tenders-complete-guide-2025",
      readTime: "10 min read",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="w-full border-b bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="content-container py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Tender Resources & Learning Center
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl">
            Everything you need to succeed in government procurement. Guides, tutorials, FAQs,
            and expert insights to help you win more tenders.
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="w-full py-12">
        <div className="content-container">
          <h2 className="text-3xl font-bold mb-8">Browse Resources</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => {
              const Icon = resource.icon;
              return (
                <Link key={resource.href} href={resource.href}>
                  <Card className="h-full hover:shadow-lg transition-all hover:border-primary cursor-pointer group">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${resource.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${resource.color}`} />
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl">{resource.title}</CardTitle>
                        <span className="text-xs px-2 py-1 bg-muted rounded-full">
                          {resource.type}
                        </span>
                      </div>
                      <CardDescription className="text-sm">
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Guides */}
      <section className="w-full py-12 bg-muted/30">
        <div className="content-container">
          <h2 className="text-3xl font-bold mb-8">Featured Guides</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredGuides.map((guide) => (
              <Link key={guide.href} href={guide.href}>
                <Card className="h-full hover:shadow-lg transition-all hover:border-primary cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg leading-tight mb-2">
                      {guide.title}
                    </CardTitle>
                    <CardDescription className="text-sm mb-3">
                      {guide.description}
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      {guide.readTime}
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/blog">
              <Button variant="outline" size="lg">
                View All Blog Posts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="w-full py-12">
        <div className="content-container">
          <h2 className="text-3xl font-bold mb-8">Popular Topics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/how-it-works" className="text-primary hover:underline">
                      → How to use Protenders
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-primary hover:underline">
                      → Account setup and features
                    </Link>
                  </li>
                  <li>
                    <Link href="/alerts" className="text-primary hover:underline">
                      → Setting up tender alerts
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tender Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/blog/how-to-submit-etenders-south-africa-complete-guide-2025" className="text-primary hover:underline">
                      → eTender submission process
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog/tender-documents-south-africa-complete-checklist-guide-2025" className="text-primary hover:underline">
                      → Required documents checklist
                    </Link>
                  </li>
                  <li>
                    <Link href="/glossary" className="text-primary hover:underline">
                      → Understanding tender terms
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12">
        <div className="content-container">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
              <p className="text-lg mb-6 text-white/90 max-w-2xl mx-auto">
                Can't find what you're looking for? Send us your feedback or questions.
              </p>
              <Link href="/feedback">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  Contact Support
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
