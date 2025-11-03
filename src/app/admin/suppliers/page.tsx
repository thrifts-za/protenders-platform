"use client";

export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Supplier Management</h1>
        <p className="text-muted-foreground">
          Manage supplier profiles and award statistics
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Supplier Directory
          </CardTitle>
          <CardDescription>
            View and edit supplier information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Supplier management coming soon</p>
            <p className="text-sm mt-2">This page will show supplier statistics and award histories</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
