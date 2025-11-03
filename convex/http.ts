import { httpRouter } from "convex/server";
import { auth } from "./auth.config";

/**
 * HTTP Router for Convex Auth
 *
 * This enables authentication endpoints:
 * - POST /auth/signin
 * - POST /auth/signout
 * - GET /auth/session
 */
const http = httpRouter();

auth.addHttpRoutes(http);

export default http;
