/**
 * Root Layout for Empathy Ledger
 * 
 * Philosophy: This layout establishes the sacred container for community stories.
 * Every element should communicate respect, dignity, and cultural safety.
 */

import type { Metadata } from "next";
import "./globals.css";
import "@/styles/design-tokens.css";
import "@/styles/globals-trust.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SupabaseProvider from "@/components/providers/SupabaseProvider";

export const metadata: Metadata = {
  title: "Empathy Ledger - Community Knowledge Sovereignty",
  description: "A platform where storytellers own their narratives, receive insights about their wisdom, and benefit when their stories create value. Building bridges between ancient wisdom and emerging technology.",
  keywords: [
    "community sovereignty", 
    "storytelling", 
    "Indigenous data sovereignty", 
    "narrative ownership", 
    "community empowerment",
    "cultural protocols",
    "knowledge sharing"
  ],
  authors: [{ name: "Empathy Ledger Community" }],
  openGraph: {
    title: "Empathy Ledger - Every Story Has Power",
    description: "A community knowledge sovereignty platform where stories are living entities that belong to their tellers.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Empathy Ledger - Community Knowledge Sovereignty",
    description: "Stories are not raw materials to be processed, but living entities that belong to their tellers.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link 
          rel="preconnect" 
          href="https://fonts.googleapis.com" 
        />
        <link 
          rel="preconnect" 
          href="https://fonts.gstatic.com" 
          crossOrigin="anonymous"
        />
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" 
        />
      </head>
      <body className="antialiased font-sans text-gray-900 bg-white" suppressHydrationWarning>
        <SupabaseProvider>
          <Header />
          <main className="pt-20">
            {children}
          </main>
          <Footer />
        </SupabaseProvider>
      </body>
    </html>
  );
}
