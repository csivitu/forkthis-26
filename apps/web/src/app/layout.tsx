import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";
import { LaunchGate } from "@/components/launch/LaunchGate";
import "./globals.css";


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

const teko = localFont({
  src: "../../public/fonts/Teko_SemiBold-s.p.4d580838.woff2",
  variable: "--font-display",
  weight: "600 700",
});

const hailMary = localFont({
  src: "../../public/fonts/Hail_Mary_Sans_v2.otf",
  variable: "--font-title",
  weight: "400",
  display: "swap",
});

const eurostile = localFont({
  src: "../../public/fonts/Eurostile_Bold-s.p.a22f4418.woff2",
  variable: "--font-misc",
  weight: "700",
});

const jetBrainsMono = localFont({
  src: "../../public/fonts/70bc3e132a0a741e-s.p.15008bfb.woff2",
  variable: "--font-mono",
  weight: "400 700",
});

const splineSans = localFont({
  src: "../../public/fonts/d249839af5fc7f99-s.p.12490bb0.woff2",
  variable: "--font-body",
  weight: "300 700",
});
export const metadata: Metadata = {
  title: "ForkThis'26 | GitHub Workshop",
  description:
    "A hands-on Git and GitHub workshop for building, branching, collaborating, and shipping with confidence.",
  icons: {
    icon: "/forkthis-icon.svg",
    shortcut: "/forkthis-icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${teko.variable} ${hailMary.variable} ${sixsound.variable} ${ibmPlexMono.variable} ${eurostile.variable} ${jetBrainsMono.variable} ${splineSans.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-black text-white"
      >
        <LaunchGate>{children}</LaunchGate>
      </body>
    </html>
  );
}
