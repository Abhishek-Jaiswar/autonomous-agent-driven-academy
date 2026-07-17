import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  Inter,
  Libre_Baskerville,
  Poppins,
} from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ReduxProvider } from "@/store/provider";
import NavbarFooter from "@/components/layout/navbar-footer";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontSans = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["100", "200", "300", "400", "500"],
});

const fontSerif = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500"],
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["100", "200", "300", "400", "500"],
});

export const metadata: Metadata = {
  title: "AstraLearn AI — Autonomous Agent-Driven Academy",
  description:
    "An adaptive, agent-driven academy that builds personalized syllabus maps, verifies resource trust, and mentors students through visual explanations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      >
        <ReduxProvider>
          <NavbarFooter>{children}</NavbarFooter>
        </ReduxProvider>
      </body>
    </html>
  );
}
