import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getAllCategorySlugs } from "@/data/categories";
import {
  generateBreadcrumbSchema,
  generateCategoryServiceSchema,
  renderStructuredData,
} from "@/lib/structured-data";
import { LiveTenders } from "./LiveTenders";
import Breadcrumbs from "@/components/Breadcrumbs";

// ISR: Revalidate every 12 hours (categories change less frequently than provinces)
export const revalidate = 43200;

// Generate static paths for all categories at build time
export async function generateStaticParams() {
  const slugs = getAllCategorySlugs();
  return slugs.map((category) => ({
    category,
  }));
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const categoryData = getCategoryBySlug(category);

  if (!categoryData) {
    return {
      title: "Category Not Found",
    };
  }

  // Generate comprehensive keywords for this category including "etenders" variations
  const keywords = [
    `${categoryData.name.toLowerCase()} tenders`,
    `${categoryData.name.toLowerCase()} etenders`,
    `${categoryData.name.toLowerCase()} tenders South Africa`,
    `${categoryData.name.toLowerCase()} tenders South Africa 2025`,
    `etenders ${categoryData.name.toLowerCase()}`,
    `government ${categoryData.name.toLowerCase()} etenders`,
    `${categoryData.name.toLowerCase()} RFQ`,
    `${categoryData.name.toLowerCase()} RFP`,
    `government ${categoryData.name.toLowerCase()} contracts`,
    `${categoryData.name.toLowerCase()} procurement`,
    `${categoryData.name.toLowerCase()} procurement opportunities`,
    `find ${categoryData.name.toLowerCase()} tenders`,
    `${categoryData.name.toLowerCase()} bid opportunities`,
    ...(categoryData.tenderTypes?.slice(0, 8).map(type =>
      `${type.toLowerCase().split('(')[0].trim()} tenders`
    ) || []),
  ];

  return {
    title: `${categoryData.name} Tenders South Africa | Find ${categoryData.name} RFQs & RFPs 2025`,
    description: categoryData.description,
    keywords: keywords.join(", "),
    openGraph: {
      title: `${categoryData.name} Tenders South Africa 2025`,
      description: categoryData.description,
      url: `https://protenders.co.za/category/${category}`,
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${categoryData.name} Government Tenders`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryData.name} Tenders South Africa 2025`,
      description: categoryData.description,
      images: ["/og-image.png"],
    },
  };
}

