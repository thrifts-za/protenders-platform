'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, Calendar, FileType } from "lucide-react";
import dayjs from "dayjs";

interface Document {
  id?: string;
  title?: string;
  documentType?: string;
  url?: string;
  datePublished?: string;
  dateModified?: string;
  format?: string;
}

interface DocumentsListProps {
  documents: Document[];
}

export default function DocumentsList({ documents }: DocumentsListProps) {
  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return dayjs(date).format("MMM D, YYYY");
  };

  const getDocumentIcon = (documentType?: string) => {
    const type = documentType?.toLowerCase() || "";
    if (type.includes("tender")) return FileText;
    if (type.includes("specification")) return FileType;
    if (type.includes("plan")) return FileText;
    return FileText;
  };

  const getDocumentBadgeVariant = (documentType?: string) => {
    const type = documentType?.toLowerCase() || "";
    if (type.includes("tender")) return "default" as const;
    if (type.includes("specification")) return "secondary" as const;
    if (type.includes("addendum")) return "destructive" as const;
    return "outline" as const;
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    const type = doc.documentType || "Other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Documents Available</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Documents for this tender have not been uploaded yet. Check back later or contact the procurement office.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tender Documents</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {documents.length} document{documents.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          <FileText className="h-3 w-3 mr-1" />
          Official Files
        </Badge>
      </div>

      {/* Documents by Category */}
      {Object.entries(groupedDocuments).map(([category, docs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              {category}
            </CardTitle>
            <CardDescription>{docs.length} file{docs.length !== 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {docs.map((doc, idx) => {
                const Icon = getDocumentIcon(doc.documentType);
                return (
                  <div
                    key={doc.id || idx}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors group"
                  >
                    {/* Icon */}
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>

                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {doc.title || doc.documentType || "Document"}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {doc.documentType && (
                          <Badge
                            variant={getDocumentBadgeVariant(doc.documentType)}
                            className="text-xs"
                          >
                            {doc.documentType}
                          </Badge>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(doc.datePublished || doc.dateModified)}
                        </span>
                        {doc.format && (
                          <span className="uppercase font-mono">
                            {doc.format}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {doc.url && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            asChild
                          >
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View
                            </a>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Download All */}
      {documents.length > 1 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm">Download All Documents</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Get all {documents.length} documents in one go
                </p>
              </div>
              <Button variant="default" disabled>
                <Download className="h-4 w-4 mr-2" />
                Download All
                <Badge variant="secondary" className="ml-2">
                  Coming Soon
                </Badge>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notice */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <FileText className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Document Review Checklist
              </p>
              <ul className="text-yellow-800 dark:text-yellow-200 space-y-1 text-xs">
                <li>• Review all mandatory documents before submission</li>
                <li>• Check for addendums or amendments to original specifications</li>
                <li>• Ensure all required forms are completed and signed</li>
                <li>• Verify that you have the latest version of each document</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
