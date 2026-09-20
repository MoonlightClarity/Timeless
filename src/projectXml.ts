import type { JSONContent } from '@tiptap/core'
import type { CitationSource, CitationStyle } from './citation'

export const TIMELESS_XML_FORMAT_VERSION = 1
export const TIMELESS_FILE_EXTENSION = '.timeless.xml'

export type HeadingLevelStyle = {
  align: 'left' | 'center' | 'right'
  bold: boolean
  italic: boolean
}

export type HeadingLevelStyles = {
  h1: HeadingLevelStyle
  h2: HeadingLevelStyle
  h3: HeadingLevelStyle
  h4: HeadingLevelStyle
  h5: HeadingLevelStyle
}

export const DEFAULT_HEADING_LEVEL_STYLES: HeadingLevelStyles = {
  h1: { align: 'left', bold: true, italic: false },
  h2: { align: 'left', bold: true, italic: false },
  h3: { align: 'left', bold: true, italic: true },
  h4: { align: 'left', bold: true, italic: true },
  h5: { align: 'left', bold: true, italic: true },
}

export type TimelessDocumentSettings = {
  bodyFont: string
  bodyFontSize: number
  headingFont: string
  headingSizes: {
    h1: number
    h2: number
    h3: number
    h4: number
    h5: number
  }
  headingLevelStyles: HeadingLevelStyles
  lineHeight: number
  paragraphSpacing: number
  firstLineIndent: number
  marginInches: number
  pageSize: 'letter' | 'a4'
  orientation: 'portrait' | 'landscape'
  runningHead: string
  pageNumbers: boolean
  automaticCitations: boolean
  automaticReferences: boolean
  headingStyle: 'standard' | 'apa'
  titlePage: 'none' | 'student' | 'professional'
  titlePageAuthor: string
  titlePageAffiliation: string
  titlePageCourse: string
  titlePageInstructor: string
  titlePageDueDate: string
  titlePageAuthorNote: string
  abstractEnabled: boolean
  abstractText: string
  abstractKeywords: string
}

export type TimelessDocumentState = {
  title: string
  editor: JSONContent
  sources: CitationSource[]
  citationStyle: CitationStyle
  settings: TimelessDocumentSettings
}

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue }

type XmlElement = {
  name: string
  attributes: Record<string, string>
  children: XmlElement[]
  text: string
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function decodeXml(value: string) {
  return value.replace(
    /&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi,
    (_entity, name: string) => {
      if (name === 'amp') return '&'
      if (name === 'lt') return '<'
      if (name === 'gt') return '>'
      if (name === 'quot') return '"'
      if (name === 'apos') return "'"

      const codePoint = name.startsWith('#x')
        ? Number.parseInt(name.slice(2), 16)
        : Number.parseInt(name.slice(1), 10)

      if (!Number.isFinite(codePoint)) {
        throw new Error(`Invalid XML entity: &${name};`)
      }
      return String.fromCodePoint(codePoint)
    },
  )
}

function toJsonCompatible(value: unknown): JsonValue {
  return JSON.parse(JSON.stringify(value)) as JsonValue
}

function serializeValue(value: JsonValue): string {
  if (value === null) return '<null/>'
  if (typeof value === 'boolean') return `<boolean value="${value}"/>`
  if (typeof value === 'number') return `<number>${value}</number>`
  if (typeof value === 'string') return `<string>${escapeXml(value)}</string>`
  if (Array.isArray(value)) {
    return `<array>${value.map((item) => serializeValue(item)).join('')}</array>`
  }

  const entries = Object.keys(value)
    .sort()
    .map((key) => `<entry key="${escapeXml(key)}">${serializeValue(value[key])}</entry>`)
    .join('')
  return `<object>${entries}</object>`
}

function parseAttributes(source: string) {
  const attributes: Record<string, string> = {}
  const pattern = /([A-Za-z_:][\w:.-]*)\s*=\s*"([^"]*)"/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(source))) {
    attributes[match[1]] = decodeXml(match[2])
  }
  return attributes
}

