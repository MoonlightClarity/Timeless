import assert from 'node:assert/strict'
import test from 'node:test'
import { citationItemsWithoutSource } from '../src/citationIntegrity.ts'

test('removes a source from a multi-source citation cluster without disturbing the others', () => {
  const items = [
    { sourceId: 'alpha', locator: '12', label: 'page' },
    { sourceId: 'beta', locator: '3', label: 'chapter' },
    { sourceId: 'gamma', locator: '', label: 'page' },
  ]

  assert.deepEqual(citationItemsWithoutSource(items, 'beta'), [
    { sourceId: 'alpha', locator: '12', label: 'page' },
    { sourceId: 'gamma', locator: '', label: 'page' },
  ])
})

test('returns an empty cluster when the only source is removed', () => {
  const items = [{ sourceId: 'alpha', locator: '', label: 'page' }]

  assert.deepEqual(citationItemsWithoutSource(items, 'alpha'), [])
})

test('does not mutate the original citation items', () => {
  const items = [
    { sourceId: 'alpha', locator: '', label: 'page' },
    { sourceId: 'beta', locator: '', label: 'page' },
  ]

  citationItemsWithoutSource(items, 'alpha')

  assert.equal(items.length, 2)
  assert.equal(items[0].sourceId, 'alpha')
})
