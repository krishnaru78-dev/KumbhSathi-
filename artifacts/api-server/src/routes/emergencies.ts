import { Router } from "express";
import { db } from "@workspace/db";
import { sosIncidentsTable, servicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.post("/emergencies/sos", async (req, res) => {
  try {
    const { lat, lng, message, userId } = req.body;
    if (lat == null || lng == null) return res.status(400).json({ error: "Location required" });
    const id = randomUUID();
    await db.insert(sosIncidentsTable).values({
      id, userId: userId || null, lat, lng,
      message: message || null, status: "active",
    });
    const hospitals = await db.select().from(servicesTable).where(eq(servicesTable.type, "hospital")).limit(1);
    const police = await db.select().from(servicesTable).where(eq(servicesTable.type, "police")).limit(1);
    const calcDist = (s: any) => Math.round(Math.sqrt(Math.pow((s.lat - lat) * 111000, 2) + Math.pow((s.lng - lng) * 111000, 2)));
    return res.status(201).json({
      incidentId: id, status: "active",
      nearestHospital: hospitals[0] ? { ...hospitals[0], distance: calcDist(hospitals[0]) } : null,
      nearestPolice: police[0] ? { ...police[0], distance: calcDist(police[0]) } : null,
      estimatedResponseTime: 8,
    });
  } catch (err) {
    req.log.error({ err }, "SOS trigger error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/emergencies/contacts", (_req, res) => {
  return res.json([
    { id: "1", name: "Police", number: "100", type: "police", available24x7: true },
    { id: "2", name: "Ambulance", number: "108", type: "ambulance", available24x7: true },
    { id: "3", name: "Fire Brigade", number: "101", type: "fire", available24x7: true },
    { id: "4", name: "Nashik Kumbh Helpline", number: "1800-233-1818", type: "helpline", available24x7: true },
    { id: "5", name: "Women Helpline", number: "1091", type: "women_helpline", available24x7: true },
    { id: "6", name: "Child Helpline", number: "1098", type: "helpline", available24x7: true },
    { id: "7", name: "Nashik Police Control", number: "0253-2460101", type: "police", available24x7: true },
    { id: "8", name: "Disaster Management", number: "1070", type: "helpline", available24x7: true },
    { id: "9", name: "Nashik Civil Hospital", number: "0253-2576501", type: "ambulance", available24x7: true },
  ]);
});

router.get("/emergencies/nearby", async (req, res) => {
  try {
    const { lat, lng, type } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "lat and lng required" });
    const latN = parseFloat(lat as string);
    const lngN = parseFloat(lng as string);
    let services = await db.select().from(servicesTable);
    if (type && type !== "all") {
      services = services.filter(s => s.type === type || (type === "hospital" && s.type === "medical_camp"));
    } else {
      services = services.filter(s => ["hospital", "police", "medical_camp"].includes(s.type));
    }
    const withDist = services.map(s => ({
      ...s,
      distance: Math.round(Math.sqrt(Math.pow((s.lat - latN) * 111000, 2) + Math.pow((s.lng - lngN) * 111000, 2))),
    })).sort((a, b) => a.distance - b.distance).slice(0, 6);
    return res.json(withDist);
  } catch (err) {
    req.log.error({ err }, "Nearby emergency services error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