function parseXml(xml: string): XmlElement {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) {
    throw new Error('Timeless XML does not allow DTD or ENTITY declarations.')
  }

  const tokens = xml.match(/<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<\/?[^>]+>|[^<]+/g) ?? []
  const stack: XmlElement[] = []
  let root: XmlElement | null = null

  for (const token of tokens) {
    if (token.startsWith('<?') || token.startsWith('<!--')) continue

    if (!token.startsWith('<')) {
      if (stack.length > 0) stack[stack.length - 1].text += decodeXml(token)
      else if (token.trim()) throw new Error('Text is not allowed outside the XML root.')
      continue
    }

    if (token.startsWith('</')) {
      const name = token.slice(2, -1).trim()
      const current = stack.pop()
      if (!current || current.name !== name) {
        throw new Error(`Mismatched XML closing tag: ${name}`)
      }
      continue
    }

    const selfClosing = token.endsWith('/>')
    const inner = token.slice(1, selfClosing ? -2 : -1).trim()
    const nameMatch = /^([A-Za-z][\w:.-]*)([\s\S]*)$/.exec(inner)
    if (!nameMatch) throw new Error(`Invalid XML tag: ${token}`)

    const element: XmlElement = {
      name: nameMatch[1],
      attributes: parseAttributes(nameMatch[2]),
      children: [],
      text: '',
    }

    if (stack.length > 0) stack[stack.length - 1].children.push(element)
    else if (root) throw new Error('Timeless XML must have exactly one root element.')
    else root = element

    if (!selfClosing) stack.push(element)
  }

  if (stack.length !== 0) throw new Error(`Unclosed XML tag: ${stack.at(-1)?.name}`)
  if (!root) throw new Error('Timeless XML is empty.')
  return root
}

function onlyChild(element: XmlElement) {
  if (element.children.length !== 1) {
    throw new Error(`<${element.name}> must contain exactly one value.`)
  }
  return element.children[0]
}

function deserializeValue(element: XmlElement): JsonValue {
  if (element.name === 'null') return null

  if (element.name === 'boolean') {
    if (element.attributes.value === 'true') return true
    if (element.attributes.value === 'false') return false
    throw new Error('Invalid boolean value in Timeless XML.')
  }

  if (element.name === 'number') {
    const value = Number(element.text.trim())
    if (!Number.isFinite(value)) throw new Error('Invalid number in Timeless XML.')
    return value
  }

  if (element.name === 'string') return element.text

  if (element.name === 'array') {
    return element.children.map((child) => deserializeValue(child))
  }

  if (element.name !== 'object') {
    throw new Error(`Unknown Timeless XML value element: <${element.name}>`)
  }

  const result: Record<string, JsonValue> = {}
  for (const entry of element.children) {
    if (entry.name !== 'entry') throw new Error('Objects may only contain <entry> elements.')
    const key = entry.attributes.key
    if (key === undefined) throw new Error('Object entry is missing its key attribute.')
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      throw new Error(`Duplicate object key in Timeless XML: ${key}`)
    }
    result[key] = deserializeValue(onlyChild(entry))
  }
  return result
}

function isRecord(value: JsonValue): value is Record<string, JsonValue> {
  return Boolean(value) && !Array.isArray(value) && typeof value === 'object'
}

function looksLikeEditor(value: JsonValue) {
  return isRecord(value) && value.type === 'doc'
}

function looksLikeHeadingLevelStyle(value: JsonValue) {
  if (!isRecord(value)) return false
  if (value.align !== 'left' && value.align !== 'center' && value.align !== 'right') return false
  if (typeof value.bold !== 'boolean') return false
  if (typeof value.italic !== 'boolean') return false
  return true
}

function looksLikeHeadingLevelStyles(value: JsonValue) {
  if (!isRecord(value)) return false
  return ['h1', 'h2', 'h3', 'h4', 'h5'].every((key) => looksLikeHeadingLevelStyle(value[key]))
}

