import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMunicipalityBySlug, getAllMunicipalitySlugs } from "@/data/municipalities";
import {
  generateBreadcrumbSchema,
  generateServiceSchema,
  renderStructuredData,
} from "@/lib/structured-data";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";

// ISR: Revalidate every 24 hours
export const revalidate = 86400;

// Generate static paths for all municipalities at build time
export async function generateStaticParams() {
  const slugs = getAllMunicipalitySlugs();
  return slugs.map((slug) => ({ slug }));
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const municipality = getMunicipalityBySlug(slug);

  if (!municipality) {
    return {
      title: "Municipality Not Found",
    };
  }

  const keywords = [
    `${municipality.name.toLowerCase()} tenders`,
    `${municipality.name.toLowerCase()} municipal tenders`,
    `${municipality.name.toLowerCase()} RFQ`,
    `${municipality.name.toLowerCase()} RFP`,
    `${municipality.province.toLowerCase()} municipal tenders`,
    `municipal tenders ${municipality.province.toLowerCase()}`,
    `${municipality.name.toLowerCase()} procurement`,
    `${municipality.name.toLowerCase()} supplier registration`,
  ];

  return {
    title: `${municipality.name} Tenders | Municipal Tenders ${municipality.province} 2025`,
    description: municipality.description,
    keywords,
    openGraph: {
      title: `${municipality.name} Municipal Tenders 2025`,
      description: municipality.description,
      url: `https://protenders.co.za/municipality/${slug}`,
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${municipality.name} Municipal Tenders`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${municipality.name} Municipal Tenders 2025`,
      description: municipality.description,
      images: ["/og-image.png"],
    },
  };
}

// Server Component - All content is pre-rendered in HTML!
export default async function MunicipalityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const municipality = getMunicipalityBySlug(slug);

  if (!municipality) {
    notFound();
  }

  // Generate structured data for SEO
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://protenders.co.za/" },
    { name: "Municipalities", url: "https://protenders.co.za/municipalities" },
    { name: municipality.name, url: `https://protenders.co.za/municipality/${slug}` },
  ]);

  const serviceSchema = generateServiceSchema(
    `${municipality.name} Municipal Tenders`,
    municipality.description
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
            { label: "Home", href: "/" },
            { label: "Municipalities", href: "/municipalities" },
            { label: municipality.name, href: `/municipality/${slug}` },
          ]}
        />

        {/* Header Section */}
        <header className="w-full border-b bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="content-container py-12">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                Municipality
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {municipality.name} Tenders
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mb-6">
              {municipality.description}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {municipality.population && (
                <div className="p-4 bg-card rounded-lg border">
                  <div className="text-sm text-muted-foreground">Population</div>
                  <div className="text-lg font-semibold">{municipality.population}</div>
                </div>
              )}
              <div className="p-4 bg-card rounded-lg border">
                <div className="text-sm text-muted-foreground">Province</div>
                <div className="text-lg font-semibold">{municipality.province}</div>
              </div>
              {municipality.website && (
                <div className="p-4 bg-card rounded-lg border">
                  <div className="text-sm text-muted-foreground">Website</div>
                  <a
                    href={municipality.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-primary hover:underline"
                  >
                    Visit Official Site
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full py-12">
          <div className="content-container">
          {/* Overview Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">About {municipality.name}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {municipality.overview}
            </p>
          </section>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Key Departments */}
            {municipality.keyDepartments && municipality.keyDepartments.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Key Departments</h2>
                <ul className="space-y-2">
                  {municipality.keyDepartments.map((dept, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      <span className="text-muted-foreground">{dept}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Tender Types */}
            {municipality.tenderTypes && municipality.tenderTypes.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Common Tender Types</h2>
                <ul className="space-y-2">
                  {municipality.tenderTypes.map((type, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      <span className="text-muted-foreground">{type}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Supplier Registration */}
          {municipality.supplierRegistration && (
            <section className="mb-12 p-6 bg-muted/50 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Supplier Registration</h2>
              <p className="text-muted-foreground mb-4">
                To participate in {municipality.name} tenders, suppliers must register with the municipality.
              </p>
              {municipality.supplierRegistration.url && (
                <Link
                  href={municipality.supplierRegistration.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Register as Supplier →
                </Link>
              )}
              {municipality.supplierRegistration.requirements && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Required Documents:</h3>
                  <ul className="space-y-1">
                    {municipality.supplierRegistration.requirements.map((req, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* BEE Requirements */}
          {municipality.beeRequirements && (
            <section className="mb-12 p-6 bg-primary/10 rounded-lg border border-primary/20">
              <h2 className="text-2xl font-bold mb-4 text-primary">B-BBEE Requirements</h2>
              <p className="text-foreground leading-relaxed">
                {municipality.beeRequirements}
              </p>
            </section>
          )}

          {/* Tender Insights */}
          {municipality.tenderInsights && (
            <section className="mb-12 p-6 bg-muted/50 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Tender Landscape Insights</h2>
              <p className="text-muted-foreground leading-relaxed">
                {municipality.tenderInsights}
              </p>
            </section>
          )}

          {/* Contact Information */}
          {municipality.contactInfo && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {municipality.contactInfo.email && (
                  <div>
                    <span className="font-semibold">Email:</span>{" "}
                    <a
                      href={`mailto:${municipality.contactInfo.email}`}
                      className="text-primary hover:underline"
                    >
                      {municipality.contactInfo.email}
                    </a>
                  </div>
                )}
                {municipality.contactInfo.phone && (
                  <div>
                    <span className="font-semibold">Phone:</span>{" "}
                    <a
                      href={`tel:${municipality.contactInfo.phone}`}
                      className="text-primary hover:underline"
                    >
                      {municipality.contactInfo.phone}
                    </a>
                  </div>
                )}
                {municipality.contactInfo.address && (
                  <div className="md:col-span-2">
                    <span className="font-semibold">Address:</span>{" "}
                    <span className="text-muted-foreground">{municipality.contactInfo.address}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Call to Action */}
          <section className="text-center p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Find {municipality.name} Tenders?
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Search our database of active municipal tenders from {municipality.name}.
              Set up alerts and never miss an opportunity.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href={`/search?buyer=${encodeURIComponent(municipality.name)}`}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Search {municipality.name} Tenders
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