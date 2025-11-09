'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Sparkles, Loader2, Zap, Gift, CheckCircle } from 'lucide-react';

interface WaitingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  source?: string;
}

/**
 * Waiting List Registration Modal
 *
 * Captures user information and adds them to the waiting list
 * for premium access. Redirects to demo page after successful submission.
 */
export function WaitingListModal({
  isOpen,
  onClose,
  onSuccess,
  source = 'tender-upgrade-cta',
}: WaitingListModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interest, setInterest] = useState('high');
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      phoneNumber: formData.get('phone') as string,
      jobTitle: formData.get('jobTitle') as string,
      interest: interest,
      message: formData.get('message') as string,
      source: source,
      userId: user?.id,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
    };

    try {
      const response = await fetch('/api/waiting-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: 'Welcome to the waiting list!',
          description: 'Redirecting you to the premium demo...',
        });

        // Close modal
        onClose();

        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }

        // Redirect to demo page
        setTimeout(() => {
          router.push('/demo?source=waiting-list');
        }, 500);
      } else {
        const error = await response.json();
        toast({
          title: 'Failed to join waiting list',
          description: error.message || 'Please try again later',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Waiting list error:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Get Premium Access
          </DialogTitle>
          <DialogDescription className="text-base">
            Join the waiting list for early-bird pricing and instant demo access
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name and Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-base">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={user?.name || ''}
                placeholder="John Doe"
                className="h-11"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-base">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={user?.email || ''}
                placeholder="john@company.com"
                className="h-11"
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <Label htmlFor="company" className="text-base">Company</Label>
            <Input
              id="company"
              name="company"
              placeholder="Your Company Ltd"
              className="h-11"
            />
          </div>

          {/* Benefits - Simplified */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-5 border border-primary/20">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Instant demo access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>50% early-bird discount</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Priority support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Free consultation</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="h-11">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-11 min-w-[180px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Join & View Demo
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
