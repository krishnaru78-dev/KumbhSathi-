import { Router } from "express";
import { db } from "@workspace/db";
import { alertsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.get("/alerts", async (req, res) => {
  try {
    const { type, active } = req.query;
    let alerts = await db.select().from(alertsTable);
    if (type) alerts = alerts.filter(a => a.type === type);
    if (active !== undefined) alerts = alerts.filter(a => a.isActive === (active === "true"));
    return res.json(alerts.map(a => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      expiresAt: a.expiresAt?.toISOString() || null,
    })));
  } catch (err) {
    req.log.error({ err }, "List alerts error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/alerts", async (req, res) => {
  try {
    const { type, title, message, severity, expiresAt } = req.body;
    const [alert] = await db.insert(alertsTable).values({
      id: randomUUID(),
      type,
      title,
      message,
      severity,
      isActive: true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }).returning();
    return res.status(201).json({
      ...alert,
      createdAt: alert.createdAt.toISOString(),
      expiresAt: alert.expiresAt?.toISOString() || null,
    });
  } catch (err) {
    req.log.error({ err }, "Create alert error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/alerts/:alertId", async (req, res) => {
  try {
    const { title, message, severity, isActive } = req.body;
    const [updated] = await db.update(alertsTable)
      .set({ title, message, severity, isActive })
      .where(eq(alertsTable.id, req.params.alertId))
      .returning();
    if (!updated) return res.status(404).json({ error: "Alert not found" });
    return res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      expiresAt: updated.expiresAt?.toISOString() || null,
    });
  } catch (err) {
    req.log.error({ err }, "Update alert error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/alerts/:alertId", async (req, res) => {
  try {
    await db.delete(alertsTable).where(eq(alertsTable.id, req.params.alertId));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Delete alert error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
