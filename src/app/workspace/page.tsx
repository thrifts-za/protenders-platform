"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSavedTenders } from "@/hooks/useSavedTenders";
import { PipelineStage, ROIRecommendation, SmartGap, FollowedBuyer } from "@/types/workspace";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Download, TrendingUp, AlertTriangle, Building2, Calendar } from "lucide-react";
import { formatDate } from "@/lib/date";
import { downloadICS, generateICS } from "@/utils/ics";
import dayjs from "dayjs";

const stages: { id: PipelineStage; label: string }[] = [
  { id: 'discovery', label: 'Discovery' },
  { id: 'shortlist', label: 'Shortlist' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
];

export default function Workspace() {
  const { savedTenders } = useSavedTenders();
  const [pipeline, setPipeline] = useState<Record<PipelineStage, typeof savedTenders>>({
    discovery: savedTenders.slice(0, 3),
    shortlist: savedTenders.slice(3, 5),
    submitted: [],
    won: [],
    lost: [],
  });

  // Mock ROI recommendations
  const roiRecs: ROIRecommendation[] = savedTenders.slice(0, 3).map(st => ({
    ocid: st.tenderId,
    title: st.tender.title,
    expectedValue: { min: 120000, max: 180000, currency: 'ZAR' },
    estimatedEffort: { min: 18, max: 26, unit: 'hours' },
    priority: 1,
    deadline: st.tender.closingDate || '',
  }));

  // Mock smart gaps
  const gaps: SmartGap[] = savedTenders.slice(0, 2).map(st => ({
    ocid: st.tenderId,
    title: st.tender.title,
    requirement: 'Tax Clearance Certificate',
    status: 'missing',
    evidence: 'Required by tender specification section 3.2',
  }));

  // Mock followed buyers
  const buyers: FollowedBuyer[] = [
    { name: 'City of Cape Town', paymentReliability: 87, medianWindow: 45, docChangeRate: 12, tenderCount: 5, muted: false },
    { name: 'Department of Health', paymentReliability: 62, medianWindow: 62, docChangeRate: 28, tenderCount: 3, muted: false },
  ];

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceStage = result.source.droppableId as PipelineStage;
    const destStage = result.destination.droppableId as PipelineStage;

    if (sourceStage === destStage) return;

    const newPipeline = { ...pipeline };
    const [moved] = newPipeline[sourceStage].splice(result.source.index, 1);
    newPipeline[destStage].splice(result.destination.index, 0, moved);

    setPipeline(newPipeline);
  };

  const exportShortlist = () => {
    const csv = [
      ['Title', 'Buyer', 'Category', 'Closing Date', 'Value Band'].join(','),
      ...pipeline.shortlist.map(st => [
        `"${st.tender.title}"`,
        `"${st.tender.buyerName || ''}"`,
        st.tender.mainProcurementCategory || '',
        st.tender.closingDate || '',
        'R50k-R200k',
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shortlist-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
  };

  const downloadAllDeadlines = () => {
    const events = savedTenders
      .filter(st => st.tender.closingDate)
      .map(st => {
        const ics = generateICS(
          `Tender Deadline: ${st.tender.title}`,
          new Date(st.tender.closingDate!),
          `Buyer: ${st.tender.buyerName || 'Unknown'}`,
          st.tender.buyerName || ''
        );
        return ics;
      })
      .join('\n');

    downloadICS(events, 'tender-deadlines.ics');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">My Growth Workspace</h1>
            <p className="text-muted-foreground mt-2">
              Turn browsing into pipeline and actions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadAllDeadlines}>
              <Calendar className="h-4 w-4 mr-2" />
              Download All Deadlines
            </Button>
            <Button variant="outline" onClick={exportShortlist}>
              <Download className="h-4 w-4 mr-2" />
              Export Shortlist
            </Button>
          </div>
        </div>

        {/* Pipeline Kanban */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {stages.map(stage => (
                  <div key={stage.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{stage.label}</h3>
                      <Badge variant="secondary">{pipeline[stage.id].length}</Badge>
                    </div>
                    <Droppable droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-[400px] p-3 rounded-lg border-2 border-dashed transition-colors ${
                            snapshot.isDraggingOver ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          {pipeline[stage.id].map((item, index) => (
                            <Draggable key={item.tenderId} draggableId={item.tenderId} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`mb-3 p-3 bg-card rounded-lg border shadow-sm transition-shadow ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                >
                                  <h4 className="font-medium text-sm mb-2 line-clamp-2">
                                    {item.tender.title}
                                  </h4>
                                  {item.tender.closingDate && (
                                    <div className="text-xs text-muted-foreground mb-2">
                                      {formatDate(item.tender.closingDate)}
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    <Badge variant="outline" className="text-xs">R50k-R200k</Badge>
                                    <Badge variant="secondary" className="text-xs">87%</Badge>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ROI Compass */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                ROI Compass
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roiRecs.map((rec, idx) => (
                  <div key={rec.ocid} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <Badge className="mb-2">Priority #{idx + 1}</Badge>
                        <h4 className="font-medium line-clamp-2">{rec.title}</h4>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Expected Value</span>
                        <p className="font-medium">
                          {rec.expectedValue.currency} {rec.expectedValue.min.toLocaleString()}-
                          {rec.expectedValue.max.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Est. Effort</span>
                        <p className="font-medium">
                          {rec.estimatedEffort.min}-{rec.estimatedEffort.max} {rec.estimatedEffort.unit}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Deadline</span>
                        <p className="font-medium">{formatDate(rec.deadline)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Followed Buyers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Followed Buyers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {buyers.map(buyer => (
                <div key={buyer.name} className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{buyer.name}</h4>
                    <Badge variant="secondary">{buyer.tenderCount}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Reliability</span>
                      <p className="font-medium">{buyer.paymentReliability}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Window</span>
                      <p className="font-medium">{buyer.medianWindow}d</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full">
                    Mute Buyer
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Smart Gaps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Smart Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gaps.map(gap => (
                <div key={`${gap.ocid}-${gap.requirement}`} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{gap.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Missing: <span className="font-medium text-foreground">{gap.requirement}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{gap.evidence}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Add Reminder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
