import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Variable serif used only for hero / section headings. Keeps body in Geist.
// Sourced from the Sunsama-calm + Synthesis-adult-respect direction.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  // SOFT optical sizing makes display weights look warmer at large sizes.
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  title: "Fractions Mastery Tracker",
  description: "A misconception-targeted fractions diagnostic for grade 3–4.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
