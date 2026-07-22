import type { Metadata } from "next";
import "./globals.css";

/**
 * RDD — Ronin Dojo Design umbrella/agency app scaffold (SESSION_0601, Slice A).
 * Hello-route only: no brand-token data mirror, no auth, no DB yet — those land
 * in later slices (B1 DB, B2 auth + State host, B3 marketing/portfolio + skin).
 */
export const metadata: Metadata = {
  title: "Ronin Dojo Design",
  description: "RDD — the Ronin Dojo Design umbrella app (scaffold).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
