import { useState } from "react";
import { useGetEmergencyContacts, useGetNearbyEmergencyServices, useTriggerSOS } from "@workspace/api-client-react";
import { getGetEmergencyContactsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Phone, AlertTriangle, MapPin, Clock, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Emergency() {
  const [sosActive, setSosActive] = useState(false);
  const [sosIncidentId, setSosIncidentId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: contacts, isLoading: contactsLoading } = useGetEmergencyContacts({
    query: { queryKey: getGetEmergencyContactsQueryKey() },
  });

  const { data: nearbyServices } = useGetNearbyEmergencyServices(
    { lat: 25.4358, lng: 81.8847 },
    { query: { queryKey: ["nearby-emergency", 25.4358, 81.8847] } }
  );

  const sosMutation = useTriggerSOS({
    mutation: {
      onSuccess: (data) => {
        setSosActive(true);
        setSosIncidentId(data.incidentId);
        toast({ title: "SOS Alert Sent!", description: "Emergency services have been notified. Help is on the way." });
      },
      onError: () => {
        toast({ title: "SOS Failed", description: "Please call 100 directly.", variant: "destructive" });
      },
    },
  });

  const handleSOS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sosMutation.mutate({ data: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
        },
        () => {
          sosMutation.mutate({ data: { lat: 25.4358, lng: 81.8847 } });
        }
      );
    } else {
      sosMutation.mutate({ data: { lat: 25.4358, lng: 81.8847 } });
    }
  };

  const severityColor: Record<string, string> = {
    police: "bg-blue-100 text-blue-700",
    ambulance: "bg-green-100 text-green-700",
    fire: "bg-red-100 text-red-700",
    helpline: "bg-purple-100 text-purple-700",
    women_helpline: "bg-pink-100 text-pink-700",
  };

  return (
    <div className="space-y-4 p-4 pb-6">
      <div className="text-center py-2">
        <h1 className="text-xl font-bold">Emergency Hub</h1>
        <p className="text-sm text-muted-foreground">Help is always available</p>
      </div>

      {/* Main SOS button */}
      <div className="flex flex-col items-center py-6">
        {sosActive ? (
          <div className="text-center space-y-3">
            <div className="w-32 h-32 rounded-full bg-green-100 border-8 border-green-200 flex items-center justify-center mx-auto">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>
            <p className="font-bold text-green-700 text-lg">SOS Alert Active</p>
            <p className="text-sm text-muted-foreground">ID: {sosIncidentId?.slice(0, 8)}</p>
            <Button variant="outline" onClick={() => { setSosActive(false); setSosIncidentId(null); }}>
              Cancel Alert
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <button
              onClick={handleSOS}
              disabled={sosMutation.isPending}
              className="w-36 h-36 rounded-full bg-destructive text-destructive-foreground flex flex-col items-center justify-center mx-auto shadow-2xl shadow-destructive/40 border-8 border-destructive/20 animate-pulse active:scale-95 transition-transform disabled:opacity-70"
            >
              {sosMutation.isPending ? (
                <Loader2 className="w-12 h-12 animate-spin" />
              ) : (
                <>
                  <AlertTriangle className="w-12 h-12" />
                  <span className="font-bold text-lg mt-1">SOS</span>
                </>
              )}
            </button>
            <p className="text-sm text-muted-foreground">Tap to send emergency alert</p>
            <p className="text-xs text-muted-foreground">Your location will be shared with responders</p>
          </div>
        )}
      </div>

      {/* Emergency hotlines */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            Emergency Hotlines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {contactsLoading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)
          ) : (
            contacts?.map((contact) => (
              <a key={contact.id} href={`tel:${contact.number}`} className="block">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all">
                  <div className="flex items-center gap-3">
                    <Badge className={`text-xs ${severityColor[contact.type] || "bg-gray-100 text-gray-700"}`}>
                      {contact.type.replace("_", " ")}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      {contact.available24x7 && <p className="text-xs text-green-600">24/7 available</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary text-lg">{contact.number}</span>
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </a>
            ))
          )}
        </CardContent>
      </Card>

      {/* Nearby emergency services */}
      {nearbyServices && nearbyServices.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Nearby Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {nearbyServices.slice(0, 4).map((svc) => (
              <div key={svc.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <div>
                  <p className="font-medium text-sm">{svc.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{svc.type.replace("_", " ")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">{svc.distance}m</p>
                  {svc.phone && (
                    <a href={`tel:${svc.phone}`} className="text-xs text-muted-foreground hover:text-primary">{svc.phone}</a>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Safety tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-primary">Safety Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Always stay with your group near ghats</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Carry a printed note with your camp address and phone number</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Know the nearest Lost & Found center location</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Avoid large crowds during peak hours (6-10 AM)</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Keep children's ID tag on wrist at all times</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
