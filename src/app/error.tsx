'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Search, AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console or error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full p-12 text-center">
        <div className="mb-8">
          <AlertCircle className="h-24 w-24 text-destructive mx-auto mb-4" />
          <h1 className="text-6xl font-bold mb-2">Error</h1>
          <h2 className="text-3xl font-semibold mb-4">Something Went Wrong</h2>
          <p className="text-xl text-muted-foreground mb-2">
            We encountered an unexpected error while processing your request.
          </p>
          <p className="text-muted-foreground">
            Our team has been notified and we're working to fix the issue.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-4 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg">
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">Continue browsing:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/search">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search Tenders
              </Button>
            </Link>
            <Link href="/latest">
              <Button variant="ghost" size="sm">Latest Tenders</Button>
            </Link>
            <Link href="/closing-soon">
              <Button variant="ghost" size="sm">Closing Soon</Button>
            </Link>
            <Link href="/opportunities">
              <Button variant="ghost" size="sm">Opportunities</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
