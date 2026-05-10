import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.get("/users/:userId", async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.params.userId)).limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { passwordHash, ...safeUser } = user;
    return res.json({ ...safeUser, emergencyContacts: user.emergencyContacts || [], medicalInfo: user.medicalInfo || null });
  } catch (err) {
    req.log.error({ err }, "Get user error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/users/:userId", async (req, res) => {
  try {
    const { name, phone, avatar, language, medicalInfo } = req.body;
    const [updated] = await db.update(usersTable)
      .set({ name, phone, avatar, language, medicalInfo, updatedAt: new Date() })
      .where(eq(usersTable.id, req.params.userId))
      .returning();
    if (!updated) return res.status(404).json({ error: "User not found" });
    const { passwordHash, ...safeUser } = updated;
    return res.json({ ...safeUser, emergencyContacts: updated.emergencyContacts || [], medicalInfo: updated.medicalInfo || null });
  } catch (err) {
    req.log.error({ err }, "Update user error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/users/:userId/emergency-contacts", async (req, res) => {
  try {
    const { contacts } = req.body;
    const [updated] = await db.update(usersTable)
      .set({ emergencyContacts: contacts, updatedAt: new Date() })
      .where(eq(usersTable.id, req.params.userId))
      .returning();
    if (!updated) return res.status(404).json({ error: "User not found" });
    const { passwordHash, ...safeUser } = updated;
    return res.json({ ...safeUser, emergencyContacts: updated.emergencyContacts || [], medicalInfo: updated.medicalInfo || null });
  } catch (err) {
    req.log.error({ err }, "Update emergency contacts error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:userId/bookmarks", async (req, res) => {
  return res.json([]);
});

export default router;
