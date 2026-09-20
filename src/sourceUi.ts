import type { CitationSource } from './citation'
import { sourceSummary } from './sourceMetadata'

type DuplicateComparableSource = Omit<CitationSource, 'id'>

export function normalizeSourceToken(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function sourceDuplicateKeys(source: DuplicateComparableSource) {
  const metadata = source.sourceData || {}
  const summary = sourceSummary(source)
  const doi = typeof metadata.DOI === 'string' ? metadata.DOI : ''
  const isbn = typeof metadata.ISBN === 'string' ? metadata.ISBN : ''
  const url = typeof metadata.url === 'string' ? metadata.url : ''
  const locator = summary.locator

  const doiValue = (
    doi
    || locator.match(/(?:https?:\/\/(?:dx\.)?doi\.org\/)?(10\.\d{4,9}\/\S+)/i)?.[1]
    || ''
  )
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .replace(/[.,;]+$/, '')
    .toLowerCase()

  const isbnCandidate = isbn || locator
  const isbnValue = isbnCandidate.replace(/[^0-9Xx]/g, '').toUpperCase()
  const urlValue = /^https?:\/\//i.test(url || locator)
    ? (url || locator).trim().replace(/[#?].*$/, '').replace(/\/$/, '').toLowerCase()
    : ''

  const keys = [
    doiValue ? `doi:${doiValue}` : '',
    (isbnValue.length === 10 || isbnValue.length === 13)
      ? `isbn:${isbnValue}`
      : '',
    urlValue ? `url:${urlValue}` : '',
  ].filter(Boolean)

  const title = normalizeSourceToken(summary.title)
  const year = normalizeSourceToken(summary.year)
  if (title && year) keys.push(`title:${title}|${year}`)

  return keys
}

export function sourcesOverlap(
  left: DuplicateComparableSource,
  right: DuplicateComparableSource,
) {
  const rightKeys = new Set(sourceDuplicateKeys(right))
  return sourceDuplicateKeys(left).some((key) => rightKeys.has(key))
}

export function sourceOpenUrl(source: CitationSource) {
  const metadata = source.sourceData || {}
  const url = typeof metadata.url === 'string' ? metadata.url.trim() : ''
  if (/^https?:\/\//i.test(url)) return url

  const doi = typeof metadata.DOI === 'string' ? metadata.DOI.trim() : ''
  const locator = sourceSummary(source).locator
  const doiMatch = (doi || locator).match(
    /(?:https?:\/\/(?:dx\.)?doi\.org\/)?(10\.\d{4,9}\/\S+)/i,
  )

  if (doiMatch) {
    return `https://doi.org/${doiMatch[1].replace(/[.,;]+$/, '')}`
  }

  return /^https?:\/\//i.test(locator) ? locator : ''
}
