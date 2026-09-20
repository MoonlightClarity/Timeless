import assert from 'node:assert/strict'
import test from 'node:test'

import { DEFAULT_DOCUMENT_SETTINGS } from '../src/documentSettings'
import { bodyStartsWithPaperTitle, buildFrontMatterHtml } from '../src/frontMatter'

test('builds an APA student title page with student metadata only', () => {
  const html = buildFrontMatterHtml('Research <Draft>', {
    ...DEFAULT_DOCUMENT_SETTINGS,
    titlePage: 'student',
    titlePageAuthor: 'Iris Example',
    titlePageAffiliation: 'Example University',
    titlePageCourse: 'PSY 101',
    titlePageInstructor: 'Dr. Example',
    titlePageDueDate: 'September 20, 2026',
    titlePageAuthorNote: 'This should not appear on a student page.',
  })

  assert.match(html, /data-title-page="student"/)
  assert.match(html, /Research &lt;Draft&gt;/)
  assert.match(html, /Iris Example/)
  assert.match(html, /Example University/)
  assert.match(html, /PSY 101/)
  assert.match(html, /Dr\. Example/)
  assert.match(html, /September 20, 2026/)
  assert.equal((html.match(/timeless-title-page-spacer/g) || []).length, 3)
  assert.doesNotMatch(html, /Author Note/)
  assert.doesNotMatch(html, /This should not appear/)
})

test('builds an APA professional title page with an optional author note', () => {
  const html = buildFrontMatterHtml('Professional Paper', {
    ...DEFAULT_DOCUMENT_SETTINGS,
    titlePage: 'professional',
    titlePageAuthor: 'Iris Example',
    titlePageAffiliation: 'Example Institute',
    titlePageCourse: 'Hidden Course',
    titlePageInstructor: 'Hidden Instructor',
    titlePageDueDate: 'Hidden Date',
    titlePageAuthorNote: 'ORCID information.\n\nCorrespondence should be addressed to Iris.',
  })

  assert.match(html, /data-title-page="professional"/)
  assert.match(html, /Iris Example/)
  assert.match(html, /Example Institute/)
  assert.match(html, /<h2>Author Note<\/h2>/)
  assert.match(html, /<p>ORCID information\.<\/p><p>Correspondence should be addressed to Iris\.<\/p>/)
  assert.match(html, /Correspondence should be addressed to Iris\./)
  assert.equal((html.match(/timeless-title-page-spacer/g) || []).length, 12)
  assert.doesNotMatch(html, /Hidden Course/)
  assert.doesNotMatch(html, /Hidden Instructor/)
  assert.doesNotMatch(html, /Hidden Date/)
})

test('builds APA abstract keywords with an italic, non-bold label', () => {
  const html = buildFrontMatterHtml('Abstract Test', {
    ...DEFAULT_DOCUMENT_SETTINGS,
    abstractEnabled: true,
    abstractText: 'A concise abstract.',
    abstractKeywords: 'testing, citations',
  })

  assert.match(html, /<section class="timeless-abstract-page">/)
  assert.match(html, /<h1>Abstract<\/h1>/)
  assert.match(html, /A concise abstract\./)
  assert.match(
    html,
    /<p class="timeless-abstract-keywords"><em>Keywords:<\/em> testing, citations<\/p>/,
  )
  assert.doesNotMatch(html, /<strong><em>Keywords:/)
})

test('omits front matter when title page and abstract are disabled', () => {
  assert.equal(
    buildFrontMatterHtml('Plain Document', DEFAULT_DOCUMENT_SETTINGS),
    '',
  )
})

test('detects an authored matching H1 so export does not duplicate the paper title', () => {
  assert.equal(
    bodyStartsWithPaperTitle('Research Draft', {
      type: 'doc',
      content: [
        { type: 'paragraph' },
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Research Draft' }],
        },
        { type: 'paragraph', content: [{ type: 'text', text: 'Body.' }] },
      ],
    }),
    true,
  )
})

test('requires an authored matching H1 before suppressing the generated body title', () => {
  assert.equal(
    bodyStartsWithPaperTitle('Research Draft', {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Different Heading' }],
        },
      ],
    }),
    false,
  )

  assert.equal(
    bodyStartsWithPaperTitle('Research Draft', {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [
            { type: 'citation', attrs: { text: 'Research Draft' } },
          ],
        },
      ],
    }),
    false,
  )
})
