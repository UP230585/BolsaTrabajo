import type { ReactNode } from "react";
import { CheckCircleIcon } from "./icons";

interface AuthLayoutProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  bullets: string[];
  children: ReactNode;
}

export function AuthLayout({ icon, title, subtitle, bullets, children }: AuthLayoutProps) {
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-navy text-white flex-col justify-center px-12 py-16">
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/5" aria-hidden />
        <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-orange/10" aria-hidden />

        <div className="relative animate-fade-up">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">{icon}</div>
          <h2 className="text-2xl font-bold leading-snug mb-3">{title}</h2>
          <p className="text-white/70 mb-8">{subtitle}</p>
          <ul className="space-y-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5 text-sm text-white/85">
                <CheckCircleIcon className="h-4 w-4 mt-0.5 shrink-0 text-orange" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-surface px-6 py-16">{children}</div>
    </div>
  );
}
