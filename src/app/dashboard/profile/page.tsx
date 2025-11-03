"use client";

export const dynamic = 'force-dynamic';

import { useAuth } from "@/hooks/useAuth";
import { useSavedTenders } from "@/hooks/useSavedTenders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { User, Database, LogOut, Info } from "lucide-react";
import { signOut } from "next-auth/react";

export default function DashboardProfile() {
  const { user, isGuest } = useAuth();
  const { savedTenders } = useSavedTenders();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Profile & Settings</h1>
              <p className="text-muted-foreground mt-2">
                Manage your account and data sync
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {isGuest ? (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              You're using Tender Finder in guest mode. Create an account to sync your data
              across devices and enable email alerts.
            </AlertDescription>
          </Alert>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono text-sm">{user?.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="default">Active</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Sync Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Saved Tenders (Local)</span>
              <span className="font-medium">{savedTenders.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Storage Location</span>
              <Badge variant="outline">
                {isGuest ? "Device Only" : "Synced to Server"}
              </Badge>
            </div>

            {isGuest && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Your data is currently stored on this device only. Sign in to automatically
                  sync to the cloud and access from any device.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {isGuest ? (
          <Card>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Sign up to unlock these features:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Sync saved tenders across all your devices</li>
                <li>Email alerts for matching opportunities</li>
                <li>Advanced tender intelligence and insights</li>
                <li>Automatic data backup and recovery</li>
              </ul>
              <Button className="w-full" size="lg" asChild>
                <Link href="/register">Create Account</Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Your local data will be automatically migrated when you sign up
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Export All Data
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Questions about your data?{" "}
            <Link href="/privacy" className="underline">
              Read our Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
