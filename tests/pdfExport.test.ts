import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildPdfHeader,
  isPdfNativeImageSource,
  normalizePdfContent,
  pdfContentHeightPoints,
  pdfContentWidthPoints,
  pdfFileName,
  pdfFontFamily,
  shouldBreakBeforeHeading,
} from '../src/pdfExport.ts'
import type { TimelessDocumentSettings } from '../src/projectXml.ts'

const settings: TimelessDocumentSettings = {
  bodyFont: 'Times New Roman',
  bodyFontSize: 12,
  headingFont: 'Times New Roman',
  headingSizes: { h1: 12, h2: 12, h3: 12, h4: 12, h5: 12 },
  lineHeight: 2,
  paragraphSpacing: 0,
  firstLineIndent: 0.5,
  marginInches: 1,
  pageSize: 'letter',
  orientation: 'portrait',
  runningHead: 'SHORT TITLE',
  pageNumbers: true,
  automaticCitations: true,
  automaticReferences: false,
  headingStyle: 'apa',
}

test('maps Timeless font choices onto PDF-native font families', () => {
  assert.equal(pdfFontFamily('Times New Roman'), 'Times')
  assert.equal(pdfFontFamily('Georgia'), 'Times')
  assert.equal(pdfFontFamily('Arial'), 'Helvetica')
  assert.equal(pdfFontFamily('Calibri'), 'Helvetica')
  assert.equal(pdfFontFamily('Courier New'), 'Courier')
})

test('recognizes image sources that pdfmake can use without conversion', () => {
  assert.equal(isPdfNativeImageSource('data:image/png;base64,abc'), true)
  assert.equal(isPdfNativeImageSource('data:image/jpeg;base64,abc'), true)
  assert.equal(isPdfNativeImageSource('data:image/jpg;base64,abc'), true)
  assert.equal(isPdfNativeImageSource('https://example.test/image.png'), true)
  assert.equal(isPdfNativeImageSource('data:image/webp;base64,abc'), false)
  assert.equal(isPdfNativeImageSource('data:image/gif;base64,abc'), false)
  assert.equal(isPdfNativeImageSource('data:image/svg+xml;base64,abc'), false)
})

test('calculates printable page dimensions from size, orientation, and margins', () => {
  assert.equal(pdfContentWidthPoints(settings), 468)
  assert.equal(pdfContentHeightPoints(settings), 648)
  assert.equal(pdfContentWidthPoints({ ...settings, orientation: 'landscape' }), 648)
  assert.equal(pdfContentHeightPoints({ ...settings, orientation: 'landscape' }), 468)
  assert.ok(Math.abs(pdfContentWidthPoints({ ...settings, pageSize: 'a4' }) - 451.28) < 0.01)
  assert.ok(Math.abs(pdfContentHeightPoints({ ...settings, pageSize: 'a4' }) - 697.89) < 0.01)
})

test('normalizes paragraph indents, fonts, images, and horizontal rules for PDF layout', () => {
  const content = [
    {
      nodeName: 'P',
      text: 'Body paragraph',
      font: 'Times New Roman',
      textIndent: 36,
    },
    {
      nodeName: 'IMG',
      image: 'data:image/png;base64,abc',
    },
    {
      nodeName: 'HR',
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 514, y2: 0 }],
    },
  ]

  normalizePdfContent(content, settings)

  assert.equal(content[0].font, 'Times')
  assert.equal(content[0].leadingIndent, 36)
  assert.equal('textIndent' in content[0], false)
  assert.equal(content[1].maxWidth, 468)
  assert.equal(content[1].maxHeight, 576)
  assert.equal(content[2].canvas[0].x2, 468)
})

test('keeps figure and caption groups together during PDF pagination', () => {
  const figure = {
    nodeName: 'DIV',
    style: ['timeless-pdf-figure'],
    stack: [
      { nodeName: 'IMG', image: 'data:image/png;base64,abc' },
      { nodeName: 'P', text: 'Figure. Example caption' },
    ],
  }

  normalizePdfContent(figure, settings)

  assert.equal(figure.unbreakable, true)
  assert.equal(figure.stack[0].maxHeight, 576)
})

test('keeps APA run-in headings at a half-inch indent independent of body paragraph indentation', () => {
  const runIn = {
    nodeName: 'P',
    style: ['apa-run-in-heading'],
    text: 'Run-in heading. Body text',
  }

  normalizePdfContent(runIn, {
    ...settings,
    firstLineIndent: 0,
  })

  assert.equal(runIn.leadingIndent, 36)
})

