import { useState } from "react";
import { useListLostFoundReports, useGetLostFoundStats } from "@workspace/api-client-react";
import { getListLostFoundReportsQueryKey, getGetLostFoundStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Search, Plus, User, Package, Clock, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColor: Record<string, string> = {
  open: "bg-red-100 text-red-700 border-red-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-700 border-gray-200",
};

const typeIcon: Record<string, React.ComponentType<any>> = {
  person: User,
  child: User,
  item: Package,
};

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function LostFound() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("open");
  const [type, setType] = useState("");

  const { data: stats, isLoading: statsLoading } = useGetLostFoundStats({ query: { queryKey: getGetLostFoundStatsQueryKey() } });
  const { data: reports, isLoading: reportsLoading } = useListLostFoundReports(
    { status: status || undefined, type: type || undefined, search: search || undefined },
    { query: { queryKey: getListLostFoundReportsQueryKey({ status: status || undefined, type: type || undefined, search: search || undefined }) } }
  );

  const filters = [
    { value: "", label: "All" },
    { value: "open", label: "Open" },
    { value: "resolved", label: "Resolved" },
  ];

  const typeFilters = [
    { value: "", label: "All Types" },
    { value: "person", label: "Person" },
    { value: "child", label: "Child" },
    { value: "item", label: "Item" },
  ];

  return (
    <div className="space-y-4 p-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Lost & Found</h1>
          <p className="text-sm text-muted-foreground">Help reunite families</p>
        </div>
        <Link href="/lost-found/new">
          <Button size="sm" className="gap-1">
            <Plus className="w-4 h-4" />
            Report
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <Skeleton className="h-20 rounded-xl" />
      ) : stats && (
        <div className="grid grid-cols-3 gap-2">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
            <CardContent className="py-3 text-center px-2">
              <p className="text-2xl font-bold text-red-600">{stats.totalOpen}</p>
              <p className="text-xs text-red-700 dark:text-red-400 font-medium">Open</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800">
            <CardContent className="py-3 text-center px-2">
              <p className="text-2xl font-bold text-green-600">{stats.totalResolved}</p>
              <p className="text-xs text-green-700 dark:text-green-400 font-medium">Found</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-3 text-center px-2">
              <p className="text-2xl font-bold text-primary">{stats.resolvedToday}</p>
              <p className="text-xs text-primary font-medium">Today</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or description..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((f) => (
          <button key={f.value} onClick={() => setStatus(f.value)}
            className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              status === f.value ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border"
            )}>
            {f.label}
          </button>
        ))}
        <div className="w-px bg-border mx-1" />
        {typeFilters.map((f) => (
          <button key={f.value} onClick={() => setType(f.value)}
            className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              type === f.value ? "bg-secondary text-secondary-foreground border-secondary" : "bg-background text-muted-foreground border-border"
            )}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Reports list */}
      {reportsLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : reports?.reports && reports.reports.length > 0 ? (
        <div className="space-y-3">
          {reports.reports.map((report) => {
            const Icon = typeIcon[report.type] || User;
            return (
              <Link key={report.id} href={`/lost-found/${report.id}`}>
                <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="py-4 px-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        report.status === "open" ? "bg-red-100" : "bg-green-100"
                      )}>
                        <Icon className={cn("w-6 h-6", report.status === "open" ? "text-red-600" : "text-green-600")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm">{report.title}</p>
                          <Badge className={cn("text-[10px] border shrink-0", statusColor[report.status])}>
                            {report.status}
                          </Badge>
                        </div>
                        {report.name && <p className="text-xs font-medium text-muted-foreground">{report.name}</p>}
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">{report.lastSeenLocation}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{timeAgo(report.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">No reports found</p>
        </div>
      )}
    </div>
  );
}
