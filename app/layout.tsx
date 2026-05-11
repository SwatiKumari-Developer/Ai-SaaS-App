import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptPilot AI",
  description: "A full-stack AI SaaS starter with credits, plans, history, and streaming responses."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
