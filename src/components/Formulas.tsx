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
          Esto es <strong>margen de contribución</strong> de la academia: no
          incluye alquiler, administración, plataforma ALTEA ni cotizaciones.
        </p>
        <p>
          <strong>FUNDAE</strong> no paga a la academia. El crédito es de la
          <strong>empresa</strong> (plantilla, modalidad y crédito anual del
          acuerdo). La empresa abona la factura y después descuenta una
          bonificación de las cotizaciones a la Seguridad Social (Sistema Red,
          casilla 763). El techo de cada grupo usa esas reglas de empresa y es
          el mínimo de tres límites:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Factura del grupo (precio × alumnos)</li>
          <li>
            Módulo económico (Orden TAS/2307/2007): horas × participantes ×
            €/h de la modalidad. Presencial / aula virtual básico 9 €,
            superior 13 €, teleformación 7,50 €. Plantillas de 1–9 no tienen
            tope de módulo; 10–49 pueden superarlo un 10 %; 50–249 un 5 %. En
            2026 el aula virtual se bonifica como presencial
            (BOE-A-2025-25790).
          </li>
          <li>
            Cofinanciación privada (Ley 30/2015 art. 11.5): 1–5 = 0 %, 6–9 =
            5 %, 10–49 = 10 %, 50–249 = 20 %, 250+ = 40 %. Si la formación es
            en jornada, el salario de los alumnos cubre esa parte y el techo
            puede llegar a la factura. Si no, la bonificación máxima es factura
            × (1 − %).
          </li>
        </ul>
        <p>
          Si indicas el crédito anual de la empresa y la suma de grupos lo
          supera, se prorratea. El neto empresa es factura − bonificación. No
          uses los módulos de la convocatoria de oferta formativa (15,4 / 8,9
          €): son otra línea de ayudas.
        </p>
      </div>
    </div>
  )
}
