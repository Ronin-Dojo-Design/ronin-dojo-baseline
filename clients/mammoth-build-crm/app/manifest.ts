import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mammoth Build",
    short_name: "Mammoth Build",
    start_url: "/",
    scope: "/",
    display: "standalone",
    // globals.css `--bg: #0e0f11` and `--primary: #ff6a1a`.
    background_color: "#0e0f11",
    theme_color: "#ff6a1a",
  };
}
