import { useState } from "react";
import { useListServices, useGetCrowdHeatmap, useListCrowdZones } from "@workspace/api-client-react";
import { getListServicesQueryKey, getGetCrowdHeatmapQueryKey, getListCrowdZonesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Phone, Clock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const serviceTypes = [
  { value: "", label: "All" },
  { value: "hospital", label: "Hospital" },
  { value: "medical_camp", label: "Medical" },
  { value: "police", label: "Police" },
  { value: "toilet", label: "Toilet" },
  { value: "food", label: "Food" },
  { value: "parking", label: "Parking" },
  { value: "bus_stand", label: "Bus Stand" },
  { value: "ghat", label: "Ghat" },
  { value: "lost_found_center", label: "Lost & Found" },
];

const typeColor: Record<string, string> = {
  hospital: "bg-red-100 text-red-700",
  medical_camp: "bg-pink-100 text-pink-700",
  police: "bg-blue-100 text-blue-700",
  toilet: "bg-gray-100 text-gray-700",
  food: "bg-amber-100 text-amber-700",
  parking: "bg-purple-100 text-purple-700",
  bus_stand: "bg-indigo-100 text-indigo-700",
  ghat: "bg-cyan-100 text-cyan-700",
  lost_found_center: "bg-orange-100 text-orange-700",
};

export default function Map() {
  const [serviceType, setServiceType] = useState("");

  const { data: services, isLoading: svcLoading } = useListServices(
    { type: serviceType || undefined },
    { query: { queryKey: getListServicesQueryKey({ type: serviceType || undefined }) } }
  );

  const { data: crowdZones } = useListCrowdZones({ query: { queryKey: getListCrowdZonesQueryKey() } });
  const { data: heatmap } = useGetCrowdHeatmap({ query: { queryKey: getGetCrowdHeatmapQueryKey() } });

  return (
    <div className="space-y-4 p-4 pb-6">
      <div>
        <h1 className="text-xl font-bold">Mela Map</h1>
        <p className="text-sm text-muted-foreground">Navigate Kumbh Mela 2027</p>
      </div>

      {/* Map placeholder */}
      <div className="relative h-52 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900 to-blue-700 border border-blue-800">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80">
          <MapPin className="w-10 h-10 mb-2" />
          <p className="font-semibold text-sm">Prayagraj, Uttar Pradesh</p>
          <p className="text-xs opacity-70">25.4358° N, 81.8847° E</p>
          <p className="text-xs mt-2 opacity-60">Interactive map coming soon</p>
        </div>
        {/* Crowd heatmap dots */}
        {heatmap?.slice(0, 3).map((pt, i) => (
          <div key={i} className="absolute w-8 h-8 rounded-full opacity-50"
            style={{
              backgroundColor: pt.weight > 0.8 ? "#ef4444" : pt.weight > 0.5 ? "#f97316" : "#22c55e",
              top: `${20 + i * 25}%`,
              left: `${20 + i * 22}%`,
              filter: "blur(4px)",
            }}
          />
        ))}
        <a
          href="https://maps.google.com/maps?q=Triveni+Sangam,Prayagraj"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3"
        >
          <div className="bg-white text-xs font-medium text-gray-900 px-3 py-1.5 rounded-full shadow-md">
            Open Google Maps
          </div>
        </a>
      </div>

      {/* Heatmap legend */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="font-medium">Crowd density:</span>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /><span>Low</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500" /><span>High</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /><span>Critical</span></div>
      </div>

      {/* Service filter */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-semibold">Nearby Services</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {serviceTypes.map((t) => (
            <button key={t.value} onClick={() => setServiceType(t.value)}
              className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                serviceType === t.value ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border"
              )}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services list */}
      {svcLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : services && services.length > 0 ? (
        <div className="space-y-2">
          {services.map((svc) => (
            <Card key={svc.id} className="border-border/50">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", typeColor[svc.type] || "bg-gray-100")}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{svc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className={cn("text-[10px]", typeColor[svc.type] || "bg-gray-100")}>
                        {svc.type.replace("_", " ")}
                      </Badge>
                      {svc.openHours && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />{svc.openHours}
                        </span>
                      )}
                    </div>
                    {svc.address && <p className="text-xs text-muted-foreground mt-0.5 truncate">{svc.address}</p>}
                  </div>
                  {svc.phone && (
                    <a href={`tel:${svc.phone}`} className="shrink-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-primary" />
                      </div>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No services found</p>
        </div>
      )}
    </div>
  );
}
