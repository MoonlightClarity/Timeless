import type { CitationSource } from './citation'
import { sourceFromItemData, type SourceItemData } from './sourceMetadata'

type MetadataItem = Record<string, unknown>

export type MetadataLookupChoice = {
  key: string
  title: string
  source?: Omit<CitationSource, 'id'>
}

export type MetadataLookupResult =
  | {
      kind: 'single'
      source: Omit<CitationSource, 'id'>
    }
  | {
      kind: 'choices'
      choices: MetadataLookupChoice[]
      followUp?: {
        url: string
        session: string
      }
    }

function textField(item: MetadataItem, key: string) {
  const value = item[key]
  return typeof value === 'string' ? value.trim() : ''
}

function isDoi(value: string) {
  return /^(?:https?:\/\/(?:dx\.)?doi\.org\/)?10\.\d{4,9}\//i.test(value.trim())
}

function sourceFromItem(
  item: MetadataItem,
  _fallback: string,
): Omit<CitationSource, 'id'> {
  const itemType = textField(item, 'itemType') || 'other'
  return sourceFromItemData({
    ...item,
    itemType,
  } as SourceItemData)
}

function validItems(payload: unknown): MetadataItem[] {
  if (!Array.isArray(payload)) return []

  return payload.filter((item): item is MetadataItem => (
    Boolean(item) && typeof item === 'object'
  ))
}

export async function lookupSourceMetadata(
  identifier: string,
): Promise<MetadataLookupResult> {
  const query = identifier.trim()
  if (!query) throw new Error('Enter an identifier.')

  const endpoint = /^https?:\/\//i.test(query) && !isDoi(query) ? 'web' : 'search'
  const response = await fetch(`/metadata-translate/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
  })

  if (response.status === 300) {
    const payload: unknown = await response.json()
    if (!payload || typeof payload !== 'object') {
      throw new Error('Could not read lookup choices.')
    }

    const data = payload as Record<string, unknown>
    const items = data.items
    const url = typeof data.url === 'string' ? data.url : query
    const session = typeof data.session === 'string' ? data.session : ''

    if (!items || typeof items !== 'object' || Array.isArray(items) || !session) {
      throw new Error('Could not read lookup choices.')
    }

    const choices = Object.entries(items)
      .filter(([, title]) => typeof title === 'string')
      .map(([key, title]) => ({
        key,
        title: String(title),
      }))

    if (!choices.length) throw new Error('No metadata found.')

    return {
      kind: 'choices',
      choices,
      followUp: { url, session },
    }
  }

  if (!response.ok) {
    throw new Error('No metadata found.')
  }

  const payload: unknown = await response.json()
  const items = validItems(payload)
  if (!items.length) throw new Error('No metadata found.')

  if (items.length === 1) {
    return {
      kind: 'single',
      source: sourceFromItem(items[0], query),
    }
  }

  return {
    kind: 'choices',
    choices: items.map((item, index) => ({
      key: textField(item, 'key') || String(index),
      title: textField(item, 'title')
        || textField(item, 'caseName')
        || textField(item, 'nameOfAct')
        || `Result ${index + 1}`,
      source: sourceFromItem(item, query),
    })),
  }
}

export async function lookupSourceChoice(
  choice: MetadataLookupChoice,
  followUp?: { url: string; session: string },
): Promise<Omit<CitationSource, 'id'>> {
  if (choice.source) return choice.source
  if (!followUp) throw new Error('Lookup session expired. Search again.')

  const response = await fetch('/metadata-translate/web', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: followUp.url,
      session: followUp.session,
      items: {
        [choice.key]: choice.title,
      },
    }),
  })

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Lookup session expired. Search again.')
    }
    throw new Error('Could not load that source.')
  }

  const payload: unknown = await response.json()
  const items = validItems(payload)
  if (!items.length) throw new Error('No metadata found.')

  return sourceFromItem(items[0], followUp.url)
}
