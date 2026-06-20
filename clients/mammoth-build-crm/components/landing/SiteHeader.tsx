"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { href: "#buildings", label: "Buildings" },
  { href: "#process", label: "Process" },
  { href: "#industries", label: "Industries" },
  { href: "#start", label: "Contact" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        scrolled ? "border-b border-border bg-surface/95 backdrop-blur" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="font-display text-xl font-bold tracking-wide">
          MAMMOTH<span className="text-primary">.</span>
        </Link>
        <nav className="hidden gap-7 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <a
          href="#start"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          Start Your Build
        </a>
      </div>
    </header>
  );
}
