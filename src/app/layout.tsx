import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import IOSInstallPrompt from "@/components/IOSInstallPrompt";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-heading' });

export const metadata: Metadata = {
  title: "Royal Table Nights",
  description: "Exclusive Poker Tracker App",
  manifest: "/manifest.json",
  openGraph: {
    title: "Royal Table Nights",
    description: "Exclusive Poker Tracker App",
    url: "https://www.royaltable.pt",
    siteName: "Royal Table Nights",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "Royal Table Nights Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Royal Table Nights",
    description: "Exclusive Poker Tracker App",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "256x256" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/logo.png",
  },
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
          <IOSInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
