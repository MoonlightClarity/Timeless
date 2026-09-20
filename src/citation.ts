import CSL from 'citeproc'
import apaStyle from '../vendor/csl-styles/apa.csl?raw'
import mlaStyle from '../vendor/csl-styles/modern-language-association.csl?raw'
import chicagoAuthorDateStyle from '../vendor/csl-styles/chicago-author-date.csl?raw'
import enUsLocale from '../vendor/csl-locales/locales-en-US.xml?raw'
import {
  CSL_DATE_TO_SOURCE_FIELD,
  CSL_TEXT_TO_SOURCE_FIELDS,
  SOURCE_TO_CSL_NAME_FIELD,
  SOURCE_TO_CSL_TYPE,
} from './cslSourceSchema'
import { sourceSummary } from './sourceMetadata'
import { bibliographyLayoutFromStyleXml } from './citationLayout'
import { SOURCE_TYPE_MAP } from './sourceTypeSchema'

export type CitationStyle = 'apa' | 'mla' | 'chicago-author-date'

export type CitationSource = {
  id: string
  manualReference?: string
  sourceData: Record<string, unknown>
  noteHtml?: string
}

export type FormattedReference = {
  id: string
  html: string
  text: string
}

export type FormattedInlineCitation = {
  id: string
  text: string
}

export type CitationClusterItem = {
  sourceId: string
  locator?: string
  label?: string
  mode?: 'normal' | 'suppress-author' | 'author-only'
  prefix?: string
  suffix?: string
}

const STYLES: Record<CitationStyle, string> = {
  apa: apaStyle,
  mla: mlaStyle,
  'chicago-author-date': chicagoAuthorDateStyle,
}

export function bibliographyLayout(style: CitationStyle) {
  return bibliographyLayoutFromStyleXml(STYLES[style])
}

function creatorFromName(value: string) {
  const name = value.trim()
  if (!name) return null

  if (name.includes(',')) {
    const [family, ...givenParts] = name.split(',')
    return {
      family: family.trim(),
      given: givenParts.join(',').trim(),
    }
  }

  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return { literal: parts[0] }

  return {
    family: parts.at(-1) || '',
    given: parts.slice(0, -1).join(' '),
  }
}

function parseAuthors(value: string) {
  return value
    .split(/\s*;\s*|\s+and\s+/i)
    .map(creatorFromName)
    .filter((creator): creator is NonNullable<typeof creator> => Boolean(creator))
}

function stringField(data: Record<string, unknown>, key: string) {
  const value = data[key]
  return typeof value === 'string' ? value.trim() : ''
}

function typeFieldValue(
  data: Record<string, unknown>,
  itemType: string,
  baseField: string,
) {
  const direct = stringField(data, baseField)
  if (direct) return direct

  const type = SOURCE_TYPE_MAP.get(itemType)
  const mapped = type?.fields.find((field) => (
    field.baseField === baseField || field.field === baseField
  ))

  return mapped ? stringField(data, mapped.field) : ''
}

function dateValue(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  const iso = trimmed.match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/)
  if (iso) {
    const parts: number[] = [Number(iso[1])]
    if (iso[2]) parts.push(Number(iso[2]))
    if (iso[3]) parts.push(Number(iso[3]))
    return { 'date-parts': [parts] }
  }

  const year = trimmed.match(/\b(\d{4})\b/)
  if (year) return { 'date-parts': [[Number(year[1])]] }

  return { literal: trimmed }
}

function sourceDataToCsl(source: CitationSource, data: Record<string, unknown>) {
  const itemType = stringField(data, 'itemType')
  const type = SOURCE_TYPE_MAP.get(itemType)
  const summary = sourceSummary(source)
  const cslItem: Record<string, unknown> = {
    id: source.id,
    type: SOURCE_TO_CSL_TYPE[itemType]
      || (summary.publication ? 'article-journal' : 'webpage'),
  }

  for (const [cslVariable, fields] of Object.entries(CSL_TEXT_TO_SOURCE_FIELDS)) {
    if (cslVariable === 'shortTitle') continue

    for (const field of fields) {
      let value = typeFieldValue(data, itemType, field)
      if (!value) continue

      if (field === 'ISBN') {
        const firstIsbn = value.match(/^(?:97[89]-?)?(?:\d-?){9}[\dx](?!-)\b/i)
        if (firstIsbn) value = firstIsbn[0]
      }

      if (value.startsWith('"') && value.endsWith('"') && value.length > 1) {
        value = value.slice(1, -1)
      }

      cslItem[cslVariable] = value
      break
    }
  }

  const creators = Array.isArray(data.creators) ? data.creators : []
  const primaryCreatorType = type?.creatorTypes.find((creator) => creator.primary)?.creatorType

  creators.forEach((creator) => {
    if (!creator || typeof creator !== 'object') return
    const record = creator as Record<string, unknown>
    const creatorType = stringField(record, 'creatorType')
    const cslCreatorType = SOURCE_TO_CSL_NAME_FIELD[creatorType]
      || (creatorType && creatorType === primaryCreatorType ? 'author' : '')
    if (!cslCreatorType) return

    const literal = stringField(record, 'name')
    const family = stringField(record, 'lastName')
    const given = stringField(record, 'firstName')
    if (!literal && !family && !given) return

    const name = literal
      ? { literal }
      : { family, given }

    const existing = cslItem[cslCreatorType]
    if (Array.isArray(existing)) existing.push(name)
    else cslItem[cslCreatorType] = [name]
  })

  for (const [cslVariable, sourceField] of Object.entries(CSL_DATE_TO_SOURCE_FIELD)) {
    const value = typeFieldValue(data, itemType, sourceField)
    if (!value) continue
    const parsed = dateValue(value)
    if (parsed) cslItem[cslVariable] = parsed
  }

  if (!cslItem.title) cslItem.title = summary.title || 'Untitled'
  if (!cslItem.author && summary.author) {
    const authors = parseAuthors(summary.author)
    if (authors.length) cslItem.author = authors
  }
  if (!cslItem.issued && summary.year) {
    const issued = dateValue(summary.year)
    if (issued) cslItem.issued = issued
  }

  return cslItem
}

