"use client";

export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function MailPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mail Management</h1>
        <p className="text-muted-foreground">
          Email templates, logs, and testing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email System
          </CardTitle>
          <CardDescription>
            Manage email templates and view mail logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Mail management coming soon</p>
            <p className="text-sm mt-2">This page will allow you to manage email templates and view mail logs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
