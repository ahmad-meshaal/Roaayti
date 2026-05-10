import { Router, type IRouter } from "express";
import { db, booksTable, chaptersTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import {
  GetBookParams,
  UpdateBookParams,
  DeleteBookParams,
  CreateBookBody,
  UpdateBookBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/books", requireAuth, async (req, res): Promise<void> => {
  const books = await db
    .select({
      id: booksTable.id,
      title: booksTable.title,
      description: booksTable.description,
      coverUrl: booksTable.coverUrl,
      genre: booksTable.genre,
      status: booksTable.status,
      isAdult: booksTable.isAdult,
      authorId: booksTable.authorId,
      authorUsername: usersTable.username,
      authorDisplayName: usersTable.displayName,
      createdAt: booksTable.createdAt,
      updatedAt: booksTable.updatedAt,
      chapterCount: sql<number>`(SELECT COUNT(*) FROM chapters WHERE book_id = ${booksTable.id})::int`,
    })
    .from(booksTable)
    .innerJoin(usersTable, eq(booksTable.authorId, usersTable.id))
    .where(eq(booksTable.authorId, req.userId!))
    .orderBy(booksTable.updatedAt);

  res.json(books);
});

router.post("/books", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateBookBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [book] = await db
    .insert(booksTable)
    .values({
      authorId: req.userId!,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      genre: parsed.data.genre,
      isAdult: parsed.data.isAdult ?? false,
      status: "draft",
    })
    .returning();

  const [user] = await db
    .select({ username: usersTable.username, displayName: usersTable.displayName })
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!))
    .limit(1);

  res.status(201).json({
    ...book,
    authorUsername: user.username,
    authorDisplayName: user.displayName,
    chapterCount: 0,
  });
});

router.get("/books/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid book id" });
    return;
  }

  const [book] = await db
    .select({
      id: booksTable.id,
      title: booksTable.title,
      description: booksTable.description,
      coverUrl: booksTable.coverUrl,
      genre: booksTable.genre,
      status: booksTable.status,
      isAdult: booksTable.isAdult,
      authorId: booksTable.authorId,
      authorUsername: usersTable.username,
      authorDisplayName: usersTable.displayName,
      createdAt: booksTable.createdAt,
      updatedAt: booksTable.updatedAt,
    })
    .from(booksTable)
    .innerJoin(usersTable, eq(booksTable.authorId, usersTable.id))
    .where(eq(booksTable.id, id))
    .limit(1);

  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  const chapters = await db
    .select()
    .from(chaptersTable)
    .where(eq(chaptersTable.bookId, id))
    .orderBy(chaptersTable.sortOrder);

  res.json({ ...book, chapters });
});

router.patch("/books/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid book id" });
    return;
  }

  const parsed = UpdateBookBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select({ authorId: booksTable.authorId })
    .from(booksTable)
    .where(eq(booksTable.id, id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  if (existing.authorId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const updates: Partial<typeof booksTable.$inferInsert> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.genre !== undefined) updates.genre = parsed.data.genre;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.isAdult !== undefined) updates.isAdult = parsed.data.isAdult;
  if (parsed.data.coverUrl !== undefined) updates.coverUrl = parsed.data.coverUrl;

  const [book] = await db
    .update(booksTable)
    .set(updates)
    .where(eq(booksTable.id, id))
    .returning();

  const [user] = await db
    .select({ username: usersTable.username, displayName: usersTable.displayName })
    .from(usersTable)
    .where(eq(usersTable.id, book.authorId))
    .limit(1);

  res.json({
    ...book,
    authorUsername: user.username,
    authorDisplayName: user.displayName,
    chapterCount: 0,
  });
});

router.delete("/books/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid book id" });
    return;
  }

  const [existing] = await db
    .select({ authorId: booksTable.authorId })
    .from(booksTable)
    .where(eq(booksTable.id, id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  if (existing.authorId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(booksTable).where(eq(booksTable.id, id));
  res.json({ success: true });
});

export default router;
