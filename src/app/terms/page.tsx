export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">Understand how you can use our service.</p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="prose max-w-3xl">
          <p>We’ll publish our full terms here. For now, reach out to support@protenders.co.za for details.</p>
        </div>
      </main>
    </div>
  );
}

