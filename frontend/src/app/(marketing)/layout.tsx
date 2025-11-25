import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yapay Zeka Chatbot | Web Siteniz İçin 30 Saniyede Akıllı Asistan Kurun",
  description: "Kodlama bilmeden, sadece web site adresinizi girerek işletmenize özel yapay zeka chatbot oluşturun. Google Gemini destekli, Türkçe, 7/24 müşteri hizmetleri ve satış asistanı.",
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
