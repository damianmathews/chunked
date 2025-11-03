import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

/**
 * Database Schema
 *
 * Includes Convex Auth tables plus your custom tables.
 */
const schema = defineSchema({
  // Include Convex Auth tables (users, sessions, etc.)
  ...authTables,

  // Add your custom tables here
  // Example: User profile data beyond auth
  userProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.optional(v.string()),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Example: App-specific data
  // Add your golf rounds, journal entries, etc. here
});

export default schema;
