'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, Clock, AlertTriangle, FileText, Users, Calendar, Download, Upload } from "lucide-react";
import { PremiumContent } from '@/components/PremiumContent';
import { WaitingListModal } from '@/components/WaitingListModal';

interface ActionCenterProps {
  closingDate?: string;
}

export default function ActionCenter({ closingDate }: ActionCenterProps) {
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
  const [showWaitingList, setShowWaitingList] = useState(false);

  const handleTaskToggle = (taskId: string) => {
    setCheckedTasks(prev => {
      const updated = new Set(prev);
      if (updated.has(taskId)) {
        updated.delete(taskId);
      } else {
        updated.add(taskId);
      }
      return updated;
    });
  };

  const tasks = [
    {
      id: "task-1",
      category: "Document Prep",
      title: "Review Tender Specifications",
      dueDate: "5 days before closing",
      priority: "High",
      icon: FileText,
    },
    {
      id: "task-2",
      category: "Document Prep",
      title: "Prepare Company Profile & BBBEE Certificate",
      dueDate: "4 days before closing",
      priority: "High",
      icon: Upload,
    },
    {
      id: "task-3",
      category: "Financial",
      title: "Complete Pricing Schedule",
      dueDate: "3 days before closing",
      priority: "High",
      icon: FileText,
    },
    {
      id: "task-4",
      category: "Financial",
      title: "Obtain Tax Clearance Certificate",
      dueDate: "4 days before closing",
      priority: "High",
      icon: Download,
    },
    {
      id: "task-5",
      category: "Team",
      title: "Assign Bid Team Roles",
      dueDate: "6 days before closing",
      priority: "Medium",
      icon: Users,
    },
    {
      id: "task-6",
      category: "Team",
      title: "Schedule Internal Review Meeting",
      dueDate: "2 days before closing",
      priority: "Medium",
      icon: Calendar,
    },
    {
      id: "task-7",
      category: "Compliance",
      title: "Verify All Mandatory Requirements",
      dueDate: "2 days before closing",
      priority: "High",
      icon: CheckSquare,
    },
    {
      id: "task-8",
      category: "Compliance",
      title: "Complete Declaration Forms",
      dueDate: "2 days before closing",
      priority: "Medium",
      icon: FileText,
    },
    {
      id: "task-9",
      category: "Submission",
      title: "Prepare Final Submission Package",
      dueDate: "1 day before closing",
      priority: "High",
      icon: Upload,
    },
    {
      id: "task-10",
      category: "Submission",
      title: "Submit Tender Before Deadline",
      dueDate: "On closing date",
      priority: "Critical",
      icon: AlertTriangle,
    },
  ];

  const upcomingDeadlines = [
    { milestone: "Tender Briefing Session", date: "15 Nov 2024, 10:00", status: "upcoming" },
    { milestone: "Site Visit", date: "18 Nov 2024, 14:00", status: "upcoming" },
    { milestone: "Questions Deadline", date: "22 Nov 2024, 16:00", status: "approaching" },
    { milestone: "Tender Closing", date: closingDate || "30 Nov 2024, 11:00", status: "critical" },
  ];

  const teamMembers = [
    { name: "Sarah Johnson", role: "Bid Manager", status: "Active", avatar: "SJ" },
    { name: "Michael Chen", role: "Technical Lead", status: "Active", avatar: "MC" },
    { name: "Priya Naidoo", role: "Financial Analyst", status: "Active", avatar: "PN" },
    { name: "Thabo Mokoena", role: "Compliance Officer", status: "Pending", avatar: "TM" },
  ];

  const completedCount = checkedTasks.size;
  const totalTasks = tasks.length;
  const progress = (completedCount / totalTasks) * 100;

  return (
    <>
      <PremiumContent onUpgradeClick={() => setShowWaitingList(true)} blurIntensity="md">
        <div className="space-y-6">
          {/* Demo Badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Action Center</h3>
        <Badge variant="secondary" className="text-xs">
          <CheckSquare className="h-3 w-3 mr-1" />
          Demo Data
        </Badge>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Bid Preparation Progress
          </CardTitle>
          <CardDescription>Track your tender preparation tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {completedCount} of {totalTasks} tasks completed
              </span>
              <span className="text-sm font-bold text-primary">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Task Checklist
          </CardTitle>
          <CardDescription>Complete all tasks before submission</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tasks.map((task) => {
              const Icon = task.icon;
              const isChecked = checkedTasks.has(task.id);
              return (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg transition-all ${
                    isChecked ? 'bg-muted/50 opacity-60' : 'hover:bg-accent/50'
                  }`}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => handleTaskToggle(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <h4 className={`font-semibold text-sm ${isChecked ? 'line-through' : ''}`}>
                          {task.title}
                        </h4>
                      </div>
                      <Badge
                        variant={
                          task.priority === 'Critical' ? 'destructive' :
                          task.priority === 'High' ? 'default' :
                          task.priority === 'Medium' ? 'secondary' : 'outline'
                        }
                        className="text-xs whitespace-nowrap"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.dueDate}
                      </span>
                      <span className="px-2 py-0.5 bg-muted rounded">
                        {task.category}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Key Deadlines
          </CardTitle>
          <CardDescription>Important dates and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upcomingDeadlines.map((deadline, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  deadline.status === 'critical' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' :
                  deadline.status === 'approaching' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20' :
                  'hover:bg-accent/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {deadline.status === 'critical' ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : deadline.status === 'approaching' ? (
                    <Clock className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <Calendar className="h-5 w-5 text-primary" />
                  )}
                  <div>
                    <p className="font-semibold text-sm">{deadline.milestone}</p>
                    <p className="text-xs text-muted-foreground">{deadline.date}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    deadline.status === 'critical' ? 'destructive' :
                    deadline.status === 'approaching' ? 'default' : 'secondary'
                  }
                >
                  {deadline.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Collaboration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bid Team
          </CardTitle>
          <CardDescription>Assigned team members for this tender</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{member.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
                  {member.status}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            <Users className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </CardContent>
      </Card>
        </div>
      </PremiumContent>

      <WaitingListModal
        isOpen={showWaitingList}
        onClose={() => setShowWaitingList(false)}
        source="action-center"
      />
    </>
  );
}
