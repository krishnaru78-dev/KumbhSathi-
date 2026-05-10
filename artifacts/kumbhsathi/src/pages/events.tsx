import { useState } from "react";
import { useListEvents, useGetBathingDates } from "@workspace/api-client-react";
import { getListEventsQueryKey, getGetBathingDatesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Clock, Star, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });
}

function formatTime(d: string | Date): string {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function timeUntil(dateStr: string | Date): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return "Ended";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  if (d > 0) return `${d}d ${h}h`;
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const importanceColor: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const typeIcon: Record<string, React.ComponentType<any>> = {
  aarti: Star,
  bathing: Droplets,
  procession: Calendar,
  ritual: Calendar,
};

export default function Events() {
  const [eventType, setEventType] = useState("all");

  const { data: events, isLoading: eventsLoading } = useListEvents(
    { type: eventType !== "all" ? eventType : undefined },
    { query: { queryKey: getListEventsQueryKey({ type: eventType !== "all" ? eventType : undefined }) } }
  );

  const { data: bathingDates, isLoading: bathingLoading } = useGetBathingDates({
    query: { queryKey: getGetBathingDatesQueryKey() },
  });

  const types = [
    { value: "all", label: "All" },
    { value: "bathing", label: "Snan" },
    { value: "aarti", label: "Aarti" },
    { value: "procession", label: "Procession" },
    { value: "ritual", label: "Ritual" },
  ];

  return (
    <div className="space-y-4 p-4 pb-6">
      <div>
        <h1 className="text-xl font-bold">Events & Schedule</h1>
        <p className="text-sm text-muted-foreground">Kumbh Mela 2027 complete schedule</p>
      </div>

      <Tabs defaultValue="events">
        <TabsList className="w-full">
          <TabsTrigger value="events" className="flex-1">Upcoming Events</TabsTrigger>
          <TabsTrigger value="bathing" className="flex-1">Bathing Dates</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-3 mt-4">
          {/* Type filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {types.map((t) => (
              <button
                key={t.value}
                onClick={() => setEventType(t.value)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  eventType === t.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {eventsLoading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          ) : events && events.length > 0 ? (
            events.map((event) => {
              const Icon = typeIcon[event.type || "ritual"] || Calendar;
              return (
                <Card key={event.id} className={cn("border-border/50", event.isShahiSnan && "border-primary/30 bg-primary/5")}>
                  <CardContent className="py-4 px-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        event.isShahiSnan ? "bg-primary/20" : "bg-muted"
                      )}>
                        <Icon className={cn("w-6 h-6", event.isShahiSnan ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.titleHindi}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-primary">{timeUntil(event.startTime)}</p>
                            {event.isShahiSnan && (
                              <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 mt-1">Shahi Snan</Badge>
                            )}
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(event.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(event.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[80px]">{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No events found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="bathing" className="space-y-3 mt-4">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-xs text-primary font-medium text-center">
              Kumbh Mela 2027 — Prayagraj, Jan 13 – Feb 26
            </p>
          </div>
          {bathingLoading ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : bathingDates?.map((date) => (
            <Card key={date.id} className={cn("border-border/50", date.isShahiSnan && "border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5")}>
              <CardContent className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0",
                    date.isShahiSnan ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <span className="text-lg font-bold leading-none">
                      {new Date(date.date).getDate()}
                    </span>
                    <span className="text-[10px] uppercase font-medium">
                      {new Date(date.date).toLocaleDateString("en-IN", { month: "short" })}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{date.name}</p>
                      {date.isShahiSnan && (
                        <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">Royal Bath</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{date.nameHindi}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{date.significance}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-muted-foreground">Expected crowd:</span>
                      <span className={cn("text-xs font-medium",
                        date.expectedCrowd === "extreme" ? "text-red-600" :
                        date.expectedCrowd === "very_high" ? "text-orange-600" : "text-amber-600"
                      )}>
                        {(date.expectedCrowd || "high").replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
