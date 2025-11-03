import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavedTender } from "@/types/tender";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface PortfolioInsightsProps {
  tenders: SavedTender[];
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#8884d8", "#82ca9d", "#ffc658"];

export const PortfolioInsights = ({ tenders }: PortfolioInsightsProps) => {
  const categoryData = useMemo(() => {
    const counts = new Map<string, number>();
    tenders.forEach((t) => {
      const cat = t.tender.mainProcurementCategory || "Uncategorized";
      counts.set(cat, (counts.get(cat) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [tenders]);

  const buyerData = useMemo(() => {
    const counts = new Map<string, number>();
    tenders.forEach((t) => {
      const buyer = t.tender.buyerName || "Unknown";
      counts.set(buyer, (counts.get(buyer) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [tenders]);

  const avgQuality = useMemo(() => {
    if (tenders.length === 0) return 0;
    const sum = tenders.reduce((acc, t) => acc + t.tender.dataQualityScore, 0);
    return Math.round(sum / tenders.length);
  }, [tenders]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Saved by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`} // eslint-disable-line @typescript-eslint/no-explicit-any
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Buyers</CardTitle>
        </CardHeader>
        <CardContent>
          {buyerData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={buyerData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Saved</span>
            <span className="text-2xl font-bold">{tenders.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Avg Data Quality</span>
            <span className="text-2xl font-bold">{avgQuality}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Categories</span>
            <span className="text-2xl font-bold">{categoryData.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Unique Buyers</span>
            <span className="text-2xl font-bold">{buyerData.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
