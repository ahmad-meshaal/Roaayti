import { Router, type IRouter } from "express";
import { db, linksTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import {
  CreateLinkBody,
  UpdateLinkParams,
  UpdateLinkBody,
  DeleteLinkParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/links", requireAuth, async (req, res): Promise<void> => {
  const links = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.userId, req.userId!))
    .orderBy(linksTable.sortOrder);

  res.json(links.map(l => ({
    id: l.id,
    title: l.title,
    url: l.url,
    icon: l.icon,
    sortOrder: l.sortOrder,
  })));
});

router.post("/links", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateLinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [link] = await db
    .insert(linksTable)
    .values({
      userId: req.userId!,
      title: parsed.data.title,
      url: parsed.data.url,
      icon: parsed.data.icon ?? null,
      sortOrder: 0,
    })
    .returning();

  res.status(201).json({
    id: link.id,
    title: link.title,
    url: link.url,
    icon: link.icon,
    sortOrder: link.sortOrder,
  });
});

router.patch("/links/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid link id" });
    return;
  }

  const parsed = UpdateLinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select({ userId: linksTable.userId })
    .from(linksTable)
    .where(eq(linksTable.id, id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Link not found" });
    return;
  }
  if (existing.userId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const updates: Partial<typeof linksTable.$inferInsert> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.url !== undefined) updates.url = parsed.data.url;
  if (parsed.data.icon !== undefined) updates.icon = parsed.data.icon;
  if (parsed.data.sortOrder !== undefined) updates.sortOrder = parsed.data.sortOrder;

  const [link] = await db
    .update(linksTable)
    .set(updates)
    .where(eq(linksTable.id, id))
    .returning();

  res.json({
    id: link.id,
    title: link.title,
    url: link.url,
    icon: link.icon,
    sortOrder: link.sortOrder,
  });
});

router.delete("/links/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid link id" });
    return;
  }

  const [existing] = await db
    .select({ userId: linksTable.userId })
    .from(linksTable)
    .where(eq(linksTable.id, id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Link not found" });
    return;
  }
  if (existing.userId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(linksTable).where(eq(linksTable.id, id));
  res.json({ success: true });
});

export default router;
