import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { bibliographyLayoutFromStyleXml } from '../src/citationLayout.ts'

function styleXml(name: string) {
  return readFileSync(new URL(`../vendor/csl-styles/${name}`, import.meta.url), 'utf8')
}

test('derives bibliography layout from the bundled CSL styles', () => {
  assert.deepEqual(bibliographyLayoutFromStyleXml(styleXml('apa.csl')), {
    hangingIndent: true,
    lineSpacing: 2,
    entrySpacing: 0,
  })

  assert.deepEqual(bibliographyLayoutFromStyleXml(styleXml('modern-language-association.csl')), {
    hangingIndent: true,
    lineSpacing: 2,
    entrySpacing: 0,
  })

  assert.deepEqual(bibliographyLayoutFromStyleXml(styleXml('chicago-author-date.csl')), {
    hangingIndent: true,
    lineSpacing: 1,
    entrySpacing: 1,
  })
})
