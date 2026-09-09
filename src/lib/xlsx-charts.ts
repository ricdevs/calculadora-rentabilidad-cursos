import JSZip from 'jszip'

export type ChartSeries = {
  name: string
  color: string
  values: number[]
  formula: string
}

export type NativeChart = {
  title: string
  yFormat: 'euro' | 'percent' | 'number'
  categories: string[]
  categoriesFormula: string
  series: ChartSeries[]
  from: { col: number; row: number }
  to: { col: number; row: number }
}

function xml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function attr(source: string, name: string): string | null {
  return source.match(new RegExp(`${name}="([^"]+)"`))?.[1] ?? null
}

function sheetPathFromWorkbook(workbookXml: string, relsXml: string, name: string) {
  const sheets = [...workbookXml.matchAll(/<sheet\b[^>]*>/g)].map((match) => match[0])
  const sheet = sheets.find((node) => attr(node, 'name') === name)
  const rid = sheet ? attr(sheet, 'r:id') : null
  if (!rid) return null
  const rels = [...relsXml.matchAll(/<Relationship\b[^>]*>/g)].map((match) => match[0])
  const rel = rels.find((node) => attr(node, 'Id') === rid)
  const target = rel ? attr(rel, 'Target') : null
  if (!target) return null
  return target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`
}

function nextRid(relsXml: string): string {
  const ids = [...relsXml.matchAll(/Id="rId(\d+)"/g)].map((match) => Number(match[1]))
  return `rId${Math.max(0, ...ids) + 1}`
}

function numFmt(kind: NativeChart['yFormat']): string {
  if (kind === 'percent') return '0.0%'
  if (kind === 'euro') return '#,##0'
  return '#,##0.0'
}

function strCache(values: string[]): string {
  const pts = values
    .map((value, idx) => `<c:pt idx="${idx}"><c:v>${xml(value)}</c:v></c:pt>`)
    .join('')
  return `<c:strCache><c:ptCount val="${values.length}"/>${pts}</c:strCache>`
}

function numCache(values: number[]): string {
  const pts = values
    .map((value, idx) => `<c:pt idx="${idx}"><c:v>${value}</c:v></c:pt>`)
    .join('')
  return `<c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="${values.length}"/>${pts}</c:numCache>`
}

function seriesXml(series: ChartSeries, index: number, categories: NativeChart): string {
  return `<c:ser>
    <c:idx val="${index}"/>
    <c:order val="${index}"/>
    <c:tx><c:v>${xml(series.name)}</c:v></c:tx>
    <c:spPr>
      <a:solidFill><a:srgbClr val="${series.color}"/></a:solidFill>
      <a:ln><a:noFill/></a:ln>
    </c:spPr>
    <c:invertIfNegative val="0"/>
    <c:cat>
      <c:strRef>
        <c:f>${xml(categories.categoriesFormula)}</c:f>
        ${strCache(categories.categories)}
      </c:strRef>
    </c:cat>
    <c:val>
      <c:numRef>
        <c:f>${xml(series.formula)}</c:f>
        ${numCache(series.values)}
      </c:numRef>
    </c:val>
  </c:ser>`
}

function chartXml(chart: NativeChart): string {
  const series = chart.series.map((item, index) => seriesXml(item, index, chart)).join('')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <c:roundedCorners val="0"/>
  <c:chart>
    <c:title>
      <c:tx><c:rich>
        <a:bodyPr/>
        <a:lstStyle/>
        <a:p>
          <a:pPr><a:defRPr sz="1100" b="1"/></a:pPr>
          <a:r>
            <a:rPr lang="es-ES" sz="1100" b="1"><a:latin typeface="Calibri"/></a:rPr>
            <a:t>${xml(chart.title)}</a:t>
          </a:r>
        </a:p>
      </c:rich></c:tx>
      <c:overlay val="0"/>
    </c:title>
    <c:autoTitleDeleted val="0"/>
    <c:plotArea>
      <c:layout/>
      <c:barChart>
        <c:barDir val="col"/>
        <c:grouping val="clustered"/>
        <c:varyColors val="0"/>
        ${series}
        <c:dLbls><c:showLegendKey val="0"/><c:showVal val="0"/><c:showCatName val="0"/><c:showSerName val="0"/></c:dLbls>
        <c:gapWidth val="80"/>
        <c:axId val="1"/>
        <c:axId val="2"/>
      </c:barChart>
      <c:catAx>
        <c:axId val="1"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="b"/>
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="2"/>
        <c:crosses val="autoZero"/>
        <c:auto val="1"/>
        <c:lblAlgn val="ctr"/>
        <c:lblOffset val="100"/>
      </c:catAx>
      <c:valAx>
        <c:axId val="2"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="l"/>
        <c:majorGridlines>
          <c:spPr><a:ln w="6350"><a:solidFill><a:srgbClr val="D9D9D9"/></a:solidFill></a:ln></c:spPr>
        </c:majorGridlines>
        <c:numFmt formatCode="${xml(numFmt(chart.yFormat))}" sourceLinked="0"/>
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="1"/>
        <c:crosses val="autoZero"/>
      </c:valAx>
    </c:plotArea>
    <c:legend>
      <c:legendPos val="b"/>
      <c:overlay val="0"/>
    </c:legend>
    <c:plotVisOnly val="1"/>
    <c:dispBlanksAs val="gap"/>
  </c:chart>
  <c:spPr>
    <a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>
    <a:ln><a:solidFill><a:srgbClr val="BFBFBF"/></a:solidFill></a:ln>
  </c:spPr>
  <c:txPr>
    <a:bodyPr/>
    <a:lstStyle/>
    <a:p><a:pPr><a:defRPr sz="900"><a:latin typeface="Calibri"/></a:defRPr></a:pPr><a:endParaRPr lang="es-ES"/></a:p>
  </c:txPr>
</c:chartSpace>
`
}

