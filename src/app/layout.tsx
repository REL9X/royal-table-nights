import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-heading' });

export const metadata: Metadata = {
  title: "Royal Table Nights",
  description: "Exclusive Poker Tracker App",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: '#0b0e1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo.png" />

        {/* Prevent flash — respects saved preference, falls back to system */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('rtn-theme');var s=t||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.add(s==='light'?'light':'dark');})()`,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased min-h-screen`} style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
