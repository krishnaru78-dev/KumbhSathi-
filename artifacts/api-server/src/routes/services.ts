import { Router } from "express";
import { db } from "@workspace/db";
import { servicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/services", async (req, res) => {
  try {
    const { type, search } = req.query;
    let services = await db.select().from(servicesTable);
    if (type) services = services.filter(s => s.type === type);
    if (search) services = services.filter(s => s.name.toLowerCase().includes((search as string).toLowerCase()));
    return res.json(services.map(s => ({ ...s, distance: null })));
  } catch (err) {
    req.log.error({ err }, "List services error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/services/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = "1000", type } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "lat and lng required" });
    const latN = parseFloat(lat as string);
    const lngN = parseFloat(lng as string);
    const radiusN = parseFloat(radius as string);

    let services = await db.select().from(servicesTable);
    if (type) services = services.filter(s => s.type === type);

    const withDist = services.map(s => ({
      ...s,
      distance: Math.round(Math.sqrt(Math.pow((s.lat - latN) * 111000, 2) + Math.pow((s.lng - lngN) * 111000, 2))),
    })).filter(s => s.distance <= radiusN).sort((a, b) => a.distance - b.distance);

    return res.json(withDist);
  } catch (err) {
    req.log.error({ err }, "Nearby services error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
