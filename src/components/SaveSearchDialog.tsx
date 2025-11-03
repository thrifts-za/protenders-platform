"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertFrequency, SearchParams } from "@/types/tender";
import { saveAlert } from "@/services/alertService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SaveSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchParams: SearchParams;
}

export default function SaveSearchDialog({ open, onOpenChange, searchParams }: SaveSearchDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState<AlertFrequency>("daily");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem("userEmail", email);
      }

      await saveAlert(email, frequency, searchParams, name || undefined);
      toast.success("Search alert saved successfully!");
      onOpenChange(false);
      setName("");
      setEmail("");
      setFrequency("daily");
      router.push("/alerts");
    } catch (error) {
      toast.error("Failed to save alert");
      console.error("Error saving alert:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Save Search Alert</DialogTitle>
            <DialogDescription>
              Get notified when new tenders match your search criteria.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Alert Name (optional)</Label>
              <Input
                id="name"
                placeholder="e.g., IT Equipment Tenders"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as AlertFrequency)}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Alert</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

