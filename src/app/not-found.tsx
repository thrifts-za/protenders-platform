import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Search, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full p-12 text-center">
        <div className="mb-8">
          <FileQuestion className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-6xl font-bold mb-2">404</h1>
          <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-xl text-muted-foreground mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-muted-foreground">
            The tender or page you're trying to access may have been moved, deleted, or never existed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg">
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" size="lg">
              <Search className="h-4 w-4 mr-2" />
              Search Tenders
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/latest">
              <Button variant="ghost" size="sm">Latest Tenders</Button>
            </Link>
            <Link href="/closing-soon">
              <Button variant="ghost" size="sm">Closing Soon</Button>
            </Link>
            <Link href="/opportunities">
              <Button variant="ghost" size="sm">Opportunities</Button>
            </Link>
            <Link href="/provinces">
              <Button variant="ghost" size="sm">Browse by Province</Button>
            </Link>
            <Link href="/categories">
              <Button variant="ghost" size="sm">Browse by Category</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