function drawingXml(charts: NativeChart[]): string {
  const anchors = charts
    .map((chart, index) => {
      const rid = `rId${index + 1}`
      return `<xdr:twoCellAnchor>
  <xdr:from>
    <xdr:col>${chart.from.col}</xdr:col><xdr:colOff>0</xdr:colOff>
    <xdr:row>${chart.from.row}</xdr:row><xdr:rowOff>0</xdr:rowOff>
  </xdr:from>
  <xdr:to>
    <xdr:col>${chart.to.col}</xdr:col><xdr:colOff>0</xdr:colOff>
    <xdr:row>${chart.to.row}</xdr:row><xdr:rowOff>0</xdr:rowOff>
  </xdr:to>
  <xdr:graphicFrame macro="">
    <xdr:nvGraphicFramePr>
      <xdr:cNvPr id="${index + 2}" name="Gráfico ${index + 1}"/>
      <xdr:cNvGraphicFramePr><a:graphicFrameLocks noGrp="1"/></xdr:cNvGraphicFramePr>
    </xdr:nvGraphicFramePr>
    <xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>
    <a:graphic>
      <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
        <c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="${rid}"/>
      </a:graphicData>
    </a:graphic>
  </xdr:graphicFrame>
  <xdr:clientData/>
</xdr:twoCellAnchor>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
${anchors}
</xdr:wsDr>
`
}

function drawingRels(count: number): string {
  const rels = Array.from({ length: count }, (_, index) => {
    const id = index + 1
    return `<Relationship Id="rId${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart${id}.xml"/>`
  }).join('')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}</Relationships>`
}

export async function embedNativeCharts(
  buffer: ArrayBuffer | Uint8Array,
  sheetName: string,
  charts: NativeChart[],
): Promise<ArrayBuffer> {
  if (charts.length === 0) {
    return buffer instanceof ArrayBuffer ? buffer : buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
  }

  const zip = await JSZip.loadAsync(buffer)
  const workbookXml = await zip.file('xl/workbook.xml')?.async('string')
  const relsXml = await zip.file('xl/_rels/workbook.xml.rels')?.async('string')
  if (!workbookXml || !relsXml) return buffer as ArrayBuffer

  const sheetPath = sheetPathFromWorkbook(workbookXml, relsXml, sheetName)
  if (!sheetPath) return buffer as ArrayBuffer

  const sheetXml = await zip.file(sheetPath)?.async('string')
  if (!sheetXml) return buffer as ArrayBuffer

  const relsPath = sheetPath.replace(/worksheets\/([^/]+)$/, 'worksheets/_rels/$1.rels')
  let sheetRels = (await zip.file(relsPath)?.async('string')) ??
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`

  const drawingRid = nextRid(sheetRels)
  sheetRels = sheetRels.replace(
    '</Relationships>',
    `<Relationship Id="${drawingRid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>`,
  )

  const withDrawing = sheetXml.includes('<drawing ')
    ? sheetXml
    : sheetXml.replace('</worksheet>', `<drawing r:id="${drawingRid}"/></worksheet>`)

  zip.file(sheetPath, withDrawing)
  zip.file(relsPath, sheetRels)
  zip.file('xl/drawings/drawing1.xml', drawingXml(charts))
  zip.file('xl/drawings/_rels/drawing1.xml.rels', drawingRels(charts.length))

  charts.forEach((chart, index) => {
    zip.file(`xl/charts/chart${index + 1}.xml`, chartXml(chart))
  })

  let types = await zip.file('[Content_Types].xml')?.async('string')
  if (types) {
    const extras = [
      '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>',
      ...charts.map(
        (_, index) =>
          `<Override PartName="/xl/charts/chart${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`,
      ),
    ].filter((part) => !types!.includes(part))
    types = types.replace('</Types>', `${extras.join('')}</Types>`)
    zip.file('[Content_Types].xml', types)
  }

  return zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' })
}
