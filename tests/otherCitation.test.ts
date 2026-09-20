import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createBlankSourceItem,
  getSourceTypeDefinition,
  sourceFromItemData,
  sourceSummary,
} from '../src/sourceMetadata.ts'
import { SOURCE_TO_CSL_TYPE } from '../src/cslSourceSchema.ts'

test('provides a generic Other source type for citations outside the built-in list', () => {
  const item = createBlankSourceItem('other')
  item.title = 'An Unlisted Source'
  item.publicationTitle = 'Independent Archive'
  item.date = '2026'
  item.url = 'https://example.test/source'
  item.creators = [
    { creatorType: 'author', firstName: 'Iris', lastName: 'Example' },
  ]

  const source = sourceFromItemData(item, {
    noteHtml: '<p>Keep note</p>',
    manualReference: 'Custom reference text.',
  })
  const summary = sourceSummary(source)

  assert.equal(getSourceTypeDefinition('other').label, 'Other')
  assert.equal(item.itemType, 'other')
  assert.equal(summary.title, 'An Unlisted Source')
  assert.equal(summary.author, 'Example, Iris')
  assert.equal(summary.year, '2026')
  assert.equal(summary.publication, 'Independent Archive')
  assert.equal(summary.locator, 'https://example.test/source')
  assert.equal(source.noteHtml, '<p>Keep note</p>')
  assert.equal(source.manualReference, 'Custom reference text.')
  assert.equal(SOURCE_TO_CSL_TYPE.other, 'document')
})
