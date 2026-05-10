import { Router, type IRouter } from "express";
import { db, booksTable, chaptersTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const [books] = await db.select({ count: sql<number>`COUNT(*)::int` }).from(booksTable);
  const [users] = await db.select({ count: sql<number>`COUNT(*)::int` }).from(usersTable);
  const [chapters] = await db.select({ count: sql<number>`COUNT(*)::int` }).from(chaptersTable);
  const [adultBooks] = await db.select({ count: sql<number>`COUNT(*)::int` }).from(booksTable).where(eq(booksTable.isAdult, true));

  res.json({ books: books.count, users: users.count, chapters: chapters.count, adultBooks: adultBooks.count });
});

router.delete("/admin/books/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(chaptersTable).where(eq(chaptersTable.bookId, id));
  await db.delete(booksTable).where(eq(booksTable.id, id));
  res.json({ deleted: true });
});

router.delete("/admin/adult-content", requireAdmin, async (_req, res): Promise<void> => {
  const adultBooks = await db.select({ id: booksTable.id }).from(booksTable).where(eq(booksTable.isAdult, true));
  let deleted = 0;
  for (const book of adultBooks) {
    await db.delete(chaptersTable).where(eq(chaptersTable.bookId, book.id));
    await db.delete(booksTable).where(eq(booksTable.id, book.id));
    deleted++;
  }
  await db.update(booksTable).set({ isAdult: false }).where(eq(booksTable.isAdult, true));
  res.json({ deleted, message: `تم حذف ${deleted} كتاب/كتب تحتوي على محتوى للبالغين` });
});

router.get("/admin/books", requireAdmin, async (_req, res): Promise<void> => {
  const books = await db
    .select({
      id: booksTable.id,
      title: booksTable.title,
      genre: booksTable.genre,
      status: booksTable.status,
      isAdult: booksTable.isAdult,
      authorId: booksTable.authorId,
      authorEmail: usersTable.email,
      createdAt: booksTable.createdAt,
    })
    .from(booksTable)
    .innerJoin(usersTable, eq(booksTable.authorId, usersTable.id))
    .orderBy(booksTable.createdAt);

  res.json(books);
});

export default router;
