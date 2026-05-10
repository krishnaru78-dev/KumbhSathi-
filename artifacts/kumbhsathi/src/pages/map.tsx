import { useState, useEffect, useRef } from "react";
import { useListServices } from "@workspace/api-client-react";
import { getListServicesQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Navigation, Search, Filter, X, LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";

// Nashik Kumbh coordinates
const NASHIK_CENTER: [number, number] = [20.0050, 73.7895];

const serviceTypes = [
  { value: "", label: "All", color: "#6b7280" },
  { value: "ghat", label: "Ghats", color: "#06b6d4" },
  { value: "temple", label: "Temples", color: "#8b5cf6" },
  { value: "hospital", label: "Hospital", color: "#ef4444" },
  { value: "medical_camp", label: "Medical", color: "#f97316" },
  { value: "police", label: "Police", color: "#3b82f6" },
  { value: "toilet", label: "Toilets", color: "#6b7280" },
  { value: "food", label: "Food", color: "#f59e0b" },
  { value: "parking", label: "Parking", color: "#8b5cf6" },
  { value: "bus_stand", label: "Bus Stand", color: "#10b981" },
  { value: "lost_found_center", label: "Lost & Found", color: "#ec4899" },
];

const typeColor: Record<string, string> = {
  hospital: "bg-red-100 text-red-700 border-red-200",
  medical_camp: "bg-orange-100 text-orange-700 border-orange-200",
  police: "bg-blue-100 text-blue-700 border-blue-200",
  toilet: "bg-gray-100 text-gray-700 border-gray-200",
  food: "bg-amber-100 text-amber-700 border-amber-200",
  parking: "bg-purple-100 text-purple-700 border-purple-200",
  bus_stand: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ghat: "bg-cyan-100 text-cyan-700 border-cyan-200",
  temple: "bg-violet-100 text-violet-700 border-violet-200",
  lost_found_center: "bg-pink-100 text-pink-700 border-pink-200",
};

const typeEmoji: Record<string, string> = {
  hospital: "🏥", medical_camp: "🩺", police: "👮", toilet: "🚻",
  food: "🍽️", parking: "🅿️", bus_stand: "🚌", ghat: "🛕",
  temple: "🛕", lost_found_center: "🔍",
};

declare global {
  interface Window { L: any }
}

export default function MapPage() {
  const [serviceType, setServiceType] = useState("");
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showList, setShowList] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data: services, isLoading } = useListServices(
    { type: serviceType || undefined },
    { query: { queryKey: getListServicesQueryKey({ type: serviceType || undefined }) } }
  );

  const filteredServices = services?.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  // Load Leaflet CSS + JS
  useEffect(() => {
    if (document.getElementById("leaflet-css")) { setMapLoaded(true); return; }
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || leafletMap.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, {
      center: NASHIK_CENTER,
      zoom: 15,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
    leafletMap.current = map;
    // Add Ramkund label
    L.marker(NASHIK_CENTER, {
      icon: L.divIcon({
        html: `<div style="background:#ea580c;color:white;padding:4px 8px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3)">📍 Ramkund Ghat</div>`,
        className: "", iconAnchor: [60, 12],
      }),
    }).addTo(map);
  }, [mapLoaded]);

  // Sync markers with filtered services
  useEffect(() => {
    if (!leafletMap.current || !window.L) return;
    const L = window.L;
    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    // Add new markers
    filteredServices.forEach(svc => {
      if (!svc.lat || !svc.lng) return;
      const cfg = serviceTypes.find(t => t.value === svc.type);
      const color = cfg?.color || "#6b7280";
      const emoji = typeEmoji[svc.type] || "📍";
      const icon = L.divIcon({
        html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);font-size:14px">${emoji}</div>`,
        className: "", iconSize: [32, 32], iconAnchor: [16, 16],
      });
      const marker = L.marker([svc.lat, svc.lng], { icon }).addTo(leafletMap.current);
      marker.bindPopup(`
        <div style="min-width:180px">
          <p style="font-weight:600;margin:0 0 4px">${svc.name}</p>
          <p style="font-size:12px;color:#666;margin:0 0 4px">${svc.address || ""}</p>
          ${svc.phone ? `<a href="tel:${svc.phone}" style="color:#ea580c;font-size:12px">📞 ${svc.phone}</a>` : ""}
        </div>
      `);
      marker.on("click", () => setSelectedService(svc));
      markersRef.current.push(marker);
    });
  }, [filteredServices, mapLoaded]);

  const locateUser = () => {
    if (!navigator.geolocation || !leafletMap.current || !window.L) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      const L = window.L;
      if (userMarkerRef.current) userMarkerRef.current.remove();
      userMarkerRef.current = L.marker([latitude, longitude], {
        icon: L.divIcon({
          html: `<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></div>`,
          className: "", iconSize: [16, 16], iconAnchor: [8, 8],
        }),
      }).addTo(leafletMap.current);
      leafletMap.current.setView([latitude, longitude], 16);
    });
  };

  const flyToService = (svc: any) => {
    if (!leafletMap.current) return;
    leafletMap.current.setView([svc.lat, svc.lng], 17, { animate: true });
    setSelectedService(svc);
    setShowList(false);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-112px)] overflow-hidden">
      {/* Search bar */}
      <div className="px-4 pt-3 pb-2 bg-background border-b space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search services, ghats, temples..."
            className="pl-9 pr-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        {/* Category filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {serviceTypes.map(t => (
            <button key={t.value} onClick={() => setServiceType(t.value)}
              className={cn(
                "shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all",
                serviceType === t.value
                  ? "text-white border-transparent"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              )}
              style={serviceType === t.value ? { backgroundColor: t.color, borderColor: t.color } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1">
        {!mapLoaded && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-2 animate-bounce" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />

        {/* Locate me button */}
        <button
          onClick={locateUser}
          className="absolute top-3 right-3 z-[1000] w-10 h-10 bg-background rounded-full shadow-lg border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <LocateFixed className="w-5 h-5 text-primary" />
        </button>

        {/* List toggle */}
        <button
          onClick={() => setShowList(!showList)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-primary text-primary-foreground px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium"
        >
          <Filter className="w-4 h-4" />
          {showList ? "Show Map" : `List (${filteredServices.length})`}
        </button>

        {/* Selected service popup */}
        {selectedService && !showList && (
          <div className="absolute bottom-16 left-4 right-4 z-[1000] bg-background rounded-2xl shadow-xl border p-4">
            <div className="flex items-start gap-3">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl", typeColor[selectedService.type] || "bg-muted")}>
                {typeEmoji[selectedService.type] || "📍"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{selectedService.name}</p>
                {selectedService.address && <p className="text-xs text-muted-foreground mt-0.5 truncate">{selectedService.address}</p>}
                {selectedService.openHours && <p className="text-xs text-green-600 mt-0.5">Open: {selectedService.openHours}</p>}
                <div className="flex gap-2 mt-2">
                  {selectedService.phone && (
                    <a href={`tel:${selectedService.phone}`}>
                      <Button size="sm" className="h-7 text-xs gap-1">
                        <Phone className="w-3 h-3" />Call
                      </Button>
                    </a>
                  )}
                  <a href={`https://maps.google.com/maps?q=${selectedService.lat},${selectedService.lng}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                      <Navigation className="w-3 h-3" />Navigate
                    </Button>
                  </a>
                </div>
              </div>
              <button onClick={() => setSelectedService(null)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List overlay */}
      {showList && (
        <div className="absolute bottom-0 left-0 right-0 max-w-md mx-auto z-[999] bg-background rounded-t-2xl shadow-xl border-t h-[65%] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <p className="font-semibold text-sm">{filteredServices.length} Services Found</p>
            <button onClick={() => setShowList(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No services found</p>
              </div>
            ) : filteredServices.map(svc => (
              <Card key={svc.id} className="border-border/50 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all" onClick={() => flyToService(svc)}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg", typeColor[svc.type] || "bg-muted")}>
                      {typeEmoji[svc.type] || "📍"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{svc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={cn("text-[10px] border", typeColor[svc.type] || "bg-muted")}>
                          {svc.type.replace("_", " ")}
                        </Badge>
                        {svc.openHours && <span className="text-xs text-green-600 truncate">{svc.openHours}</span>}
                      </div>
                      {svc.address && <p className="text-xs text-muted-foreground mt-0.5 truncate">{svc.address}</p>}
                    </div>
                    {svc.phone && (
                      <a href={`tel:${svc.phone}`} onClick={e => e.stopPropagation()}>
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
        </div>
      )}
    </div>
  );
}
