import type { CitationSource } from './citation'

export type MetadataLookupChoice = {
  key: string
  title: string
  source?: Omit<CitationSource, 'id'>
}

export type MetadataLookupResult =
  | {
      kind: 'single'
      source: Omit<CitationSource, 'id'>
    }
  | {
      kind: 'choices'
      choices: MetadataLookupChoice[]
      followUp?: {
        url: string
        session: string
      }
    }

function unavailable(): never {
  throw new Error('Automatic metadata lookup is unavailable in the Firefox edition.')
}

export async function lookupSourceMetadata(
  _identifier: string,
): Promise<MetadataLookupResult> {
  return unavailable()
}

export async function lookupSourceChoice(
  _choice: MetadataLookupChoice,
  _followUp?: { url: string; session: string },
): Promise<Omit<CitationSource, 'id'>> {
  return unavailable()
}
