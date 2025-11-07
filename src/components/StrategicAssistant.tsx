'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  Lightbulb,
  Shield,
  Zap
} from "lucide-react";

interface StrategicAssistantProps {
  tender: any;
  intel?: any;
}

interface StrategyRecommendation {
  type: "pricing" | "differentiation" | "focus" | "risk" | "timeline";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionable: boolean;
  icon: React.ReactNode;
}

export default function StrategicAssistant({ tender, intel }: StrategicAssistantProps) {
  // Mock strategic analysis based on tender data
  // In production, this would use AI analysis of all intelligence data
  const strategicAnalysis = {
    winProbability: intel?.opportunityScore?.score || 68,
    recommendedPriceBand: {
      min: tender.value ? tender.value * 0.85 : 2400000,
      max: tender.value ? tender.value * 1.05 : 2850000,
      currency: "ZAR"
    },
    keyDifferentiators: [
      "BBBEE Level 2 compliance advantage",
      "Proven infrastructure delivery track record",
      "Local content and job creation commitment",
      "Advanced project management methodology"
    ],
    proposalFocusAreas: [
      {
        area: "Technical Approach",
        weight: 20,
        status: "critical",
        tips: ["Emphasize compliance with requirements", "Highlight similar project experience"]
      },
      {
        area: "Price Competitiveness",
        weight: 80,
        status: "high",
        tips: ["Stay within recommended price band", "Ensure competitive but sustainable pricing"]
      },
      {
        area: "BBBEE & Transformation",
        weight: 10,
        status: "medium",
        tips: ["Maximize transformation points", "Demonstrate community development commitment"]
      }
    ],
    riskAlerts: [
      {
        risk: "high",
        title: "Tight Competition",
        description: "Multiple active competitors in similar tenders",
        mitigation: "Focus on unique value propositions and strong references"
      },
      {
        risk: "medium",
        title: "Technical Complexity",
        description: "Project requires specialized expertise",
        mitigation: "Partner with proven subcontractors if needed"
      },
      {
        risk: "low",
        title: "Payment Terms",
        description: "Favorable payment history",
        mitigation: "Monitor payment milestones closely"
      }
    ],
    actionItems: [
      {
        task: "Complete technical proposal",
        deadline: tender.closingDate,
        priority: "high",
        completed: false
      },
      {
        task: "Prepare BBBEE compliance documentation",
        deadline: tender.closingDate,
        priority: "high",
        completed: false
      },
      {
        task: "Finalize pricing strategy",
        deadline: tender.closingDate,
        priority: "medium",
        completed: false
      },
      {
        task: "Arrange site visit attendance",
        deadline: tender.closingDate,
        priority: "high",
        completed: false
      }
    ]
  };

  const formatCurrency = (amount: number, currency: string = "ZAR") => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical": return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case "high": return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case "medium": return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low": return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'TBA';
    const d = new Date(date);
    return d.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Card className="h-fit">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-purple-600" />
          Strategic Assistant
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">Win Probability:</div>
          <Badge className={`${strategicAnalysis.winProbability >= 70 ? 'bg-green-100 text-green-800' : strategicAnalysis.winProbability >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
            {strategicAnalysis.winProbability}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Price Strategy Recommendation */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <h3 className="font-semibold text-sm">Recommended Price Band</h3>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-center mb-2">
              <div className="text-lg font-bold text-green-700">
                {formatCurrency(strategicAnalysis.recommendedPriceBand.min)} - {formatCurrency(strategicAnalysis.recommendedPriceBand.max)}
              </div>
              <div className="text-xs text-green-600">Optimal pricing range</div>
            </div>
            <div className="text-xs text-green-700 space-y-1">
              <p>• Competitive yet profitable positioning</p>
              <p>• Accounts for 80% price weighting in evaluation</p>
              <p>• Considers competitor pricing patterns</p>
            </div>
          </div>
        </div>

        {/* Key Differentiators */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold text-sm">Key Differentiators</h3>
          </div>
          <div className="space-y-2">
            {strategicAnalysis.keyDifferentiators.map((differentiator, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-800">{differentiator}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Proposal Focus Areas */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <h3 className="font-semibold text-sm">Proposal Focus Areas</h3>
          </div>
          <div className="space-y-3">
            {strategicAnalysis.proposalFocusAreas.map((area, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{area.area}</span>
                    {getStatusBadge(area.status)}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {area.weight}% weight
                  </Badge>
                </div>
                <div className="space-y-1">
                  {area.tips.map((tip, tipIndex) => (
                    <div key={tipIndex} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-xs text-gray-600">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <h3 className="font-semibold text-sm">Risk Alerts</h3>
          </div>
          <div className="space-y-2">
            {strategicAnalysis.riskAlerts.map((alert, index) => (
              <Alert key={index} className={`border-l-4 ${getRiskColor(alert.risk)}`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  <div className="font-medium text-sm mb-1">{alert.title}</div>
                  <div className="text-xs mb-2">{alert.description}</div>
                  <div className="text-xs font-medium text-gray-700">
                    💡 {alert.mitigation}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>

        {/* Action Items */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-600" />
            <h3 className="font-semibold text-sm">Priority Actions</h3>
          </div>
          <div className="space-y-2">
            {strategicAnalysis.actionItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    className="rounded border-gray-300"
                    readOnly
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.task}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Due: {formatDate(item.deadline)}</span>
                    </div>
                  </div>
                </div>
                <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                  {item.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Summary */}
        <Alert className="bg-purple-50 border-purple-200">
          <Brain className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <strong>Strategy Summary:</strong> Focus on technical excellence and competitive pricing.
            Your BBBEE compliance provides a strong advantage. Complete all documentation
            before the closing date to ensure submission readiness.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
