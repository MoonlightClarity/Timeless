export type BibliographyLayout = {
  hangingIndent: boolean
  lineSpacing: number
  entrySpacing: number
}

function bibliographyAttribute(styleXml: string, name: string) {
  const bibliography = styleXml.match(/<bibliography\b([^>]*)>/i)?.[1] || ''
  return bibliography.match(new RegExp(`\\b${name}="([^"]+)"`, 'i'))?.[1] || ''
}

export function bibliographyLayoutFromStyleXml(styleXml: string): BibliographyLayout {
  const lineSpacingAttribute = bibliographyAttribute(styleXml, 'line-spacing')
  const entrySpacingAttribute = bibliographyAttribute(styleXml, 'entry-spacing')
  const lineSpacing = lineSpacingAttribute ? Number(lineSpacingAttribute) : Number.NaN
  const entrySpacing = entrySpacingAttribute ? Number(entrySpacingAttribute) : Number.NaN

  return {
    hangingIndent: bibliographyAttribute(styleXml, 'hanging-indent') === 'true',
    lineSpacing: Number.isFinite(lineSpacing) && lineSpacing > 0 ? lineSpacing : 1,
    entrySpacing: Number.isFinite(entrySpacing) && entrySpacing >= 0 ? entrySpacing : 1,
  }
}
