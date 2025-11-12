/**
 * FundingFilterPanel Component
 * Phase 3: ProTender Fund Finder
 *
 * Filter panel for funding opportunities search
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Search,
  RotateCcw,
  Loader2,
  Factory,
  Cpu,
  Link2,
  Wheat,
  Laptop,
  Pickaxe,
  Leaf,
  Briefcase,
  MapPin
} from "lucide-react";
import { trackFilterChange } from "@/lib/analytics";

interface FundingFilterPanelProps {
  onSearch: (params: FundingSearchParams) => void;
  facets?: FundingFacets;
  isLoadingFacets?: boolean;
  initialValues?: FundingSearchParams;
}

export interface FundingSearchParams {
  q?: string;
  categories?: string[];
  provinces?: string[];
  fundingType?: string;
  amountMin?: number;
  amountMax?: number;
  source?: string;
  institution?: string;
  page?: number;
  pageSize?: number;
}

interface FundingFacets {
  categories: [string, number][];
  provinces: [string, number][];
  fundingTypes: [string, number][];
  sources: [string, number][];
  institutions: [string, number][];
  amountRanges: {
    min: number | null;
    max: number | null;
    quartiles: number[];
  };
}

const AMOUNT_PRESETS = [
  { label: "Up to R100k", value: { max: 100000 } },
  { label: "R100k - R500k", value: { min: 100000, max: 500000 } },
  { label: "R500k - R1M", value: { min: 500000, max: 1000000 } },
  { label: "R1M - R5M", value: { min: 1000000, max: 5000000 } },
  { label: "R5M+", value: { min: 5000000 } },
];

/**
 * Get icon for category with background
 */
function getCategoryIcon(category: string) {
  const categoryLower = category.toLowerCase();

  if (categoryLower.includes('manufacturing')) {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded bg-blue-100">
        <Factory className="h-3.5 w-3.5 text-blue-600" />
      </span>
    );
  }
  if (categoryLower.includes('technology')) {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded bg-purple-100">
        <Cpu className="h-3.5 w-3.5 text-purple-600" />
      </span>
    );
  }
  if (categoryLower.includes('supply chain')) {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded bg-orange-100">
        <Link2 className="h-3.5 w-3.5 text-orange-600" />
      </span>
    );
  }
  if (categoryLower.includes('agriculture')) {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded bg-green-100">
        <Wheat className="h-3.5 w-3.5 text-green-600" />
      </span>
    );
  }
  if (categoryLower.includes('ict')) {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded bg-indigo-100">
        <Laptop className="h-3.5 w-3.5 text-indigo-600" />
      </span>
    );
  }
  if (categoryLower.includes('mining')) {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded bg-amber-100">
        <Pickaxe className="h-3.5 w-3.5 text-amber-700" />
      </span>
    );
  }
  if (categoryLower.includes('green') || categoryLower.includes('environment')) {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded bg-emerald-100">
        <Leaf className="h-3.5 w-3.5 text-emerald-600" />
      </span>
    );
  }

  return (
    <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100">
      <Briefcase className="h-3.5 w-3.5 text-slate-600" />
    </span>
  );
}

/**
 * Format category label - remove "General" prefix
 */
function formatCategoryLabel(category: string): string {
  return category.replace(/^General\s+/i, '');
}

