import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Ferramenta Online para Manipulação de PDFs",
  description:
    "Compacte, divida e combine seus arquivos PDF com facilidade. Ferramenta online simples e eficiente para todas as suas necessidades com PDFs.",
  openGraph: {
    images: [
      {
        url: "/meta-og-image.png",
        width: 1200,
        height: 630,
        alt: "Imagem de manipulação de PDF",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme="dracula" lang="pt">
      <body className="font-poppins">
        <Toaster richColors={true} position="top-right" />
        {children}
      </body>
    </html>
  );
}
