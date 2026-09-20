import assert from 'node:assert/strict'
import test from 'node:test'

import {
  APA_LAYOUT_SETTINGS,
  DEFAULT_DOCUMENT_SETTINGS,
  DEFAULT_LAYOUT_SETTINGS,
  normalizeDocumentSettings,
} from '../src/documentSettings'

test('creates independent default document settings', () => {
  const first = normalizeDocumentSettings()
  const second = normalizeDocumentSettings()

  assert.deepEqual(first, DEFAULT_DOCUMENT_SETTINGS)
  assert.notEqual(first, DEFAULT_DOCUMENT_SETTINGS)
  assert.notEqual(first.headingSizes, DEFAULT_DOCUMENT_SETTINGS.headingSizes)
  assert.notEqual(first.headingSizes, second.headingSizes)
  assert.notEqual(first.headingLevelStyles, DEFAULT_DOCUMENT_SETTINGS.headingLevelStyles)
  assert.notEqual(first.headingLevelStyles.h2, second.headingLevelStyles.h2)

  first.headingSizes.h1 = 24
  first.headingLevelStyles.h2.align = 'center'
  assert.equal(second.headingSizes.h1, 18)
  assert.equal(DEFAULT_DOCUMENT_SETTINGS.headingSizes.h1, 18)
  assert.equal(second.headingLevelStyles.h2.align, 'left')
  assert.equal(DEFAULT_DOCUMENT_SETTINGS.headingLevelStyles.h2.align, 'left')
})

test('normalizes document settings while preserving nested heading defaults', () => {
  const normalized = normalizeDocumentSettings({
    ...DEFAULT_DOCUMENT_SETTINGS,
    bodyFont: 'Arial',
    headingSizes: {
      ...DEFAULT_DOCUMENT_SETTINGS.headingSizes,
      h2: 14,
    },
  })

  assert.equal(normalized.bodyFont, 'Arial')
  assert.equal(normalized.headingSizes.h1, 18)
  assert.equal(normalized.headingSizes.h2, 14)
  assert.equal(normalized.pageNumbers, false)
})

test('keeps neutral defaults distinct from the APA layout preset', () => {
  assert.equal(DEFAULT_LAYOUT_SETTINGS.lineHeight, 1.15)
  assert.equal(DEFAULT_LAYOUT_SETTINGS.firstLineIndent, 0)
  assert.equal(DEFAULT_LAYOUT_SETTINGS.pageNumbers, false)
  assert.equal(DEFAULT_LAYOUT_SETTINGS.headingStyle, 'standard')
  assert.equal(DEFAULT_DOCUMENT_SETTINGS.automaticReferences, false)
  assert.deepEqual(DEFAULT_LAYOUT_SETTINGS.headingSizes, { h1: 18, h2: 16, h3: 14, h4: 12, h5: 12 })

  assert.equal(APA_LAYOUT_SETTINGS.lineHeight, 2)
  assert.equal(APA_LAYOUT_SETTINGS.firstLineIndent, 0.5)
  assert.equal(APA_LAYOUT_SETTINGS.pageNumbers, true)
  assert.equal(APA_LAYOUT_SETTINGS.headingStyle, 'apa')
  assert.equal('runningHead' in APA_LAYOUT_SETTINGS, false)
  assert.equal('automaticCitations' in DEFAULT_LAYOUT_SETTINGS, false)
  assert.equal('titlePage' in DEFAULT_LAYOUT_SETTINGS, false)
  assert.equal('abstractEnabled' in DEFAULT_LAYOUT_SETTINGS, false)
})
