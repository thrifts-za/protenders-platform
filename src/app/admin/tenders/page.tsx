"use client";

export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";

export default function TendersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tender Management</h1>
        <p className="text-muted-foreground">
          Browse and manage tender records
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Tender Catalog
          </CardTitle>
          <CardDescription>
            View, edit, and manage tender data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Tender management coming soon</p>
            <p className="text-sm mt-2">This page will allow you to browse and edit tender records</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
