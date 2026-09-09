export function Formulas() {
  return (
    <div className="text-muted-foreground rounded-xl bg-card px-4 py-4 text-sm ring-1 ring-foreground/10 sm:px-5">
      <div className="max-w-3xl space-y-3">
        <p>
          Un profesor está con el grupo durante <strong>todas las horas del
          alumno</strong>. La duración de cada sesión no entra en el margen: el
          coste es el de esas horas, no el de cuántas clases se partan. El
          tamaño de clase reparte ese coste entre más personas. El CAC se
          aplica por alumno matriculado. Los totales del contrato suman todos
          los grupos del acuerdo.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Coste profesor / grupo = horas por alumno × €/hora del profesor
          </li>
          <li>
            Coste profesor / alumno = coste profesor del grupo ÷ tamaño de clase
          </li>
          <li>CAC grupo = CAC × tamaño de clase</li>
          <li>Ingresos / grupo = precio del curso × tamaño de clase</li>
          <li>
            Beneficio / grupo = ingresos − (coste profesor + CAC)
          </li>
          <li>Margen = beneficio ÷ ingresos</li>
          <li>ROI = beneficio ÷ costes (profesor + CAC)</li>
          <li>
            Punto de equilibrio (alumnos) = coste profesor del grupo ÷ (precio −
            CAC)
          </li>
          <li>
            Precio mínimo / alumno = coste profesor / alumno + CAC
          </li>
          <li>
            Techo €/h profesor = (ingresos − CAC grupo) ÷ horas del curso
          </li>
          <li>
            % profesor o CAC = ese coste ÷ ingresos del grupo
          </li>
        </ul>
        <p>
          Esto es <strong>margen de contribución</strong>: no incluye alquiler,
          administración, plataforma ALTEA ni cotizaciones. En FUNDAE el precio
          que ve la empresa puede no coincidir con lo que ingresa la academia.
        </p>
      </div>
    </div>
  )
}
