import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone, language } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const id = randomUUID();
    const [user] = await db.insert(usersTable).values({
      id,
      name,
      email,
      phone: phone || null,
      language: language || "hi",
      role: "user",
      passwordHash: password,
      isGuest: false,
    }).returning();
    const token = `token_${id}`;
    const { passwordHash, ...safeUser } = user;
    return res.status(201).json({ token, user: { ...safeUser, emergencyContacts: [], medicalInfo: null } });
  } catch (err) {
    req.log.error({ err }, "Register error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = `token_${user.id}`;
    const { passwordHash, ...safeUser } = user;
    return res.json({ token, user: { ...safeUser, emergencyContacts: user.emergencyContacts || [], medicalInfo: user.medicalInfo || null } });
  } catch (err) {
    req.log.error({ err }, "Login error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/guest", async (req, res) => {
  try {
    const id = randomUUID();
    const [user] = await db.insert(usersTable).values({
      id,
      name: `Guest_${id.slice(0, 6)}`,
      language: "hi",
      role: "guest",
      isGuest: true,
    }).returning();
    const token = `guest_${id}`;
    const { passwordHash, ...safeUser } = user;
    return res.json({ token, user: { ...safeUser, emergencyContacts: [], medicalInfo: null } });
  } catch (err) {
    req.log.error({ err }, "Guest login error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (req, res) => {
  return res.status(204).send();
});

router.get("/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.replace("Bearer ", "");
    const userId = token.replace("token_", "").replace("guest_", "");
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { passwordHash, ...safeUser } = user;
    return res.json({ ...safeUser, emergencyContacts: user.emergencyContacts || [], medicalInfo: user.medicalInfo || null });
  } catch (err) {
    req.log.error({ err }, "Get me error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
