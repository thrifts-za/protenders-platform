export type PipelineStage = 'discovery' | 'shortlist' | 'submitted' | 'won' | 'lost';

export interface PipelineItem {
  ocid: string;
  tenderId: string;
  stage: PipelineStage;
  title: string;
  closingDate?: string;
  valueBand?: string;
  reliability?: number;
  movedAt: string;
}

export interface ROIRecommendation {
  ocid: string;
  title: string;
  expectedValue: { min: number; max: number; currency: string };
  estimatedEffort: { min: number; max: number; unit: string };
  priority: number;
  deadline: string;
}

export interface SmartGap {
  ocid: string;
  title: string;
  requirement: string;
  status: 'missing' | 'incomplete';
  evidence?: string;
}

export interface FollowedBuyer {
  name: string;
  paymentReliability?: number;
  medianWindow?: number;
  docChangeRate?: number;
  tenderCount: number;
  muted: boolean;
}
