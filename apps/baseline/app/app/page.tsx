import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { LeadsBoard } from "./leads-board";

/**
 * Baseline admin — the inquiry pipeline board (ADR 0038 D5 gated + ADR 0033 kernel).
 *
 * Server-gated: an unauthenticated request is redirected to /login before any
 * board (or lead data) renders. The board itself is a client island that mounts
 * the shared AdminKanban kernel over Baseline's own DB via a BoardStore adapter —
 * zero board logic here (pure wiring). Every store call is auth-gated again at
 * the action layer (lib/actions.ts requireAuth), so this is defense-in-depth.
 */
export default async function AdminBoardPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/login");
  }

  return <LeadsBoard />;
}
