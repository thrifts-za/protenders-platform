"use client";

import { useState } from "react";
import { SearchParams, SubmissionMethod, TenderStatus } from "@/types/tender";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Search, RotateCcw, Save } from "lucide-react";
import { trackFilterChange, trackButtonClick } from "@/lib/analytics";

interface FilterPanelProps {
  onSearch: (params: SearchParams) => void;
  onSaveSearch: () => void;
}

const CATEGORIES = ["goods", "services", "works"];
const SUBMISSION_METHODS: SubmissionMethod[] = ["email", "electronic", "physical", "other"];
const STATUSES: { value: TenderStatus | "any"; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "active", label: "Active" },
  { value: "planned", label: "Planned" },
  { value: "complete", label: "Complete" },
  { value: "cancelled", label: "Cancelled" },
];

export const FilterPanel = ({ onSearch, onSaveSearch }: FilterPanelProps) => {
  const [keywords, setKeywords] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [closingInDays, setClosingInDays] = useState<string>("any");
  const [submissionMethods, setSubmissionMethods] = useState<SubmissionMethod[]>([]);
  const [buyer, setBuyer] = useState("");
  const [status, setStatus] = useState<string>("any");

  const handleCategoryToggle = (category: string) => {
    const isActive = categories.includes(category);
    setCategories((prev) =>
      isActive ? prev.filter((c) => c !== category) : [...prev, category]
    );
    trackFilterChange('category', category, !isActive);
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim() && !categories.includes(customCategory.trim())) {
      setCategories((prev) => [...prev, customCategory.trim()]);
      setCustomCategory("");
    }
  };

  const handleRemoveCategory = (category: string) => {
    setCategories((prev) => prev.filter((c) => c !== category));
  };

  const handleSubmissionMethodToggle = (method: SubmissionMethod) => {
    const isActive = submissionMethods.includes(method);
    setSubmissionMethods((prev) =>
      isActive ? prev.filter((m) => m !== method) : [...prev, method]
    );
    trackFilterChange('submission_method', method, !isActive);
  };

  const handleSearch = () => {
    const params: SearchParams = {
      keywords: keywords || undefined,
      categories: categories.length > 0 ? categories : undefined,
      closingInDays: closingInDays === "any" ? null : parseInt(closingInDays),
      submissionMethods: submissionMethods.length > 0 ? submissionMethods : undefined,
      buyer: buyer || null,
      status: status === "any" ? null : (status as TenderStatus),
      page: 1,
    };
    onSearch(params);
  };

  const handleReset = () => {
    setKeywords("");
    setCategories([]);
    setCustomCategory("");
    setClosingInDays("any");
    setSubmissionMethods([]);
    setBuyer("");
    setStatus("any");
    onSearch({ page: 1 });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords</Label>
          <Input
            id="keywords"
            placeholder="Search title, description, buyer..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat}
                variant={categories.includes(cat) ? "default" : "outline"}
                className="cursor-pointer capitalize min-h-[40px] px-4 py-2 active:scale-95 transition-transform"
                onClick={() => handleCategoryToggle(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
          {categories.filter((c) => !CATEGORIES.includes(c)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories
                .filter((c) => !CATEGORIES.includes(c))
                .map((cat) => (
                  <Badge key={cat} variant="secondary" className="capitalize min-h-[40px] px-4 py-2 pr-2">
                    <span className="mr-2">{cat}</span>
                    <button
                      onClick={() => handleRemoveCategory(cat)}
                      className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-background/50 active:scale-95 transition-all"
                      aria-label={`Remove ${cat}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Badge>
                ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom category..."
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCustomCategory()}
            />
            <Button size="sm" onClick={handleAddCustomCategory}>
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="closing">Closing in</Label>
          <Select value={closingInDays} onValueChange={setClosingInDays}>
            <SelectTrigger id="closing">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              <SelectItem value="3">3 days</SelectItem>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Submission Method</Label>
          <div className="space-y-2">
            {SUBMISSION_METHODS.map((method) => (
              <div key={method} className="flex items-center space-x-3 min-h-[40px]">
                <Checkbox
                  id={`method-${method}`}
                  checked={submissionMethods.includes(method)}
                  onCheckedChange={() => handleSubmissionMethodToggle(method)}
                />
                <label
                  htmlFor={`method-${method}`}
                  className="text-sm capitalize cursor-pointer select-none flex-1 py-2"
                >
                  {method}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyer">Buyer</Label>
          <Input
            id="buyer"
            placeholder="Filter by buyer name..."
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={handleSearch} className="w-full">
          <Search className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
        <Button variant="outline" onClick={onSaveSearch} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save this search
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;

