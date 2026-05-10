import { Router, type IRouter } from "express";
import { db, usersTable, booksTable, linksTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import {
  UpdateMyProfileBody,
  UploadAvatarBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users/:username", async (req, res): Promise<void> => {
  const username = req.params.username?.toLowerCase();

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

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
    })
    .from(booksTable)
    .innerJoin(usersTable, eq(booksTable.authorId, usersTable.id))
    .where(and(eq(booksTable.authorId, user.id), eq(booksTable.status, "published")));

  const links = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.userId, user.id))
    .orderBy(linksTable.sortOrder);

  res.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    books: books.map(b => ({ ...b, chapterCount: 0 })),
    links: links.map(l => ({
      id: l.id,
      title: l.title,
      url: l.url,
      icon: l.icon,
      sortOrder: l.sortOrder,
    })),
  });
});

router.patch("/users/me/profile", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, string> = {};
  if (parsed.data.displayName !== undefined) updates.displayName = parsed.data.displayName;
  if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;

  const [user] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.userId!))
    .returning();

  res.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  });
});

router.post("/users/me/avatar", requireAuth, async (req, res): Promise<void> => {
  const parsed = UploadAvatarBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { dataUrl } = parsed.data;

  if (!dataUrl.startsWith("data:image/")) {
    res.status(400).json({ error: "Invalid image data URL" });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set({ avatarUrl: dataUrl })
    .where(eq(usersTable.id, req.userId!))
    .returning();

  res.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  });
});

router.get("/users/:username/books", async (req, res): Promise<void> => {
  const username = req.params.username?.toLowerCase();

  const [user] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

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
    })
    .from(booksTable)
    .innerJoin(usersTable, eq(booksTable.authorId, usersTable.id))
    .where(and(eq(booksTable.authorId, user.id), eq(booksTable.status, "published")));

  res.json(books.map(b => ({ ...b, chapterCount: 0 })));
});

router.get("/users/:username/links", async (req, res): Promise<void> => {
  const username = req.params.username?.toLowerCase();

  const [user] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const links = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.userId, user.id))
    .orderBy(linksTable.sortOrder);

  res.json(links.map(l => ({
    id: l.id,
    title: l.title,
    url: l.url,
    icon: l.icon,
    sortOrder: l.sortOrder,
  })));
});

export default router;
