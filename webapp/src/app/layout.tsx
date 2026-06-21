import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap"
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "Deep Ocean",
  title: "Deep Ocean — Turn Focus Into a Dive",
  description:
    "A cinematic focus app where minutes become depth, discoveries, XP, streaks, expedition history, and calm personal guidance.",
  keywords: [
    "focus app",
    "focus timer",
    "deep work",
    "productivity",
    "ocean",
    "pomodoro",
    "habit tracker",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Deep Ocean — Turn Focus Into a Dive",
    description:
      "Focus deeper, surface calmer. A cinematic focus system with ocean progression, discoveries, AI guidance, widgets, and Live Activities.",
    url: "/",
    siteName: "Deep Ocean",
    type: "website",
    images: [
      {
        url: "/assets/ocean-portal-wide.png",
        width: 1000,
        height: 500,
        alt: "Deep Ocean focus app underwater portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deep Ocean — Turn Focus Into a Dive",
    description:
      "Focus deeper, surface calmer with cinematic focus dives, ocean progression, discoveries, and personal guidance.",
    images: ["/assets/ocean-portal-wide.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetBrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
