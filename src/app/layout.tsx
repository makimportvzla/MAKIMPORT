import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { PWAOfflineHandler } from "@/components/PWAOfflineHandler";

export const metadata: Metadata = {
  title: "MAKIMPORT | Importación y Subastas de Maquinaria Pesada para Venezuela",
  description: "Plataforma especializada en la importación directa y subastas en vivo de maquinaria pesada desde Estados Unidos (Houston, Miami) y China (Shanghai, Ningbo) hacia Venezuela. Inspecciones certificadas de 140 puntos y logística aduanal en Puerto Cabello y La Guaira.",
  keywords: ["Maquinaria Pesada Venezuela", "Subastas de Excavadoras", "Importar Caterpillar a Venezuela", "Komatsu", "Puerto Cabello", "La Guaira", "SANY", "XCMG", "Bulldozers Venezuela"],
  manifest: "/manifest.json",
  themeColor: "#ea580c",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MAKIMPORT",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  openGraph: {
    title: "MAKIMPORT | Maquinaria Pesada para Venezuela",
    description: "Importación directa y subastas de maquinaria pesada. Excavadoras, bulldozers, motoniveladoras y más.",
    type: "website",
    locale: "es_VE",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-orange-600 selection:text-white">
        <AuthProvider>
          <PWAOfflineHandler />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

