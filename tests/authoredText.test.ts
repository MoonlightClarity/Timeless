import assert from 'node:assert/strict'
import test from 'node:test'
import { authoredHeadingText } from '../src/authoredText.ts'

test('outline heading text ignores inline citations', () => {
  const heading = {
    type: 'heading',
    attrs: { level: 1 },
    content: [
      {
        type: 'citation',
        attrs: {
          sourceId: 'source-1',
          text: '(Example, 2026)',
        },
      },
      { type: 'text', text: 'Actual document title' },
    ],
  }

  assert.equal(authoredHeadingText(heading), 'Actual document title')
})

test('outline heading text preserves authored inline text around formatting nodes', () => {
  const heading = {
    type: 'heading',
    attrs: { level: 1 },
    content: [
      { type: 'text', text: 'A ' },
      { type: 'text', text: 'formatted', marks: [{ type: 'bold' }] },
      { type: 'text', text: ' title' },
    ],
  }

  assert.equal(authoredHeadingText(heading), 'A formatted title')
})

test('citation-only headings do not become citation-derived outline labels', () => {
  const heading = {
    type: 'heading',
    attrs: { level: 1 },
    content: [
      {
        type: 'citation',
        attrs: {
          sourceId: 'source-1',
          text: '(Example, 2026)',
        },
      },
    ],
  }

  assert.equal(authoredHeadingText(heading), '')
})
