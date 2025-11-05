"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useSavedTenders } from "@/hooks/useSavedTenders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/date";
import { Trash2, FileEdit, Check, Tag as TagIcon } from "lucide-react";
import Link from "next/link";

export default function My() {
  const { savedTenders, removeTender, updateTags, updateNotes, toggleSubmitted } = useSavedTenders();
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [tagsValue, setTagsValue] = useState("");

  const handleSaveNotes = (tenderId: string) => {
    updateNotes(tenderId, notesValue);
    setEditingNotes(null);
  };

  const handleSaveTags = (tenderId: string) => {
    const tags = tagsValue.split(",").map((t) => t.trim()).filter(Boolean);
    updateTags(tenderId, tags);
    setEditingTags(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">My Tenders</h1>
          <p className="text-muted-foreground mt-2">
            Saved tenders with your personal notes and tags
          </p>
        </div>
      </header>

      <div className="w-full py-8">
        <div className="content-container">
        {savedTenders.length === 0 ? (
          <div className="text-center py-12">
            <FileEdit className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium mb-2">No saved tenders yet</p>
            <p className="text-muted-foreground">
              Browse tenders and save ones you're interested in
            </p>
            <Link href="/">
              <Button className="mt-4">Browse Tenders</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedTenders.map((saved) => (
              <div key={saved.tenderId} className="bg-card border rounded-lg p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <Link href={`/tender/${saved.tenderId}`}>
                      <h3 className="text-xl font-semibold hover:text-primary cursor-pointer mb-2">
                        {saved.tender.title}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>{saved.tender.buyerName}</span>
                      {saved.tender.closingDate && (
                        <>
                          <span>•</span>
                          <span>Closes: {formatDate(saved.tender.closingDate)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {saved.isSubmitted && (
                      <Badge variant="default" className="gap-1">
                        <Check className="h-3 w-3" />
                        Submitted
                      </Badge>
                    )}
                    {saved.tender.status && (
                      <Badge variant="secondary" className="capitalize">
                        {saved.tender.status}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TagIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Tags</span>
                      <Dialog open={editingTags === saved.tenderId} onOpenChange={(open) => {
                        if (open) {
                          setEditingTags(saved.tenderId);
                          setTagsValue(saved.tags?.join(", ") || "");
                        } else {
                          setEditingTags(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost">Edit</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Tags</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="e.g. urgent, high-priority, IT"
                              value={tagsValue}
                              onChange={(e) => setTagsValue(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                              Separate tags with commas
                            </p>
                            <Button onClick={() => handleSaveTags(saved.tenderId)}>
                              Save
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {saved.tags && saved.tags.length > 0 ? (
                        saved.tags.map((tag: string, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No tags</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileEdit className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Notes</span>
                      <Dialog open={editingNotes === saved.tenderId} onOpenChange={(open) => {
                        if (open) {
                          setEditingNotes(saved.tenderId);
                          setNotesValue(saved.notes || "");
                        } else {
                          setEditingNotes(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost">Edit</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Notes</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Add your notes here..."
                              value={notesValue}
                              onChange={(e) => setNotesValue(e.target.value)}
                              rows={6}
                            />
                            <Button onClick={() => handleSaveNotes(saved.tenderId)}>
                              Save
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {saved.notes ? (
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {saved.notes}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No notes</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    size="sm"
                    variant={saved.isSubmitted ? "outline" : "default"}
                    onClick={() => toggleSubmitted(saved.tenderId)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {saved.isSubmitted ? "Mark as Not Submitted" : "Mark as Submitted"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeTender(saved.tenderId)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