function looksLikeDocumentSettings(value: JsonValue) {
  if (!isRecord(value)) return false
  if (typeof value.bodyFont !== 'string') return false
  if (typeof value.bodyFontSize !== 'number') return false
  if (typeof value.headingFont !== 'string') return false
  if (!isRecord(value.headingSizes)) return false
  if (typeof value.headingSizes.h1 !== 'number') return false
  if (typeof value.headingSizes.h2 !== 'number') return false
  if (typeof value.headingSizes.h3 !== 'number') return false
  if (typeof value.headingSizes.h4 !== 'number') return false
  if (typeof value.headingSizes.h5 !== 'number') return false
  if (value.headingLevelStyles === undefined) {
    value.headingLevelStyles = toJsonCompatible(DEFAULT_HEADING_LEVEL_STYLES)
  }
  if (!looksLikeHeadingLevelStyles(value.headingLevelStyles)) return false
  if (typeof value.lineHeight !== 'number') return false
  if (typeof value.paragraphSpacing !== 'number') return false
  if (typeof value.firstLineIndent !== 'number') return false
  if (typeof value.marginInches !== 'number') return false
  if (value.pageSize !== 'letter' && value.pageSize !== 'a4') return false
  if (value.orientation !== 'portrait' && value.orientation !== 'landscape') return false
  if (typeof value.runningHead !== 'string') return false
  if (typeof value.pageNumbers !== 'boolean') return false
  if (typeof value.automaticCitations !== 'boolean') return false
  if (value.automaticReferences === undefined) value.automaticReferences = false
  if (typeof value.automaticReferences !== 'boolean') return false
  if (value.headingStyle !== 'standard' && value.headingStyle !== 'apa') return false
  if (!['none', 'student', 'professional'].includes(String(value.titlePage))) return false
  if (typeof value.titlePageAuthor !== 'string') return false
  if (typeof value.titlePageAffiliation !== 'string') return false
  if (typeof value.titlePageCourse !== 'string') return false
  if (typeof value.titlePageInstructor !== 'string') return false
  if (typeof value.titlePageDueDate !== 'string') return false
  if (typeof value.titlePageAuthorNote !== 'string') return false
  if (typeof value.abstractEnabled !== 'boolean') return false
  if (typeof value.abstractText !== 'string') return false
  if (typeof value.abstractKeywords !== 'string') return false
  return true
}

function looksLikeCitationSource(value: JsonValue) {
  if (!isRecord(value)) return false
  const allowedKeys = new Set(['id', 'sourceData', 'noteHtml', 'manualReference'])
  if (Object.keys(value).some((key) => !allowedKeys.has(key))) return false
  if (typeof value.id !== 'string' || !value.id) return false
  if (!isRecord(value.sourceData) || typeof value.sourceData.itemType !== 'string') return false
  if (value.noteHtml !== undefined && typeof value.noteHtml !== 'string') return false
  if (value.manualReference !== undefined && typeof value.manualReference !== 'string') return false
  return true
}

function looksLikeDocumentState(value: JsonValue): value is TimelessDocumentState & JsonValue {
  if (!isRecord(value)) return false
  if (typeof value.title !== 'string') return false
  if (!looksLikeEditor(value.editor)) return false
  if (!Array.isArray(value.sources) || !value.sources.every(looksLikeCitationSource)) return false
  if (!['apa', 'mla', 'chicago-author-date'].includes(String(value.citationStyle))) return false
  if (!looksLikeDocumentSettings(value.settings)) return false
  return true
}

