"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Star, Share2, Check, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  metadata: string | null;
  createdAt: string;
}

const ACTION_ICONS: Record<string, any> = {
  SAVE_TENDER: Star,
  UNSAVE_TENDER: Star,
  ADD_TO_CALENDAR: Calendar,
  SHARE_TENDER: Share2,
};

const ACTION_LABELS: Record<string, string> = {
  SAVE_TENDER: "Saved tender",
  UNSAVE_TENDER: "Removed tender",
  ADD_TO_CALENDAR: "Added to calendar",
  SHARE_TENDER: "Shared tender",
};

const ACTION_COLORS: Record<string, string> = {
  SAVE_TENDER: "text-green-600",
  UNSAVE_TENDER: "text-gray-600",
  ADD_TO_CALENDAR: "text-blue-600",
  SHARE_TENDER: "text-purple-600",
};

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const response = await fetch("/api/user/activity?limit=10");
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error("Failed to load activities:", error);
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No recent activity. Start by saving some tenders!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = ACTION_ICONS[activity.action] || Activity;
            const label = ACTION_LABELS[activity.action] || activity.action;
            const color = ACTION_COLORS[activity.action] || "text-gray-600";

            let metadata: any = {};
            try {
              metadata = activity.metadata ? JSON.parse(activity.metadata) : {};
            } catch (e) {
              // Ignore parse errors
            }

            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`mt-0.5 ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{label}</p>
                  {metadata.tenderTitle && (
                    <p className="text-xs text-muted-foreground truncate">
                      {metadata.tenderTitle}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
