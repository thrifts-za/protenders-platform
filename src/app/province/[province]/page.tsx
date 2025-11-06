import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProvinceBySlug, getAllProvinceSlugs } from "@/data/provinces";
import {
  generateBreadcrumbSchema,
  generateProvinceServiceSchema,
  renderStructuredData,
} from "@/lib/structured-data";
import { LiveTenders } from "./LiveTenders";
import Breadcrumbs from "@/components/Breadcrumbs";

// ISR: Revalidate every 24 hours
export const revalidate = 86400;

// Generate static paths for all provinces at build time
export async function generateStaticParams() {
  const slugs = getAllProvinceSlugs();
  return slugs.map((province) => ({
    province,
  }));
}

// Dynamic metadata for SEO (THIS IS THE KEY!)
export async function generateMetadata({ params }: { params: Promise<{ province: string }> }): Promise<Metadata> {
  const { province } = await params;
  const provinceData = getProvinceBySlug(province);

  if (!provinceData) {
    return {
      title: "Province Not Found",
    };
  }

  const keywords = [
    `${provinceData.name.toLowerCase()} tenders`,
    `${provinceData.name.toLowerCase()} etenders`,
    `etenders ${provinceData.name.toLowerCase()}`,
    `government tenders ${provinceData.name.toLowerCase()}`,
    `government etenders ${provinceData.name.toLowerCase()}`,
    `${provinceData.name} procurement`,
    `tenders in ${provinceData.name.toLowerCase()}`,
    `etenders in ${provinceData.name.toLowerCase()}`,
    `${provinceData.name} RFQ`,
    `${provinceData.name} RFP`,
    ...(provinceData.keyIndustries?.map(ind => `${ind.toLowerCase()} tenders ${provinceData.name.toLowerCase()}`) || []),
  ];

  return {
    title: `${provinceData.name} Government Tenders | Find ${provinceData.name} Tenders 2025`,
    description: provinceData.description,
    keywords: keywords.join(", "),
    openGraph: {
      title: `${provinceData.name} Government Tenders 2025`,
      description: provinceData.description,
      url: `https://protenders.co.za/province/${province}`,
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${provinceData.name} Government Tenders`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${provinceData.name} Government Tenders 2025`,
      description: provinceData.description,
      images: ["/og-image.png"],
    },
  };
}

// Server Component - All content is pre-rendered in HTML!
export default async function ProvincePage({ params }: { params: Promise<{ province: string }> }) {
  const { province } = await params;
  const provinceData = getProvinceBySlug(province);

  if (!provinceData) {
    notFound();
  }

  // Generate structured data for SEO
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Provinces", url: "/provinces" },
    { name: provinceData.name, url: `/province/${province}` },
  ]);

  const serviceSchema = generateProvinceServiceSchema(
    provinceData.name,
    provinceData.description
  );

  // Live tenders loaded client-side to avoid slow SSR during static build

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
      {/* Header Section */}
      <header className="w-full border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="content-container py-12">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
              Province
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {provinceData.name} Government Tenders
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl">
            {provinceData.description}
          </p>

          {/* Quick Stats */}
          {provinceData.statistics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-card rounded-lg border">
                <div className="text-sm text-muted-foreground">Population</div>
                <div className="text-lg font-semibold">{provinceData.statistics.population}</div>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <div className="text-sm text-muted-foreground">GDP Contribution</div>
                <div className="text-lg font-semibold">{provinceData.statistics.gdpContribution}</div>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <div className="text-sm text-muted-foreground">Capital</div>
                <div className="text-lg font-semibold">{provinceData.capital}</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full py-12">
        <div className="content-container">
          {/* Overview Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">About {provinceData.name}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {provinceData.overview || provinceData.description}
            </p>
          </section>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Major Departments */}
          {provinceData.majorDepartments && provinceData.majorDepartments.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Major Departments & Buyers</h2>
              <ul className="space-y-2">
                {provinceData.majorDepartments.map((dept, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <span className="text-muted-foreground">{dept}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Key Industries */}
          {provinceData.keyIndustries && provinceData.keyIndustries.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Key Industries & Sectors</h2>
              <ul className="space-y-2">
                {provinceData.keyIndustries.map((industry, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <span className="text-muted-foreground">{industry}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          </div>

          {/* Tender Insights */}
          {provinceData.tenderInsights && (
            <section className="mb-12 p-6 bg-muted/50 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Tender Landscape Insights</h2>
              <p className="text-muted-foreground leading-relaxed">
                {provinceData.tenderInsights}
              </p>
            </section>
          )}

          {/* Live Tenders in this Province */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Current Tenders in {provinceData.name}</h2>
            <LiveTenders keyword={provinceData.name} />
          </section>

          {/* Success Tip */}
          {provinceData.successTip && (
            <section className="mb-12 p-6 bg-primary/10 rounded-lg border border-primary/20">
              <h2 className="text-2xl font-bold mb-4 text-primary">Success Tips</h2>
              <p className="text-foreground leading-relaxed">
                {provinceData.successTip}
              </p>
            </section>
          )}

          {/* Major Cities */}
          {provinceData.statistics?.majorCities && provinceData.statistics.majorCities.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Major Cities</h2>
              <div className="flex flex-wrap gap-2">
                {provinceData.statistics.majorCities.map((city, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Call to Action */}
          <section className="text-center p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Find {provinceData.name} Tenders?
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Search our database of active government tenders in {provinceData.name}.
              Set up alerts and never miss an opportunity.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/search"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Search Tenders
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
            This page is automatically updated every 24 hours with the latest tender information.
            Last updated: {new Date().toLocaleDateString('en-ZA')}
          </p>
        </div>
      </footer>
    </div>
    </>
  );
}