// Server Component - All content is pre-rendered in HTML!
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const categoryData = getCategoryBySlug(category);

  if (!categoryData) {
    notFound();
  }

  // Generate structured data for SEO
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Categories", url: "/categories" },
    { name: categoryData.name, url: `/category/${category}` },
  ]);

  const serviceSchema = generateCategoryServiceSchema(
    categoryData.name,
    categoryData.description
  );

  // Live tenders loaded client-side to avoid long SSR during static build

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderStructuredData(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderStructuredData(serviceSchema) }}
      />

      <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: categoryData.name, href: `/category/${category}` },
        ]}
      />
      
      {/* Header Section */}
      <header className="border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
              Category
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {categoryData.name} Tenders in South Africa
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl">
            {categoryData.description}
          </p>

          {/* Average Values Badge */}
          <div className="mt-6">
            <div className="inline-block p-4 bg-card rounded-lg border">
              <div className="text-sm text-muted-foreground">Average Tender Values</div>
              <div className="text-lg font-semibold">{categoryData.averageValues}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full py-12">
        <div className="content-container">
        {/* Industry Overview */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Industry Overview</h2>
          <div className="prose max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {categoryData.overview}
            </p>
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Common Tender Types */}
          <section className="p-6 bg-card rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">Common Tender Types</h2>
            <ul className="space-y-2">
              {categoryData.tenderTypes?.map((type, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 text-primary">✓</span>
                  <span className="text-muted-foreground">{type}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Common Buyers */}
          <section className="p-6 bg-card rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">Common Buyers & Departments</h2>
            <ul className="space-y-2">
              {categoryData.commonBuyers?.map((buyer, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-muted-foreground">{buyer}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Requirements Section */}
        {categoryData.requirements && (
        <section className="mb-12 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">{categoryData.requirements.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryData.requirements.items?.map((requirement, index) => (
              <div key={index} className="flex items-start">
                <span className="mr-2 text-green-500">✓</span>
                <span className="text-sm text-muted-foreground">{requirement}</span>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* Key Considerations */}
        {categoryData.keyConsiderations && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Key Considerations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryData.keyConsiderations.map((consideration, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900"
              >
                <span className="text-amber-600 mt-1">⚠</span>
                <span className="text-sm">{consideration}</span>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* Live Tenders for this Category */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Current {categoryData.name} Tenders</h2>
          <LiveTenders category={category} />
        </section>

        {/* Success Tips */}
        {categoryData.successTips && (
        <section className="mb-12 p-6 bg-primary/10 rounded-lg border border-primary/20">
          <h2 className="text-2xl font-bold mb-4 text-primary">Tips for Success</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryData.successTips?.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-900"
              >
                <span className="text-green-600 mt-1">💡</span>
                <span className="text-sm">{tip}</span>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* BEE & Empowerment Opportunities */}
        <section className="mb-12 p-6 bg-gradient-to-br from-primary/5 to-background rounded-lg border">
          <h2 className="text-2xl font-bold mb-4">
            BEE & Empowerment Opportunities in {categoryData.name}
          </h2>
          <p className="text-muted-foreground mb-4">
            Find {categoryData.name.toLowerCase()} tenders with BEE preferential points,
            set-aside opportunities for SMMEs, and empowerment-focused procurement.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2 p-4 rounded-lg bg-white dark:bg-gray-900 border">
              <span className="text-primary">✓</span>
              <div>
                <div className="font-medium text-sm">Level 1-4 BEE Preferred</div>
                <div className="text-xs text-muted-foreground">
                  Tenders with preferential points for high BEE contributors
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-4 rounded-lg bg-white dark:bg-gray-900 border">
              <span className="text-primary">✓</span>
              <div>
                <div className="font-medium text-sm">SMME Set-Asides</div>
                <div className="text-xs text-muted-foreground">
                  Opportunities reserved exclusively for small businesses
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-4 rounded-lg bg-white dark:bg-gray-900 border">
              <span className="text-primary">✓</span>
              <div>
                <div className="font-medium text-sm">Women-Owned Business Preferences</div>
                <div className="text-xs text-muted-foreground">
                  Additional points for women-owned enterprises
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-4 rounded-lg bg-white dark:bg-gray-900 border">
              <span className="text-primary">✓</span>
              <div>
                <div className="font-medium text-sm">Youth-Owned Business Opportunities</div>
                <div className="text-xs text-muted-foreground">
                  Special consideration for youth entrepreneurs
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 text-xl">📈</span>
              <div>
                <div className="font-semibold text-sm mb-1">Improve Your BEE Score</div>
                <p className="text-xs text-muted-foreground">
                  Ensure your B-BBEE certificate is current and registered on the Central
                  Supplier Database (CSD) to qualify for empowerment tenders.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find {categoryData.name} Tenders?
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Search our database of active {categoryData.name.toLowerCase()} tenders across South Africa.
            Set up alerts and never miss an opportunity.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/search"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Search {categoryData.name} Tenders
            </a>
            <a
              href="/alerts"
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
            >
              Set Up Alerts
            </a>
          </div>
        </section>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="w-full border-t mt-12">
        <div className="content-container py-6">
          <p className="text-sm text-muted-foreground text-center">
            This page is automatically updated every 12 hours with the latest {categoryData.name.toLowerCase()} tender information.
            Last updated: {new Date().toLocaleDateString('en-ZA')}
          </p>
        </div>
      </footer>
    </div>
    </>
  );
}
