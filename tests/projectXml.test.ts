import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_HEADING_LEVEL_STYLES,
  deserializeTimelessXml,
  openTimelessXmlFileWithHandle,
  saveTimelessXmlFile,
  serializeTimelessXml,
  timelessFileName,
  type TimelessDocumentState,
  type TimelessFileHandle,
} from '../src/projectXml.ts'

const project: TimelessDocumentState = {
  title: 'Research & Analysis <Draft>',
  citationStyle: 'apa',
  editor: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'A & B < C' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Body text ' },
          {
            type: 'citation',
            attrs: {
              sourceId: 'source-1',
              locator: '12',
              label: 'page',
              items: '[{"sourceId":"source-1","locator":"12","label":"page","mode":"suppress-author","prefix":"see","suffix":"for context"}]',
              citationMode: 'narrative',
              prefix: 'see',
              suffix: 'for context',
              manualText: 'Example (2026, p. 12)',
              text: 'Example (2026, p. 12)',
            },
          },
        ],
      },
      { type: 'pageBreak' },
      {
        type: 'image',
        attrs: {
          src: 'data:image/png;base64,AA==',
          alt: 'Example figure',
          align: 'center',
          figureNumber: '1',
          figureTitle: 'Example Figure',
          figureNote: 'Illustrative note.',
        },
      },
      {
        type: 'table',
        attrs: {
          apaTable: true,
          tableNumber: '1',
          tableTitle: 'Example Table',
          tableNote: 'Illustrative table note.',
        },
        content: [],
      },
      { type: 'paragraph', content: [{ type: 'text', text: 'Second page.' }] },
      {
        type: 'paragraph',
        attrs: {
          referenceTitle: true,
          referenceStyle: 'apa',
          referenceLineSpacing: 2,
          referenceEntrySpacing: null,
        },
        content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'References' }],
      },
      {
        type: 'paragraph',
        attrs: {
          referenceEntry: true,
          referenceStyle: 'apa',
          referenceLineSpacing: 2,
          referenceEntrySpacing: 0,
        },
        content: [{ type: 'text', text: 'Example, I. (2026). Editable reference.' }],
      },
    ],
  },
  settings: {
    bodyFont: 'Times New Roman',
    bodyFontSize: 12,
    headingFont: 'Times New Roman',
    headingSizes: { h1: 12, h2: 12, h3: 12, h4: 12, h5: 12 },
    headingLevelStyles: {
      h1: { ...DEFAULT_HEADING_LEVEL_STYLES.h1 },
      h2: { align: 'center', bold: true, italic: false },
      h3: { ...DEFAULT_HEADING_LEVEL_STYLES.h3 },
      h4: { ...DEFAULT_HEADING_LEVEL_STYLES.h4 },
      h5: { ...DEFAULT_HEADING_LEVEL_STYLES.h5 },
    },
    lineHeight: 2,
    paragraphSpacing: 0,
    firstLineIndent: 0.5,
    marginInches: 1,
    pageSize: 'letter',
    orientation: 'portrait',
    runningHead: 'RESEARCH DRAFT',
    pageNumbers: true,
    automaticCitations: false,
    automaticReferences: false,
    headingStyle: 'apa',
    titlePage: 'student',
    titlePageAuthor: 'Iris Example',
    titlePageAffiliation: 'Example University',
    titlePageCourse: 'Research 101',
    titlePageInstructor: 'Dr. Example',
    titlePageDueDate: 'September 20, 2026',
    titlePageAuthorNote: '',
    abstractEnabled: true,
    abstractText: 'A concise abstract.',
    abstractKeywords: 'timeless, research',
  },
  sources: [
    {
      id: 'source-1',
      noteHtml: '<p><strong>Keep</strong> this note.</p>',
      manualReference: 'Example, I. (2026). Manually edited reference.',
      sourceData: {
        itemType: 'journalArticle',
        title: 'XML & evidence',
        publicationTitle: 'Journal <Test>',
        date: '2026',
        url: 'https://example.test/?a=1&b=2',
        creators: [{ creatorType: 'author', firstName: 'Iris', lastName: 'Example' }],
      },
    },
  ],
}

