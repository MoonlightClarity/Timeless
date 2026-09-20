import type { TimelessDocumentSettings } from './projectXml'

type PdfRecord = Record<string, unknown>

let fontsRegistered = false

export function pdfFontFamily(fontFamily: string) {
  const normalized = fontFamily.trim().toLowerCase()
  if (normalized.includes('courier') || normalized.includes('mono')) return 'Courier'
  if (
    normalized.includes('arial')
    || normalized.includes('calibri')
    || normalized.includes('helvetica')
    || normalized.includes('sans')
  ) return 'Helvetica'
  return 'Times'
}

export function pdfFileName(title: string) {
  const withoutControls = Array.from(title.trim())
    .map((character) => character.charCodeAt(0) < 32 ? '-' : character)
    .join('')

  const base = withoutControls
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/[. ]+$/g, '')
    .slice(0, 120)

  return `${base || 'Untitled'}.pdf`
}

export function pdfContentWidthPoints(settings: TimelessDocumentSettings) {
  const portraitWidth = settings.pageSize === 'a4' ? 595.28 : 612
  const pageWidth = settings.orientation === 'landscape'
    ? (settings.pageSize === 'a4' ? 841.89 : 792)
    : portraitWidth
  return Math.max(72, pageWidth - (settings.marginInches * 144))
}

export function pdfContentHeightPoints(settings: TimelessDocumentSettings) {
  const portraitHeight = settings.pageSize === 'a4' ? 841.89 : 792
  const pageHeight = settings.orientation === 'landscape'
    ? (settings.pageSize === 'a4' ? 595.28 : 612)
    : portraitHeight
  return Math.max(72, pageHeight - (settings.marginInches * 144))
}

export function buildPdfHeader(settings: TimelessDocumentSettings, currentPage: number) {
  const runningHead = settings.runningHead?.trim() || ''
  if (!runningHead && !settings.pageNumbers) return undefined

  const marginPoints = settings.marginInches * 72
  return {
    columns: [
      {
        text: runningHead,
        alignment: 'left',
        width: '*',
      },
      {
        text: settings.pageNumbers ? String(currentPage) : '',
        alignment: 'right',
        width: 'auto',
      },
    ],
    margin: [marginPoints, Math.max(12, marginPoints / 2), marginPoints, 0],
    font: pdfFontFamily(settings.bodyFont),
    fontSize: settings.bodyFontSize,
  }
}

