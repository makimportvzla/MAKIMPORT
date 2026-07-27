import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "MAKIMPORT | Importación y Subastas de Maquinaria Pesada para Venezuela",
  description: "Plataforma especializada en la importación directa y subastas en vivo de maquinaria pesada desde Estados Unidos (Houston, Miami) y China (Shanghai, Ningbo) hacia Venezuela. Inspecciones certificadas de 140 puntos y logística aduanal en Puerto Cabello y La Guaira.",
  keywords: ["Maquinaria Pesada Venezuela", "Subastas de Excavadoras", "Importar Caterpillar a Venezuela", "Komatsu", "Puerto Cabello", "La Guaira", "SANY", "XCMG", "Bulldozers Venezuela"],
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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
