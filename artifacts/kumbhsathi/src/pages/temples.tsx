import { useState } from "react";
import { useListTemples } from "@workspace/api-client-react";
import { getListTemplesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Search, MapPin, Clock, Bookmark, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const crowdColor: Record<string, string> = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

const categoryColors: Record<string, string> = {
  temple: "bg-purple-100 text-purple-700",
  ghat: "bg-blue-100 text-blue-700",
  ashram: "bg-green-100 text-green-700",
};

export default function Temples() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { data: temples, isLoading } = useListTemples(
    { search: search || undefined, category: category || undefined },
    { query: { queryKey: getListTemplesQueryKey({ search: search || undefined, category: category || undefined }) } }
  );

  const categories = [
    { value: "", label: "All" },
    { value: "temple", label: "Mandir" },
    { value: "ghat", label: "Ghat" },
    { value: "ashram", label: "Ashram" },
  ];

  return (
    <div className="space-y-4 p-4 pb-6">
      <div>
        <h1 className="text-xl font-bold">Temple Explorer</h1>
        <p className="text-sm text-muted-foreground">Discover sacred sites at Kumbh Mela 2027</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search temples..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
              category === cat.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/50"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Temple grid */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : temples && temples.length > 0 ? (
        <div className="space-y-3">
          {temples.map((temple) => (
            <Link key={temple.id} href={`/temples/${temple.id}`}>
              <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="py-4 px-4">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                      <span className="text-2xl font-bold text-primary">{temple.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm leading-tight">{temple.name}</p>
                          <p className="text-xs text-muted-foreground">{temple.nameHindi}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{temple.description}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{temple.timings}</span>
                        </div>
                        {temple.crowdLevel && (
                          <Badge className={cn("text-[10px] border", crowdColor[temple.crowdLevel])}>
                            {temple.crowdLevel}
                          </Badge>
                        )}
                        {temple.category && (
                          <Badge className={cn("text-[10px]", categoryColors[temple.category] || "bg-gray-100 text-gray-700")}>
                            {temple.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">No temples found</p>
          <p className="text-sm text-muted-foreground">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
