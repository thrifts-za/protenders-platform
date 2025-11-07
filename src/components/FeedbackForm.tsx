"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Lightbulb, Bug, Sparkles } from "lucide-react";


interface FeedbackFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export function FeedbackForm({ onSuccess, onCancel, showCancel = false }: FeedbackFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: "feedback",
    title: "",
    description: "",
    email: "",
    priority: "medium"
  });

  const feedbackTypes = [
    { value: "feature", label: "Feature Request", icon: Lightbulb, description: "Suggest a new feature" },
    { value: "bug", label: "Bug Report", icon: Bug, description: "Report something broken" },
    { value: "improvement", label: "Improvement", icon: Sparkles, description: "Suggest an enhancement" },
    { value: "feedback", label: "General Feedback", icon: MessageSquare, description: "Share your thoughts" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and description",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Thank you for your feedback!",
          description: "We'll review it soon and get back to you if needed.",
        });

        // Reset form
        setFormData({
          type: "feedback",
          title: "",
          description: "",
          email: "",
          priority: "medium"
        });

        // Call success callback
        onSuccess?.();
      } else {
        throw new Error(data.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Feedback Type */}
      <div className="space-y-3">
        <Label>Type of Feedback</Label>
        <RadioGroup
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {feedbackTypes.map((type) => {
            const Icon = type.icon;
            return (
              <label
                key={type.value}
                className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all hover:bg-accent ${
                  formData.type === type.value ? "border-primary bg-primary text-primary-foreground" : "border-border"
                }`}
              >
                <RadioGroupItem value={type.value} className="mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 shrink-0 ${formData.type === type.value ? "text-primary-foreground" : ""}`} />
                    <span className={`font-medium text-sm ${formData.type === type.value ? "text-primary-foreground" : ""}`}>{type.label}</span>
                  </div>
                  <p className={`text-xs ${formData.type === type.value ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{type.description}</p>
                </div>
              </label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Brief summary of your feedback"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          maxLength={200}
          required
        />
        <p className="text-xs text-muted-foreground">
          {formData.title.length}/200 characters
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Please provide details about your feedback..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={6}
          required
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Be as specific as possible to help us understand your feedback
        </p>
      </div>

      {/* Priority (optional) */}
      <div className="space-y-2">
        <Label htmlFor="priority">Priority (Optional)</Label>
        <Select
          value={formData.priority}
          onValueChange={(value) => setFormData({ ...formData, priority: value })}
        >
          <SelectTrigger id="priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low - Nice to have</SelectItem>
            <SelectItem value="medium">Medium - Would be helpful</SelectItem>
            <SelectItem value="high">High - Important to me</SelectItem>
            <SelectItem value="critical">Critical - Blocking my work</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Email (optional) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email (Optional)</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          We&apos;ll only use this to follow up if needed
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        {showCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className={showCancel ? "flex-1" : "w-full"}
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </div>
    </form>
  );
}
