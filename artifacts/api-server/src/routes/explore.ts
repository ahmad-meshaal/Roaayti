import { Router, type IRouter } from "express";
import { db, booksTable, chaptersTable, usersTable } from "@workspace/db";
import { eq, and, desc, sql, like, ilike } from "drizzle-orm";

const router: IRouter = Router();

router.get("/explore", async (req, res): Promise<void> => {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10) || 20));
  const offset = (page - 1) * limit;
  const genre = req.query.genre as string | undefined;
  const search = req.query.search as string | undefined;

  const conditions = [
    eq(booksTable.status, "published"),
    eq(booksTable.isAdult, false),
  ];

  if (genre) {
    conditions.push(eq(booksTable.genre, genre));
  }

  const whereClause = and(...conditions);

  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(*)::int` })
    .from(booksTable)
    .where(whereClause);

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
    .where(whereClause)
    .orderBy(desc(booksTable.updatedAt))
    .limit(limit)
    .offset(offset);

  res.json({ books, total, page, limit });
});

router.get("/explore/trending", async (_req, res): Promise<void> => {
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
    .where(and(eq(booksTable.status, "published"), eq(booksTable.isAdult, false)))
    .orderBy(desc(booksTable.updatedAt))
    .limit(8);

  res.json(books);
});

router.get("/explore/stats", async (_req, res): Promise<void> => {
  const [booksRow] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(booksTable)
    .where(and(eq(booksTable.status, "published"), eq(booksTable.isAdult, false)));

  const [authorsRow] = await db
    .select({ count: sql<number>`COUNT(DISTINCT author_id)::int` })
    .from(booksTable)
    .where(eq(booksTable.status, "published"));

  const [chaptersRow] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(chaptersTable);

  const genreRows = await db
    .select({
      genre: booksTable.genre,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(booksTable)
    .where(and(eq(booksTable.status, "published"), eq(booksTable.isAdult, false)))
    .groupBy(booksTable.genre)
    .orderBy(desc(sql`COUNT(*)`));

  res.json({
    totalBooks: booksRow?.count ?? 0,
    totalAuthors: authorsRow?.count ?? 0,
    totalChapters: chaptersRow?.count ?? 0,
    genres: genreRows,
  });
});

export default router;
