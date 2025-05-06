import type { Metadata } from "next";
import { GeistSans, GeistMono } from "next/font/geist";
import "./globals.css";

const sans = GeistSans({
  subsets: ["latin"],
});

const mono = GeistMono({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Winston Chat",
  description: "A lightweight, modular chatbot built with Next.js and OpenAI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
