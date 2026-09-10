export function Header() {
  return (
    <header className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-[1080px] items-center gap-3.5 px-4 py-4 sm:px-6">
        <div
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-gold/40"
        >
          <svg viewBox="0 0 48 48" className="size-6">
            <path
              fill="#7A6548"
              d="M24 4 8 10v14c0 10.5 7.2 17.8 16 20 8.8-2.2 16-9.5 16-20V10L24 4Z"
            />
            <text
              x="24"
              y="29"
              textAnchor="middle"
              fill="#16181c"
              fontFamily="Georgia, serif"
              fontSize="14"
              fontWeight="700"
            >
              AG
            </text>
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium tracking-[0.18em] text-gold uppercase">
            Academia Georgetown
          </p>
          <h1 className="font-heading text-[1.35rem] leading-tight font-medium tracking-tight sm:text-xl">
            Calculadora de rentabilidad de cursos
          </h1>
        </div>
      </div>
    </header>
  )
}
