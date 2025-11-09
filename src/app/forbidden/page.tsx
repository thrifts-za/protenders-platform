import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, LogOut, ShieldX } from "lucide-react";

export const metadata = {
  title: "Forbidden | Protenders",
  description: "You don't have permission to access this page",
};

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full p-12 text-center">
        <div className="mb-8">
          <ShieldX className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <h1 className="text-6xl font-bold mb-2">403</h1>
          <h2 className="text-3xl font-semibold mb-4">Access Forbidden</h2>
          <p className="text-xl text-muted-foreground mb-2">
            You don't have permission to access this page.
          </p>
          <p className="text-muted-foreground">
            This area is restricted to authorized administrators only.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg">
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>
          <Link href="/admin/login">
            <Button variant="outline" size="lg">
              <LogOut className="h-4 w-4 mr-2" />
              Sign In as Admin
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">Continue browsing:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/search">
              <Button variant="ghost" size="sm">Search Tenders</Button>
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

        <div className="mt-8">
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </Card>
    </div>
  );
}
