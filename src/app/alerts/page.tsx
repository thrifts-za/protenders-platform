"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAlerts, toggleAlert, deleteAlert } from "@/services/alertService";
import { SavedAlert } from "@/types/tender";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Trash2, Mail, Clock, Search } from "lucide-react";
import { formatDate } from "@/lib/date";
import { toast } from "sonner";

export default function Alerts() {
  const [alerts, setAlerts] = useState<SavedAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await getAlerts();
        setAlerts(data);
      } catch (error) {
        console.error("Failed to load alerts:", error);
        toast.error("Failed to load alerts");
      } finally {
        setIsLoading(false);
      }
    };
    loadAlerts();
  }, []);

  const handleToggle = async (id: string) => {
    const updated = await toggleAlert(id);
    if (updated) {
      const data = await getAlerts();
      setAlerts(data);
      toast.success(updated.active ? "Alert activated" : "Alert paused");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this alert?")) {
      const success = await deleteAlert(id);
      if (success) {
        const data = await getAlerts();
        setAlerts(data);
        toast.success("Alert deleted");
      }
    }
  };

  const getSearchSummary = (alert: SavedAlert) => {
    const parts: string[] = [];
    if (alert.searchParams.keywords) parts.push(`"${alert.searchParams.keywords}"`);
    if (alert.searchParams.categories?.length)
      parts.push(alert.searchParams.categories.map((c) => c).join(", "));
    if (alert.searchParams.buyer) parts.push(`Buyer: ${alert.searchParams.buyer}`);
    if (alert.searchParams.closingInDays)
      parts.push(`Closing in ${alert.searchParams.closingInDays} days`);
    return parts.length > 0 ? parts.join(" • ") : "All tenders";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Saved Alerts</h1>
          <p className="text-muted-foreground mt-1">Manage your tender search notifications</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Loading alerts...</p>
          </Card>
        ) : alerts.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold">No saved alerts yet</h2>
              <p className="text-muted-foreground">
                Create a search alert to get notified when new tenders match your criteria.
              </p>
              <Link href="/">
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Start Searching
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4 max-w-4xl">
            {alerts.map((alert) => (
              <Card key={alert.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        {alert.name || "Unnamed Alert"}
                      </h3>
                      <Badge variant={alert.active ? "default" : "secondary"}>
                        {alert.active ? "Active" : "Paused"}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {alert.frequency}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{alert.email}</span>
                    </div>

                    <p className="text-sm text-muted-foreground">{getSearchSummary(alert)}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Created {formatDate(alert.createdAt)}</span>
                      </div>
                      {alert.nextRun && (
                        <span>Next run: {formatDate(alert.nextRun)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={alert.active}
                      onCheckedChange={() => handleToggle(alert.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(alert.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
