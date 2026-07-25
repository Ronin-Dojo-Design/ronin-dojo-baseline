import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ronin Dojo Design",
    short_name: "Ronin Dojo Design",
    start_url: "/",
    display: "standalone",
    // Source: app/globals.css `--bg: #0d0f12` and `--primary: #3b82f6`.
    background_color: "#0d0f12",
    theme_color: "#3b82f6",
  };
}