function sourceToCsl(source: CitationSource) {
  return sourceDataToCsl(source, source.sourceData)
}

function plainText(html: string) {
  if (typeof DOMParser !== 'undefined') {
    const parsed = new DOMParser().parseFromString(html, 'text/html')
    return parsed.body.textContent?.trim() || ''
  }

  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&#(\d+);/g, (_match, value) => String.fromCharCode(Number(value)))
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatCitationCluster(
  sources: CitationSource[],
  style: CitationStyle,
  citationItems: CitationClusterItem[],
): string {
  if (!sources.length || !citationItems.length) return ''

  const availableIds = new Set(sources.map((source) => source.id))
  const items = Object.fromEntries(sources.map((item) => [item.id, sourceToCsl(item)]))
  const engine = new CSL.Engine({
    retrieveLocale: () => enUsLocale,
    retrieveItem: (id: string) => items[id],
  }, STYLES[style], 'en-US')

  engine.setOutputFormat('html')
  engine.updateItems(sources.map((item) => item.id))

  const cluster = citationItems
    .filter((item) => availableIds.has(item.sourceId))
    .map((item) => {
      const cite: {
        id: string
        locator?: string
        label?: string
        prefix?: string
        suffix?: string
        'suppress-author'?: boolean
        'author-only'?: boolean
      } = { id: item.sourceId }
      if (item.locator?.trim()) {
        cite.locator = item.locator.trim()
        cite.label = item.label || 'page'
      }
      if (item.prefix?.trim()) cite.prefix = item.prefix.trim()
      if (item.suffix?.trim()) cite.suffix = item.suffix.trim()
      if (item.mode === 'suppress-author') cite['suppress-author'] = true
      if (item.mode === 'author-only') cite['author-only'] = true
      return cite
    })

  if (!cluster.length) return ''
  return plainText(engine.makeCitationCluster(cluster))
}

export function formatInlineCitation(
  sources: CitationSource[],
  style: CitationStyle,
  sourceId: string,
  locator = '',
  label = 'page',
): string {
  return formatCitationCluster(sources, style, [
    { sourceId, locator, label },
  ])
}

export function formatInlineCitations(
  sources: CitationSource[],
  style: CitationStyle,
): FormattedInlineCitation[] {
  return sources.map((source) => ({
    id: source.id,
    text: formatInlineCitation(sources, style, source.id),
  }))
}

export function formatReferences(
  sources: CitationSource[],
  style: CitationStyle,
): FormattedReference[] {
  if (!sources.length) return []

  const items = Object.fromEntries(sources.map((source) => [source.id, sourceToCsl(source)]))
  const engine = new CSL.Engine({
    retrieveLocale: () => enUsLocale,
    retrieveItem: (id: string) => items[id],
  }, STYLES[style], 'en-US')

  engine.setOutputFormat('html')
  engine.updateItems(sources.map((source) => source.id))

  const bibliography = engine.makeBibliography()
  if (!bibliography) return []

  const [meta, entries] = bibliography
  return entries.map((html: string, index: number) => {
    const entryId = Array.isArray(meta.entry_ids[index])
      ? meta.entry_ids[index][0]
      : meta.entry_ids[index]
    const source = sources.find((candidate) => candidate.id === String(entryId))
    const manualReference = source?.manualReference?.trim() || ''

    return {
      id: String(entryId),
      html: manualReference
        ? `<div class="csl-entry">${escapeCitationText(manualReference)}</div>`
        : html,
      text: manualReference || plainText(html),
    }
  })
}

function escapeCitationText(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
