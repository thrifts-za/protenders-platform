/**
 * FreshnessFilters Component
 * Provides freshness chips, date picker, and sort controls for search
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";

export interface FreshnessFilterState {
  windowDays: number | null; // 7, 30, 90, null (all time)
  updatedSince: Date | null;
  sort: "latest" | "closingSoon" | "relevance";
}

interface FreshnessFiltersProps {
  value: FreshnessFilterState;
  onChange: (filters: FreshnessFilterState) => void;
  onReset?: () => void;
}

export default function FreshnessFilters({ value, onChange, onReset }: FreshnessFiltersProps) {
  const [updatedSinceOpen, setUpdatedSinceOpen] = useState(false);

  const windowOptions = [
    { label: "Last 7 days", value: 7 },
    { label: "Last 30 days", value: 30 },
    { label: "Last 90 days", value: 90 },
    { label: "All time", value: null },
  ];

  const handleWindowChange = (days: number | null) => {
    onChange({ ...value, windowDays: days });
  };

  const handleSortChange = (sort: string) => {
    onChange({ ...value, sort: sort as FreshnessFilterState["sort"] });
  };

  const handleUpdatedSinceChange = (date: Date | undefined) => {
    onChange({ ...value, updatedSince: date || null });
    setUpdatedSinceOpen(false);
  };

  const isActive = value.windowDays !== 30 || value.updatedSince !== null || value.sort !== "latest";

  return (
    <div className="space-y-4">
      {/* Freshness Window Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          <Clock className="h-4 w-4" />
          Freshness:
        </span>
        {windowOptions.map((option) => (
          <Button
            key={option.label}
            variant={value.windowDays === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleWindowChange(option.value)}
            className="h-8"
          >
            {option.label}
          </Button>
        ))}

        {/* Updated Since Date Picker */}
        <Popover open={updatedSinceOpen} onOpenChange={setUpdatedSinceOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={value.updatedSince ? "default" : "outline"}
              size="sm"
              className="h-8"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {value.updatedSince ? format(value.updatedSince, "MMM d, yyyy") : "Updated since"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value.updatedSince || undefined}
              onSelect={handleUpdatedSinceChange}
              initialFocus
            />
            {value.updatedSince && (
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => handleUpdatedSinceChange(undefined)}
                >
                  Clear date
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Sort and Reset */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <SlidersHorizontal className="h-4 w-4" />
            Sort:
          </span>
          <Select value={value.sort} onValueChange={handleSortChange}>
            <SelectTrigger className="h-8 w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="closingSoon">Closing Soon</SelectItem>
              <SelectItem value="relevance">Relevance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isActive && onReset && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-8">
            Reset filters
          </Button>
        )}
      </div>

      {/* Active Filter Summary */}
      {value.updatedSince && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <CalendarIcon className="h-3 w-3" />
            Updated since {format(value.updatedSince, "MMM d, yyyy")}
          </Badge>
        </div>
      )}
    </div>
  );
}
