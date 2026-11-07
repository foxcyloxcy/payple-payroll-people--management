import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Payple — Your people. Your prints. One clear picture.",
  description: "A calmer way to manage your photography team, branch reports, attendance and configurable pay.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
