export type BibliographySource = {
  id: string
}

export function sourcesForDocumentBibliography<T extends BibliographySource>(
  sources: T[],
  citedIds: ReadonlySet<string>,
) {
  return sources.filter((source) => citedIds.has(source.id))
}
