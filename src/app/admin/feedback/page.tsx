"use client";

export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Feedback</h1>
        <p className="text-muted-foreground">
          Manage user feedback and feature requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback Management
          </CardTitle>
          <CardDescription>
            View and respond to user feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Feedback management coming soon</p>
            <p className="text-sm mt-2">This page will allow you to view and manage user feedback submissions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
