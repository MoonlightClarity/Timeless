import assert from 'node:assert/strict'
import test from 'node:test'

import {
  sourceOpenUrl,
  sourcesOverlap,
} from '../src/sourceUi'
import type { CitationSource } from '../src/citation'

function source(overrides: Partial<CitationSource> = {}): CitationSource {
  return {
    id: 'source-1',
    sourceData: {
      itemType: 'book',
      title: 'Example',
      date: '2026',
      creators: [{ creatorType: 'author', lastName: 'Example' }],
    },
    ...overrides,
  }
}

test('source matching recognizes normalized DOI identity', () => {
  assert.equal(
    sourcesOverlap(
      source({
        sourceData: {
          itemType: 'journalArticle',
          DOI: 'https://doi.org/10.1234/Example.',
        },
      }),
      source({
        id: 'source-2',
        sourceData: {
          itemType: 'journalArticle',
          DOI: '10.1234/example',
        },
      }),
    ),
    true,
  )
})

test('source matching falls back to normalized title and year', () => {
  assert.equal(
    sourcesOverlap(
      source({
        sourceData: { itemType: 'book', title: '  An   Example ', date: ' 2026 ' },
      }),
      source({
        id: 'source-2',
        sourceData: { itemType: 'book', title: 'an example', date: '2026' },
      }),
    ),
    true,
  )
})

test('source open URL prefers URL and otherwise constructs DOI URL', () => {
  assert.equal(
    sourceOpenUrl(source({
      sourceData: { itemType: 'webpage', url: 'https://example.com/item' },
    })),
    'https://example.com/item',
  )
  assert.equal(
    sourceOpenUrl(source({
      sourceData: { itemType: 'journalArticle', DOI: '10.1234/example' },
    })),
    'https://doi.org/10.1234/example',
  )
})
