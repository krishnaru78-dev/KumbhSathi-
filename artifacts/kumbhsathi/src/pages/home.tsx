import { useGetDashboardSummary, useGetActiveAlerts, useGetUpcomingEvents } from "@workspace/api-client-react";
import { getGetDashboardSummaryQueryKey, getGetActiveAlertsQueryKey, getGetUpcomingEventsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { MapPin, Calendar, Users, AlertTriangle, Search, Bot, CloudSun, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const crowdColor: Record<string, string> = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

const crowdBg: Record<string, string> = {
  low: "from-green-500/10 to-green-600/5",
  medium: "from-amber-500/10 to-amber-600/5",
  high: "from-orange-500/10 to-orange-600/5",
  critical: "from-red-500/10 to-red-600/5",
};

function timeUntil(dateStr: string | Date): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return "Started";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Home() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: alerts } = useGetActiveAlerts({ query: { queryKey: getGetActiveAlertsQueryKey() } });
  const { data: events } = useGetUpcomingEvents({ query: { queryKey: getGetUpcomingEventsQueryKey() } });

  const crowdLevel = summary?.crowdLevel ?? "low";

  const quickActions = [
    { href: "/map", icon: MapPin, label: "Map", sub: "Navigate mela" },
    { href: "/lost-found", icon: Search, label: "Lost & Found", sub: "Find missing" },
    { href: "/temples", icon: Users, label: "Temples", sub: "Explore mandirs" },
    { href: "/events", icon: Calendar, label: "Schedule", sub: "Snan dates" },
    { href: "/crowd", icon: Users, label: "Crowd", sub: "Zone status" },
    { href: "/ai", icon: Bot, label: "AI Guide", sub: "Ask anything" },
  ];

  return (
    <div className="space-y-4 p-4 pb-6">
      {/* Alert ticker */}
      {alerts && alerts.length > 0 && (
        <div className="overflow-hidden rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <div className="flex items-center gap-2 px-3 py-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-200 font-medium truncate">
              {alerts[0].title}: {alerts[0].message}
            </p>
            <Link href="/admin" className="ml-auto shrink-0">
              <ChevronRight className="w-4 h-4 text-amber-600" />
            </Link>
          </div>
        </div>
      )}

      {/* Crowd level hero */}
      {summaryLoading ? (
        <Skeleton className="h-36 rounded-2xl" />
      ) : (
        <div className={cn("rounded-2xl bg-gradient-to-br p-5 border", crowdBg[crowdLevel])}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Overall Crowd</p>
              <p className="text-3xl font-bold mt-1 capitalize">{crowdLevel}</p>
              <p className="text-sm text-muted-foreground mt-1">
                ~{summary?.crowdCount?.toLocaleString()} pilgrims
              </p>
            </div>
            <Badge className={cn("text-xs border", crowdColor[crowdLevel])}>
              {crowdLevel.toUpperCase()}
            </Badge>
          </div>
          <div className="flex gap-4 mt-4 pt-4 border-t border-border/30">
            <div className="text-center">
              <p className="text-lg font-bold text-destructive">{summary?.activeSOSCount ?? 0}</p>
              <p className="text-xs text-muted-foreground">Active SOS</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">{summary?.activeAlerts ?? 0}</p>
              <p className="text-xs text-muted-foreground">Alerts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-primary">{summary?.openLostCount ?? 0}</p>
              <p className="text-xs text-muted-foreground">Missing</p>
            </div>
          </div>
        </div>
      )}

      {/* Weather */}
      {summary?.weather && (
        <Card className="border-border/50">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CloudSun className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="font-semibold text-lg">{summary.weather.temperature}°C</p>
                  <p className="text-xs text-muted-foreground">{summary.weather.condition}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{summary.weather.humidity}% humidity</p>
                <p className="text-xs text-muted-foreground">{summary.weather.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Access</p>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href}>
              <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="py-4 px-3 text-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                    <a.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs font-semibold leading-tight">{a.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.sub}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming events */}
      {events && events.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Upcoming Events</p>
            <Link href="/events" className="text-xs text-primary font-medium">See all</Link>
          </div>
          <div className="space-y-2">
            {events.slice(0, 3).map((event) => (
              <Card key={event.id} className="border-border/50">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{event.titleHindi}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">{event.location}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-primary">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs font-medium">{timeUntil(event.startTime)}</span>
                      </div>
                      {event.isShahiSnan && (
                        <Badge className="text-[10px] mt-1 bg-primary/10 text-primary border-primary/20">Shahi Snan</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI assistant promo */}
      <Link href="/ai">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 hover:shadow-md transition-all cursor-pointer">
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Ask Kumbh AI Guide</p>
                <p className="text-xs text-muted-foreground">Get answers in Hindi, English or Marathi</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
