import Link from "next/link";
import { getAllProvinceSlugs, getProvinceBySlug } from "@/data/provinces";

export const revalidate = 86400;

export default function ProvincesIndex() {
  const slugs = getAllProvinceSlugs();
  const provinces = slugs.map((slug) => ({ slug, name: getProvinceBySlug(slug)?.name || slug }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Provinces</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Browse tenders by province across South Africa.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {provinces.map((p) => (
            <Link key={p.slug} href={`/province/${p.slug}`} className="p-6 bg-card rounded-lg border hover:border-primary transition-colors font-semibold text-center">
              {p.name}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

