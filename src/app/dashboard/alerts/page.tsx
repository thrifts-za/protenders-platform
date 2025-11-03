"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useAlerts } from "@/hooks/useAlerts";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Plus, Trash2, Bell } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function DashboardAlerts() {
  const { rules, saveRule, deleteRule, toggleRule, isLocal } = useAlerts();
  const { isGuest } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    keywords: "",
    categories: "",
    closingInDays: "",
    emailEnabled: false,
    frequency: "daily" as "daily" | "weekly",
  });

  const handleSaveRule = async () => {
    if (!newRule.name) {
      toast.error("Name required");
      return;
    }

    await saveRule({
      name: newRule.name,
      searchParams: {
        keywords: newRule.keywords || undefined,
        categories: newRule.categories ? newRule.categories.split(",").map((s) => s.trim()) : undefined,
        closingInDays: newRule.closingInDays ? parseInt(newRule.closingInDays) : undefined,
      },
      active: true,
      emailEnabled: newRule.emailEnabled,
      frequency: newRule.frequency,
    });

    toast.success("Alert rule created");
    setIsDialogOpen(false);
    setNewRule({
      name: "",
      keywords: "",
      categories: "",
      closingInDays: "",
      emailEnabled: false,
      frequency: "daily",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Alert Center</h1>
              <p className="text-muted-foreground mt-2">
                Set up custom alerts for tender opportunities
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {isGuest && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Email delivery requires an account. Rules are saved on this device only.{" "}
              <Link href="/login" className="underline font-medium">
                Sign in
              </Link>{" "}
              to enable email alerts.
            </AlertDescription>
          </Alert>
        )}

        {isLocal && !isGuest && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Alert API unavailable. Rules are stored locally.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Alert Rules</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Alert Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Rule Name</Label>
                  <Input
                    placeholder="e.g., Catering in Gauteng"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Keywords</Label>
                  <Input
                    placeholder="e.g., catering, food service"
                    value={newRule.keywords}
                    onChange={(e) => setNewRule({ ...newRule, keywords: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Categories (comma-separated)</Label>
                  <Input
                    placeholder="e.g., goods, services"
                    value={newRule.categories}
                    onChange={(e) => setNewRule({ ...newRule, categories: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Closing Within (days)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 7"
                    value={newRule.closingInDays}
                    onChange={(e) => setNewRule({ ...newRule, closingInDays: e.target.value })}
                  />
                </div>

                {!isGuest && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label>Email Notifications</Label>
                      <Switch
                        checked={newRule.emailEnabled}
                        onCheckedChange={(checked) =>
                          setNewRule({ ...newRule, emailEnabled: checked })
                        }
                      />
                    </div>

                    {newRule.emailEnabled && (
                      <div>
                        <Label>Frequency</Label>
                        <Select
                          value={newRule.frequency}
                          onValueChange={(v) =>
                            setNewRule({ ...newRule, frequency: v as "daily" | "weekly" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily Digest</SelectItem>
                            <SelectItem value="weekly">Weekly Digest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}

                <Button onClick={handleSaveRule} className="w-full">
                  Create Rule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {rules.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No alert rules yet</h3>
                <p className="text-muted-foreground">
                  Create your first rule to get notified about matching tenders
                </p>
              </CardContent>
            </Card>
          ) : (
            rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {rule.searchParams.keywords && (
                          <Badge variant="outline">Keywords: {rule.searchParams.keywords}</Badge>
                        )}
                        {rule.searchParams.categories?.map((cat) => (
                          <Badge key={cat} variant="outline">
                            {cat}
                          </Badge>
                        ))}
                        {rule.searchParams.closingInDays && (
                          <Badge variant="outline">
                            Closing in {rule.searchParams.closingInDays} days
                          </Badge>
                        )}
                        {rule.emailEnabled && (
                          <Badge variant="secondary">
                            Email: {rule.frequency}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={rule.active}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
