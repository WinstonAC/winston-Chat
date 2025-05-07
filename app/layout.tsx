import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import PortfolioWidget from "./components/PortfolioWidget";

export const metadata: Metadata = {
  title: "Winston Chat",
  description: "A lightweight, modular chatbot built with Next.js and OpenAI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if we're on the widget page by looking at the URL
  const isWidgetPage = typeof window !== 'undefined' && window.location.pathname === '/winston-widget';

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        {children}
        {!isWidgetPage && <PortfolioWidget />}
      </body>
    </html>
  );
}
