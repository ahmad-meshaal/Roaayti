import { Router, type IRouter } from "express";
import { db, usersTable, followersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function getParam(p: string | string[] | undefined): string {
  return (Array.isArray(p) ? p[0] : p)?.toLowerCase() ?? "";
}

router.get("/users/:username/followers", async (req, res): Promise<void> => {
  const username = getParam(req.params.username);
  const [user] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const followers = await db
    .select({ id: usersTable.id, username: usersTable.username, displayName: usersTable.displayName, avatarUrl: usersTable.avatarUrl })
    .from(followersTable)
    .innerJoin(usersTable, eq(followersTable.followerId, usersTable.id))
    .where(eq(followersTable.followingId, user.id));

  res.json(followers);
});

router.get("/users/:username/following", async (req, res): Promise<void> => {
  const username = getParam(req.params.username);
  const [user] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const following = await db
    .select({ id: usersTable.id, username: usersTable.username, displayName: usersTable.displayName, avatarUrl: usersTable.avatarUrl })
    .from(followersTable)
    .innerJoin(usersTable, eq(followersTable.followingId, usersTable.id))
    .where(eq(followersTable.followerId, user.id));

  res.json(following);
});

router.get("/users/:username/follow-stats", async (req, res): Promise<void> => {
  const username = getParam(req.params.username);
  const [user] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const [followersCount] = await db.select({ count: sql<number>`COUNT(*)::int` }).from(followersTable).where(eq(followersTable.followingId, user.id));
  const [followingCount] = await db.select({ count: sql<number>`COUNT(*)::int` }).from(followersTable).where(eq(followersTable.followerId, user.id));

  res.json({ followers: followersCount.count, following: followingCount.count, userId: user.id });
});

router.post("/users/:username/follow", requireAuth, async (req, res): Promise<void> => {
  const username = getParam(req.params.username);
  const [target] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!target) { res.status(404).json({ error: "User not found" }); return; }
  if (target.id === req.userId) { res.status(400).json({ error: "Cannot follow yourself" }); return; }

  await db.insert(followersTable).values({ followerId: req.userId!, followingId: target.id }).onConflictDoNothing();
  res.json({ following: true });
});

router.delete("/users/:username/follow", requireAuth, async (req, res): Promise<void> => {
  const username = getParam(req.params.username);
  const [target] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!target) { res.status(404).json({ error: "User not found" }); return; }

  await db.delete(followersTable).where(and(eq(followersTable.followerId, req.userId!), eq(followersTable.followingId, target.id)));
  res.json({ following: false });
});

router.get("/users/:username/is-following", requireAuth, async (req, res): Promise<void> => {
  const username = getParam(req.params.username);
  const [target] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!target) { res.status(404).json({ error: "User not found" }); return; }

  const [row] = await db.select({ id: followersTable.id }).from(followersTable).where(and(eq(followersTable.followerId, req.userId!), eq(followersTable.followingId, target.id))).limit(1);
  res.json({ following: !!row });
});

export default router;
