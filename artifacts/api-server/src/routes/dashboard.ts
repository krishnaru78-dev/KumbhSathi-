import { Router } from "express";
import { db } from "@workspace/db";
import { crowdZonesTable, eventsTable, alertsTable, sosIncidentsTable, lostFoundTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  try {
    const zones = await db.select().from(crowdZonesTable);
    const criticalZone = zones.find(z => z.level === "critical") || zones.find(z => z.level === "high");
    const overallLevel = criticalZone?.level || zones[0]?.level || "low";
    const totalEstimated = zones.reduce((s, z) => s + (z.estimatedCount || 0), 0);

    const now = new Date();
    const upcoming = await db.select().from(eventsTable)
      .where(sql`${eventsTable.startTime} > ${now}`)
      .limit(3);

    const activeAlerts = await db.select().from(alertsTable)
      .where(eq(alertsTable.isActive, true));

    const openSOS = await db.select().from(sosIncidentsTable)
      .where(eq(sosIncidentsTable.status, "active"));

    const openLost = await db.select().from(lostFoundTable)
      .where(eq(lostFoundTable.status, "open"));

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    return res.json({
      crowdLevel: overallLevel,
      crowdCount: totalEstimated,
      activeAlerts: activeAlerts.length,
      openSOSCount: openSOS.length,
      openLostCount: openLost.length,
      upcomingEvents: upcoming.map(e => ({
        id: e.id,
        title: e.title,
        titleHindi: e.titleHindi,
        description: e.description,
        type: e.type,
        location: e.location,
        startTime: e.startTime,
        endTime: e.endTime,
        isShahiSnan: e.isShahiSnan,
        importance: e.importance,
        image: e.image,
      })),
      weather: {
        temperature: 28,
        feelsLike: 32,
        humidity: 65,
        condition: "Partly Cloudy",
        icon: "partly-cloudy",
        windSpeed: 12,
        location: "Prayagraj, UP",
      },
      todayBathing: false,
      nearbyServicesCount: 24,
    });
  } catch (err) {
    req.log.error({ err }, "Dashboard summary error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/weather", (req, res) => {
  return res.json({
    temperature: 28,
    feelsLike: 32,
    humidity: 65,
    condition: "Partly Cloudy",
    icon: "partly-cloudy",
    windSpeed: 12,
    location: "Prayagraj, Uttar Pradesh",
  });
});

router.get("/dashboard/active-alerts", async (req, res) => {
  try {
    const alerts = await db.select().from(alertsTable).where(eq(alertsTable.isActive, true));
    return res.json(alerts);
  } catch (err) {
    req.log.error({ err }, "Active alerts error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
