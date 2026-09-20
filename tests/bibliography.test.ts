import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { sourcesForDocumentBibliography } from '../src/bibliography.ts'

type Source = {
  id: string
  title: string
}

test('includes cited sources and excludes uncited research-only sources', () => {
  const sources: Source[] = [
    { id: 'cited', title: 'Cited source' },
    { id: 'uncited', title: 'Research-only source' },
  ]

  const result = sourcesForDocumentBibliography(sources, new Set(['cited']))

  assert.deepEqual(result.map((source) => source.id), ['cited'])
})

test('returns no bibliography entries when the document has no citations', () => {
  const sources: Source[] = [
    { id: 'uncited', title: 'Research-only source' },
  ]

  assert.deepEqual(sourcesForDocumentBibliography(sources, new Set()), [])
})

test('does not reintroduce the obsolete publication-summary container-title fallback', () => {
  const citationSource = readFileSync(new URL('../src/citation.ts', import.meta.url), 'utf8')

  assert.equal(
    citationSource.includes("cslItem['container-title'] = summary.publication"),
    false,
  )
})
