import assert from 'node:assert/strict'
import test from 'node:test'

import ReferenceParagraph, { isEmptyReferenceParagraph } from '../src/ReferenceParagraph.ts'

test('reference paragraph attribute round-trips through HTML semantics', () => {
  const addGlobalAttributes = ReferenceParagraph.config.addGlobalAttributes
  assert.ok(addGlobalAttributes)

  const groups = addGlobalAttributes.call(ReferenceParagraph)
  const referenceEntry = groups[0]?.attributes.referenceEntry
  assert.ok(referenceEntry)
  assert.equal(referenceEntry.default, false)
  assert.equal(referenceEntry.keepOnSplit, true)

  const markedElement = {
    getAttribute(name: string) {
      return name === 'data-reference-entry' ? 'true' : null
    },
  } as HTMLElement
  const plainElement = {
    getAttribute() {
      return null
    },
  } as unknown as HTMLElement

  assert.equal(referenceEntry.parseHTML?.(markedElement), true)
  assert.equal(referenceEntry.parseHTML?.(plainElement), false)
  assert.deepEqual(referenceEntry.renderHTML?.({ referenceEntry: true }), {
    'data-reference-entry': 'true',
    class: 'reference-entry',
  })
  assert.deepEqual(referenceEntry.renderHTML?.({ referenceEntry: false }), {})

  const referenceTitle = groups[0]?.attributes.referenceTitle
  assert.ok(referenceTitle)
  assert.equal(referenceTitle.default, false)
  assert.equal(referenceTitle.keepOnSplit, false)

  const titleElement = {
    getAttribute(name: string) {
      return name === 'data-reference-title' ? 'true' : null
    },
  } as HTMLElement
  assert.equal(referenceTitle.parseHTML?.(titleElement), true)
  assert.deepEqual(referenceTitle.renderHTML?.({ referenceTitle: true }), {
    'data-reference-title': 'true',
    class: 'reference-section-title',
  })

  const referenceStyle = groups[0]?.attributes.referenceStyle
  const referenceLineSpacing = groups[0]?.attributes.referenceLineSpacing
  const referenceEntrySpacing = groups[0]?.attributes.referenceEntrySpacing
  assert.ok(referenceStyle)
  assert.ok(referenceLineSpacing)
  assert.ok(referenceEntrySpacing)
  assert.equal(referenceStyle.default, '')
  assert.equal(referenceLineSpacing.default, null)
  assert.equal(referenceEntrySpacing.default, null)
  assert.equal(referenceLineSpacing.keepOnSplit, true)
  assert.equal(referenceEntrySpacing.keepOnSplit, true)

  const layoutElement = {
    getAttribute(name: string) {
      if (name === 'data-reference-style') return 'apa'
      if (name === 'data-reference-line-spacing') return '2'
      if (name === 'data-reference-entry-spacing') return '0'
      return null
    },
  } as HTMLElement
  assert.equal(referenceStyle.parseHTML?.(layoutElement), 'apa')
  assert.equal(referenceLineSpacing.parseHTML?.(layoutElement), 2)
  assert.equal(referenceEntrySpacing.parseHTML?.(layoutElement), 0)
  assert.deepEqual(referenceLineSpacing.renderHTML?.({ referenceLineSpacing: 2 }), {
    'data-reference-line-spacing': '2',
    style: 'line-height:2',
  })
  assert.deepEqual(referenceEntrySpacing.renderHTML?.({ referenceEntrySpacing: 0 }), {
    'data-reference-entry-spacing': '0',
    style: 'margin-bottom:0em',
  })
})

test('only an empty reference paragraph exits reference-entry mode on Enter', () => {
  assert.equal(isEmptyReferenceParagraph('paragraph', '', true), true)
  assert.equal(isEmptyReferenceParagraph('paragraph', '   ', true), true)
  assert.equal(isEmptyReferenceParagraph('paragraph', 'Smith (2026).', true), false)
  assert.equal(isEmptyReferenceParagraph('paragraph', '', false), false)
  assert.equal(isEmptyReferenceParagraph('heading', '', true), false)
})
