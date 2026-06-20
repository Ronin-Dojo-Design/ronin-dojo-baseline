import type { Metadata } from "next";
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
