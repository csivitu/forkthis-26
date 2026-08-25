import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "ForkThis'26 | GitHub Workshop",
  description:
    "A hands-on Git and GitHub workshop for building, branching, collaborating, and shipping with confidence.",
  icons: {
    icon: "/forkthis-icon.svg",
    shortcut: "/forkthis-icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
