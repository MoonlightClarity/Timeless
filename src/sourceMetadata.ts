import type { CitationSource } from './citation'
import {
  SOURCE_TYPE_MAP,
  SOURCE_TYPES,
  type SourceTypeDefinition,
} from './sourceTypeSchema'

export type SourceCreator = {
  creatorType: string
  firstName?: string
  lastName?: string
  name?: string
}

export type SourceItemData = Record<string, unknown> & {
  itemType: string
  creators?: SourceCreator[]
}

function text(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function typeDefinition(itemType: string) {
  return SOURCE_TYPE_MAP.get(itemType)
    || SOURCE_TYPE_MAP.get('book')
    || SOURCE_TYPES[0]
}

function primaryCreatorType(type: SourceTypeDefinition) {
  return type.creatorTypes.find((creator) => creator.primary)?.creatorType
    || type.creatorTypes[0]?.creatorType
    || 'author'
}

function canonicalFieldMap(type: SourceTypeDefinition) {
  return new Map(type.fields.map((field) => [field.field, field.baseField || field.field]))
}

function targetFieldMap(type: SourceTypeDefinition) {
  return new Map(type.fields.map((field) => [field.baseField || field.field, field.field]))
}

export function createBlankSourceItem(itemType = 'book'): SourceItemData {
  const type = typeDefinition(itemType)
  const creatorType = primaryCreatorType(type)

  return {
    itemType: type.itemType,
    creators: type.creatorTypes.length
      ? [{ creatorType, firstName: '', lastName: '' }]
      : [],
  }
}

export function sourceToItemData(source: CitationSource | Omit<CitationSource, 'id'>): SourceItemData {
  return structuredClone(source.sourceData) as SourceItemData
}

export function changeSourceItemType(
  item: SourceItemData,
  nextItemType: string,
): SourceItemData {
  const currentType = typeDefinition(item.itemType)
  const nextType = typeDefinition(nextItemType)
  const currentCanonical = canonicalFieldMap(currentType)
  const nextFields = targetFieldMap(nextType)
  const canonicalValues = new Map<string, unknown>()

  currentType.fields.forEach((field) => {
    const value = item[field.field]
    if (value === undefined || value === null || value === '') return
    canonicalValues.set(currentCanonical.get(field.field) || field.field, value)
  })

  const result = createBlankSourceItem(nextType.itemType)

  canonicalValues.forEach((value, canonical) => {
    const target = nextFields.get(canonical)
    if (target) result[target] = value
  })

  const allowedCreatorTypes = new Set(nextType.creatorTypes.map((creator) => creator.creatorType))
  const fallbackCreatorType = primaryCreatorType(nextType)
  const creators = Array.isArray(item.creators) ? item.creators : []
  result.creators = creators.map((creator) => ({
    ...creator,
    creatorType: allowedCreatorTypes.has(creator.creatorType)
      ? creator.creatorType
      : fallbackCreatorType,
  }))

  if (!result.creators.length && nextType.creatorTypes.length) {
    result.creators = [{ creatorType: fallbackCreatorType, firstName: '', lastName: '' }]
  }

  return result
}

function creatorDisplay(creators: SourceCreator[], primaryType: string) {
  return creators
    .filter((creator) => creator.creatorType === primaryType)
    .map((creator) => {
      if (creator.name?.trim()) return creator.name.trim()
      const first = creator.firstName?.trim() || ''
      const last = creator.lastName?.trim() || ''
      if (last && first) return `${last}, ${first}`
      return last || first
    })
    .filter(Boolean)
    .join('; ')
}

export type SourceSummary = {
  author: string
  year: string
  title: string
  publication: string
  locator: string
}

export function sourceSummaryFromItemData(item: SourceItemData): SourceSummary {
  const type = typeDefinition(item.itemType)
  const canonicalTargets = targetFieldMap(type)
  const creators = Array.isArray(item.creators) ? item.creators : []
  const primaryType = primaryCreatorType(type)
  const dateField = canonicalTargets.get('date')
  const publicationField = canonicalTargets.get('publicationTitle')
  const publisherField = canonicalTargets.get('publisher')

  return {
    author: creatorDisplay(creators, primaryType),
    year: dateField ? text(item[dateField]).trim() : '',
    title: text(item[type.titleField]).trim(),
    publication: publicationField
      ? text(item[publicationField]).trim()
      : publisherField
        ? text(item[publisherField]).trim()
        : '',
    locator: (
      text(item.DOI)
      || text(item.ISBN)
      || text(item.url)
    ).trim(),
  }
}

export function sourceSummary(source: CitationSource | Omit<CitationSource, 'id'>) {
  return sourceSummaryFromItemData(sourceToItemData(source))
}

export function sourceFromItemData(
  item: SourceItemData,
  previous?: Pick<CitationSource, 'noteHtml' | 'manualReference'>,
): Omit<CitationSource, 'id'> {
  return {
    sourceData: structuredClone(item),
    noteHtml: previous?.noteHtml,
    manualReference: previous?.manualReference,
  }
}

export function getSourceTypeDefinition(itemType: string) {
  return typeDefinition(itemType)
}

export { SOURCE_TYPES }
