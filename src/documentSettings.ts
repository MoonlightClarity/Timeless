import {
  DEFAULT_HEADING_LEVEL_STYLES,
  type TimelessDocumentSettings,
} from './projectXml'

function cloneHeadingLevelStyles(styles: TimelessDocumentSettings['headingLevelStyles']) {
  return {
    h1: { ...styles.h1 },
    h2: { ...styles.h2 },
    h3: { ...styles.h3 },
    h4: { ...styles.h4 },
    h5: { ...styles.h5 },
  }
}

export const DEFAULT_LAYOUT_SETTINGS = {
  bodyFont: 'Times New Roman',
  bodyFontSize: 12,
  headingFont: 'Times New Roman',
  headingSizes: {
    h1: 18,
    h2: 16,
    h3: 14,
    h4: 12,
    h5: 12,
  },
  headingLevelStyles: {
    h1: { ...DEFAULT_HEADING_LEVEL_STYLES.h1 },
    h2: { ...DEFAULT_HEADING_LEVEL_STYLES.h2 },
    h3: { ...DEFAULT_HEADING_LEVEL_STYLES.h3 },
    h4: { ...DEFAULT_HEADING_LEVEL_STYLES.h4 },
    h5: { ...DEFAULT_HEADING_LEVEL_STYLES.h5 },
  },
  lineHeight: 1.15,
  paragraphSpacing: 0,
  firstLineIndent: 0,
  marginInches: 1,
  pageSize: 'letter' as const,
  orientation: 'portrait' as const,
  runningHead: '',
  pageNumbers: false,
  headingStyle: 'standard' as const,
}

export const APA_LAYOUT_SETTINGS = {
  bodyFont: 'Times New Roman',
  bodyFontSize: 12,
  headingFont: 'Times New Roman',
  headingSizes: {
    h1: 12,
    h2: 12,
    h3: 12,
    h4: 12,
    h5: 12,
  },
  lineHeight: 2,
  paragraphSpacing: 0,
  firstLineIndent: 0.5,
  marginInches: 1,
  pageSize: 'letter' as const,
  orientation: 'portrait' as const,
  pageNumbers: true,
  headingStyle: 'apa' as const,
}

export const DEFAULT_DOCUMENT_SETTINGS: TimelessDocumentSettings = {
  ...DEFAULT_LAYOUT_SETTINGS,
  headingSizes: { ...DEFAULT_LAYOUT_SETTINGS.headingSizes },
  headingLevelStyles: cloneHeadingLevelStyles(DEFAULT_LAYOUT_SETTINGS.headingLevelStyles),
  automaticCitations: true,
  automaticReferences: false,
  titlePage: 'none',
  titlePageAuthor: '',
  titlePageAffiliation: '',
  titlePageCourse: '',
  titlePageInstructor: '',
  titlePageDueDate: '',
  titlePageAuthorNote: '',
  abstractEnabled: false,
  abstractText: '',
  abstractKeywords: '',
}

export const DOCUMENT_DEFAULTS = {
  bodyAlignment: 'left' as const,
  referenceTitle: 'References',
  citationStyle: 'apa' as const,
}

export const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Calibri', value: 'Calibri' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Garamond', value: 'Garamond' },
  { label: 'Courier New', value: 'Courier New' },
]

export const FONT_SIZES = [
  '',
  '8pt',
  '9pt',
  '10pt',
  '11pt',
  '12pt',
  '14pt',
  '16pt',
  '18pt',
  '20pt',
  '24pt',
  '28pt',
  '32pt',
]

export const DOCUMENT_FONT_SIZES = FONT_SIZES
  .filter(Boolean)
  .map((size) => Number.parseFloat(size))

export const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#f6e58d' },
  { label: 'Green', value: '#b8e994' },
  { label: 'Blue', value: '#82ccdd' },
  { label: 'Pink', value: '#f8a5c2' },
  { label: 'Purple', value: '#d6a2e8' },
]

export function normalizeDocumentSettings(
  settings?: TimelessDocumentSettings,
): TimelessDocumentSettings {
  if (!settings) {
    return {
      ...DEFAULT_DOCUMENT_SETTINGS,
      headingSizes: { ...DEFAULT_DOCUMENT_SETTINGS.headingSizes },
      headingLevelStyles: cloneHeadingLevelStyles(DEFAULT_DOCUMENT_SETTINGS.headingLevelStyles),
    }
  }

  return {
    ...DEFAULT_DOCUMENT_SETTINGS,
    ...settings,
    headingSizes: {
      ...DEFAULT_DOCUMENT_SETTINGS.headingSizes,
      ...settings.headingSizes,
    },
    headingLevelStyles: cloneHeadingLevelStyles(
      settings.headingLevelStyles || DEFAULT_DOCUMENT_SETTINGS.headingLevelStyles,
    ),
  }
}
