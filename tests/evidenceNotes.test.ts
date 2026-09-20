import assert from 'node:assert/strict'
import test from 'node:test'
import { applyPendingEvidenceNote } from '../src/evidenceNotes.ts'

test('commits a deferred note to the source that owned the edit', () => {
  const sources = [
    { id: 'a', noteHtml: '<p>Old A</p>' },
    { id: 'b', noteHtml: '<p>Old B</p>' },
  ]

  const result = applyPendingEvidenceNote(sources, 'a', '<p>Edited A</p>')

  assert.equal(result.committed, true)
  assert.equal(result.sources[0]?.noteHtml, '<p>Edited A</p>')
  assert.equal(result.sources[1]?.noteHtml, '<p>Old B</p>')
  assert.equal(sources[0]?.noteHtml, '<p>Old A</p>')
})

test('preserves the pending source when selection moves before the deferred commit', () => {
  let sources = [
    { id: 'a', noteHtml: '<p>A</p>' },
    { id: 'b', noteHtml: '<p>B</p>' },
  ]

  const pendingSourceId = 'a'
  const selectedSourceId = 'b'
  const result = applyPendingEvidenceNote(sources, pendingSourceId, '<p>A changed before switching</p>')
  sources = result.sources

  assert.equal(selectedSourceId, 'b')
  assert.equal(sources.find((source) => source.id === 'a')?.noteHtml, '<p>A changed before switching</p>')
  assert.equal(sources.find((source) => source.id === 'b')?.noteHtml, '<p>B</p>')
})

test('does not report a commit when the pending source no longer exists', () => {
  const sources = [{ id: 'b', noteHtml: '<p>B</p>' }]
  const result = applyPendingEvidenceNote(sources, 'a', '<p>orphaned</p>')

  assert.equal(result.committed, false)
  assert.equal(result.sources, sources)
})

test('does not commit when note html is unavailable', () => {
  const sources = [{ id: 'a', noteHtml: '<p>A</p>' }]
  const result = applyPendingEvidenceNote(sources, 'a', undefined)

  assert.equal(result.committed, false)
  assert.equal(result.sources, sources)
})
