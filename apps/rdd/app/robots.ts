import type { MetadataRoute } from "next";

const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://ronindojodesign.com");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
