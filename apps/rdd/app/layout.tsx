import type { Metadata } from "next";
import { Inter, Saira } from "next/font/google";
import "./globals.css";

/**
 * RDD — Ronin Dojo Design umbrella/agency app (SESSION_0601 Slice A scaffold → SESSION_0625 the
 * first public marketing surface on `ronindojodesign.com`).
 *
 * Fonts load via `next/font/google`, which downloads and SELF-HOSTS them at build time — no runtime
 * CDN request. `globals.css` already named Saira/Inter in `--font-display`/`--font-sans` but nothing
 * ever loaded them, so the scaffold silently fell back to system faces.
 */
const saira = Saira({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display-loaded",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-loaded",
  display: "swap",
});

const DESCRIPTION =
  "Ronin Dojo Design is a product studio that builds one durable software kernel and reskins it into a portfolio of brands — so small operators get a real platform, not a template.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ronindojodesign.com"),
  title: {
    default: "Ronin Dojo Design — One kernel. Many brands. Built to last.",
    template: "%s · Ronin Dojo Design",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "Ronin Dojo Design",
    description: DESCRIPTION,
    url: "https://ronindojodesign.com",
    siteName: "Ronin Dojo Design",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Ronin Dojo Design", description: DESCRIPTION },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${saira.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
