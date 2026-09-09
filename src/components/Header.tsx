export function Header() {
  return (
    <header className="border-b border-gold/25 bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-[1120px] items-start justify-between gap-6 px-4 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div
            aria-hidden="true"
            className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-gold/35 bg-primary-foreground/5"
          >
            <svg viewBox="0 0 48 48" className="size-7">
              <path
                fill="#9A7D4A"
                d="M24 4 8 10v14c0 10.5 7.2 17.8 16 20 8.8-2.2 16-9.5 16-20V10L24 4Z"
              />
              <text
                x="24"
                y="29"
                textAnchor="middle"
                fill="#1c2836"
                fontFamily="Georgia, serif"
                fontSize="14"
                fontWeight="700"
              >
                AG
              </text>
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">
              Academia Georgetown
            </p>
            <h1 className="font-heading mt-0.5 text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
              Calculadora de rentabilidad de cursos
            </h1>
            <p className="mt-1.5 max-w-xl text-[13px] leading-snug text-primary-foreground/70">
              Para ventas y dirección. Un acuerdo con empresa puede agrupar
              varios grupos de distinto tamaño y duración: aquí ves el contrato
              entero y cada componente, con márgenes, equilibrio y coste de
              profesor.
            </p>
          </div>
        </div>
      </div>
      <div className="h-px bg-linear-to-r from-gold via-gold/50 to-transparent" />
    </header>
  )
}
