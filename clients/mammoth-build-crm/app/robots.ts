import type { MetadataRoute } from "next";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://mammothmb.com");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app", "/api", "/login"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
