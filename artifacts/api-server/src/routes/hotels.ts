import { Router } from "express";

const router = Router();

const hotelsData = [
  {
    id: "h1",
    name: "Hotel Panchavati",
    nameHindi: "होटल पंचवटी",
    type: "hotel",
    priceRange: "₹1200 - ₹3500",
    priceMin: 1200,
    priceMax: 3500,
    rating: 4.2,
    reviewCount: 248,
    distance: 0.3,
    distanceText: "300m from Ramkund",
    address: "Panchavati Road, Nashik - 422003",
    phone: "0253-2574000",
    amenities: ["AC Rooms", "Hot Water", "WiFi", "Parking", "Restaurant"],
    description: "Well-located hotel just steps from Ramkund Ghat. Ideal for pilgrims visiting Kumbh Mela.",
    lat: 20.0052,
    lng: 73.7896,
    available: true,
    category: "hotel",
  },
  {
    id: "h2",
    name: "Hotel Godavari Grand",
    nameHindi: "होटल गोदावरी ग्रैंड",
    type: "hotel",
    priceRange: "₹2500 - ₹6000",
    priceMin: 2500,
    priceMax: 6000,
    rating: 4.5,
    reviewCount: 312,
    distance: 0.8,
    distanceText: "800m from Ramkund",
    address: "Gangapur Road, Nashik - 422013",
    phone: "0253-2311234",
    amenities: ["AC Rooms", "Hot Water", "WiFi", "Swimming Pool", "Restaurant", "Room Service", "Parking"],
    description: "Premium hotel with excellent amenities. Best option for families attending Kumbh Mela.",
    lat: 20.0058,
    lng: 73.7890,
    available: true,
    category: "hotel",
  },
  {
    id: "h3",
    name: "Tapovan Guest House",
    nameHindi: "तपोवन गेस्ट हाउस",
    type: "guesthouse",
    priceRange: "₹600 - ₹1500",
    priceMin: 600,
    priceMax: 1500,
    rating: 3.8,
    reviewCount: 95,
    distance: 1.2,
    distanceText: "1.2km from Ramkund",
    address: "Tapovan, Nashik - 422003",
    phone: "0253-2576789",
    amenities: ["Basic Rooms", "Hot Water", "Common Area", "Parking"],
    description: "Budget-friendly guest house in the peaceful Tapovan area. Simple, clean rooms.",
    lat: 20.0200,
    lng: 73.7800,
    available: true,
    category: "guesthouse",
  },
  {
    id: "h4",
    name: "Ram Dharmashala",
    nameHindi: "राम धर्मशाला",
    type: "dharmashala",
    priceRange: "₹150 - ₹400",
    priceMin: 150,
    priceMax: 400,
    rating: 3.5,
    reviewCount: 420,
    distance: 0.15,
    distanceText: "150m from Ramkund",
    address: "Ramkund, Panchavati, Nashik - 422003",
    phone: "0253-2572345",
    amenities: ["Basic Dormitory", "Hot Water", "Temple Access"],
    description: "Affordable dharamshala close to Ramkund. Basic facilities, ideal for solo pilgrims.",
    lat: 20.0051,
    lng: 73.7898,
    available: true,
    category: "dharmashala",
  },
  {
    id: "h5",
    name: "Nashik Resort & Spa",
    nameHindi: "नाशिक रिसॉर्ट एंड स्पा",
    type: "resort",
    priceRange: "₹5000 - ₹12000",
    priceMin: 5000,
    priceMax: 12000,
    rating: 4.7,
    reviewCount: 156,
    distance: 3.5,
    distanceText: "3.5km from Ramkund",
    address: "Gangapur Dam Road, Nashik - 422222",
    phone: "0253-2997777",
    amenities: ["Luxury Rooms", "Spa", "Pool", "Multi-cuisine Restaurant", "WiFi", "Parking", "24hr Room Service"],
    description: "Luxury resort away from the crowds, perfect for families wanting comfort during Kumbh.",
    lat: 20.0150,
    lng: 73.8100,
    available: true,
    category: "resort",
  },
  {
    id: "h6",
    name: "Kumbh Tent Camp (Government)",
    nameHindi: "कुंभ टेंट कैंप (सरकारी)",
    type: "camp",
    priceRange: "₹200 - ₹800",
    priceMin: 200,
    priceMax: 800,
    rating: 3.3,
    reviewCount: 1240,
    distance: 0.5,
    distanceText: "500m from Ramkund",
    address: "Kumbh Mela Ground, Nashik",
    phone: "1800-233-1818",
    amenities: ["Tent Accommodation", "Community Toilet", "Common Dining", "Medical Aid"],
    description: "Official government tent accommodation for Kumbh pilgrims. Book via official Kumbh website.",
    lat: 20.0055,
    lng: 73.7910,
    available: true,
    category: "camp",
  },
  {
    id: "h7",
    name: "Panchavati Heritage Inn",
    nameHindi: "पंचवटी हेरिटेज इन",
    type: "hotel",
    priceRange: "₹1800 - ₹4500",
    priceMin: 1800,
    priceMax: 4500,
    rating: 4.0,
    reviewCount: 178,
    distance: 0.6,
    distanceText: "600m from Ramkund",
    address: "Tilak Road, Panchavati, Nashik - 422003",
    phone: "0253-2573456",
    amenities: ["AC Rooms", "WiFi", "Rooftop Restaurant", "Parking", "Travel Desk"],
    description: "Boutique heritage hotel with Godavari views. Authentic Maharashtrian hospitality.",
    lat: 20.0053,
    lng: 73.7893,
    available: true,
    category: "hotel",
  },
  {
    id: "h8",
    name: "Sai Niwas Dharamshala",
    nameHindi: "साई निवास धर्मशाला",
    type: "dharmashala",
    priceRange: "₹100 - ₹300",
    priceMin: 100,
    priceMax: 300,
    rating: 3.6,
    reviewCount: 380,
    distance: 0.4,
    distanceText: "400m from Ramkund",
    address: "Godavari Ghat Rd, Nashik - 422003",
    phone: "0253-2571234",
    amenities: ["Dormitory", "Lockers", "Vegetarian Food"],
    description: "Pilgrimage dharamshala with simple dormitory accommodation and community meals.",
    lat: 20.0049,
    lng: 73.7897,
    available: true,
    category: "dharmashala",
  },
];

router.get("/hotels", (req, res) => {
  const { search, category, maxPrice, minRating, available } = req.query;
  let results = [...hotelsData];

  if (search) {
    const s = (search as string).toLowerCase();
    results = results.filter(h => h.name.toLowerCase().includes(s) || h.address.toLowerCase().includes(s) || h.description.toLowerCase().includes(s));
  }
  if (category) results = results.filter(h => h.category === category);
  if (maxPrice) results = results.filter(h => h.priceMin <= parseInt(maxPrice as string));
  if (minRating) results = results.filter(h => h.rating >= parseFloat(minRating as string));
  if (available === "true") results = results.filter(h => h.available);

  results.sort((a, b) => a.distance - b.distance);
  return res.json(results);
});

router.get("/hotels/:hotelId", (req, res) => {
  const hotel = hotelsData.find(h => h.id === req.params.hotelId);
  if (!hotel) return res.status(404).json({ error: "Hotel not found" });
  return res.json(hotel);
});

export default router;
