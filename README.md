# Calculadora de rentabilidad de cursos

Herramienta interna para **ventas y dirección** de [Academia Georgetown](https://www.academiageorgetown.com/) (Pamplona). Compara configuraciones de curso y lee de un vistazo márgenes, punto de equilibrio y coste de profesor.

Los datos se quedan en el navegador. No hay login ni servidor.

## Qué hace

1. **Configuraciones de curso** — horas por alumno, tamaño de clase, duración, coste del profesor (€/h), CAC y precio.
2. **Rentabilidades y ratios** — sesiones, coste profesor/alumno, beneficio, margen, ROI, €/hora-alumno y alumnos mínimos para cubrir profesor + CAC.
3. **Gráficos conmutables** — costes vs ingresos, beneficio, composición de costes, margen y equilibrio vs tamaño actual.

Los escenarios de ejemplo (grupo anual, particular, intensivo de verano, empresa 24 semanas) son **ilustrativos**. Cámbialos por tarifas reales antes de cotizar.

El resultado es **margen de contribución** (ingresos − profesor − captación). No incluye alquiler, administración ni plataforma.

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
| Sesiones | horas alumno ÷ duración de la clase |
| Coste profesor / grupo | horas alumno × €/h profesor |
| Coste profesor / alumno | coste profesor del grupo ÷ tamaño de clase |
| Ingresos / grupo | precio × tamaño de clase |
| Beneficio | ingresos − (profesor + CAC) |
| Equilibrio (alumnos) | coste profesor del grupo ÷ (precio − CAC) |

El profesor imparte el grupo durante todas las horas del alumno. El tamaño de clase es lo que diluye ese coste.

## Uso recomendado

- Comercial: ¿este grupo de 6 cubre profesor, o hace falta 8?
- Dirección: particular vs grupo vs intensivo vs empresa, mismo modelo.
- Exportar CSV para llevarlo a una hoja de cálculo.
