import type { Metadata } from "next";
// Antes usábamos next/font/google (Geist + Geist_Mono), que descarga los
// archivos de fuente desde Google Fonts en tiempo de build. Eso hizo fallar
// el build de Docker en el runner self-hosted cuando Google Fonts no
// respondió a tiempo ("Failed to fetch `Geist Mono` from Google Fonts").
// El paquete "geist" trae las mismas fuentes empaquetadas localmente en
// node_modules, así que el build ya no depende de internet.
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AuthProvider } from "@/context/AuthContext";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Bolsa de Trabajo UPA",
  description: "Conectamos el talento de la UPA con las empresas de Aguascalientes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Header />
          <Breadcrumbs />
          <main className="flex-1 flex flex-col">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
