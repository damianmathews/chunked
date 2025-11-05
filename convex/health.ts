/**
 * Health Check Query
 *
 * Simple query to verify Convex connection is working.
 * Use this for debugging and development verification.
 *
 * @see https://docs.convex.dev/functions/query-functions
 */

import { query } from "./_generated/server";

export const ping = query({
  args: {},
  handler: async () => {
    return {
      status: "ok",
      timestamp: Date.now(),
      message: "Convex is connected!",
      deployment: process.env.CONVEX_CLOUD_URL || "local",
    };
  },
});