export const FundingFilterPanel = ({ onSearch, facets, isLoadingFacets, initialValues }: FundingFilterPanelProps) => {
  const isFirstMount = useRef(true);

  const [query, setQuery] = useState(initialValues?.q || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialValues?.categories || []);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>(initialValues?.provinces || []);
  const [fundingType, setFundingType] = useState<string>(initialValues?.fundingType || "any");
  const [amountPreset, setAmountPreset] = useState<string>("any");
  const [amountMin, setAmountMin] = useState<string>(initialValues?.amountMin?.toString() || "");
  const [amountMax, setAmountMax] = useState<string>(initialValues?.amountMax?.toString() || "");
  const [source, setSource] = useState<string>(initialValues?.source || "any");
  const [institution, setInstitution] = useState<string>(initialValues?.institution || "");

  const handleCategoryToggle = (category: string) => {
    const isActive = selectedCategories.includes(category);
    setSelectedCategories((prev) =>
      isActive ? prev.filter((c) => c !== category) : [...prev, category]
    );
    trackFilterChange('funding_category', category, !isActive);
  };

  const handleProvinceToggle = (province: string) => {
    const isActive = selectedProvinces.includes(province);
    setSelectedProvinces((prev) =>
      isActive ? prev.filter((p) => p !== province) : [...prev, province]
    );
    trackFilterChange('funding_province', province, !isActive);
  };

  const handleAmountPresetChange = (preset: string) => {
    setAmountPreset(preset);

    if (preset === "any") {
      setAmountMin("");
      setAmountMax("");
    } else {
      const presetData = AMOUNT_PRESETS.find((p) => p.label === preset);
      if (presetData) {
        setAmountMin(presetData.value.min?.toString() || "");
        setAmountMax(presetData.value.max?.toString() || "");
      }
    }
  };

  const handleSearch = () => {
    const params: FundingSearchParams = {
      q: query || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      provinces: selectedProvinces.length > 0 ? selectedProvinces : undefined,
      fundingType: fundingType === "any" ? undefined : fundingType,
      amountMin: amountMin ? parseInt(amountMin) : undefined,
      amountMax: amountMax ? parseInt(amountMax) : undefined,
      source: source === "any" ? undefined : source,
      institution: institution || undefined,
      page: 1,
    };
    onSearch(params);
  };

  const handleReset = () => {
    setQuery("");
    setSelectedCategories([]);
    setSelectedProvinces([]);
    setFundingType("any");
    setAmountPreset("any");
    setAmountMin("");
    setAmountMax("");
    setSource("any");
    setInstitution("");
    onSearch({ page: 1 });
  };

  // Auto-search when filters change (skip on first mount to preserve URL params)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    handleSearch();
  }, [selectedCategories, selectedProvinces, fundingType, source]);

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {isLoadingFacets ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="funding-query">Search</Label>
            <div className="flex gap-2">
              <Input
                id="funding-query"
                placeholder="Search funding programs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Funding Type */}
          {facets && facets.fundingTypes.length > 0 && (
            <div className="space-y-2">
              <Label>Funding Type</Label>
              <Select value={fundingType} onValueChange={setFundingType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Type</SelectItem>
                  {facets.fundingTypes.map(([type, count]) => (
                    <SelectItem key={type} value={type}>
                      {type} ({count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Amount Range */}
          <div className="space-y-2">
            <Label>Funding Amount</Label>
            <Select value={amountPreset} onValueChange={handleAmountPresetChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Amount</SelectItem>
                {AMOUNT_PRESETS.map((preset) => (
                  <SelectItem key={preset.label} value={preset.label}>
                    {preset.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {amountPreset === "custom" && (
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  placeholder="Min (ZAR)"
                  value={amountMin}
                  onChange={(e) => setAmountMin(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max (ZAR)"
                  value={amountMax}
                  onChange={(e) => setAmountMax(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Categories */}
          {facets && facets.categories.length > 0 && (
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="space-y-2">
                {facets.categories.slice(0, 8).map(([category, count]) => (
                  <Checkbox
                    key={category}
                    id={`category-${category}`}
                    label={formatCategoryLabel(category)}
                    icon={getCategoryIcon(category)}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                  />
                ))}
              </div>

              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {selectedCategories.map((category) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {formatCategoryLabel(category)}
                      <button
                        onClick={() => handleCategoryToggle(category)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Provinces */}
          {facets && facets.provinces.length > 0 && (
            <div className="space-y-2">
              <Label>Provinces</Label>
              <div className="space-y-2">
                {facets.provinces.slice(0, 9).map(([province, count]) => (
                  <Checkbox
                    key={province}
                    id={`province-${province}`}
                    label={province}
                    icon={
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                      </span>
                    }
                    checked={selectedProvinces.includes(province)}
                    onCheckedChange={() => handleProvinceToggle(province)}
                  />
                ))}
              </div>

              {selectedProvinces.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {selectedProvinces.map((province) => (
                    <Badge key={province} variant="secondary" className="text-xs">
                      {province}
                      <button
                        onClick={() => handleProvinceToggle(province)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Source */}
          {facets && facets.sources.length > 0 && (
            <div className="space-y-2">
              <Label>Funding Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">All Sources</SelectItem>
                  {facets.sources.map(([src, count]) => {
                    // Format source labels for better readability
                    let label = src;
                    if (src === 'corporate_esd') label = 'Corporate ESD';
                    else if (src === 'pdf') label = 'Government DFIs';
                    else label = src.toUpperCase();

                    return (
                      <SelectItem key={src} value={src}>
                        {label} ({count})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Institution Search */}
          <div className="space-y-2">
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              placeholder="Search by institution..."
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* Apply Button (for manual filters) */}
          <Button onClick={handleSearch} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );
};
