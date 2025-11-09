'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, FileEdit, AlertCircle, CheckCircle, Clock, Activity } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { PremiumContent } from '@/components/PremiumContent';
import { WaitingListModal } from '@/components/WaitingListModal';

dayjs.extend(relativeTime);

interface RealTimeUpdatesProps {
  tenderNumber?: string;
}

export default function RealTimeUpdates({ tenderNumber }: RealTimeUpdatesProps) {
  const [showWaitingList, setShowWaitingList] = useState(false);

  const updates = [
    {
      id: 1,
      type: "amendment",
      title: "Closing Date Extended",
      description: "Tender closing date has been extended by 7 days to allow for additional site visits.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      severity: "high",
      icon: AlertCircle,
    },
    {
      id: 2,
      type: "document",
      title: "New Document Added",
      description: "Addendum 2: Updated technical specifications document uploaded.",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      severity: "medium",
      icon: FileEdit,
    },
    {
      id: 3,
      type: "qa",
      title: "Question Answered",
      description: "Clarification provided on local content requirements - minimum 60% required.",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      severity: "medium",
      icon: MessageSquare,
    },
    {
      id: 4,
      type: "briefing",
      title: "Briefing Session Scheduled",
      description: "Compulsory briefing session scheduled for 18 Nov 2024 at 10:00 AM.",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      severity: "high",
      icon: Bell,
    },
    {
      id: 5,
      type: "correction",
      title: "Specification Correction",
      description: "Section 3.2.1 updated - Corrected minimum experience requirement to 5 years.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      severity: "high",
      icon: AlertCircle,
    },
    {
      id: 6,
      type: "info",
      title: "Site Visit Confirmation",
      description: "Site visit successfully completed. Attendance register signed by 12 companies.",
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      severity: "low",
      icon: CheckCircle,
    },
    {
      id: 7,
      type: "qa",
      title: "Questions Deadline Reminder",
      description: "Reminder: Questions must be submitted by 22 Nov 2024, 16:00.",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      severity: "medium",
      icon: Clock,
    },
  ];

  const subscriptions = [
    { channel: "Amendments & Addenda", enabled: true, count: 2 },
    { channel: "Q&A Updates", enabled: true, count: 5 },
    { channel: "Document Changes", enabled: true, count: 3 },
    { channel: "Deadline Reminders", enabled: false, count: 0 },
  ];

  const activityStats = [
    { label: "Total Updates", value: "24", change: "+3 today" },
    { label: "Active Watchers", value: "18", change: "companies" },
    { label: "Questions Asked", value: "12", change: "7 answered" },
    { label: "Documents Updated", value: "6", change: "2 this week" },
  ];

  return (
    <>
      <PremiumContent onUpgradeClick={() => setShowWaitingList(true)} blurIntensity="md">
        <div className="space-y-6">
          {/* Demo Badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Real-Time Updates</h3>
        <Badge variant="secondary" className="text-xs">
          <Activity className="h-3 w-3 mr-1" />
          Demo Data
        </Badge>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {activityStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Manage your alert subscriptions for this tender</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subscriptions.map((sub, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${sub.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-semibold text-sm">{sub.channel}</p>
                    <p className="text-xs text-muted-foreground">{sub.count} notifications</p>
                  </div>
                </div>
                <Badge variant={sub.enabled ? 'default' : 'secondary'}>
                  {sub.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Update Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Update Timeline
          </CardTitle>
          <CardDescription>Chronological history of tender changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {updates.map((update, index) => {
              const Icon = update.icon;
              return (
                <div key={update.id} className="relative">
                  {/* Timeline connector */}
                  {index !== updates.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
                  )}

                  <div className="flex gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      update.severity === 'high' ? 'bg-red-100 dark:bg-red-950' :
                      update.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-950' :
                      'bg-green-100 dark:bg-green-950'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        update.severity === 'high' ? 'text-red-600 dark:text-red-400' :
                        update.severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-green-600 dark:text-green-400'
                      }`} />
                    </div>

                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-semibold text-sm">{update.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {dayjs(update.timestamp).fromNow()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            update.type === 'amendment' ? 'destructive' :
                            update.type === 'qa' ? 'default' :
                            update.type === 'document' ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {update.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{update.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Q&A Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Q&A
          </CardTitle>
          <CardDescription>Questions and answers from other bidders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                question: "What is the minimum BBBEE level required?",
                answer: "Minimum Level 4 BBBEE required. Level 1-3 will receive preference points.",
                askedBy: "Company A",
                answeredAt: "2 days ago",
              },
              {
                question: "Is the site visit compulsory?",
                answer: "Yes, attendance at the site visit is mandatory. Non-attendance will result in disqualification.",
                askedBy: "Company B",
                answeredAt: "3 days ago",
              },
              {
                question: "Can joint ventures submit bids?",
                answer: "Yes, JVs are permitted. A joint venture agreement must be submitted with the bid.",
                askedBy: "Company C",
                answeredAt: "4 days ago",
              },
            ].map((qa, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{qa.question}</p>
                    <p className="text-xs text-muted-foreground">Asked by {qa.askedBy}</p>
                  </div>
                </div>
                <div className="pl-6 pt-2 border-l-2 border-primary/20">
                  <p className="text-sm text-muted-foreground">{qa.answer}</p>
                  <p className="text-xs text-muted-foreground mt-1">Answered {qa.answeredAt}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        </div>
      </PremiumContent>

      <WaitingListModal
        isOpen={showWaitingList}
        onClose={() => setShowWaitingList(false)}
        source="real-time-updates"
      />
    </>
  );
}
