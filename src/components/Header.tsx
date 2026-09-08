export function Header() {
  return (
    <header className="border-b border-gold/40 bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-[1440px] items-start justify-between gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-start gap-4">
          <div
            aria-hidden="true"
            className="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-md border border-gold/50 bg-primary-foreground/5"
          >
            <svg viewBox="0 0 48 48" className="size-9">
              <path
                fill="#C9A227"
                d="M24 4 8 10v14c0 10.5 7.2 17.8 16 20 8.8-2.2 16-9.5 16-20V10L24 4Z"
              />
              <text
                x="24"
                y="29"
                textAnchor="middle"
                fill="#0C1F3A"
                fontFamily="Georgia, serif"
                fontSize="14"
                fontWeight="700"
              >
                AG
              </text>
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] text-gold uppercase">
              Academia Georgetown
            </p>
            <h1 className="font-heading mt-1 text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
              Calculadora de rentabilidad de cursos
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-primary-foreground/75">
              Para ventas y dirección. Compara configuraciones de grupo,
              particular, intensivo o empresa y lee márgenes, punto de equilibrio
              y coste de profesor en el mismo sitio.
            </p>
          </div>
        </div>
      </div>
      <div className="h-1 bg-linear-to-r from-gold via-gold/70 to-transparent" />
    </header>
  )
}
