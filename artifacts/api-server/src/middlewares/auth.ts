import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { type Request, type Response, type NextFunction } from "express";

export const ADMIN_EMAILS = ["ahmaf.meshaal.2040@gmail.com"];

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db
    .select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.clerkId, auth.userId))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "User not synced" });
    return;
  }

  req.userId = user.id;
  req.userEmail = user.email;
  req.isAdmin = ADMIN_EMAILS.includes(user.email);
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  await requireAuth(req, res, () => {
    if (!req.isAdmin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    next();
  });
}

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userEmail?: string;
      isAdmin?: boolean;
    }
  }
}
