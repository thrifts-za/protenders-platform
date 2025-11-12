/**
 * DownloadCTA Component
 * Phase 3: ProTender Fund Finder - Downloadable Resources
 *
 * Call-to-action component for downloadable resources within guide articles
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, ArrowRight } from "lucide-react";
import { LeadCaptureForm } from "./LeadCaptureForm";

interface DownloadCTAProps {
  resourceTitle: string;
  resourceDescription: string;
  resourceFileName: string;
  resourceFileSize: string;
  variant?: "inline" | "prominent";
}

export function DownloadCTA({
  resourceTitle,
  resourceDescription,
  resourceFileName,
  resourceFileSize,
  variant = "prominent",
}: DownloadCTAProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownloadClick = () => {
    // Open lead capture modal
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    // Track conversion
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "download_interest", {
        resource_name: resourceTitle,
        resource_file: resourceFileName,
      });
    }
  };

  if (variant === "inline") {
    return (
      <div className="flex items-start gap-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg my-6">
        <div className="flex-shrink-0 mt-1">
          <FileText className="h-6 w-6 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-emerald-900 mb-1">{resourceTitle}</h4>
          <p className="text-sm text-emerald-700 mb-3">{resourceDescription}</p>
          <Button
            onClick={handleDownloadClick}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Coming Soon ({resourceFileSize})
          </Button>
        </div>

        <LeadCaptureForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          resourceTitle={resourceTitle}
          resourceDescription={resourceDescription}
          resourceFileName={resourceFileName}
          onSuccess={handleSuccess}
        />
      </div>
    );
  }

  // Prominent variant (default)
  return (
    <Card className="p-8 my-8 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-200">
      <div className="text-center space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 bg-emerald-100 rounded-full">
            <Download className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900">{resourceTitle}</h3>

        {/* Description */}
        <p className="text-gray-700 max-w-2xl mx-auto">{resourceDescription}</p>

        {/* File Info */}
        <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>PDF Format</span>
          </div>
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>{resourceFileSize}</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <Button
            onClick={handleDownloadClick}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Coming Soon - Get Notified
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Social Proof */}
        <p className="text-xs text-gray-500 italic">
          Sign up to be notified when this toolkit becomes available
        </p>
      </div>

      <LeadCaptureForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        resourceTitle={resourceTitle}
        resourceDescription={resourceDescription}
        resourceFileName={resourceFileName}
        onSuccess={handleSuccess}
      />
    </Card>
  );
}
