# Calculadora de rentabilidad de cursos

Herramienta interna para **ventas y dirección** de [Academia Georgetown](https://www.academiageorgetown.com/) (Pamplona). Modela un **acuerdo comercial** (un contrato con una empresa) y los **grupos o módulos** que lo componen: tamaños y duraciones distintos, totales del contrato y métricas de cada componente.

Los datos se quedan en el navegador. No hay login ni servidor.

## Qué hace

1. **Configuraciones de curso** (siempre visible) — nombre del acuerdo, empresa, plantilla FUNDAE, modalidad, crédito anual y una fila por cada grupo: horas, tamaño, profesor, CAC y precio.
2. **Totales del contrato** — ingresos, costes y contribución de la academia, más bonificación FUNDAE, % cubierto y neto de la empresa.
3. **Rentabilidades y ratios** — coste profesor/alumno, beneficio, margen, ROI, equilibrio, y columnas FUNDAE por grupo.
4. **Análisis de configuración** — gráfico de líneas de un grupo, con el cruce ingresos / coste total (punto de equilibrio) y deslizadores en tiempo real.
5. **Gráficos conmutables** — costes vs ingresos, beneficio, composición de costes, margen y equilibrio vs tamaño actual. Cada gráfico se puede ampliar a pantalla (Esc para cerrar; flechas para pasar al siguiente).

Todas las secciones salvo **Configuraciones de curso** se pueden plegar.

El ejemplo de partida (plan FUNDAE ilustrativo con cuatro grupos) no son tarifas oficiales. Cámbialo por datos reales antes de cotizar.

El resultado de la academia es **margen de contribución** (ingresos − profesor − captación). No incluye alquiler, administración ni plataforma.

La **bonificación FUNDAE** no es un ingreso de la academia: la empresa paga la factura y descuenta el crédito de las cotizaciones a la Seguridad Social (formación programada, no la convocatoria de oferta formativa). El techo de cada grupo es el mínimo entre factura, módulo económico (Orden TAS/2307/2007) y cofinanciación (Ley 30/2015 art. 11.5). Si indicas el crédito anual, se prorratea entre los grupos.

## Cómo ejecutarla

```bash
npm install
npm test
npm run dev
```

La app queda en `http://127.0.0.1:43127`.

```bash
npm run build
npm run preview
```

`base: './'` está configurado para que el build estático funcione tanto en la raíz como en un subpath de GitHub Pages.

## Publicar en GitHub Pages

1. Crea el repositorio en GitHub y sube este código.
2. En **Settings → Pages**, como fuente elige **GitHub Actions**.
3. El workflow `.github/workflows/pages.yml` construye `dist/` y publica en cada push a `main`.

También puedes publicar la carpeta `dist/` a mano después de `npm run build`.

## Fórmulas

| Métrica | Cálculo |
| --- | --- |
| Coste profesor / grupo | horas alumno × €/h profesor |
| Coste profesor / alumno | coste profesor del grupo ÷ tamaño de clase |
| Ingresos / grupo | precio × tamaño de clase |
| Beneficio | ingresos − (profesor + CAC) |
| Equilibrio (alumnos) | coste profesor del grupo ÷ (precio − CAC) |
| Totales del contrato | suma de los grupos del acuerdo |
| Techo FUNDAE / grupo | mín(factura, módulo €/h × horas × alumnos, tope de cofinanciación) |
| Bonificación | techo, recortado a prorrata si hay crédito anual |
| Neto empresa | factura − bonificación |

Módulos (participante/hora): presencial / aula virtual básico 9 €, superior 13 €, teleformación 7,50 €. Plantillas 1–9 sin tope de módulo; 10–49 pueden superarlo un 10 %; 50–249 un 5 %. Cofinanciación: 1–5 0 %, 6–9 5 %, 10–49 10 %, 50–249 20 %, ≥250 40 %. Si la formación es en jornada, el salario cubre esa parte. En 2026 el aula virtual se bonifica como presencial.

El profesor imparte el grupo durante todas las horas del alumno. El tamaño de clase es lo que diluye ese coste.

## Uso recomendado

- Comercial: este acuerdo de 4 grupos, ¿cubre profesor en cada uno y cuánto puede bonificar la empresa?
- Dirección: comparar componentes (particular, intensivo, in-company) dentro del mismo contrato.
- Exportar Excel (`.xlsx`): hojas **Contrato**, **Ratios** y **Gráficos**, con formato contable y bloque FUNDAE.
