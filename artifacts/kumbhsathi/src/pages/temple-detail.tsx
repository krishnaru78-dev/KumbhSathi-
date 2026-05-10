import { useRoute } from "wouter";
import { useGetTemple, useBookmarkTemple, useRemoveTempleBookmark } from "@workspace/api-client-react";
import { getGetTempleQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { MapPin, Clock, Bookmark, BookmarkCheck, ArrowLeft, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

const crowdColor: Record<string, string> = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

export default function TempleDetail() {
  const [, params] = useRoute("/temples/:id");
  const templeId = params?.id || "";
  const [isBookmarked, setIsBookmarked] = useState(false);
  const qc = useQueryClient();

  const { data: temple, isLoading } = useGetTemple(templeId, {
    query: { queryKey: getGetTempleQueryKey(templeId), enabled: !!templeId },
  });

  const bookmarkMutation = useBookmarkTemple({
    mutation: {
      onSuccess: () => setIsBookmarked(true),
    },
  });

  const removeBookmarkMutation = useRemoveTempleBookmark({
    mutation: {
      onSuccess: () => setIsBookmarked(false),
    },
  });

  const toggleBookmark = () => {
    if (isBookmarked) {
      removeBookmarkMutation.mutate({ templeId });
    } else {
      bookmarkMutation.mutate({ templeId });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  if (!temple) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mb-3" />
        <p className="font-medium">Temple not found</p>
        <Link href="/temples" className="text-primary text-sm mt-2">Back to temples</Link>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Header image area */}
      <div className="relative h-48 bg-gradient-to-br from-primary/30 via-secondary/20 to-primary/10 flex items-center justify-center">
        <span className="text-7xl font-bold text-primary/40">{temple.name[0]}</span>
        <div className="absolute top-4 left-4">
          <Link href="/temples">
            <Button size="icon" variant="secondary" className="w-9 h-9 rounded-full shadow">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="absolute top-4 right-4">
          <Button size="icon" variant="secondary" className="w-9 h-9 rounded-full shadow" onClick={toggleBookmark}>
            {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Title */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold">{temple.name}</h1>
              <p className="text-base text-muted-foreground">{temple.nameHindi}</p>
            </div>
            {temple.crowdLevel && (
              <Badge className={cn("text-xs border shrink-0", crowdColor[temple.crowdLevel])}>
                {temple.crowdLevel} crowd
              </Badge>
            )}
          </div>
        </div>

        {/* Key info */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/50">
            <CardContent className="py-3 px-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Timings</span>
              </div>
              <p className="text-sm font-semibold">{temple.timings}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="py-3 px-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Location</span>
              </div>
              <p className="text-sm font-semibold line-clamp-2">{temple.address}</p>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card className="border-border/50">
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-primary" />
              <p className="font-semibold text-sm">About</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{temple.description}</p>
          </CardContent>
        </Card>

        {/* History */}
        {temple.history && (
          <Card className="border-border/50">
            <CardContent className="py-4 px-4">
              <p className="font-semibold text-sm mb-2">History</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{temple.history}</p>
            </CardContent>
          </Card>
        )}

        {/* Rules */}
        {temple.rules && temple.rules.length > 0 && (
          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800">
            <CardContent className="py-4 px-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="font-semibold text-sm text-amber-800 dark:text-amber-200">Rules & Guidelines</p>
              </div>
              <ul className="space-y-1.5">
                {temple.rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                    <span className="mt-0.5 text-amber-500">{i + 1}.</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Directions button */}
        <a
          href={`https://maps.google.com/maps?q=${temple.lat},${temple.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button className="w-full" variant="outline">
            <MapPin className="w-4 h-4 mr-2" />
            Get Directions
          </Button>
        </a>
      </div>
    </div>
  );
}
