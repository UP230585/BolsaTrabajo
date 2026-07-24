export function Footer() {
  return (
    <footer className="bg-surface border-t border-black/10">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-black/60 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} Bolsa de Trabajo UPA — Universidad Politécnica de Aguascalientes.</p>
        <p>Proyecto Integrador · Grupo ISC08C</p>
      </div>
    </footer>
  );
}