export function serializeTimelessXml(state: TimelessDocumentState) {
  const body = serializeValue(toJsonCompatible(state))
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<timeless-document version="${TIMELESS_XML_FORMAT_VERSION}">`,
    `<state>${body}</state>`,
    '</timeless-document>',
    '',
  ].join('\n')
}

export function deserializeTimelessXml(xml: string): TimelessDocumentState {
  const root = parseXml(xml)
  if (root.name !== 'timeless-document') {
    throw new Error(`Unexpected Timeless XML root: <${root.name}>`)
  }

  const version = Number.parseInt(root.attributes.version ?? '', 10)
  if (version !== TIMELESS_XML_FORMAT_VERSION) {
    throw new Error(`Unsupported Timeless XML version: ${root.attributes.version ?? 'missing'}`)
  }
  const stateElement = root.children.find((child) => child.name === 'state')
  if (!stateElement) throw new Error('Timeless XML is missing its <state> element.')

  const value = deserializeValue(onlyChild(stateElement))
  if (!looksLikeDocumentState(value)) {
    throw new Error('Timeless XML does not contain a recognizable document state.')
  }

  return value as TimelessDocumentState
}

export function timelessFileName(title?: string) {
  const raw = (title || 'Untitled')
    .trim()
    .replace(/\.timeless\.xml$/i, '')
    .split('')
    .map((character) => character.charCodeAt(0) < 32 ? '-' : character)
    .join('')
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')

  return `${raw || 'Untitled'}${TIMELESS_FILE_EXTENSION}`
}

export interface TimelessFileHandle {
  readonly name?: string
  getFile?(): Promise<File>
  createWritable(): Promise<{
    write(data: string): Promise<void>
    close(): Promise<void>
  }>
}

type TimelessPickerWindow = Window & {
  showOpenFilePicker?: (options: Record<string, unknown>) => Promise<TimelessFileHandle[]>
  showSaveFilePicker?: (options: Record<string, unknown>) => Promise<TimelessFileHandle>
}

export type TimelessFileSaveResult = {
  fileName: string
  handle: TimelessFileHandle | null
  mode: 'handle' | 'download'
}

export type TimelessFileOpenResult = {
  fileName: string
  handle: TimelessFileHandle | null
  state: TimelessDocumentState
}

const TIMELESS_FILE_PICKER_TYPES = [{
  description: 'Timeless document',
  accept: { 'application/xml': [TIMELESS_FILE_EXTENSION] },
}]

async function writeTimelessHandle(
  handle: TimelessFileHandle,
  state: TimelessDocumentState,
) {
  const writable = await handle.createWritable()
  await writable.write(serializeTimelessXml(state))
  await writable.close()
}

function downloadTimelessXml(state: TimelessDocumentState, fileName: string) {
  const xml = serializeTimelessXml(state)
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function supportsTimelessFileHandles() {
  const pickerWindow = window as TimelessPickerWindow
  return Boolean(pickerWindow.showOpenFilePicker && pickerWindow.showSaveFilePicker)
}

export async function openTimelessXmlFileWithHandle(): Promise<TimelessFileOpenResult | null> {
  const picker = (window as TimelessPickerWindow).showOpenFilePicker
  if (!picker) return null

  const [handle] = await picker.call(window, {
    id: 'timeless-document',
    multiple: false,
    excludeAcceptAllOption: true,
    types: TIMELESS_FILE_PICKER_TYPES,
  })
  if (!handle?.getFile) throw new Error('The selected file cannot be read.')

  const file = await handle.getFile()
  const state = deserializeTimelessXml(await file.text())
  return {
    fileName: file.name || handle.name || timelessFileName(state.title),
    handle,
    state,
  }
}

export async function saveTimelessXmlFile(
  state: TimelessDocumentState,
  currentHandle: TimelessFileHandle | null = null,
  forceSaveAs = false,
): Promise<TimelessFileSaveResult> {
  const suggestedName = timelessFileName(state.title)

  if (currentHandle && !forceSaveAs) {
    await writeTimelessHandle(currentHandle, state)
    return {
      fileName: currentHandle.name || suggestedName,
      handle: currentHandle,
      mode: 'handle',
    }
  }

  const picker = (window as TimelessPickerWindow).showSaveFilePicker
  if (picker) {
    const handle = await picker.call(window, {
      id: 'timeless-document',
      suggestedName,
      excludeAcceptAllOption: true,
      types: TIMELESS_FILE_PICKER_TYPES,
    })
    await writeTimelessHandle(handle, state)
    return {
      fileName: handle.name || suggestedName,
      handle,
      mode: 'handle',
    }
  }

  downloadTimelessXml(state, suggestedName)
  return {
    fileName: suggestedName,
    handle: null,
    mode: 'download',
  }
}
