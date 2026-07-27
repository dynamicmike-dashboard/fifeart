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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
