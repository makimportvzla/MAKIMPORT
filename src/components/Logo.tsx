import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** showText: true = imagen completa (ícono + texto integrado en la imagen).
   *  false  = sólo el ícono cuadrado del logo sin el bloque de texto.
   *  Por defecto: true */
  showText?: boolean;
}

/**
 * Renderiza el logo oficial de MAKIMPORT.
 * La imagen PNG ya incluye el ícono + "MAKIMPORT / SOLUCIONES EN MAQUINARIA".
 * - showText=true  → imagen completa (portrait con texto)  → usar en Hero, Footer, Auth
 * - showText=false → recorte cuadrado del ícono únicamente → usar en Navbar compacto
 */
export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  // Full logo (portrait): ícono + texto integrado dentro de la imagen
  const fullDimensions = {
    sm: { w: 80,  h: 100 },
    md: { w: 110, h: 138 },
    lg: { w: 150, h: 188 },
    xl: { w: 200, h: 250 },
  }[size];

  // Icon-only crop (square, top portion of the PNG that contains just the emblem)
  const iconDimensions = {
    sm: { w: 36, h: 36 },
    md: { w: 48, h: 48 },
    lg: { w: 64, h: 64 },
    xl: { w: 90, h: 90 },
  }[size];

  if (showText) {
    // Full logo with text: show the entire portrait image
    return (
      <div
        className={`inline-flex items-center select-none ${className}`}
        aria-label="MAKIMPORT – Soluciones en Maquinaria"
      >
        <Image
          src="/images/logo-makimport.png"
          alt="MAKIMPORT – Soluciones en Maquinaria"
          width={fullDimensions.w}
          height={fullDimensions.h}
          className="object-contain drop-shadow-[0_2px_14px_rgba(180,90,20,0.4)]"
          priority
        />
      </div>
    );
  }

  // Icon-only: show only the top square crop of the emblem
  // We use overflow-hidden + object-top to show just the emblem portion
  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      aria-label="MAKIMPORT Venezuela"
    >
      <div
        className="relative overflow-hidden shrink-0"
        style={{ width: iconDimensions.w, height: iconDimensions.h }}
      >
        <Image
          src="/images/logo-makimport.png"
          alt="MAKIMPORT"
          width={iconDimensions.w * 2}
          height={iconDimensions.w * 2}
          className="object-cover object-top drop-shadow-[0_2px_10px_rgba(180,90,20,0.35)]"
          style={{ marginTop: 0 }}
          priority
        />
      </div>
    </div>
  );
};
