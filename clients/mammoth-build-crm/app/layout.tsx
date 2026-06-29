import type { Metadata } from "next";
// Shared-kernel CSS for the AdminKanban board, loaded in order BEFORE globals.css so Mammoth's
// `--mk-*` bridge (globals.css) overrides the kernel's BBL-red defaults: tokens.css = the --mk-*
// scaffold (spacing/radius/fonts), card.css = the ported L1 `.mk-surface` shell, m-card.css = the
// board `.mk-card` anatomy. (Fixes the §6 gap #3 wiring — the board had NO kernel CSS loaded.)
import "@ronin-dojo/ui-kit/tokens.css";
import "@ronin-dojo/ui-kit/card.css";
import "@ronin-dojo/ui-kit/m-card.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mammoth Build CRM",
  description:
    "Mammoth Metal Buildings — lead to order, with proof at every step. MVP (frontend-only).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
