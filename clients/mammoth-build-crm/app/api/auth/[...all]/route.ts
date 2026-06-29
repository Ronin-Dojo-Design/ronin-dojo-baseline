import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Mammoth's own Better Auth API surface (sign-in/up/out, session) — ADR 0038 D5.
// Mounted at /api/auth/* exactly like apps/web; Mammoth carries its own instance.
export const { POST, GET } = toNextJsHandler(auth);
