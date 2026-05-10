import { useGetCrowdOverview, useListCrowdZones } from "@workspace/api-client-react";
import { getGetCrowdOverviewQueryKey, getListCrowdZonesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Users, Activity, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const crowdConfig: Record<string, { color: string; bg: string; label: string; progress: number }> = {
  low: { color: "text-green-700 border-green-200", bg: "bg-green-100", label: "Low", progress: 25 },
  medium: { color: "text-amber-700 border-amber-200", bg: "bg-amber-100", label: "Medium", progress: 55 },
  high: { color: "text-orange-700 border-orange-200", bg: "bg-orange-100", label: "High", progress: 80 },
  critical: { color: "text-red-700 border-red-200", bg: "bg-red-100", label: "Critical", progress: 97 },
};

const progressColor: Record<string, string> = {
  low: "bg-green-500",
  medium: "bg-amber-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

export default function Crowd() {
  const { data: overview, isLoading: overviewLoading } = useGetCrowdOverview({
    query: { queryKey: getGetCrowdOverviewQueryKey() },
  });
  const { data: zones, isLoading: zonesLoading } = useListCrowdZones({
    query: { queryKey: getListCrowdZonesQueryKey() },
  });

  const levelCounts = zones?.reduce((acc, z) => {
    acc[z.level] = (acc[z.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4 p-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Crowd Monitor</h1>
          <p className="text-sm text-muted-foreground">Real-time zone density</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-green-600">
          <Activity className="w-4 h-4" />
          <span>Live</span>
        </div>
      </div>

      {/* Overall status */}
      {overviewLoading ? (
        <Skeleton className="h-32 rounded-2xl" />
      ) : overview && (
        <div className={cn("rounded-2xl p-5 border", crowdConfig[overview.overallLevel]?.bg || "bg-muted")}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Overall Status</p>
              <p className="text-3xl font-bold mt-1 capitalize">{overview.overallLevel}</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-border/30 flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span>{overview.totalEstimated?.toLocaleString()} pilgrims</span>
              <span>{crowdConfig[overview.overallLevel]?.progress}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/40">
              <div
                className={cn("h-3 rounded-full transition-all", progressColor[overview.overallLevel])}
                style={{ width: `${crowdConfig[overview.overallLevel]?.progress || 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Level summary */}
      {levelCounts && (
        <div className="grid grid-cols-4 gap-2">
          {["critical", "high", "medium", "low"].map((level) => (
            <Card key={level} className={cn("border", crowdConfig[level]?.color)}>
              <CardContent className="py-2 px-2 text-center">
                <p className={cn("text-xl font-bold", level === "critical" ? "text-red-600" : level === "high" ? "text-orange-600" : level === "medium" ? "text-amber-600" : "text-green-600")}>
                  {levelCounts[level] || 0}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">{level}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Zone list */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">All Zones</p>
        {zonesLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : zones?.map((zone) => {
          const cfg = crowdConfig[zone.level] || crowdConfig.low;
          const pct = Math.round(((zone.estimatedCount || 0) / zone.maxCapacity) * 100);
          return (
            <Card key={zone.id} className="border-border/50 mb-3">
              <CardContent className="py-4 px-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">{zone.name}</p>
                  <Badge className={cn("text-[10px] border", cfg.color, cfg.bg)}>{zone.level}</Badge>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{zone.estimatedCount?.toLocaleString()} / {zone.maxCapacity?.toLocaleString()}</span>
                    <span>{pct}% capacity</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-muted">
                    <div
                      className={cn("h-2.5 rounded-full transition-all", progressColor[zone.level])}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <Card className="border-border/50 bg-muted/30">
        <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Crowd Level Guide</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-2">
          {Object.entries(crowdConfig).reverse().map(([level, cfg]) => (
            <div key={level} className="flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-full shrink-0", progressColor[level])} />
              <span className="text-xs font-medium capitalize w-14">{level}</span>
              <span className="text-xs text-muted-foreground">
                {level === "low" ? "Under 30% capacity — free movement" :
                 level === "medium" ? "30-70% capacity — moderate congestion" :
                 level === "high" ? "70-90% capacity — restricted movement" :
                 "Over 90% — emergency measures active"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
