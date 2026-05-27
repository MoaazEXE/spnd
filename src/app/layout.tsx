import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Settle — The money you didn't spend",
  description: "Intervene before the money leaves. Cool off impulses, split group costs, and celebrate what you saved.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: { fontFamily: 'var(--font-inter)', fontSize: '14px' },
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