test('does not apply body first-line indents inside lists or generated references', () => {
  const content = [
    {
      nodeName: 'UL',
      ul: [
        {
          nodeName: 'LI',
          stack: [{ nodeName: 'P', text: 'List paragraph' }],
        },
      ],
    },
    {
      nodeName: 'DIV',
      style: ['generated-citation'],
      stack: [{ nodeName: 'P', text: 'Reference paragraph' }],
    },
  ]

  normalizePdfContent(content, settings)

  const listParagraph = content[0].ul[0].stack[0]
  const reference = content[1]
  const referenceParagraph = reference.stack[0]
  assert.equal('leadingIndent' in listParagraph, false)
  assert.equal('leadingIndent' in referenceParagraph, false)
  assert.deepEqual(reference.margin, [36, 0, 0, 0])
  assert.equal(reference.leadingIndent, -36)

  const manualReference = {
    nodeName: 'P',
    style: ['reference-entry'],
    text: 'Editable reference paragraph',
  }
  normalizePdfContent(manualReference, settings)
  assert.deepEqual(manualReference.margin, [36, 0, 0, 0])
  assert.equal(manualReference.leadingIndent, -36)

  const referenceTitle = {
    nodeName: 'P',
    style: ['references-title'],
    text: 'References',
  }
  normalizePdfContent(referenceTitle, settings)
  assert.equal('leadingIndent' in referenceTitle, false)
})

test('preserves citation-style line and entry spacing while normalizing reference indents', () => {
  const manualReference = {
    nodeName: 'P',
    style: ['reference-entry'],
    text: 'Editable Chicago reference',
    lineHeight: 1,
    margin: [0, 0, 0, 12],
  }

  normalizePdfContent(manualReference, settings)

  assert.equal(manualReference.lineHeight, 1)
  assert.deepEqual(manualReference.margin, [36, 0, 0, 12])
  assert.equal(manualReference.leadingIndent, -36)

  const generatedReference = {
    nodeName: 'DIV',
    style: ['generated-citation'],
    text: 'Generated Chicago reference',
    lineHeight: 1,
    margin: [0, 0, 0, 12],
  }

  normalizePdfContent(generatedReference, settings)

  assert.equal(generatedReference.lineHeight, 1)
  assert.deepEqual(generatedReference.margin, [36, 0, 0, 12])
  assert.equal(generatedReference.leadingIndent, -36)
})

test('keeps table rows intact and repeats a detected header row', () => {
  const table = {
    nodeName: 'TABLE',
    table: {
      body: [
        [
          { nodeName: 'TH', text: 'Column A' },
          { nodeName: 'TH', text: 'Column B' },
        ],
        [
          { nodeName: 'TD', text: 'A1' },
          { nodeName: 'TD', text: 'B1' },
        ],
      ],
    },
  }

  normalizePdfContent(table, settings)

  assert.equal(table.table.dontBreakRows, true)
  assert.equal(table.table.headerRows, 1)
  assert.equal(table.table.keepWithHeaderRows, 1)

  const headerless = {
    nodeName: 'TABLE',
    table: {
      body: [[{ nodeName: 'TD', text: 'Only row' }]],
    },
  }

  normalizePdfContent(headerless, settings)

  assert.equal(headerless.table.dontBreakRows, true)
  assert.equal('headerRows' in headerless.table, false)
  assert.equal('keepWithHeaderRows' in headerless.table, false)
})

test('formats front matter without body paragraph indents', () => {
  const titlePage = {
    nodeName: 'SECTION',
    style: ['timeless-title-page'],
    stack: [
      {
        nodeName: 'DIV',
        style: ['timeless-title-page-main'],
        stack: [
          { nodeName: 'H1', text: 'Paper title' },
          { nodeName: 'P', text: 'Iris Example' },
        ],
      },
    ],
  }

  normalizePdfContent(titlePage, settings)

  const main = titlePage.stack[0]
  const author = main.stack[1]
  assert.equal('margin' in main, false)
  assert.equal('alignment' in main, false)
  assert.equal('leadingIndent' in author, false)

  const inheritedMainStyleParagraph = {
    nodeName: 'P',
    style: ['timeless-title-page-main'],
    text: 'Child paragraph',
  }
  normalizePdfContent(inheritedMainStyleParagraph, settings)
  assert.equal('margin' in inheritedMainStyleParagraph, false)

  const inheritedAuthorNoteStyleParagraph = {
    nodeName: 'P',
    style: ['timeless-author-note'],
    text: 'Child note paragraph',
  }
  normalizePdfContent(inheritedAuthorNoteStyleParagraph, settings)
  assert.equal('margin' in inheritedAuthorNoteStyleParagraph, false)
  assert.equal(inheritedAuthorNoteStyleParagraph.leadingIndent, 36)

  const abstractPage = {
    nodeName: 'SECTION',
    style: ['timeless-abstract-page'],
    stack: [
      { nodeName: 'P', style: ['timeless-abstract-text'], text: 'Abstract text.' },
      { nodeName: 'P', style: ['timeless-abstract-keywords'], text: 'Keywords: testing' },
    ],
  }

  normalizePdfContent(abstractPage, settings)

  assert.equal('leadingIndent' in abstractPage.stack[0], false)
  assert.equal(abstractPage.stack[1].leadingIndent, 36)

  const paperTitle = {
    nodeName: 'P',
    style: ['timeless-body-title'],
    text: 'Paper title',
  }
  normalizePdfContent(paperTitle, settings)
  assert.equal('leadingIndent' in paperTitle, false)
})

