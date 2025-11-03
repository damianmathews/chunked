import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth.config";

/**
 * Get the current authenticated user
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

/**
 * Get user by ID
 */
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

/**
 * Update current user profile
 */
export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get or create user profile
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        ...args,
        updatedAt: now,
      });
      return existingProfile._id;
    } else {
      return await ctx.db.insert("userProfiles", {
        userId,
        ...args,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Get current user's profile
 */
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});
