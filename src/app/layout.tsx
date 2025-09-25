"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Create a single QueryClient instance for the whole app
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" forcedTheme="light">
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position="top-right" reverseOrder={false} />
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
