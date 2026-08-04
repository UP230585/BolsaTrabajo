export function PageLoading({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-black/60">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-black/15 border-t-navy" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-black/15 bg-surface/60 px-6 py-10 text-center text-sm text-black/60">
      {children}
    </div>
  );
}
