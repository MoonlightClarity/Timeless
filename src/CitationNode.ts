import { Node, mergeAttributes } from '@tiptap/core'

const CitationNode = Node.create({
  name: 'citation',

  inline: true,
  group: 'inline',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      items: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-items') || '',
        renderHTML: (attributes) => (
          attributes.items
            ? { 'data-items': attributes.items }
            : {}
        ),
      },
      text: {
        default: '',
        parseHTML: (element) => element.textContent || '',
      },
      citationMode: {
        default: 'parenthetical',
        parseHTML: (element) => element.getAttribute('data-citation-mode') || 'parenthetical',
        renderHTML: (attributes) => (
          attributes.citationMode && attributes.citationMode !== 'parenthetical'
            ? { 'data-citation-mode': attributes.citationMode }
            : {}
        ),
      },
      prefix: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-prefix') || '',
        renderHTML: (attributes) => attributes.prefix
          ? { 'data-prefix': attributes.prefix }
          : {},
      },
      suffix: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-suffix') || '',
        renderHTML: (attributes) => attributes.suffix
          ? { 'data-suffix': attributes.suffix }
          : {},
      },
      manualText: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-manual-text') || '',
        renderHTML: (attributes) => attributes.manualText
          ? { 'data-manual-text': attributes.manualText }
          : {},
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'span[data-timeless-citation]' },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-timeless-citation': 'true',
        class: 'timeless-inline-citation',
      }),
      node.attrs.text || '',
    ]
  },
})

export default CitationNode
