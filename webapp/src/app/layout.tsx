import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
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
  openGraph: {
    title: "Deep Ocean — Turn Focus Into a Dive",
    description:
      "Focus deeper, surface calmer. A cinematic focus system with ocean progression, discoveries, AI guidance, widgets, and Live Activities.",
    type: "website",
    images: ["/assets/ocean-portal-wide.png"],
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
