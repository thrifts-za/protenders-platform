"use client";

export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track admin actions and system changes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Trail
          </CardTitle>
          <CardDescription>
            View audit logs and system activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Audit logs coming soon</p>
            <p className="text-sm mt-2">This page will show all admin actions and system changes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
