import { useState } from "react";
import { useGetAdminStats, useListSOSIncidents, useListAlerts, useCreateAlert, useDeleteAlert, useListUsers, useListLostFoundReports, useApproveLostFoundReport, useListCrowdZones, useUpdateCrowdZone } from "@workspace/api-client-react";
import { getGetAdminStatsQueryKey, getListSOSIncidentsQueryKey, getListAlertsQueryKey, getListLostFoundReportsQueryKey, getListCrowdZonesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { Users, AlertTriangle, Search, Activity, Bell, CheckCircle, Trash2, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const crowdLevels = ["low", "medium", "high", "critical"];
const crowdLevelColor: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function Admin() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });
  const { data: sos } = useListSOSIncidents({ query: { queryKey: getListSOSIncidentsQueryKey() } });
  const { data: alertsData } = useListAlerts({}, { query: { queryKey: getListAlertsQueryKey({}) } });
  const { data: lostReports } = useListLostFoundReports({ status: "open" }, { query: { queryKey: getListLostFoundReportsQueryKey({ status: "open" }) } });
  const { data: zones } = useListCrowdZones({ query: { queryKey: getListCrowdZonesQueryKey() } });

  const [alertForm, setAlertForm] = useState({ title: "", message: "", type: "announcement", severity: "info" });

  const createAlertMutation = useCreateAlert({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListAlertsQueryKey({}) });
        setAlertForm({ title: "", message: "", type: "announcement", severity: "info" });
        toast({ title: "Alert created" });
      },
    },
  });

  const deleteAlertMutation = useDeleteAlert({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getListAlertsQueryKey({}) }),
    },
  });

  const approveMutation = useApproveLostFoundReport({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListLostFoundReportsQueryKey({ status: "open" }) });
        toast({ title: "Report approved" });
      },
    },
  });

  const updateZoneMutation = useUpdateCrowdZone({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getListCrowdZonesQueryKey() }),
    },
  });

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-blue-600" },
    { label: "Active SOS", value: stats?.activeSOSCount, icon: AlertTriangle, color: "text-red-600" },
    { label: "Open Lost", value: stats?.openLostCount, icon: Search, color: "text-amber-600" },
    { label: "Active Alerts", value: stats?.activeAlerts, icon: Bell, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-4 p-4 pb-6">
      <div>
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Kumbh Mela 2027 Operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="py-4 px-4">
              {statsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="flex items-center gap-3">
                  <s.icon className={cn("w-6 h-6", s.color)} />
                  <div>
                    <p className="text-2xl font-bold">{s.value ?? 0}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="alerts">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="alerts" className="text-xs">Alerts</TabsTrigger>
          <TabsTrigger value="crowd" className="text-xs">Crowd</TabsTrigger>
          <TabsTrigger value="sos" className="text-xs">SOS</TabsTrigger>
          <TabsTrigger value="lostfound" className="text-xs">Lost+Found</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Plus className="w-4 h-4" />Broadcast Alert</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-3">
              <Input placeholder="Title" value={alertForm.title} onChange={(e) => setAlertForm((f) => ({ ...f, title: e.target.value }))} />
              <Input placeholder="Message" value={alertForm.message} onChange={(e) => setAlertForm((f) => ({ ...f, message: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <select value={alertForm.severity} onChange={(e) => setAlertForm((f) => ({ ...f, severity: e.target.value }))} className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Danger</option>
                  <option value="critical">Critical</option>
                </select>
                <select value={alertForm.type} onChange={(e) => setAlertForm((f) => ({ ...f, type: e.target.value }))} className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="announcement">Announcement</option>
                  <option value="crowd">Crowd</option>
                  <option value="weather">Weather</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <Button className="w-full" disabled={createAlertMutation.isPending || !alertForm.title}
                onClick={() => createAlertMutation.mutate({ data: { ...alertForm } })}>
                {createAlertMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Broadcast
              </Button>
            </CardContent>
          </Card>

          <p className="text-xs font-semibold text-muted-foreground uppercase">Active Alerts</p>
          {alertsData?.filter((a) => a.isActive).map((alert) => (
            <Card key={alert.id} className="border-border/50">
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                    <Badge className="text-[10px] mt-1">{alert.severity}</Badge>
                  </div>
                  <Button size="icon" variant="ghost" className="w-8 h-8 shrink-0"
                    onClick={() => deleteAlertMutation.mutate({ alertId: alert.id })}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="crowd" className="space-y-3 mt-4">
          {zones?.map((zone) => (
            <Card key={zone.id} className="border-border/50">
              <CardContent className="py-3 px-4">
                <p className="font-medium text-sm mb-2">{zone.name}</p>
                <div className="flex gap-2 flex-wrap">
                  {crowdLevels.map((lvl) => (
                    <button key={lvl} onClick={() => updateZoneMutation.mutate({ zoneId: zone.id, data: { level: lvl } })}
                      className={cn("px-3 py-1 rounded-full text-xs font-medium transition-all capitalize",
                        zone.level === lvl ? crowdLevelColor[lvl] : "bg-muted text-muted-foreground"
                      )}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sos" className="space-y-3 mt-4">
          {sos && sos.length === 0 && (
            <div className="text-center py-8"><p className="text-muted-foreground text-sm">No active SOS incidents</p></div>
          )}
          {sos?.map((incident) => (
            <Card key={incident.id} className="border-red-200 bg-red-50 dark:bg-red-900/10">
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">SOS #{incident.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">Lat: {incident.lat}, Lng: {incident.lng}</p>
                    {incident.message && <p className="text-xs mt-1">{incident.message}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(incident.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  <Badge className="text-xs bg-red-100 text-red-700 border-red-200">{incident.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="lostfound" className="space-y-3 mt-4">
          {lostReports?.reports.length === 0 && (
            <div className="text-center py-8"><p className="text-muted-foreground text-sm">No pending reports</p></div>
          )}
          {lostReports?.reports.filter((r) => !r.isApproved).map((report) => (
            <Card key={report.id} className="border-border/50">
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{report.title}</p>
                    {report.name && <p className="text-xs text-muted-foreground">{report.name}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">{report.lastSeenLocation}</p>
                    <Badge className="text-[10px] mt-1 capitalize">{report.type}</Badge>
                  </div>
                  <Button size="sm" className="gap-1 shrink-0 bg-green-600 hover:bg-green-700"
                    onClick={() => approveMutation.mutate({ reportId: report.id })}>
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