test('starts APA and MLA generated reference sections on a new page when content precedes them', () => {
  const content = [
    { nodeName: 'P', text: 'Body' },
    {
      nodeName: 'SECTION',
      style: ['references', 'citation-style-apa'],
      stack: [{ nodeName: 'P', text: 'Reference' }],
    },
  ]
  normalizePdfContent(content, settings)

  assert.equal(content[1].pageBreak, 'before')

  const mlaContent = [
    { nodeName: 'P', text: 'Body' },
    {
      nodeName: 'SECTION',
      style: ['references', 'citation-style-mla'],
      stack: [{ nodeName: 'P', text: 'Reference' }],
    },
  ]
  normalizePdfContent(mlaContent, settings)
  assert.equal(mlaContent[1].pageBreak, 'before')

  const chicagoContent = [
    { nodeName: 'P', text: 'Body' },
    {
      nodeName: 'SECTION',
      style: ['references', 'citation-style-chicago-author-date'],
      stack: [{ nodeName: 'P', text: 'Reference' }],
    },
  ]
  normalizePdfContent(chicagoContent, settings)
  assert.equal('pageBreak' in chicagoContent[1], false)

  const referencesOnly = [
    { nodeName: 'P', text: '' },
    {
      nodeName: 'SECTION',
      style: ['references', 'citation-style-apa'],
      stack: [{ nodeName: 'P', text: 'Reference' }],
    },
  ]
  normalizePdfContent(referencesOnly, settings)

  assert.equal('pageBreak' in referencesOnly[1], false)

  const alreadyBroken = [
    { nodeName: 'P', text: 'Body' },
    { text: '', pageBreak: 'after' },
    {
      nodeName: 'SECTION',
      style: ['references', 'citation-style-apa'],
      stack: [{ nodeName: 'P', text: 'Reference' }],
    },
  ]
  normalizePdfContent(alreadyBroken, settings)

  assert.equal('pageBreak' in alreadyBroken[2], false)
})

test('uses APA block-quote geometry only in APA layout mode', () => {
  const apaQuote = {
    nodeName: 'BLOCKQUOTE',
    stack: [{ nodeName: 'P', text: 'Quoted text' }],
  }
  normalizePdfContent(apaQuote, settings)

  assert.deepEqual(apaQuote.margin, [36, 0, 0, 0])
  assert.equal(apaQuote.color, '#111111')
  assert.equal('leadingIndent' in apaQuote.stack[0], false)

  const standardQuote = {
    nodeName: 'BLOCKQUOTE',
    stack: [{ nodeName: 'P', text: 'Quoted text' }],
  }
  normalizePdfContent(standardQuote, { ...settings, headingStyle: 'standard' })

  assert.equal('margin' in standardQuote, false)
})

test('moves orphaned headings to the next page but leaves headings with following content in place', () => {
  assert.equal(shouldBreakBeforeHeading(
    { headlineLevel: 2, text: 'Heading' },
    {
      getFollowingNodesOnPage: () => [],
      getNodesOnNextPage: () => [{ text: 'Body' }],
    },
  ), true)

  assert.equal(shouldBreakBeforeHeading(
    { headlineLevel: 2, text: 'Heading' },
    {
      getFollowingNodesOnPage: () => [{ text: 'Body' }],
      getNodesOnNextPage: () => [],
    },
  ), false)

  assert.equal(shouldBreakBeforeHeading(
    { text: 'Ordinary paragraph' },
    {
      getFollowingNodesOnPage: () => [],
      getNodesOnNextPage: () => [{ text: 'Body' }],
    },
  ), false)
})

test('builds a deterministic running head and page number', () => {
  const header = buildPdfHeader(settings, 7)
  assert.ok(header)
  assert.equal(header?.font, 'Times')
  assert.equal(header?.fontSize, 12)
  assert.deepEqual(header?.margin, [72, 36, 72, 0])
  assert.equal(header?.columns[0].text, 'SHORT TITLE')
  assert.equal(header?.columns[1].text, '7')
})

test('omits the PDF header when both header features are disabled', () => {
  assert.equal(buildPdfHeader({
    ...settings,
    runningHead: '',
    pageNumbers: false,
  }, 1), undefined)
})

test('creates safe PDF filenames without coupling them to document headings', () => {
  assert.equal(pdfFileName('Research: Draft'), 'Research- Draft.pdf')
  assert.equal(pdfFileName('  Untitled  '), 'Untitled.pdf')
  assert.equal(pdfFileName('Bad\u0001Name?'), 'Bad-Name-.pdf')
})
