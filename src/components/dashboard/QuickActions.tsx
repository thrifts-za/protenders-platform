import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Bell, Trash2 } from "lucide-react";
import { SavedTender } from "@/types/tender";
import { exportToCSV } from "@/lib/csv";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
  tenders: SavedTender[];
  onClearAll: () => void;
}

export const QuickActions = ({ tenders, onClearAll }: QuickActionsProps) => {
  const { toast } = useToast();

  const handleExportAll = () => {
    if (tenders.length === 0) {
      toast({
        title: "No tenders to export",
        description: "Save some tenders first",
        variant: "destructive",
      });
      return;
    }

    const tendersData = tenders.map((t) => t.tender);
    exportToCSV(tendersData, "my-saved-tenders.csv");
    toast({
      title: "Export successful",
      description: `Exported ${tenders.length} tenders`,
    });
  };

  const handleSetGlobalReminder = () => {
    toast({
      title: "Global reminder set",
      description: "You'll be notified 48h before any closing deadline",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          className="w-full justify-start"
          variant="outline"
          onClick={handleExportAll}
          disabled={tenders.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export All (CSV)
        </Button>

        <Button
          className="w-full justify-start"
          variant="outline"
          onClick={handleSetGlobalReminder}
        >
          <Bell className="h-4 w-4 mr-2" />
          Set 48h Reminder
        </Button>

        <Button
          className="w-full justify-start"
          variant="outline"
          onClick={onClearAll}
          disabled={tenders.length === 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </CardContent>
    </Card>
  );
};
