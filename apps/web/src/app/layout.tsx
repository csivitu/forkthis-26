import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const hailMary = localFont({
  src: "../../public/fonts/Hail_Mary_Sans_v2.otf",
  variable: "--font-hail-mary",
  display: "swap",
});

const sixsound = localFont({
  src: "../../public/fonts/sixsound.otf",
  variable: "--font-sixsound",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ForkThis | Resources",
  description: "Curated Git and GitHub learning resources for ForkThis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${hailMary.variable} ${sixsound.variable} ${ibmPlexMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-black text-white font-[family-name:var(--font-ibm-plex-mono)]">
        {children}
      </body>
    </html>
  );
}
