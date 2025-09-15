import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";

export const metadata: Metadata = {
  title: "Winston Chat",
  description: "A lightweight, modular chatbot built with Next.js and OpenAI",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/winston-mascot.svg', type: 'image/svg+xml' },
      { url: '/winston.png', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/winston.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/winston-mascot.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/winston.png" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