function preparePdfHtml(contentHtml: string, settings: TimelessDocumentSettings) {
  const document = new DOMParser().parseFromString(`<main>${contentHtml}</main>`, 'text/html')
  const root = document.body.firstElementChild as HTMLElement | null
  if (!root) return contentHtml

  root.querySelectorAll<HTMLElement>('.generated-citation, .csl-entry, [data-reference-entry="true"]').forEach((reference) => {
    reference.style.marginLeft = '0.5in'
    reference.style.textIndent = '-0.5in'
    const storedLineSpacing = Number(reference.dataset.referenceLineSpacing)
    const storedEntrySpacing = Number(reference.dataset.referenceEntrySpacing)
    if (Number.isFinite(storedLineSpacing) && storedLineSpacing > 0) {
      reference.style.lineHeight = String(storedLineSpacing)
    } else if (!reference.style.lineHeight) {
      reference.style.lineHeight = String(settings.lineHeight)
    }
    if (Number.isFinite(storedEntrySpacing) && storedEntrySpacing >= 0) {
      reference.style.marginBottom = `${storedEntrySpacing}em`
    }
  })

  root.querySelectorAll<HTMLUListElement>('ul[data-type="taskList"]').forEach((list) => {
    list.style.listStyleType = 'none'
  })

  root.querySelectorAll<HTMLLIElement>('li[data-type="taskItem"]').forEach((item) => {
    const checked = item.getAttribute('data-checked') === 'true'
    item.querySelector(':scope > label')?.remove()

    const firstParagraph = item.querySelector<HTMLElement>(':scope > div > p')
    const marker = document.createTextNode(checked ? '[x] ' : '[ ] ')
    if (firstParagraph) firstParagraph.insertBefore(marker, firstParagraph.firstChild)
    else item.insertBefore(marker, item.firstChild)
  })

  root.querySelectorAll<HTMLElement>('div[data-figure-align]').forEach((figure) => {
    const caption = figure.nextElementSibling as HTMLElement | null
    if (
      !caption
      || caption.tagName !== 'P'
      || !caption.textContent?.trim().startsWith('Figure.')
    ) return

    figure.classList.add('timeless-pdf-figure')
    figure.appendChild(caption)
  })

  root.querySelectorAll<HTMLElement>('.references-title').forEach((heading) => {
    heading.style.fontFamily = settings.bodyFont
    heading.style.fontSize = `${settings.bodyFontSize}pt`
    const storedLineSpacing = Number(heading.dataset.referenceLineSpacing)
    heading.style.lineHeight = String(
      Number.isFinite(storedLineSpacing) && storedLineSpacing > 0
        ? storedLineSpacing
        : settings.lineHeight,
    )
    heading.style.marginBottom = '0'
    heading.style.textAlign = 'center'
    heading.style.textIndent = '0'
    heading.style.fontWeight = heading.closest('.citation-style-apa') ? '700' : '400'
  })

  root.querySelectorAll<HTMLElement>('[data-reference-title="true"]').forEach((heading) => {
    heading.style.fontFamily = settings.bodyFont
    heading.style.fontSize = `${settings.bodyFontSize}pt`
    const storedLineSpacing = Number(heading.dataset.referenceLineSpacing)
    heading.style.lineHeight = String(
      Number.isFinite(storedLineSpacing) && storedLineSpacing > 0
        ? storedLineSpacing
        : settings.lineHeight,
    )
    heading.style.marginBottom = '0'
    heading.style.textAlign = 'center'
    heading.style.textIndent = '0'
  })

  if (settings.headingStyle === 'apa') {
    Array.from(root.querySelectorAll<HTMLHeadingElement>('h4, h5')).forEach((heading) => {
      const next = heading.nextElementSibling
      if (!next || next.tagName !== 'P') return

      const paragraph = document.createElement('p')
      paragraph.classList.add('apa-run-in-heading')
      paragraph.style.textIndent = '0.5in'
      paragraph.style.marginBottom = `${settings.paragraphSpacing}pt`

      const strong = document.createElement('strong')
      const headingContent = heading.tagName === 'H5'
        ? document.createElement('em')
        : strong

      if (heading.tagName === 'H5') {
        strong.appendChild(headingContent)
      }

      while (heading.firstChild) headingContent.appendChild(heading.firstChild)
      paragraph.appendChild(strong)
      paragraph.appendChild(document.createTextNode('. '))
      while (next.firstChild) paragraph.appendChild(next.firstChild)

      heading.replaceWith(paragraph)
      next.remove()
    })
  }

  return root.innerHTML
}

type PdfNormalizeContext = {
  suppressParagraphIndent: boolean
  hasPreviousSibling: boolean
  previousEndsPage: boolean
}

function pdfNodeHasSubstantiveContent(value: unknown): boolean {
  if (typeof value === 'string') return Boolean(value.trim())
  if (typeof value === 'number') return true
  if (Array.isArray(value)) return value.some(pdfNodeHasSubstantiveContent)
  if (!value || typeof value !== 'object') return false

  const record = value as PdfRecord
  if (
    record.image
    || record.svg
    || record.canvas
    || record.table
    || record.ul
    || record.ol
    || record.qr
  ) return true

  return ['text', 'stack', 'columns']
    .some((key) => pdfNodeHasSubstantiveContent(record[key]))
}

function pdfNodeEndsPage(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return (value as PdfRecord).pageBreak === 'after'
}

function styleNames(record: PdfRecord) {
  const style = record.style
  if (Array.isArray(style)) return style.filter((value): value is string => typeof value === 'string')
  return typeof style === 'string' ? [style] : []
}

