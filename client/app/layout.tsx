import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/store/provider";
import NavbarFooter from "@/components/layout/navbar-footer";
import { DM_Sans, Space_Mono } from "next/font/google";

const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: "400",
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
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased`}>
        <ReduxProvider>
          <NavbarFooter>{children}</NavbarFooter>
        </ReduxProvider>
      </body>
    </html>
  );
}
