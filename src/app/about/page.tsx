export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About ProTenders</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            ProTenders is a tender intelligence platform helping South African businesses discover and win government opportunities.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12">
        <div className="prose max-w-3xl">
          <p>
            We aggregate tenders across national, provincial and municipal departments and provide tools like alerts and insights to streamline bidding.
          </p>
        </div>
      </main>
    </div>
  );
}

