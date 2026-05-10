import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Search, Star, MapPin, Phone, Navigation, Filter, X, ChevronRight, Wifi, Car, Utensils, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface Hotel {
  id: string;
  name: string;
  nameHindi: string;
  type: string;
  category: string;
  priceRange: string;
  priceMin: number;
  priceMax: number;
  rating: number;
  reviewCount: number;
  distance: number;
  distanceText: string;
  address: string;
  phone: string;
  amenities: string[];
  description: string;
  lat: number;
  lng: number;
  available: boolean;
}

const categories = [
  { value: "", label: "All" },
  { value: "hotel", label: "Hotels" },
  { value: "dharmashala", label: "Dharamshala" },
  { value: "guesthouse", label: "Guest House" },
  { value: "resort", label: "Resort" },
  { value: "camp", label: "Tent Camp" },
];

const categoryColor: Record<string, string> = {
  hotel: "bg-blue-100 text-blue-700 border-blue-200",
  dharmashala: "bg-amber-100 text-amber-700 border-amber-200",
  guesthouse: "bg-green-100 text-green-700 border-green-200",
  resort: "bg-purple-100 text-purple-700 border-purple-200",
  camp: "bg-orange-100 text-orange-700 border-orange-200",
};

const amenityIcon: Record<string, any> = {
  WiFi: Wifi, Parking: Car, Restaurant: Utensils, "Hot Water": Droplets,
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={cn("w-3 h-3", i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200")}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function Hotels() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  const { data: hotels, isLoading } = useQuery<Hotel[]>({
    queryKey: ["hotels", search, category, maxPrice],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (maxPrice > 0) params.set("maxPrice", String(maxPrice));
      const res = await fetch(`/api/hotels?${params}`);
      return res.json();
    },
  });

  const priceRanges = [
    { label: "All Prices", value: 0 },
    { label: "Under ₹500", value: 500 },
    { label: "Under ₹1500", value: 1500 },
    { label: "Under ₹3000", value: 3000 },
    { label: "Under ₹6000", value: 6000 },
  ];

  if (selectedHotel) {
    return (
      <div className="pb-6">
        {/* Header */}
        <div className="h-44 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
          <div className="text-center">
            <span className="text-5xl font-bold text-primary/30">{selectedHotel.name[0]}</span>
          </div>
          <button onClick={() => setSelectedHotel(null)} className="absolute top-4 left-4 w-9 h-9 bg-background/80 rounded-full flex items-center justify-center shadow">
            <X className="w-4 h-4" />
          </button>
          <Badge className={cn("absolute top-4 right-4 text-xs border", categoryColor[selectedHotel.category] || "bg-muted")}>
            {selectedHotel.category}
          </Badge>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h1 className="text-xl font-bold">{selectedHotel.name}</h1>
            <p className="text-sm text-muted-foreground">{selectedHotel.nameHindi}</p>
            <div className="flex items-center gap-3 mt-2">
              <StarRating rating={selectedHotel.rating} />
              <span className="text-xs text-muted-foreground">({selectedHotel.reviewCount} reviews)</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border/50">
              <CardContent className="py-3 px-3 text-center">
                <p className="text-xs text-muted-foreground">Price Range</p>
                <p className="font-bold text-primary text-sm mt-1">{selectedHotel.priceRange}</p>
                <p className="text-xs text-muted-foreground">per night</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="py-3 px-3 text-center">
                <p className="text-xs text-muted-foreground">Distance</p>
                <p className="font-bold text-sm mt-1">{selectedHotel.distanceText}</p>
              </CardContent>
            </Card>
          </div>
          <Card className="border-border/50">
            <CardContent className="py-4 px-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">About</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedHotel.description}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="py-4 px-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {selectedHotel.amenities.map(a => (
                  <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="py-4 px-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Location</p>
              <p className="text-sm text-muted-foreground">{selectedHotel.address}</p>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <a href={`tel:${selectedHotel.phone}`} className="flex-1">
              <Button className="w-full gap-2">
                <Phone className="w-4 h-4" />
                Call Hotel
              </Button>
            </a>
            <a
              href={`https://maps.google.com/maps?q=${selectedHotel.lat},${selectedHotel.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" className="w-full gap-2">
                <Navigation className="w-4 h-4" />
                Directions
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Hotels & Stays</h1>
          <p className="text-sm text-muted-foreground">Near Nashik Kumbh Mela 2027</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-1">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search hotels, dharamshalas..."
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

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button key={cat.value} onClick={() => setCategory(cat.value)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              category === cat.value ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border"
            )}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Price filter */}
      {showFilters && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-3 px-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Price Range (per night)</p>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map(p => (
                <button key={p.value} onClick={() => setMaxPrice(p.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    maxPrice === p.value ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border"
                  )}>
                  {p.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info banner */}
      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
        <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
          Book early — Nashik Kumbh 2027 (Jul-Sep) sees millions of pilgrims. Hotels fill up fast.
        </p>
      </div>

      {/* Hotels list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      ) : hotels && hotels.length > 0 ? (
        <div className="space-y-3">
          {hotels.map(hotel => (
            <Card
              key={hotel.id}
              className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedHotel(hotel)}
            >
              <CardContent className="py-4 px-4">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center shrink-0">
                    <span className="text-2xl font-bold text-primary">{hotel.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm leading-tight">{hotel.name}</p>
                        <Badge className={cn("text-[10px] border mt-1", categoryColor[hotel.category] || "bg-muted")}>
                          {hotel.category}
                        </Badge>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    </div>
                    <StarRating rating={hotel.rating} />
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{hotel.distanceText}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <span className="text-sm font-bold text-primary">
                          ₹{hotel.priceMin.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground"> / night</span>
                      </div>
                      <div className="flex gap-1">
                        {hotel.amenities.slice(0, 3).map(a => (
                          <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>
                        ))}
                        {hotel.amenities.length > 3 && (
                          <Badge variant="secondary" className="text-[10px]">+{hotel.amenities.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">No accommodations found</p>
          <p className="text-sm text-muted-foreground">Try different filters</p>
        </div>
      )}
    </div>
  );
}
