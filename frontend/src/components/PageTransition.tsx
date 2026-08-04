"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Remonta en cada cambio de ruta para que el fade-in se repita en toda pantalla. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="flex-1 flex flex-col animate-fade-in">
      {children}
    </div>
  );
}
