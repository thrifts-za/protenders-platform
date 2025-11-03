"use client";

export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function BuyersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Buyer Management</h1>
        <p className="text-muted-foreground">
          Manage buyer organizations and statistics
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Buyer Directory
          </CardTitle>
          <CardDescription>
            View and edit buyer information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Buyer management coming soon</p>
            <p className="text-sm mt-2">This page will show buyer metrics and allow editing buyer profiles</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
