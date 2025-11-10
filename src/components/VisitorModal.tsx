"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import mixpanel from "@/lib/mixpanel";

const STORAGE_KEY_PROFILE = "pt_visitor_profile"; // { name, business }
const STORAGE_KEY_NEXT_SHOW = "pt_visitor_next_show"; // epoch ms

function shouldShow(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const profile = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (profile) return false; // already filled
    const nextShowStr = localStorage.getItem(STORAGE_KEY_NEXT_SHOW);
    if (!nextShowStr) return true;
    const nextShow = parseInt(nextShowStr, 10) || 0;
    return Date.now() >= nextShow;
  } catch { return false; }
}

export default function VisitorModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");

  useEffect(() => {
    setOpen(shouldShow());
  }, []);

  function dismissFor(days: number) {
    try {
      const ms = days * 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY_NEXT_SHOW, String(Date.now() + ms));
    } catch {}
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !business.trim()) {
      // require both
      return;
    }
    try {
      const profile = { name, business, at: Date.now() };
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));

      // Mixpanel tracking - simplified
      try {
        // Identify user
        mixpanel.identify(name.trim());

        // Set user properties
        mixpanel.people.set({
          '$name': name.trim(),
          'business': business.trim(),
        });

        // Track event
        mixpanel.track('Visitor Info Submitted');

        console.log('Mixpanel: User identified and tracked');
      } catch (err) {
        console.error('Mixpanel error:', err);
      }

      setOpen(false);
    } catch {
      setOpen(false);
    }
  }

  function onDismiss() {
    dismissFor(3);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to ProTenders</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Your Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Doe" />
          </div>
          <div>
            <label className="block text-sm mb-1">Business / Entity</label>
            <Input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="e.g. Acme Trading (Pty) Ltd" />
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="outline" onClick={onDismiss}>Not now</Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

