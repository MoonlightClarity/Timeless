import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      insertPageBreak: () => ReturnType
    }
  }
}

const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: true,

  parseHTML() {
    return [
      { tag: 'div[data-timeless-page-break]' },
      { tag: 'hr[data-timeless-page-break]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-timeless-page-break': 'true',
        class: 'timeless-page-break',
      }),
      ['span', { contenteditable: 'false' }, 'Page break'],
    ]
  },

  addCommands() {
    return {
      insertPageBreak:
        () => ({ commands }) => commands.insertContent([
          { type: this.name },
          { type: 'paragraph' },
        ]),
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.commands.insertPageBreak(),
    }
  },
})

export default PageBreak
