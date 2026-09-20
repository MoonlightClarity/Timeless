import type { Editor } from '@tiptap/core'
import type { CitationClusterItem } from './citation'

const citedSourceCountsCache = new WeakMap<object, Map<string, number>>()

export function citationItemsFromAttributes(
  attributes: Record<string, unknown>,
): CitationClusterItem[] {
  const encoded = typeof attributes.items === 'string' ? attributes.items : ''
  if (!encoded) return []

  try {
    const parsed = JSON.parse(encoded)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item) => ({
        sourceId: String(item.sourceId || ''),
        locator: String(item.locator || ''),
        label: String(item.label || 'page'),
        mode: (
          item.mode === 'suppress-author' || item.mode === 'author-only'
            ? item.mode
            : 'normal'
        ) as CitationClusterItem['mode'],
        prefix: String(item.prefix || ''),
        suffix: String(item.suffix || ''),
      }))
      .filter((item) => item.sourceId)
  } catch {
    return []
  }
}

export function citationItemsAttribute(items: CitationClusterItem[]) {
  return JSON.stringify(items.map((item) => ({
    sourceId: item.sourceId,
    locator: item.locator || '',
    label: item.label || 'page',
    mode: item.mode || 'normal',
    prefix: item.prefix || '',
    suffix: item.suffix || '',
  })))
}

export function citedSourceCounts(editor: Editor | null) {
  const counts = new Map<string, number>()
  if (!editor) return counts

  const doc = editor.state.doc
  const cached = citedSourceCountsCache.get(doc)
  if (cached) return cached

  doc.descendants((node) => {
    if (node.type.name !== 'citation') return
    citationItemsFromAttributes(node.attrs).forEach((item) => {
      counts.set(item.sourceId, (counts.get(item.sourceId) || 0) + 1)
    })
  })

  citedSourceCountsCache.set(doc, counts)
  return counts
}
