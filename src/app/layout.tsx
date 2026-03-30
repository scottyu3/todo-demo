import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Decompose — Your Tasks Are Alive",
  description: "A todo app where tasks grow, bloom, or rot. Tend your garden or watch it die.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${caveat.variable} min-h-screen antialiased`} style={{ fontFamily: "var(--font-inter), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
