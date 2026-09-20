export type EvidenceNoteSource = {
  id: string
  noteHtml?: string
}

export function applyPendingEvidenceNote<T extends EvidenceNoteSource>(
  sources: T[],
  pendingSourceId: string | null | undefined,
  html: string | undefined,
) {
  if (!pendingSourceId || html === undefined) {
    return { sources, committed: false }
  }

  let committed = false
  const next = sources.map((source) => {
    if (source.id !== pendingSourceId) return source
    committed = true
    return { ...source, noteHtml: html }
  })

  return {
    sources: committed ? next : sources,
    committed,
  }
}
