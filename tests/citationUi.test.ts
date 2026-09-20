import assert from 'node:assert/strict'
import test from 'node:test'

import {
  citationItemsAttribute,
  citationItemsFromAttributes,
} from '../src/citationState'

test('citation cluster attributes round-trip with defaults preserved', () => {
  const encoded = citationItemsAttribute([
    {
      sourceId: 'source-1',
      locator: '42',
      label: 'page',
      mode: 'suppress-author',
      prefix: 'see',
      suffix: 'for context',
    },
    {
      sourceId: 'source-2',
    },
  ])

  assert.deepEqual(citationItemsFromAttributes({ items: encoded }), [
    {
      sourceId: 'source-1',
      locator: '42',
      label: 'page',
      mode: 'suppress-author',
      prefix: 'see',
      suffix: 'for context',
    },
    {
      sourceId: 'source-2',
      locator: '',
      label: 'page',
      mode: 'normal',
      prefix: '',
      suffix: '',
    },
  ])
})

test('citation attributes require the current cluster representation', () => {
  assert.deepEqual(citationItemsFromAttributes({
    sourceId: 'obsolete-single-source',
    locator: '7',
    label: 'chapter',
  }), [])

  assert.deepEqual(citationItemsFromAttributes({
    items: '{not-json',
    sourceId: 'obsolete-single-source',
  }), [])
})
