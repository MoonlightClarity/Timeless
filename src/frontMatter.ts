import type { JSONContent } from '@tiptap/core'
import type { TimelessDocumentSettings } from './projectXml'
import { authoredHeadingText } from './authoredText'

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function escapeHtmlWithBreaks(text: string) {
  return escapeHtml(text.trim()).replace(/\r?\n/g, '<br>')
}

function escapeHtmlParagraphs(text: string) {
  return text
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\r?\n/g, '<br>')}</p>`)
    .join('')
}

export function bodyStartsWithPaperTitle(
  titleValue: string,
  document: JSONContent | null | undefined,
) {
  const title = titleValue.replace(/\s+/g, ' ').trim()
  if (!title || !document?.content?.length) return false

  const firstSubstantive = document.content.find((node) => {
    if (node.type !== 'paragraph') return true
    return Boolean(authoredHeadingText(node))
  })

  return (
    firstSubstantive?.type === 'heading'
    && Number(firstSubstantive.attrs?.level) === 1
    && authoredHeadingText(firstSubstantive) === title
  )
}

export function buildFrontMatterHtml(
  titleValue: string,
  settings: TimelessDocumentSettings,
) {
  const titlePage = settings.titlePage || 'none'
  const title = escapeHtml(titleValue.trim() || 'Untitled')
  const author = escapeHtmlWithBreaks(settings.titlePageAuthor || '')
  const affiliation = escapeHtmlWithBreaks(settings.titlePageAffiliation || '')
  const course = escapeHtmlWithBreaks(settings.titlePageCourse || '')
  const instructor = escapeHtmlWithBreaks(settings.titlePageInstructor || '')
  const dueDate = escapeHtmlWithBreaks(settings.titlePageDueDate || '')
  const authorNote = escapeHtmlParagraphs(settings.titlePageAuthorNote || '')
  const abstractText = escapeHtmlWithBreaks(settings.abstractText || '')
  const abstractKeywords = escapeHtmlWithBreaks(settings.abstractKeywords || '')
  const pages: string[] = []
  const blankLine = '<p class="timeless-title-page-spacer">&nbsp;</p>'

  if (titlePage !== 'none') {
    const titlePageFields = titlePage === 'student'
      ? [author, affiliation, course, instructor, dueDate]
      : [author, affiliation]
    const metadata = titlePageFields
      .filter(Boolean)
      .map((value) => `<p class="timeless-title-page-line">${value}</p>`)
      .join('')
    const note = titlePage === 'professional' && authorNote
      ? blankLine.repeat(9)
        + `<div class="timeless-author-note"><h2>Author Note</h2>${authorNote}</div>`
      : ''

    pages.push(
      `<section class="timeless-title-page" data-title-page="${titlePage}">`
      + '<div class="timeless-title-page-main">'
      + blankLine.repeat(2)
      + `<h1>${title}</h1>`
      + blankLine
      + metadata
      + '</div>'
      + note
      + '</section><div data-timeless-page-break="true"></div>',
    )
  }

  if (settings.abstractEnabled) {
    const keywords = abstractKeywords
      ? `<p class="timeless-abstract-keywords"><em>Keywords:</em> ${abstractKeywords}</p>`
      : ''
    pages.push(
      '<section class="timeless-abstract-page">'
      + '<h1>Abstract</h1>'
      + `<p class="timeless-abstract-text">${abstractText}</p>`
      + keywords
      + '</section><div data-timeless-page-break="true"></div>',
    )
  }

  return pages.join('')
}
