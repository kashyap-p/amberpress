import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AmberPress — AI-Powered Tech Blog",
  description:
    "A personal, AI-integrated blog for AI & tech stories. Write, rewrite, and curate blogs with AI assistance, and discover the latest AI and technology news from around the world.",
  keywords: [
    "AI blog",
    "tech blog",
    "artificial intelligence",
    "technology news",
    "AI writing assistant",
  ],
  authors: [{ name: "AmberPress" }],
  openGraph: {
    title: "AmberPress — AI-Powered Tech Blog",
    description:
      "A personal AI & tech blog with AI-assisted writing and live tech news.",
    siteName: "AmberPress",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AmberPress — AI-Powered Tech Blog",
    description: "A personal AI & tech blog with AI-assisted writing.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster richColors closeButton position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
