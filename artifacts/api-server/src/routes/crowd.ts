import { Router } from "express";
import { db } from "@workspace/db";
import { crowdZonesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/crowd/overview", async (req, res) => {
  try {
    const zones = await db.select().from(crowdZonesTable);
    const levels = ["critical", "high", "medium", "low"];
    const overallLevel = levels.find(l => zones.some(z => z.level === l)) || "low";
    const totalEstimated = zones.reduce((s, z) => s + (z.estimatedCount || 0), 0);
    return res.json({
      overallLevel,
      totalEstimated,
      zones: zones.map(z => ({ ...z, updatedAt: z.updatedAt.toISOString() })),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Crowd overview error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/crowd/zones", async (req, res) => {
  try {
    const zones = await db.select().from(crowdZonesTable);
    return res.json(zones.map(z => ({ ...z, updatedAt: z.updatedAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "List crowd zones error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/crowd/zones/:zoneId", async (req, res) => {
  try {
    const [zone] = await db.select().from(crowdZonesTable).where(eq(crowdZonesTable.id, req.params.zoneId)).limit(1);
    if (!zone) return res.status(404).json({ error: "Zone not found" });
    return res.json({ ...zone, updatedAt: zone.updatedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Get crowd zone error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/crowd/zones/:zoneId", async (req, res) => {
  try {
    const { level, estimatedCount } = req.body;
    const [updated] = await db.update(crowdZonesTable)
      .set({ level, estimatedCount, updatedAt: new Date() })
      .where(eq(crowdZonesTable.id, req.params.zoneId))
      .returning();
    if (!updated) return res.status(404).json({ error: "Zone not found" });
    return res.json({ ...updated, updatedAt: updated.updatedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Update crowd zone error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/crowd/heatmap", async (req, res) => {
  try {
    const zones = await db.select().from(crowdZonesTable);
    const heatmap = zones.map(z => ({
      lat: z.lat,
      lng: z.lng,
      weight: z.level === "critical" ? 1.0 : z.level === "high" ? 0.75 : z.level === "medium" ? 0.5 : 0.25,
    }));
    return res.json(heatmap);
  } catch (err) {
    req.log.error({ err }, "Crowd heatmap error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
