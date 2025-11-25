import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Yapay Zeka Chatbot",
  description: "Chatbot yönetim paneli",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
