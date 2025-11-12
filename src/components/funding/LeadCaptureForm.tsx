/**
 * LeadCaptureForm Component
 * Phase 3: ProTender Fund Finder - Lead Generation
 *
 * Captures email addresses for downloadable resources and marketing
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface LeadCaptureFormProps {
  isOpen: boolean;
  onClose: () => void;
  resourceTitle: string;
  resourceDescription: string;
  resourceFileName: string;
  onSuccess?: () => void;
}

export function LeadCaptureForm({
  isOpen,
  onClose,
  resourceTitle,
  resourceDescription,
  resourceFileName,
  onSuccess,
}: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          resourceName: resourceTitle,
          resourceFileName,
          source: "funding_guide_download",
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit. Please try again.");
      }

      setStatus("success");

      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form state
    setFormData({ name: "", email: "", businessType: "" });
    setStatus("idle");
    setErrorMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-emerald-600" />
            Download {resourceTitle}
          </DialogTitle>
          <DialogDescription>{resourceDescription}</DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-700">Success!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Check your email for the download link. We've sent it to{" "}
                <span className="font-medium">{formData.email}</span>
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Business Type Field */}
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type (Optional)</Label>
              <Input
                id="businessType"
                type="text"
                placeholder="e.g., Manufacturing, Retail, Services"
                value={formData.businessType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    businessType: e.target.value,
                  }))
                }
                disabled={isSubmitting}
              />
            </div>

            {/* Error Message */}
            {status === "error" && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            {/* Privacy Notice */}
            <p className="text-xs text-muted-foreground">
              By submitting, you agree to receive funding updates and resources from
              ProTender. We respect your privacy and you can unsubscribe anytime.
            </p>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Free Resource
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
