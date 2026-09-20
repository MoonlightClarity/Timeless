import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const css = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')

test('dark theme includes the writing surface, not only application chrome', () => {
  assert.match(css, /:root\s*\{[\s\S]*--paper-bg:\s*#1f1d1a;/)
  assert.match(css, /:root\s*\{[\s\S]*--paper-text:\s*#eee8dd;/)
  assert.match(css, /\.app-shell\.dark-theme\s*\{[\s\S]*color-scheme:\s*dark;/)
})

test('light theme restores a light paper surface', () => {
  assert.match(css, /\.app-shell\.light-theme\s*\{[\s\S]*--paper-bg:\s*#f1eadb;/)
  assert.match(css, /\.app-shell\.light-theme\s*\{[\s\S]*--paper-text:\s*#29251f;/)
})

test('paper content uses theme variables for contrast-sensitive elements', () => {
  assert.match(css, /\.document-editor blockquote\s*\{[\s\S]*color:\s*var\(--paper-blockquote\);/)
  assert.match(css, /\.document-editor hr\s*\{[\s\S]*border-top:\s*1px solid var\(--paper-rule\);/)
  assert.match(css, /\.document-editor th\s*\{[\s\S]*background:\s*var\(--paper-table-head\);/)
})
