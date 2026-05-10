import { Router, type IRouter } from "express";
import { db, chaptersTable, booksTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import {
  CreateChapterBody,
  CreateChapterParams,
  GetChapterParams,
  UpdateChapterParams,
  UpdateChapterBody,
  DeleteChapterParams,
  GetChaptersParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/books/:id/chapters", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid book id" });
    return;
  }

  const chapters = await db
    .select()
    .from(chaptersTable)
    .where(eq(chaptersTable.bookId, id))
    .orderBy(chaptersTable.sortOrder);

  res.json(chapters);
});

router.post("/books/:id/chapters", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid book id" });
    return;
  }

  const parsed = CreateChapterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [book] = await db
    .select({ authorId: booksTable.authorId })
    .from(booksTable)
    .where(eq(booksTable.id, id))
    .limit(1);

  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  if (book.authorId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [countRow] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(chaptersTable)
    .where(eq(chaptersTable.bookId, id));

  const sortOrder = (countRow?.count ?? 0) + 1;

  const [chapter] = await db
    .insert(chaptersTable)
    .values({
      bookId: id,
      title: parsed.data.title,
      content: parsed.data.content ?? null,
      sortOrder,
    })
    .returning();

  res.status(201).json(chapter);
});

router.get("/chapters/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid chapter id" });
    return;
  }

  const [chapter] = await db
    .select()
    .from(chaptersTable)
    .where(eq(chaptersTable.id, id))
    .limit(1);

  if (!chapter) {
    res.status(404).json({ error: "Chapter not found" });
    return;
  }

  res.json(chapter);
});

router.patch("/chapters/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid chapter id" });
    return;
  }

  const parsed = UpdateChapterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select({
      id: chaptersTable.id,
      bookId: chaptersTable.bookId,
      authorId: booksTable.authorId,
    })
    .from(chaptersTable)
    .innerJoin(booksTable, eq(chaptersTable.bookId, booksTable.id))
    .where(eq(chaptersTable.id, id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Chapter not found" });
    return;
  }
  if (existing.authorId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const updates: Partial<typeof chaptersTable.$inferInsert> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.content !== undefined) updates.content = parsed.data.content;
  if (parsed.data.sortOrder !== undefined) updates.sortOrder = parsed.data.sortOrder;

  const [chapter] = await db
    .update(chaptersTable)
    .set(updates)
    .where(eq(chaptersTable.id, id))
    .returning();

  res.json(chapter);
});

router.delete("/chapters/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid chapter id" });
    return;
  }

  const [existing] = await db
    .select({
      id: chaptersTable.id,
      authorId: booksTable.authorId,
    })
    .from(chaptersTable)
    .innerJoin(booksTable, eq(chaptersTable.bookId, booksTable.id))
    .where(eq(chaptersTable.id, id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Chapter not found" });
    return;
  }
  if (existing.authorId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(chaptersTable).where(eq(chaptersTable.id, id));
  res.json({ success: true });
});

export default router;
