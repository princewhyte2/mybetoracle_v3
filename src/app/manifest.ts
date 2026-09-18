import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "4",
    name: "MyBetOracle",
    short_name: "MyBetOracle",
    description: "Verified football intelligence, prediction markets, streak evidence and performance tracking.",
    theme_color: "#083F87",
    background_color: "#083F87",
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    start_url: "/",
    icons: [
      {
        src: "/icons/maskable_icon_x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "/icons/maskable_icon_x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/icons/maskable_icon_x128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "/icons/maskable_icon_x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/maskable_icon_x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icons/maskable_icon_x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
