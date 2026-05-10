import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, sosIncidentsTable, lostFoundTable, alertsTable, aiMessagesTable, crowdZonesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/admin/stats", async (req, res) => {
  try {
    const users = await db.select().from(usersTable);
    const sos = await db.select().from(sosIncidentsTable).where(eq(sosIncidentsTable.status, "active"));
    const openLost = await db.select().from(lostFoundTable).where(eq(lostFoundTable.status, "open"));
    const resolvedLost = await db.select().from(lostFoundTable).where(eq(lostFoundTable.status, "resolved"));
    const alerts = await db.select().from(alertsTable).where(eq(alertsTable.isActive, true));
    const msgs = await db.select().from(aiMessagesTable);
    const zones = await db.select().from(crowdZonesTable);
    const levels = ["critical", "high", "medium", "low"];
    const crowdLevel = levels.find(l => zones.some(z => z.level === l)) || "low";
    const today = new Date().toISOString().split("T")[0];
    const todayReg = users.filter(u => u.createdAt.toISOString().startsWith(today)).length;

    return res.json({
      totalUsers: users.length,
      activeSOSCount: sos.length,
      openLostCount: openLost.length,
      resolvedLostCount: resolvedLost.length,
      activeAlerts: alerts.length,
      crowdLevel,
      todayRegistrations: todayReg,
      totalMessages: msgs.length,
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/sos-incidents", async (req, res) => {
  try {
    const incidents = await db.select().from(sosIncidentsTable);
    return res.json(incidents.map(i => ({
      ...i,
      createdAt: i.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "SOS incidents error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/lost-found/:reportId/approve", async (req, res) => {
  try {
    const [updated] = await db.update(lostFoundTable)
      .set({ isApproved: true, updatedAt: new Date() })
      .where(eq(lostFoundTable.id, req.params.reportId))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json({
      ...updated,
      lastSeenTime: updated.lastSeenTime.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Approve lost found error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/users", async (req, res) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const all = await db.select().from(usersTable);
    const pageN = parseInt(page as string);
    const limitN = parseInt(limit as string);
    const paged = all.slice((pageN - 1) * limitN, pageN * limitN);
    return res.json({
      users: paged.map(u => { const { passwordHash, ...safe } = u; return { ...safe, emergencyContacts: u.emergencyContacts || [], medicalInfo: u.medicalInfo || null }; }),
      total: all.length,
    });
  } catch (err) {
    req.log.error({ err }, "List users error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
