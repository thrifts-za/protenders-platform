import { useState, useMemo } from "react";
import { SavedTender } from "@/types/tender";
import { SavedTenderCard } from "./SavedTenderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Grid, List } from "lucide-react";

interface SavedTenderListProps {
  tenders: SavedTender[];
  onRemove: (id: string) => void;
  onSetReminder: (id: string) => void;
}

export const SavedTenderList = ({ tenders, onRemove, onSetReminder }: SavedTenderListProps) => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"closing" | "newest" | "score">("closing");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set<string>();
    tenders.forEach((t) => {
      if (t.tender.mainProcurementCategory) {
        cats.add(t.tender.mainProcurementCategory);
      }
    });
    return Array.from(cats);
  }, [tenders]);

  const filtered = useMemo(() => {
    let result = [...tenders];

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.tender.title.toLowerCase().includes(query) ||
          t.tender.buyerName?.toLowerCase().includes(query) ||
          t.tender.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filterCategory !== "all") {
      result = result.filter((t) => t.tender.mainProcurementCategory === filterCategory);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "closing") {
        if (!a.tender.closingDate) return 1;
        if (!b.tender.closingDate) return -1;
        return new Date(a.tender.closingDate).getTime() - new Date(b.tender.closingDate).getTime();
      }
      if (sortBy === "newest") {
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      }
      if (sortBy === "score") {
        return b.tender.dataQualityScore - a.tender.dataQualityScore;
      }
      return 0;
    });

    return result;
  }, [tenders, search, sortBy, filterCategory]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved tenders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="closing">Closing Soon</SelectItem>
            <SelectItem value="newest">Recently Saved</SelectItem>
            <SelectItem value="score">Data Quality</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            size="icon"
            variant={view === "grid" ? "default" : "outline"}
            onClick={() => setView("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={view === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-3"}>
        {filtered.map((saved) => (
          <SavedTenderCard
            key={saved.tenderId}
            saved={saved}
            onRemove={onRemove}
            onSetReminder={onSetReminder}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tenders match your filters</p>
        </div>
      )}
    </div>
  );
};
