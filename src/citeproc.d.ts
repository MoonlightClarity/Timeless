declare module 'citeproc' {
  type CiteprocItem = Record<string, unknown>

  type CiteprocSystem = {
    retrieveLocale: (language: string) => string
    retrieveItem: (id: string) => CiteprocItem
  }

  type BibliographyMeta = {
    entry_ids: Array<string | string[]>
  }

  class Engine {
    constructor(system: CiteprocSystem, style: string, language?: string)
    setOutputFormat(format: string): void
    updateItems(ids: string[]): void
    makeCitationCluster(items: Array<{ id: string; [key: string]: unknown }>): string
    makeBibliography(): [BibliographyMeta, string[]] | false
  }

  const CSL: {
    Engine: typeof Engine
  }

  export default CSL
}
