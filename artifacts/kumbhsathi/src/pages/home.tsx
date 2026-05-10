import { useGetDashboardSummary, useGetActiveAlerts, useGetUpcomingEvents } from "@workspace/api-client-react";
import { getGetDashboardSummaryQueryKey, getGetActiveAlertsQueryKey, getGetUpcomingEventsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { MapPin, Calendar, Users, AlertTriangle, Search, Bot, CloudSun, Clock, ChevronRight, Hotel, Flame } from "lucide-react";
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
  if (diff < 0) return "Live";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  if (d > 0) return `${d}d ${h}h`;
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Home() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: alerts } = useGetActiveAlerts({ query: { queryKey: getGetActiveAlertsQueryKey() } });
  const { data: events } = useGetUpcomingEvents({ query: { queryKey: getGetUpcomingEventsQueryKey() } });

  const crowdLevel = summary?.crowdLevel ?? "low";

  const quickActions = [
    { href: "/map", icon: MapPin, label: "Map", sub: "Live navigation" },
    { href: "/temples", icon: Flame, label: "Temples", sub: "Mandirs & Ghats" },
    { href: "/lost-found", icon: Search, label: "Lost & Found", sub: "Find missing" },
    { href: "/events", icon: Calendar, label: "Snan Dates", sub: "Shahi Snan" },
    { href: "/crowd", icon: Users, label: "Crowd", sub: "Zone status" },
    { href: "/hotels", icon: Hotel, label: "Stays", sub: "Hotels nearby" },
    { href: "/ai", icon: Bot, label: "AI Guide", sub: "Ask anything" },
    { href: "/emergency", icon: AlertTriangle, label: "Emergency", sub: "SOS & Helplines" },
  ];

  return (
    <div className="space-y-4 p-4 pb-6">
      {/* Kumbh branding strip */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nashik Simhastha</p>
          <h2 className="text-lg font-bold leading-tight">Kumbh Mela 2027</h2>
        </div>
        <Badge className="text-xs bg-primary/10 text-primary border-primary/20 font-medium">
          Maharashtra
        </Badge>
      </div>

      {/* Alert ticker */}
      {alerts && alerts.length > 0 && (
        <Link href="/admin">
          <div className="overflow-hidden rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 cursor-pointer">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-200 font-medium line-clamp-1 flex-1">
                {alerts[0].title}: {alerts[0].message}
              </p>
              <span className="text-[10px] bg-amber-200 text-amber-800 rounded-full px-2 py-0.5 shrink-0 font-medium">
                {alerts.length} alert{alerts.length > 1 ? "s" : ""}
              </span>
              <ChevronRight className="w-4 h-4 text-amber-600 shrink-0" />
            </div>
          </div>
        </Link>
      )}

      {/* Crowd level hero */}
      {summaryLoading ? (
        <Skeleton className="h-36 rounded-2xl" />
      ) : (
        <div className={cn("rounded-2xl bg-gradient-to-br p-5 border shadow-sm", crowdBg[crowdLevel])}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ramkund Crowd</p>
              <p className="text-3xl font-bold mt-1 capitalize">{crowdLevel}</p>
              <p className="text-sm text-muted-foreground mt-1">
                ~{summary?.crowdCount?.toLocaleString()} pilgrims today
              </p>
            </div>
            <Badge className={cn("text-xs border font-semibold", crowdColor[crowdLevel])}>
              {crowdLevel.toUpperCase()}
            </Badge>
          </div>
          <div className="flex gap-5 mt-4 pt-4 border-t border-border/30">
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
        <Card className="border-border/50 shadow-sm">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CloudSun className="w-9 h-9 text-amber-500" />
                <div>
                  <p className="font-semibold text-xl">{summary.weather.temperature}°C</p>
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

      {/* Quick actions grid */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Access</p>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href}>
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-muted/50 active:bg-muted transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <a.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-[10px] font-semibold text-center leading-tight">{a.label}</p>
                <p className="text-[9px] text-muted-foreground text-center leading-tight hidden sm:block">{a.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming events */}
      {events && events.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Upcoming Events</p>
            <Link href="/events" className="text-xs text-primary font-medium">See all</Link>
          </div>
          <div className="space-y-2">
            {events.slice(0, 3).map((event) => (
              <Link key={event.id} href="/events">
                <Card className={cn("border-border/50 hover:shadow-sm transition-all cursor-pointer", event.isShahiSnan && "border-primary/30 bg-primary/5")}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", event.isShahiSnan ? "bg-primary/15" : "bg-muted")}>
                        <Calendar className={cn("w-5 h-5", event.isShahiSnan ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{event.titleHindi}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate">{event.location}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-primary">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs font-bold">{timeUntil(event.startTime)}</span>
                        </div>
                        {event.isShahiSnan && (
                          <Badge className="text-[9px] mt-1 bg-primary/10 text-primary border-primary/20">Shahi Snan</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* AI guide promo */}
      <Link href="/ai">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 hover:shadow-md transition-all cursor-pointer">
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Kumbh AI Guide</p>
                <p className="text-xs text-muted-foreground">Ask about temples, ghats, safety — Hindi, Marathi, English</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Key info strip */}
      <Card className="border-border/50 bg-muted/30">
        <CardContent className="py-3 px-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs font-bold text-primary">Ramkund</p>
              <p className="text-[10px] text-muted-foreground">Main Ghat</p>
            </div>
            <div>
              <p className="text-xs font-bold text-primary">Jul–Sep 2027</p>
              <p className="text-[10px] text-muted-foreground">Simhastha Kumbh</p>
            </div>
            <div>
              <p className="text-xs font-bold text-primary">Godavari</p>
              <p className="text-[10px] text-muted-foreground">Sacred River</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
