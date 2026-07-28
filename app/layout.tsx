import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FifeArt — Original Paintings by Nancy Berry",
  description:
    "Original paintings by Scottish artist Nancy Berry. Explore landscapes, portraits, pet portraits, and more — available in the UK.",
  openGraph: {
    title: "FifeArt — Original Paintings by Nancy Berry",
    description:
      "Original paintings by Scottish artist Nancy Berry. Explore landscapes, portraits, pet portraits, and more — available in the UK.",
    siteName: "FifeArt",
    locale: "en_GB",
    type: "website",
  },
  icons: [{ rel: "icon", url: "/icon-192.png" }],
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1c1917" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js")}`,
        }} />
      </body>
    </html>
  );
}
