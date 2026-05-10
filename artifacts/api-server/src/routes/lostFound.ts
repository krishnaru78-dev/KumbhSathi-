import { Router } from "express";
import { db } from "@workspace/db";
import { lostFoundTable } from "@workspace/db";
import { eq, and, ilike, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.get("/lost-found/stats", async (req, res) => {
  try {
    const all = await db.select().from(lostFoundTable);
    return res.json({
      totalOpen: all.filter(r => r.status === "open").length,
      totalResolved: all.filter(r => r.status === "resolved").length,
      childrenFound: all.filter(r => r.type === "child" && r.status === "resolved").length,
      resolvedToday: all.filter(r => {
        const today = new Date().toISOString().split("T")[0];
        return r.status === "resolved" && r.updatedAt.toISOString().startsWith(today);
      }).length,
    });
  } catch (err) {
    req.log.error({ err }, "Lost found stats error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/lost-found", async (req, res) => {
  try {
    const { status, type, search, page = "1", limit = "20" } = req.query;
    let reports = await db.select().from(lostFoundTable);
    if (status) reports = reports.filter(r => r.status === status);
    if (type) reports = reports.filter(r => r.type === type);
    if (search) reports = reports.filter(r =>
      r.title.toLowerCase().includes((search as string).toLowerCase()) ||
      (r.name || "").toLowerCase().includes((search as string).toLowerCase())
    );
    const pageN = parseInt(page as string);
    const limitN = parseInt(limit as string);
    const total = reports.length;
    const paged = reports.slice((pageN - 1) * limitN, pageN * limitN);
    return res.json({
      reports: paged.map(r => ({
        ...r,
        lastSeenTime: r.lastSeenTime.toISOString(),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      total,
      page: pageN,
      totalPages: Math.ceil(total / limitN),
    });
  } catch (err) {
    req.log.error({ err }, "List lost found error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/lost-found", async (req, res) => {
  try {
    const { type, title, description, name, age, gender, lastSeenLocation, lastSeenTime, photos, contactName, contactPhone } = req.body;
    const id = randomUUID();
    const [report] = await db.insert(lostFoundTable).values({
      id,
      type,
      status: "open",
      title,
      description,
      name: name || null,
      age: age || null,
      gender: gender || null,
      lastSeenLocation,
      lastSeenTime: new Date(lastSeenTime),
      photos: photos || [],
      contactName,
      contactPhone,
      reportedBy: "anonymous",
      isApproved: false,
    }).returning();
    return res.status(201).json({
      ...report,
      lastSeenTime: report.lastSeenTime.toISOString(),
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Create lost found error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/lost-found/:reportId", async (req, res) => {
  try {
    const [report] = await db.select().from(lostFoundTable).where(eq(lostFoundTable.id, req.params.reportId)).limit(1);
    if (!report) return res.status(404).json({ error: "Report not found" });
    return res.json({
      ...report,
      lastSeenTime: report.lastSeenTime.toISOString(),
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Get lost found error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/lost-found/:reportId", async (req, res) => {
  try {
    const { description, contactPhone, photos } = req.body;
    const [updated] = await db.update(lostFoundTable)
      .set({ description, contactPhone, photos, updatedAt: new Date() })
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
    req.log.error({ err }, "Update lost found error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/lost-found/:reportId", async (req, res) => {
  try {
    await db.delete(lostFoundTable).where(eq(lostFoundTable.id, req.params.reportId));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Delete lost found error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/lost-found/:reportId/resolve", async (req, res) => {
  try {
    const [updated] = await db.update(lostFoundTable)
      .set({ status: "resolved", updatedAt: new Date() })
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
    req.log.error({ err }, "Resolve lost found error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
