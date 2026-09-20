import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    referenceParagraph: {
      toggleReferenceEntry: (layout?: {
        style?: string
        lineSpacing?: number
        entrySpacing?: number
      }) => ReturnType
    }
  }
}

export function isEmptyReferenceParagraph(nodeType: string, text: string, referenceEntry: unknown) {
  return nodeType === 'paragraph' && referenceEntry === true && text.trim() === ''
}

const ReferenceParagraph = Extension.create({
  name: 'referenceParagraph',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          referenceEntry: {
            default: false,
            keepOnSplit: true,
            parseHTML: (element) => element.getAttribute('data-reference-entry') === 'true',
            renderHTML: (attributes) => attributes.referenceEntry
              ? {
                  'data-reference-entry': 'true',
                  class: 'reference-entry',
                }
              : {},
          },
          referenceTitle: {
            default: false,
            keepOnSplit: false,
            parseHTML: (element) => element.getAttribute('data-reference-title') === 'true',
            renderHTML: (attributes) => attributes.referenceTitle
              ? {
                  'data-reference-title': 'true',
                  class: 'reference-section-title',
                }
              : {},
          },
          referenceStyle: {
            default: '',
            keepOnSplit: true,
            parseHTML: (element) => element.getAttribute('data-reference-style') || '',
            renderHTML: (attributes) => attributes.referenceStyle
              ? { 'data-reference-style': String(attributes.referenceStyle) }
              : {},
          },
          referenceLineSpacing: {
            default: null,
            keepOnSplit: true,
            parseHTML: (element) => {
              const value = Number(element.getAttribute('data-reference-line-spacing'))
              return Number.isFinite(value) && value > 0 ? value : null
            },
            renderHTML: (attributes) => Number.isFinite(Number(attributes.referenceLineSpacing))
              ? {
                  'data-reference-line-spacing': String(attributes.referenceLineSpacing),
                  style: `line-height:${attributes.referenceLineSpacing}`,
                }
              : {},
          },
          referenceEntrySpacing: {
            default: null,
            keepOnSplit: true,
            parseHTML: (element) => {
              const value = Number(element.getAttribute('data-reference-entry-spacing'))
              return Number.isFinite(value) && value >= 0 ? value : null
            },
            renderHTML: (attributes) => Number.isFinite(Number(attributes.referenceEntrySpacing))
              ? {
                  'data-reference-entry-spacing': String(attributes.referenceEntrySpacing),
                  style: `margin-bottom:${attributes.referenceEntrySpacing}em`,
                }
              : {},
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      toggleReferenceEntry:
        (layout = {}) => ({ editor, commands }) => {
          if (!editor.isActive('paragraph')) return false
          const current = Boolean(editor.getAttributes('paragraph').referenceEntry)
          if (current) {
            return commands.updateAttributes('paragraph', {
              referenceEntry: false,
              referenceStyle: '',
              referenceLineSpacing: null,
              referenceEntrySpacing: null,
            })
          }

          return editor
            .chain()
            .setTextAlign('left')
            .updateAttributes('paragraph', {
              referenceEntry: true,
              referenceTitle: false,
              referenceStyle: layout.style || '',
              referenceLineSpacing: Number.isFinite(layout.lineSpacing) ? layout.lineSpacing : null,
              referenceEntrySpacing: Number.isFinite(layout.entrySpacing) ? layout.entrySpacing : null,
            })
            .run()
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { $from } = this.editor.state.selection
        if (!isEmptyReferenceParagraph(
          $from.parent.type.name,
          $from.parent.textContent,
          $from.parent.attrs.referenceEntry,
        )) return false

        return this.editor.commands.updateAttributes('paragraph', {
          referenceEntry: false,
          referenceStyle: '',
          referenceLineSpacing: null,
          referenceEntrySpacing: null,
        })
      },
    }
  },
})

export default ReferenceParagraph
