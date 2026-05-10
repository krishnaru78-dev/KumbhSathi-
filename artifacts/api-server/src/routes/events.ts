import { Router } from "express";
import { db } from "@workspace/db";
import { eventsTable, bathingDatesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/events/upcoming", async (req, res) => {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const events = await db.select().from(eventsTable)
      .where(sql`${eventsTable.startTime} > ${now}`)
      .limit(10);
    return res.json(events.map(e => ({
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
    })));
  } catch (err) {
    req.log.error({ err }, "Upcoming events error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events/bathing-dates", async (req, res) => {
  try {
    const dates = await db.select().from(bathingDatesTable);
    return res.json(dates);
  } catch (err) {
    req.log.error({ err }, "Bathing dates error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events", async (req, res) => {
  try {
    const { type, date } = req.query;
    let events = await db.select().from(eventsTable);
    if (type) events = events.filter(e => e.type === type);
    if (date) events = events.filter(e => e.startTime.toISOString().startsWith(date as string));
    return res.json(events.map(e => ({
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
    })));
  } catch (err) {
    req.log.error({ err }, "List events error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events/:eventId", async (req, res) => {
  try {
    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, req.params.eventId)).limit(1);
    if (!event) return res.status(404).json({ error: "Event not found" });
    return res.json({
      id: event.id,
      title: event.title,
      titleHindi: event.titleHindi,
      description: event.description,
      type: event.type,
      location: event.location,
      startTime: event.startTime,
      endTime: event.endTime,
      isShahiSnan: event.isShahiSnan,
      importance: event.importance,
      image: event.image,
    });
  } catch (err) {
    req.log.error({ err }, "Get event error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
