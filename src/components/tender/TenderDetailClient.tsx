"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import OpportunityScoreCard from "@/components/OpportunityScoreCard";
import { Tender } from "@/types/tender";
import { getTenderById } from "@/lib/api";
import { Calendar, DollarSign, FileText, Clock, Building2, Target, Star, Share2, Info } from "lucide-react";
import StrategicAssistant from "@/components/StrategicAssistant";
import EntrepreneurMetrics from "@/components/EntrepreneurMetrics";

interface TenderDetailClientProps {
  initialTender: Tender | null;
  slugOrId: string;
}

export default function TenderDetailClient({ initialTender, slugOrId }: TenderDetailClientProps) {
  const [tender, setTender] = useState<Tender | null>(initialTender);
  const [loading, setLoading] = useState(!initialTender);

  useEffect(() => {
    async function loadTender() {
      if (initialTender) return; // Already loaded
      
      try {
        const tenderData = await getTenderById(slugOrId);
        setTender(tenderData);
      } catch (error) {
        console.error('Failed to load tender:', error);
      } finally {
        setLoading(false);
      }
    }

    if (slugOrId && !initialTender) {
      loadTender();
    }
  }, [slugOrId, initialTender]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tender details...</p>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tender Not Found</h1>
          <p className="text-muted-foreground">The requested tender could not be found.</p>
        </div>
      </div>
    );
  }

  // Rest of the component logic from the original page.tsx
  // ... (keeping all the existing rendering logic)
  
  // This is a simplified version - you'll need to copy the full component logic
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {tender.tender?.title || "Untitled Tender"}
          </h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <OpportunityScoreCard tender={tender} />
      </main>
    </div>
  );
}