export function normalizePdfContent(
  value: unknown,
  settings: TimelessDocumentSettings,
  context: PdfNormalizeContext = {
    suppressParagraphIndent: false,
    hasPreviousSibling: false,
    previousEndsPage: false,
  },
) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const previous = value.slice(0, index)
      normalizePdfContent(item, settings, {
        ...context,
        hasPreviousSibling: previous.some(pdfNodeHasSubstantiveContent),
        previousEndsPage: previous.length > 0 && pdfNodeEndsPage(previous[previous.length - 1]),
      })
    })
    return
  }
  if (!value || typeof value !== 'object') return

  const record = value as PdfRecord
  const nodeName = typeof record.nodeName === 'string' ? record.nodeName.toUpperCase() : ''
  const styles = styleNames(record)
  const isReference = styles.some((style) => (
    style === 'generated-citation'
    || style === 'csl-entry'
    || style === 'reference-entry'
    || style === 'reference-section-title'
    || style === 'references-title'
    || style === 'references'
  ))
  const isApaRunInHeading = styles.includes('apa-run-in-heading')
  const isAuthorNoteParagraph = nodeName === 'P' && styles.includes('timeless-author-note')
  const isPaperTitle = styles.includes('timeless-body-title')
  const isFigureGroup = styles.includes('timeless-pdf-figure')
  const isApaTable = styles.includes('timeless-apa-table')
  const isFrontMatter = styles.some((style) => (
    style === 'timeless-title-page'
    || style === 'timeless-title-page-main'
    || style === 'timeless-author-note'
    || style === 'timeless-abstract-page'
  ))
  const suppressParagraphIndent = (
    context.suppressParagraphIndent
    || isReference
    || isFrontMatter
    || isPaperTitle
    || ['LI', 'UL', 'OL', 'TABLE', 'TD', 'TH', 'BLOCKQUOTE', 'PRE'].includes(nodeName)
  )

  if (typeof record.font === 'string') record.font = pdfFontFamily(record.font)

  if (styles.includes('generated-citation') || styles.includes('csl-entry')) {
    const currentMargin = Array.isArray(record.margin) ? record.margin : [0, 0, 0, 0]
    record.margin = [
      36,
      typeof currentMargin[1] === 'number' ? currentMargin[1] : 0,
      typeof currentMargin[2] === 'number' ? currentMargin[2] : 0,
      typeof currentMargin[3] === 'number' ? currentMargin[3] : 0,
    ]
    record.leadingIndent = -36
  }

  if (nodeName === 'P') {
    delete record.textIndent
    if (styles.includes('reference-entry')) {
      const currentMargin = Array.isArray(record.margin) ? record.margin : [0, 0, 0, 0]
      record.margin = [
        36,
        typeof currentMargin[1] === 'number' ? currentMargin[1] : 0,
        typeof currentMargin[2] === 'number' ? currentMargin[2] : 0,
        typeof currentMargin[3] === 'number' ? currentMargin[3] : 0,
      ]
      record.leadingIndent = -36
    } else if (isApaRunInHeading || isAuthorNoteParagraph) {
      record.leadingIndent = 36
    } else if (!suppressParagraphIndent && settings.firstLineIndent > 0) {
      record.leadingIndent = settings.firstLineIndent * 72
    } else {
      delete record.leadingIndent
    }
  }

  if (
    nodeName === 'SECTION'
    && styles.includes('references')
    && (styles.includes('citation-style-apa') || styles.includes('citation-style-mla'))
    && context.hasPreviousSibling
    && !context.previousEndsPage
  ) {
    record.pageBreak = 'before'
  }

  if (nodeName === 'BLOCKQUOTE' && settings.headingStyle === 'apa') {
    record.margin = [36, 0, 0, 0]
    record.color = '#111111'
  }

  if (isFigureGroup) {
    record.unbreakable = true
  }

  if (styles.includes('timeless-abstract-page')) {
    record.margin = [0, 0, 0, 0]
  }

  if (styles.includes('timeless-abstract-keywords')) {
    record.leadingIndent = 36
  }

  if (nodeName === 'TABLE' && record.table && typeof record.table === 'object') {
    const table = record.table as PdfRecord
    const body = Array.isArray(table.body) ? table.body : []
    const firstRow = Array.isArray(body[0]) ? body[0] : []
    const hasHeaderRow = firstRow.some((cell) => (
      cell
      && typeof cell === 'object'
      && (cell as PdfRecord).nodeName === 'TH'
    ))

    table.dontBreakRows = true
    if (hasHeaderRow) {
      table.headerRows = 1
      if (body.length > 1) table.keepWithHeaderRows = 1
    }

    if (isApaTable) {
      record.layout = {
        hLineWidth: (index: number, node: PdfRecord) => {
          const rows = Array.isArray((node.table as PdfRecord | undefined)?.body)
            ? ((node.table as PdfRecord).body as unknown[]).length
            : body.length
          if (index === 0 || index === rows) return 1
          if (hasHeaderRow && index === 1) return 1
          return 0
        },
        vLineWidth: () => 0,
        hLineColor: () => '#111111',
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 3,
        paddingBottom: () => 3,
      }
    }
  }

  if (nodeName === 'IMG') {
    record.maxWidth = Math.min(
      typeof record.maxWidth === 'number' ? record.maxWidth : Number.POSITIVE_INFINITY,
      pdfContentWidthPoints(settings),
    )
    record.maxHeight = Math.min(
      typeof record.maxHeight === 'number' ? record.maxHeight : Number.POSITIVE_INFINITY,
      Math.max(72, pdfContentHeightPoints(settings) - 72),
    )
  }

  if (nodeName === 'HR' && Array.isArray(record.canvas)) {
    const maxWidth = pdfContentWidthPoints(settings)
    record.canvas.forEach((shape) => {
      if (!shape || typeof shape !== 'object') return
      const line = shape as PdfRecord
      if (line.type === 'line') line.x2 = maxWidth
    })
  }

  const childContext = {
    suppressParagraphIndent,
    hasPreviousSibling: false,
    previousEndsPage: false,
  }
  Object.entries(record).forEach(([key, child]) => {
    if (key === 'style') return
    normalizePdfContent(child, settings, childContext)
  })
}

