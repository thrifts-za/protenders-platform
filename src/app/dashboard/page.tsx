"use client";

export const dynamic = 'force-dynamic';

import { useSavedTenders } from "@/hooks/useSavedTenders";
import { useAuth } from "@/hooks/useAuth";
import { SavedTenderList } from "@/components/dashboard/SavedTenderList";
import { PortfolioInsights } from "@/components/dashboard/PortfolioInsights";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { formatDate, getDaysUntilClose } from "@/lib/date";
import { Calendar, FileText, Info, Bell } from "lucide-react";
import { toast } from "sonner";
import { generateICS, downloadICS } from "@/utils/ics";
import { useMemo } from "react";
import { createTenderUrlFromTitle } from "@/lib/utils/slug";

export default function Dashboard() {
  const { savedTenders, removeTender, saveTender } = useSavedTenders();
  const { isGuest, user } = useAuth();

  const stats = useMemo(() => {
    const closingSoon = savedTenders.filter((t) => {
      if (!t.tender.closingDate) return false;
      const days = getDaysUntilClose(t.tender.closingDate);
      return days !== null && days <= 7 && days >= 0;
    });

    const upcomingDeadlines = [...savedTenders]
      .filter((t) => t.tender.closingDate && getDaysUntilClose(t.tender.closingDate)! >= 0)
      .sort((a, b) => {
        if (!a.tender.closingDate || !b.tender.closingDate) return 0;
        return new Date(a.tender.closingDate).getTime() - new Date(b.tender.closingDate).getTime();
      })
      .slice(0, 3);

    const categories = new Set(
      savedTenders.map((t) => t.tender.mainProcurementCategory).filter(Boolean)
    );

    return { closingSoon: closingSoon.length, upcomingDeadlines, categories: Array.from(categories) };
  }, [savedTenders]);

  const handleSetReminder = (tenderId: string) => {
    const saved = savedTenders.find((t) => t.tenderId === tenderId);
    if (!saved || !saved.tender.closingDate) return;

    const reminderDate = new Date(saved.tender.closingDate);
    reminderDate.setHours(reminderDate.getHours() - 48);

    const ics = generateICS(
      `Tender Deadline: ${saved.tender.title}`,
      reminderDate,
      `Closes: ${formatDate(saved.tender.closingDate)}`,
      saved.tender.buyerName
    );

    downloadICS(ics, `reminder-${saved.tenderId}.ics`);

    toast.success("Reminder created", {
      description: "Calendar event downloaded. Import to your calendar app.",
    });
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all saved tenders?")) {
      savedTenders.forEach((t) => removeTender(t.tenderId));
      toast.success("Cleared all saved tenders");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full border-b bg-card">
        <div className="content-container py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {isGuest ? "Welcome to Your Dashboard" : `Welcome back, ${user?.email?.split("@")[0]}`}
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your saved tenders and stay on top of deadlines
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/alerts">
                  <Bell className="h-4 w-4 mr-2" />
                  Alerts
                </Link>
              </Button>
              {isGuest && (
                <Button variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isGuest && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              You're in guest mode. Data is stored on this device only.{" "}
              <Link href="/login" className="underline font-medium">
                Create an account
              </Link>{" "}
              to sync across devices.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Saved Tenders</p>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{savedTenders.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Closing Soon</p>
                <Calendar className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-3xl font-bold">{stats.closingSoon}</p>
              <p className="text-xs text-muted-foreground mt-1">Next 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
              <p className="text-3xl font-bold">{stats.categories.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Next Deadline</p>
              </div>
              {stats.upcomingDeadlines[0] ? (
                <>
                  <p className="text-xl font-bold">
                    {getDaysUntilClose(stats.upcomingDeadlines[0].tender.closingDate!)} days
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {stats.upcomingDeadlines[0].tender.title}
                  </p>
                </>
              ) : (
                <p className="text-xl text-muted-foreground">None</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        {stats.categories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Your Categories</h3>
            <div className="flex flex-wrap gap-2">
              {stats.categories.map((cat) => (
                <Badge key={cat} variant="secondary">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Upcoming Deadlines */}
            {stats.upcomingDeadlines.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Upcoming Deadlines</h3>
                  <div className="space-y-3">
                    {stats.upcomingDeadlines.map((saved) => {
                      const tenderUrl = createTenderUrlFromTitle(saved.tender.title, saved.tenderId);
                      return (
                      <div
                        key={saved.tenderId}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex-1">
                          <Link href={tenderUrl}>
                            <p className="font-medium hover:text-primary cursor-pointer">
                              {saved.tender.title}
                            </p>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(saved.tender.closingDate!)} (
                            {getDaysUntilClose(saved.tender.closingDate!)} days)
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetReminder(saved.tenderId)}
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Add .ics
                        </Button>
                      </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Saved Tenders List */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Saved Tenders</h2>
              {savedTenders.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No saved tenders yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start browsing and save tenders you're interested in
                    </p>
                    <Button asChild>
                      <Link href="/">Browse Tenders</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <SavedTenderList
                  tenders={savedTenders}
                  onRemove={removeTender}
                  onSetReminder={handleSetReminder}
                />
              )}
            </div>

            {/* Portfolio Insights */}
            {savedTenders.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Portfolio Insights</h2>
                <PortfolioInsights tenders={savedTenders} />
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <QuickActions tenders={savedTenders} onClearAll={handleClearAll} />
            <Recommendations savedTenders={savedTenders} onSave={saveTender} />
          </div>
        </div>
      </div>
    </div>
  );
}
