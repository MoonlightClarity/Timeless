import type { CitationClusterItem } from './citation'

export function citationItemsWithoutSource(
  items: CitationClusterItem[],
  sourceId: string,
) {
  return items.filter((item) => item.sourceId !== sourceId)
}
