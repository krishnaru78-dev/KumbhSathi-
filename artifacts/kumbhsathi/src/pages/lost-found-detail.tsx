import { useRoute } from "wouter";
import { useGetLostFoundReport, useResolveLostFoundReport } from "@workspace/api-client-react";
import { getGetLostFoundReportQueryKey, getListLostFoundReportsQueryKey, getGetLostFoundStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowLeft, MapPin, Clock, Phone, User, CheckCircle, Package, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const statusColor: Record<string, string> = {
  open: "bg-red-100 text-red-700 border-red-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
};

export default function LostFoundDetail() {
  const [, params] = useRoute("/lost-found/:id");
  const reportId = params?.id || "";
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: report, isLoading } = useGetLostFoundReport(reportId, {
    query: { queryKey: getGetLostFoundReportQueryKey(reportId), enabled: !!reportId },
  });

  const resolveMutation = useResolveLostFoundReport({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetLostFoundReportQueryKey(reportId) });
        qc.invalidateQueries({ queryKey: getListLostFoundReportsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetLostFoundStatsQueryKey() });
        toast({ title: "Marked as resolved", description: "This report has been resolved." });
      },
    },
  });

  if (isLoading) {
    return <div className="p-4 space-y-4"><Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-24 rounded-xl" /></div>;
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mb-3" />
        <p className="font-medium">Report not found</p>
        <Link href="/lost-found" className="text-primary text-sm mt-2">Back to list</Link>
      </div>
    );
  }

  const Icon = report.type === "item" ? Package : User;

  return (
    <div className="pb-8">
      <div className={cn("h-40 flex items-center justify-center", report.status === "open" ? "bg-red-50 dark:bg-red-900/10" : "bg-green-50 dark:bg-green-900/10")}>
        <div className={cn("w-20 h-20 rounded-full flex items-center justify-center", report.status === "open" ? "bg-red-100" : "bg-green-100")}>
          <Icon className={cn("w-10 h-10", report.status === "open" ? "text-red-600" : "text-green-600")} />
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/lost-found">
            <Button size="icon" variant="ghost" className="w-9 h-9 -ml-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{report.title}</h1>
            {report.name && <p className="text-sm text-muted-foreground">{report.name}</p>}
          </div>
          <Badge className={cn("text-xs border", statusColor[report.status])}>{report.status}</Badge>
        </div>

        <Card>
          <CardContent className="py-4 px-4 space-y-3">
            {report.age && (
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>Age: {report.age} {report.gender && `• ${report.gender}`}</span>
              </div>
            )}
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Last seen at</p>
                <p className="font-medium">{report.lastSeenLocation}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{new Date(report.lastSeenTime).toLocaleString("en-IN")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 px-4">
            <p className="text-xs text-muted-foreground uppercase font-medium mb-2">Description</p>
            <p className="text-sm leading-relaxed">{report.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 px-4 space-y-3">
            <p className="text-xs text-muted-foreground uppercase font-medium">Contact</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{report.contactName}</p>
                <p className="text-xs text-muted-foreground">{report.contactPhone}</p>
              </div>
              <a href={`tel:${report.contactPhone}`}>
                <Button size="sm" className="gap-2">
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {report.status === "open" && (
          <Button
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => resolveMutation.mutate({ reportId })}
            disabled={resolveMutation.isPending}
          >
            <CheckCircle className="w-4 h-4" />
            Mark as Found / Resolved
          </Button>
        )}
      </div>
    </div>
  );
}