test('round-trips the complete Timeless project through native XML', () => {
  const xml = serializeTimelessXml(project)

  assert.match(xml, /<timeless-document version="1">/)
  assert.ok(!xml.includes('codec='))
  assert.ok(xml.includes('Research &amp; Analysis &lt;Draft&gt;'))
  assert.ok(xml.includes('key="sourceData"'))
  assert.ok(!xml.includes('zoteroData'))
  assert.deepEqual(deserializeTimelessXml(xml), project)
})

test('normalizes current-format XML that predates per-level heading appearance', () => {
  const legacyCurrent = structuredClone(project) as unknown as {
    settings: Record<string, unknown>
  }
  delete legacyCurrent.settings.headingLevelStyles

  const restored = deserializeTimelessXml(serializeTimelessXml(legacyCurrent as unknown as TimelessDocumentState))
  assert.deepEqual(restored.settings.headingLevelStyles, DEFAULT_HEADING_LEVEL_STYLES)
})

test('normalizes current-format XML that predates reference-list mode', () => {
  const legacyCurrent = structuredClone(project) as unknown as {
    settings: Record<string, unknown>
  }
  delete legacyCurrent.settings.automaticReferences

  const restored = deserializeTimelessXml(serializeTimelessXml(legacyCurrent as unknown as TimelessDocumentState))
  assert.equal(restored.settings.automaticReferences, false)
})

test('rejects obsolete native documents that do not contain current settings', () => {
  const obsolete = {
    ...project,
    settings: undefined,
  } as unknown as TimelessDocumentState

  assert.throws(
    () => deserializeTimelessXml(serializeTimelessXml(obsolete)),
    /recognizable document state/,
  )
})

test('rejects source records that still contain obsolete duplicated summary fields', () => {
  const obsolete = structuredClone(project) as unknown as {
    sources: Array<Record<string, unknown>>
  }
  obsolete.sources[0].title = 'Duplicated title'

  assert.throws(
    () => deserializeTimelessXml(serializeTimelessXml(obsolete as unknown as TimelessDocumentState)),
    /recognizable document state/,
  )
})

test('serialization is deterministic after a round trip', () => {
  const first = serializeTimelessXml(project)
  const second = serializeTimelessXml(deserializeTimelessXml(first))

  assert.equal(second, first)
})

test('rejects DTD and entity declarations', () => {
  assert.throws(
    () => deserializeTimelessXml('<!DOCTYPE timeless [<!ENTITY x "oops">]><timeless-document version="1"/>'),
    /does not allow DTD or ENTITY/,
  )
})

test('uses a Timeless-specific filename instead of implying Catalyst interchangeability', () => {
  assert.equal(timelessFileName('Research: Draft'), 'Research- Draft.timeless.xml')
  assert.equal(timelessFileName('Already.timeless.xml'), 'Already.timeless.xml')
})

test('reuses an existing writable file handle for normal Save', async () => {
  let written = ''
  const handle: TimelessFileHandle = {
    name: 'existing.timeless.xml',
    async createWritable() {
      return {
        async write(data: string) {
          written = data
        },
        async close() {},
      }
    },
  }

  const result = await saveTimelessXmlFile(project, handle)

  assert.equal(result.handle, handle)
  assert.equal(result.fileName, 'existing.timeless.xml')
  assert.equal(result.mode, 'handle')
  assert.deepEqual(deserializeTimelessXml(written), project)
})

test('opens a native document through a browser file handle when available', async () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  const xml = serializeTimelessXml(project)
  const handle: TimelessFileHandle = {
    name: 'opened.timeless.xml',
    async getFile() {
      return {
        name: 'opened.timeless.xml',
        async text() {
          return xml
        },
      } as File
    },
    async createWritable() {
      throw new Error('not used by open')
    },
  }

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      async showOpenFilePicker() {
        return [handle]
      },
    },
  })

  try {
    const opened = await openTimelessXmlFileWithHandle()
    assert.ok(opened)
    assert.equal(opened.fileName, 'opened.timeless.xml')
    assert.equal(opened.handle, handle)
    assert.deepEqual(opened.state, project)
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow)
    else Reflect.deleteProperty(globalThis, 'window')
  }
})
