'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, AlertCircle, PieChart, Wallet } from "lucide-react";
import { PremiumContent } from '@/components/PremiumContent';
import { WaitingListModal } from '@/components/WaitingListModal';

interface FinancialIntelligenceProps {
  tenderValue?: number;
  tenderTitle?: string;
}

export default function FinancialIntelligence({ tenderValue, tenderTitle }: FinancialIntelligenceProps) {
  const [showWaitingList, setShowWaitingList] = useState(false);

  // Mock financial data based on tender value
  const estimatedValue = tenderValue || 2500000;
  const budgetBreakdown = [
    { category: "Direct Costs", amount: estimatedValue * 0.65, percentage: 65 },
    { category: "Indirect Costs", amount: estimatedValue * 0.20, percentage: 20 },
    { category: "Contingency", amount: estimatedValue * 0.10, percentage: 10 },
    { category: "Profit Margin", amount: estimatedValue * 0.05, percentage: 5 },
  ];

  const paymentTerms = [
    { milestone: "Contract Award", payment: "10%", timeline: "Within 7 days" },
    { milestone: "Phase 1 Completion", payment: "30%", timeline: "Month 2" },
    { milestone: "Phase 2 Completion", payment: "30%", timeline: "Month 4" },
    { milestone: "Final Delivery", payment: "30%", timeline: "Month 6" },
  ];

  const financialRisks = [
    { risk: "Currency Fluctuation", level: "Medium", impact: "5-8% cost variance" },
    { risk: "Material Cost Inflation", level: "High", impact: "10-15% increase likely" },
    { risk: "Payment Delays", level: "Low", impact: "30-45 days typical" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <PremiumContent onUpgradeClick={() => setShowWaitingList(true)} blurIntensity="md">
        <div className="space-y-6">
          {/* Demo Badge */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Financial Intelligence</h3>
            <Badge variant="secondary" className="text-xs">
              <PieChart className="h-3 w-3 mr-1" />
              Demo Data
            </Badge>
          </div>

          {/* Budget Overview */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Analysis
          </CardTitle>
          <CardDescription>Estimated financial breakdown for this tender</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Estimated Value</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(estimatedValue)}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Recommended Bid Range</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-400">
                {formatCurrency(estimatedValue * 0.92)} - {formatCurrency(estimatedValue * 0.98)}
              </p>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Cost Breakdown</h4>
            {budgetBreakdown.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.category}</span>
                  <span className="font-semibold">{formatCurrency(item.amount)} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Expected Payment Schedule
          </CardTitle>
          <CardDescription>Typical payment milestones for government contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentTerms.map((term, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{term.payment}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{term.milestone}</p>
                    <p className="text-xs text-muted-foreground">{term.timeline}</p>
                  </div>
                </div>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Risks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Financial Risk Assessment
          </CardTitle>
          <CardDescription>Key financial considerations for this bid</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {financialRisks.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <div className="mt-0.5">
                  {item.level === 'High' && (
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                  {item.level === 'Medium' && (
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  )}
                  {item.level === 'Low' && (
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{item.risk}</p>
                    <Badge
                      variant={item.level === 'High' ? 'destructive' : item.level === 'Medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.level} Risk
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cash Flow Projection
          </CardTitle>
          <CardDescription>Estimated 6-month financial timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { month: 'Month 1', inflow: estimatedValue * 0.10, outflow: estimatedValue * 0.15, net: estimatedValue * -0.05 },
              { month: 'Month 2', inflow: estimatedValue * 0.30, outflow: estimatedValue * 0.25, net: estimatedValue * 0.05 },
              { month: 'Month 3', inflow: 0, outflow: estimatedValue * 0.20, net: estimatedValue * -0.20 },
              { month: 'Month 4', inflow: estimatedValue * 0.30, outflow: estimatedValue * 0.25, net: estimatedValue * 0.05 },
              { month: 'Month 5', inflow: 0, outflow: estimatedValue * 0.10, net: estimatedValue * -0.10 },
              { month: 'Month 6', inflow: estimatedValue * 0.30, outflow: estimatedValue * 0.05, net: estimatedValue * 0.25 },
            ].map((item, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 text-sm p-2 hover:bg-accent/50 rounded">
                <span className="font-medium">{item.month}</span>
                <span className="text-green-600 dark:text-green-400">+{formatCurrency(item.inflow)}</span>
                <span className="text-red-600 dark:text-red-400">-{formatCurrency(item.outflow)}</span>
                <span className={`font-semibold ${item.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {item.net >= 0 ? '+' : ''}{formatCurrency(item.net)}
                </span>
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
        source="financial-intelligence"
      />
    </>
  );
}
