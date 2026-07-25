import type { MetadataRoute } from "next";

const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://ronindojodesign.com");

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: new URL("/", SITE_URL).toString() }];
}
