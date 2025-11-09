'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import OpportunityScoreCard from "@/components/OpportunityScoreCard";
import { Tender } from "@/types/tender";
import {
  Target,
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Shield,
  Award,
  Zap,
  FileText,
  DollarSign,
  BarChart3,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { PremiumContent } from '@/components/PremiumContent';
import { WaitingListModal } from '@/components/WaitingListModal';

interface OverviewTabProps {
  tender: Tender | null;
}

export default function OverviewTab({ tender }: OverviewTabProps) {
  const [showWaitingList, setShowWaitingList] = useState(false);

  // Mock data for additional sections
  const keyRequirements = [
    { requirement: "Valid Tax Clearance Certificate", status: "mandatory", icon: FileText },
    { requirement: "BBBEE Level 1-4 Certificate", status: "mandatory", icon: Award },
    { requirement: "Proof of Company Registration", status: "mandatory", icon: Shield },
    { requirement: "Professional Indemnity Insurance", status: "mandatory", icon: Shield },
    { requirement: "Minimum 5 years experience", status: "preferred", icon: CheckCircle },
    { requirement: "ISO 9001 Certification", status: "preferred", icon: Award },
  ];

  const quickStats = [
    { label: "Days to Closing", value: "12", trend: "critical", icon: Clock },
    { label: "Estimated Competition", value: "8-12", trend: "medium", icon: Users },
    { label: "Win Probability", value: "68%", trend: "high", icon: Target },
    { label: "Complexity Score", value: "Medium", trend: "medium", icon: BarChart3 },
  ];

  const preparationChecklist = [
    { task: "Review Technical Specifications", completed: true },
    { task: "Verify Compliance Requirements", completed: true },
    { task: "Prepare Pricing Schedule", completed: false },
    { task: "Gather Company Credentials", completed: false },
    { task: "Schedule Internal Review", completed: false },
  ];

  const tenderInsights = [
    {
      title: "Strong Match for Your Business",
      description: "This tender aligns well with your company profile and past experience. Your BBBEE level provides a competitive advantage.",
      type: "positive",
      icon: CheckCircle,
    },
    {
      title: "Competitive Landscape",
      description: "Expected 8-12 bidders based on similar tenders. Focus on differentiation through quality and local content.",
      type: "info",
      icon: Users,
    },
    {
      title: "Pricing Strategy Required",
      description: "Market rate for similar projects: R2.3M - R2.8M. Recommended bid range to balance competitiveness and profitability.",
      type: "warning",
      icon: DollarSign,
    },
  ];

  const successFactors = [
    { factor: "BBBEE Compliance", importance: 95, yourScore: 90 },
    { factor: "Technical Capability", importance: 85, yourScore: 78 },
    { factor: "Price Competitiveness", importance: 80, yourScore: 72 },
    { factor: "Past Performance", importance: 70, yourScore: 82 },
    { factor: "Local Content", importance: 75, yourScore: 85 },
  ];

  const completedTasks = preparationChecklist.filter(item => item.completed).length;
  const preparationProgress = (completedTasks / preparationChecklist.length) * 100;

  return (
    <>
      <div className="space-y-8">
        {/* AI Opportunity Score Card */}
        <PremiumContent onUpgradeClick={() => setShowWaitingList(true)} blurIntensity="md">
          <OpportunityScoreCard tender={tender!} />
        </PremiumContent>

        {/* Quick Stats */}
        <PremiumContent onUpgradeClick={() => setShowWaitingList(true)} blurIntensity="md">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    stat.trend === 'critical' ? 'bg-red-100 dark:bg-red-950' :
                    stat.trend === 'high' ? 'bg-green-100 dark:bg-green-950' :
                    'bg-yellow-100 dark:bg-yellow-950'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      stat.trend === 'critical' ? 'text-red-600 dark:text-red-400' :
                      stat.trend === 'high' ? 'text-green-600 dark:text-green-400' :
                      'text-yellow-600 dark:text-yellow-400'
                    }`} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
          </div>
        </PremiumContent>

        {/* Key Insights */}
        <PremiumContent onUpgradeClick={() => setShowWaitingList(true)} blurIntensity="md">
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Key Insights
          </CardTitle>
          <CardDescription>AI-powered analysis of this opportunity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tenderInsights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className={`p-4 border rounded-lg ${
                  insight.type === 'positive' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' :
                  insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20' :
                  'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
                }`}
              >
                <div className="flex gap-3">
                  <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    insight.type === 'positive' ? 'text-green-600 dark:text-green-400' :
                    insight.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`} />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
          </Card>
        </PremiumContent>

        {/* Mandatory Requirements */}
        <PremiumContent onUpgradeClick={() => setShowWaitingList(true)} blurIntensity="md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Key Requirements
              </CardTitle>
              <CardDescription>Mandatory and preferred qualifications</CardDescription>
            </CardHeader>
            <CardContent>
          <div className="space-y-3">
            {keyRequirements.map((req, index) => {
              const Icon = req.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium text-sm">{req.requirement}</span>
                  </div>
                  <Badge variant={req.status === 'mandatory' ? 'destructive' : 'secondary'}>
                    {req.status === 'mandatory' ? 'Required' : 'Preferred'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
          </Card>
        </PremiumContent>

        {/* Success Factors */}
        <PremiumContent onUpgradeClick={() => setShowWaitingList(true)} blurIntensity="md">
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Success Factor Analysis
          </CardTitle>
          <CardDescription>Your competitive positioning for this tender</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {successFactors.map((factor, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{factor.factor}</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">
                      Importance: {factor.importance}%
                    </span>
                    <span className={`font-semibold ${
                      factor.yourScore >= 80 ? 'text-green-600 dark:text-green-400' :
                      factor.yourScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      Your Score: {factor.yourScore}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-muted-foreground h-2 rounded-full"
                        style={{ width: `${factor.importance}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          factor.yourScore >= 80 ? 'bg-green-500' :
                          factor.yourScore >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${factor.yourScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
          </Card>
        </PremiumContent>

        {/* Preparation Progress */}
        <PremiumContent onUpgradeClick={() => setShowWaitingList(true)} blurIntensity="md">
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Bid Preparation Progress
          </CardTitle>
          <CardDescription>
            {completedTasks} of {preparationChecklist.length} tasks completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-bold">{preparationProgress.toFixed(0)}%</span>
            </div>
            <Progress value={preparationProgress} className="h-3" />
          </div>

          <div className="space-y-2 mt-4">
            {preparationChecklist.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 border rounded-lg ${
                  item.completed ? 'bg-muted/50 opacity-70' : ''
                }`}
              >
                {item.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                )}
                <span className={`text-sm ${item.completed ? 'line-through' : 'font-medium'}`}>
                  {item.task}
                </span>
              </div>
            ))}
          </div>

          <Button className="w-full mt-4">
            <BookOpen className="h-4 w-4 mr-2" />
            View Full Preparation Guide
          </Button>
        </CardContent>
          </Card>
        </PremiumContent>

        {/* Strategic Recommendations */}
        <PremiumContent onUpgradeClick={() => setShowWaitingList(true)} blurIntensity="md">
          <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Emphasize Your BBBEE Status</h4>
                <p className="text-sm text-muted-foreground">
                  Your Level 2 BBBEE provides significant preference points. Ensure certificates are current and prominently featured.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Competitive Pricing Strategy</h4>
                <p className="text-sm text-muted-foreground">
                  Bid between R2.35M - R2.55M to maximize competitiveness while maintaining profitability.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Highlight Local Partnerships</h4>
                <p className="text-sm text-muted-foreground">
                  Showcase partnerships with local SMMEs and your contribution to local economic development.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
          </Card>
        </PremiumContent>
      </div>

      <WaitingListModal
        isOpen={showWaitingList}
        onClose={() => setShowWaitingList(false)}
        source="overview-tab"
      />
    </>
  );
}
