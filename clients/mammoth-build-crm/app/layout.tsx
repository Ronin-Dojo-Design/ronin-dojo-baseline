import type { Metadata } from "next";
// Shared-kernel CSS for the AdminKanban board, loaded in order BEFORE globals.css so Mammoth's
// `--mk-*` bridge (globals.css) overrides the kernel's BBL-red defaults: tokens.css = the --mk-*
// scaffold (spacing/radius/fonts), card.css = the ported L1 `.mk-surface` shell, m-card.css = the
// board `.mk-card` anatomy. (Fixes the §6 gap #3 wiring — the board had NO kernel CSS loaded.)
import "@ronin-dojo/ui-kit/tokens.css";
import "@ronin-dojo/ui-kit/card.css";
import "@ronin-dojo/ui-kit/m-card.css";
import "./globals.css";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://mammothmb.com");
const description =
  "Most metal-building companies hand off a kit and vanish. Mammoth stays in the whole project — design, fabrication, sequenced delivery, and construction — with proof at every step.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Mammoth Build",
    template: "%s | Mammoth Build",
  },
  description,
  openGraph: {
    title: "Mammoth Build",
    description,
    url: siteUrl,
    siteName: "Mammoth Build",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mammoth Build",
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
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
