"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackForm } from "@/components/FeedbackForm";
import { ArrowLeft } from "lucide-react";

export default function Feedback() {
  const router = useRouter();

  const handleSuccess = () => {
    // Navigate back after 2 seconds
    setTimeout(() => router.back(), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="container max-w-2xl mx-auto px-4 py-6 md:py-12">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">Share Your Feedback</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Help us improve ProTenders by sharing your thoughts, suggestions, or reporting issues.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What would you like to share?</CardTitle>
            <CardDescription>
              Your feedback shapes the future of ProTenders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeedbackForm
              onSuccess={handleSuccess}
              onCancel={() => router.back()}
              showCancel={true}
            />
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-muted">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Your feedback is private and will only be visible to our team. We review all submissions
              and use them to prioritize improvements to ProTenders. Thank you for helping us build a
              better product!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