export function isPdfNativeImageSource(source: string) {
  return /^data:image\/(?:png|jpe?g);base64,/i.test(source)
    || /^(?:https?:|blob:)/i.test(source)
}

async function convertDataImageToPng(source: string) {
  if (isPdfNativeImageSource(source)) return source
  if (!/^data:image\//i.test(source)) return source

  return new Promise<string>((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth || image.width
      canvas.height = image.naturalHeight || image.height
      const context = canvas.getContext('2d')
      if (!context || !canvas.width || !canvas.height) {
        reject(new Error('Could not prepare an image for PDF export.'))
        return
      }
      context.drawImage(image, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    image.onerror = () => reject(new Error('Could not decode an image for PDF export.'))
    image.src = source
  })
}

async function normalizePdfImages(value: unknown): Promise<void> {
  if (Array.isArray(value)) {
    await Promise.all(value.map((item) => normalizePdfImages(item)))
    return
  }
  if (!value || typeof value !== 'object') return

  const record = value as PdfRecord
  if (typeof record.image === 'string' && !isPdfNativeImageSource(record.image)) {
    record.image = await convertDataImageToPng(record.image)
  }

  await Promise.all(
    Object.entries(record)
      .filter(([key]) => key !== 'image')
      .map(([, child]) => normalizePdfImages(child)),
  )
}

function pdfCustomTag(params: {
  element: Element
  ret: PdfRecord
}) {
  if (params.element.hasAttribute('data-timeless-page-break')) {
    return {
      text: '',
      pageBreak: 'after',
    }
  }

  const heading = params.element.nodeName.match(/^H([1-5])$/)
  if (heading) params.ret.headlineLevel = Number(heading[1])

  return params.ret
}

export function shouldBreakBeforeHeading(
  currentNode: PdfRecord,
  container: {
    getFollowingNodesOnPage: () => unknown[]
    getNodesOnNextPage: () => unknown[]
  },
) {
  return (
    typeof currentNode.headlineLevel === 'number'
    && container.getFollowingNodesOnPage().length === 0
    && container.getNodesOnNextPage().length > 0
  )
}

export async function exportTimelessPdf({
  title,
  contentHtml,
  settings,
}: {
  title: string
  contentHtml: string
  settings: TimelessDocumentSettings
}) {
  const [
    pdfMakeModule,
    timesModule,
    helveticaModule,
    courierModule,
    htmlToPdfmakeModule,
  ] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/standard-fonts/Times'),
    import('pdfmake/build/standard-fonts/Helvetica'),
    import('pdfmake/build/standard-fonts/Courier'),
    import('html-to-pdfmake'),
  ])

  const pdfMake = pdfMakeModule.default
  if (!fontsRegistered) {
    pdfMake.addFontContainer(timesModule.default)
    pdfMake.addFontContainer(helveticaModule.default)
    pdfMake.addFontContainer(courierModule.default)
    fontsRegistered = true
  }

  const headingFont = pdfFontFamily(settings.headingFont)
  const html = preparePdfHtml(contentHtml, settings)
  const content = htmlToPdfmakeModule.default(html, {
    window,
    tableAutoSize: true,
    removeExtraBlanks: false,
    defaultStyles: {
      p: {
        margin: [0, 0, 0, settings.paragraphSpacing],
        fontSize: settings.bodyFontSize,
        lineHeight: settings.lineHeight,
      },
      h1: {
        font: headingFont,
        fontSize: settings.headingSizes.h1,
        bold: true,
        italics: false,
        alignment: settings.headingStyle === 'apa' ? 'center' : 'left',
        margin: [0, 0, 0, 0],
        lineHeight: settings.lineHeight,
      },
      h2: {
        font: headingFont,
        fontSize: settings.headingSizes.h2,
        bold: true,
        italics: false,
        alignment: 'left',
        margin: [0, 0, 0, 0],
        lineHeight: settings.lineHeight,
      },
      h3: {
        font: headingFont,
        fontSize: settings.headingSizes.h3,
        bold: true,
        italics: settings.headingStyle === 'apa',
        alignment: 'left',
        margin: [0, 0, 0, 0],
        lineHeight: settings.lineHeight,
      },
      h4: {
        font: headingFont,
        fontSize: settings.headingSizes.h4,
        bold: true,
        italics: settings.headingStyle !== 'apa',
        margin: [0, 0, 0, 0],
        lineHeight: settings.lineHeight,
      },
      h5: {
        font: headingFont,
        fontSize: settings.headingSizes.h5 ?? settings.bodyFontSize,
        bold: true,
        italics: true,
        margin: [0, 0, 0, 0],
        lineHeight: settings.lineHeight,
      },
      a: {
        color: '#000000',
        decoration: 'none',
      },
    },
    customTag(params) {
      return pdfCustomTag(params)
    },
  })

  normalizePdfContent(content, settings)
  await normalizePdfImages(content)

  const marginPoints = settings.marginInches * 72
  const bodyFont = pdfFontFamily(settings.bodyFont)
  const headerEnabled = Boolean(settings.runningHead?.trim()) || Boolean(settings.pageNumbers)

  const definition: PdfRecord = {
    info: {
      title: title.trim() || 'Untitled',
      creator: 'Timeless',
    },
    pageSize: settings.pageSize === 'a4' ? 'A4' : 'LETTER',
    pageOrientation: settings.orientation || 'portrait',
    pageMargins: [marginPoints, marginPoints, marginPoints, marginPoints],
    content,
    pageBreakBefore: shouldBreakBeforeHeading,
    defaultStyle: {
      font: bodyFont,
      fontSize: settings.bodyFontSize,
      lineHeight: settings.lineHeight,
      color: '#111111',
    },
  }

  if (headerEnabled) {
    definition.header = (currentPage: number) => buildPdfHeader(settings, currentPage)
  }

  const result = pdfMake.createPdf(definition).download(pdfFileName(title))
  await Promise.resolve(result)
}
