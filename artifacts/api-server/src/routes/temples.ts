import { Router } from "express";
import { db } from "@workspace/db";
import { templesTable } from "@workspace/db";
import { eq, ilike, sql } from "drizzle-orm";

const router = Router();

router.get("/temples", async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = db.select().from(templesTable).$dynamic();
    if (category) {
      query = query.where(eq(templesTable.category, category as string));
    }
    const temples = await query;
    const filtered = search
      ? temples.filter(t => t.name.toLowerCase().includes((search as string).toLowerCase()) || t.nameHindi.includes(search as string))
      : temples;
    return res.json(filtered.map(t => ({ ...t, isBookmarked: false })));
  } catch (err) {
    req.log.error({ err }, "List temples error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/temples/:templeId", async (req, res) => {
  try {
    const [temple] = await db.select().from(templesTable).where(eq(templesTable.id, req.params.templeId)).limit(1);
    if (!temple) return res.status(404).json({ error: "Temple not found" });
    return res.json({ ...temple, isBookmarked: false });
  } catch (err) {
    req.log.error({ err }, "Get temple error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/temples/:templeId/bookmark", async (req, res) => {
  return res.json({
    id: `bm_${req.params.templeId}`,
    type: "temple",
    referenceId: req.params.templeId,
    name: "Temple",
    createdAt: new Date().toISOString(),
  });
});

router.delete("/temples/:templeId/bookmark", (req, res) => {
  return res.status(204).send();
});

export default router;
