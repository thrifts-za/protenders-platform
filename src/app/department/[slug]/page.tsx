import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDepartmentBySlug, getAllDepartmentSlugs } from "@/data/departments";
import {
  generateBreadcrumbSchema,
  generateServiceSchema,
  renderStructuredData,
} from "@/lib/structured-data";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";

// ISR: Revalidate every 24 hours
export const revalidate = 86400;

// Generate static paths for all departments at build time
export async function generateStaticParams() {
  const slugs = getAllDepartmentSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const department = getDepartmentBySlug(slug);

  if (!department) {
    return {
      title: "Department Not Found",
    };
  }

  const keywords = [
    `${department.name.toLowerCase()} tenders`,
    `${department.name.toLowerCase()} RFQ`,
    `${department.name.toLowerCase()} RFP`,
    `government ${department.name.toLowerCase()} tenders`,
    `${department.name.toLowerCase()} procurement`,
    `${department.name.toLowerCase()} contracts`,
    `${department.name.toLowerCase()} opportunities`,
    `find ${department.name.toLowerCase()} tenders`,
  ];

  return {
    title: `${department.name} Tenders | Government Tenders South Africa 2025`,
    description: department.description,
    keywords,
    openGraph: {
      title: `${department.name} Tenders 2025`,
      description: department.description,
      url: `https://protenders.co.za/department/${slug}`,
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${department.name} Government Tenders`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${department.name} Tenders 2025`,
      description: department.description,
      images: ["/og-image.png"],
    },
  };
}

// Server Component - All content is pre-rendered in HTML!
export default async function DepartmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const department = getDepartmentBySlug(slug);

  if (!department) {
    notFound();
  }

  // Generate structured data for SEO
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Departments", url: "/departments" },
    { name: department.name, url: `/department/${slug}` },
  ]);

  const serviceSchema = generateServiceSchema(
    `${department.name} Tenders`,
    department.description
  );

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
            { name: "Home", url: "/" },
            { name: "Departments", url: "/departments" },
            { name: department.name, url: `/department/${slug}` },
          ]}
        />

        {/* Header Section */}
        <header className="w-full border-b bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="content-container py-12">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                Department
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {department.name} Tenders
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mb-6">
              {department.description}
            </p>

            {department.website && (
              <div className="mt-4">
                <a
                  href={department.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Visit Official Website →
                </a>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full py-12">
          <div className="content-container">
          {/* Overview Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">About {department.name}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {department.overview}
            </p>
          </section>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Tender Types */}
            {department.tenderTypes && department.tenderTypes.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Common Tender Types</h2>
                <ul className="space-y-2">
                  {department.tenderTypes.map((type, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      <span className="text-muted-foreground">{type}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Key Programs */}
            {department.keyPrograms && department.keyPrograms.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Key Programs</h2>
                <ul className="space-y-2">
                  {department.keyPrograms.map((program, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      <span className="text-muted-foreground">{program}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* BEE Requirements */}
          {department.beeRequirements && (
            <section className="mb-12 p-6 bg-primary/10 rounded-lg border border-primary/20">
              <h2 className="text-2xl font-bold mb-4 text-primary">B-BBEE Requirements</h2>
              <p className="text-foreground leading-relaxed">
                {department.beeRequirements}
              </p>
            </section>
          )}

          {/* Tender Insights */}
          {department.tenderInsights && (
            <section className="mb-12 p-6 bg-muted/50 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Tender Landscape Insights</h2>
              <p className="text-muted-foreground leading-relaxed">
                {department.tenderInsights}
              </p>
            </section>
          )}

          {/* Contact Information */}
          {department.contactInfo && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {department.contactInfo.email && (
                  <div>
                    <span className="font-semibold">Email:</span>{" "}
                    <a
                      href={`mailto:${department.contactInfo.email}`}
                      className="text-primary hover:underline"
                    >
                      {department.contactInfo.email}
                    </a>
                  </div>
                )}
                {department.contactInfo.phone && (
                  <div>
                    <span className="font-semibold">Phone:</span>{" "}
                    <a
                      href={`tel:${department.contactInfo.phone}`}
                      className="text-primary hover:underline"
                    >
                      {department.contactInfo.phone}
                    </a>
                  </div>
                )}
                {department.contactInfo.address && (
                  <div className="md:col-span-2">
                    <span className="font-semibold">Address:</span>{" "}
                    <span className="text-muted-foreground">{department.contactInfo.address}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Call to Action */}
          <section className="text-center p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Find {department.name} Tenders?
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Search our database of active government tenders from {department.name}.
              Set up alerts and never miss an opportunity.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href={`/search?buyer=${encodeURIComponent(department.name)}`}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Search {department.name} Tenders
              </Link>
              <Link
                href="/alerts"
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
              >
                Set Up Alerts
              </Link>
            </div>
          </section>
          </div>
        </main>
      </div>
    </>
  );
}