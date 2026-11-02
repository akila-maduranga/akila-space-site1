import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Akila Maduranga — Tech Enthusiast & Hobbyist Photographer",
  description:
    "Personal corner of the internet. Projects I tinker with, photos I like, and the occasional blog post — from Sri Lanka.",
  keywords: [
    "Akila Maduranga",
    "portfolio",
    "tech enthusiast",
    "hobbyist photographer",
    "photography",
    "Sri Lanka",
    "blog",
  ],
  openGraph: {
    title: "Akila Maduranga — Tech Enthusiast & Hobbyist Photographer",
    description:
      "Projects I tinker with, photos I like, and the occasional blog post — from Sri Lanka.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${grotesk.variable} ${jetbrains.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
