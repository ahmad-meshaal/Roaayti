import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/auth/sync", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const clerkId = auth.userId;
  const { email, displayName, avatarUrl } = req.body as {
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  };

  let [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId))
    .limit(1);

  if (!user) {
    const baseUsername = email
      ? email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase().substring(0, 20)
      : "user";
    const finalBase = baseUsername || "user";
    let username = `${finalBase}${Math.floor(Math.random() * 9000) + 1000}`;
    let attempts = 0;
    while (attempts < 10) {
      const existing = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.username, username))
        .limit(1);
      if (existing.length === 0) break;
      username = `${finalBase}${Math.floor(Math.random() * 90000) + 10000}`;
      attempts++;
    }

    if (email) {
      const existingByEmail = await db
        .select({ id: usersTable.id, clerkId: usersTable.clerkId })
        .from(usersTable)
        .where(eq(usersTable.email, email.toLowerCase()))
        .limit(1);

      if (existingByEmail.length > 0 && !existingByEmail[0].clerkId) {
        [user] = await db
          .update(usersTable)
          .set({ clerkId })
          .where(eq(usersTable.id, existingByEmail[0].id))
          .returning();
      }
    }

    if (!user) {
      const emailToUse = email ? email.toLowerCase() : `${clerkId}@clerk.user`;
      [user] = await db
        .insert(usersTable)
        .values({
          clerkId,
          email: emailToUse,
          username,
          displayName: displayName?.trim() || "مستخدم",
          avatarUrl: avatarUrl || null,
        })
        .returning();
    }
  } else {
    if (avatarUrl && avatarUrl !== user.avatarUrl) {
      [user] = await db
        .update(usersTable)
        .set({ avatarUrl })
        .where(eq(usersTable.id, user.id))
        .returning();
    }
  }

  res.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, auth.userId))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "User not synced" });
    return;
  }

  res.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  });
});

export default router;
