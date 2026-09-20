import {
  formatCitationCluster,
  formatReferences,
  type CitationClusterItem,
  type CitationSource,
  type CitationStyle,
} from './citation'

const referenceFormatCache = new Map<string, ReturnType<typeof formatReferences>>()

export function cachedFormatReferences(
  sources: CitationSource[],
  style: CitationStyle,
) {
  const key = JSON.stringify([
    style,
    sources.map((source) => ({
      id: source.id,
      manualReference: source.manualReference || '',
      sourceData: source.sourceData || null,
    })),
  ])

  const cached = referenceFormatCache.get(key)
  if (cached) return cached

  const formatted = formatReferences(sources, style)
  if (referenceFormatCache.size >= 12) {
    const oldest = referenceFormatCache.keys().next().value
    if (oldest !== undefined) referenceFormatCache.delete(oldest)
  }

  referenceFormatCache.set(key, formatted)
  return formatted
}

export function formatCitationPresentation(
  sources: CitationSource[],
  style: CitationStyle,
  items: CitationClusterItem[],
  mode: 'parenthetical' | 'narrative' = 'parenthetical',
  manualText = '',
) {
  const manual = manualText.trim()
  if (manual) return manual
  if (mode !== 'narrative') return formatCitationCluster(sources, style, items)

  const authorPart = formatCitationCluster(
    sources,
    style,
    items.map((item) => ({
      ...item,
      mode: 'author-only' as const,
      locator: '',
      label: 'page',
      suffix: '',
    })),
  ).replace(/^\((.*)\)$/, '$1').trim()

  const detailPart = formatCitationCluster(
    sources,
    style,
    items.map((item) => ({
      ...item,
      mode: 'suppress-author' as const,
      prefix: '',
      suffix: item.suffix || '',
    })),
  ).trim()

  return [authorPart, detailPart].filter(Boolean).join(' ')
}
