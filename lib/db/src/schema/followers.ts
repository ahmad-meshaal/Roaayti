import { pgTable, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const followersTable = pgTable("followers", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  followingId: integer("following_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique("unique_follow").on(t.followerId, t.followingId),
]);

export type Follower = typeof followersTable.$inferSelect;
