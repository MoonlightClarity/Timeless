import { Table, TableView } from '@tiptap/extension-table'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'

class TimelessTableView extends TableView {
  private metadata: HTMLDivElement

  private numberElement: HTMLDivElement

  private titleElement: HTMLDivElement

  private noteElement: HTMLDivElement

  constructor(
    node: ProseMirrorNode,
    cellMinWidth: number,
    view?: EditorView,
    HTMLAttributes: Record<string, unknown> = {},
  ) {
    super(node, cellMinWidth, view, HTMLAttributes)

    this.dom.classList.add('timeless-table-wrapper')

    this.metadata = document.createElement('div')
    this.metadata.className = 'timeless-table-metadata'
    this.metadata.contentEditable = 'false'

    this.numberElement = document.createElement('div')
    this.numberElement.className = 'timeless-table-number'
    this.metadata.appendChild(this.numberElement)

    this.titleElement = document.createElement('div')
    this.titleElement.className = 'timeless-table-title'
    this.metadata.appendChild(this.titleElement)

    this.noteElement = document.createElement('div')
    this.noteElement.className = 'timeless-table-note'
    this.noteElement.contentEditable = 'false'

    this.dom.insertBefore(this.metadata, this.table)
    this.dom.appendChild(this.noteElement)
    this.syncApaMetadata(node)
  }

  private syncApaMetadata(node: ProseMirrorNode) {
    const apaTable = Boolean(node.attrs.apaTable)
    const tableNumber = String(node.attrs.tableNumber || '').trim()
    const tableTitle = String(node.attrs.tableTitle || '').trim()
    const tableNote = String(node.attrs.tableNote || '').trim()

    this.dom.dataset.apaTable = apaTable ? 'true' : 'false'

    const tableAttributes: Array<[string, string]> = [
      ['data-apa-table', apaTable ? 'true' : ''],
      ['data-table-number', tableNumber],
      ['data-table-title', tableTitle],
      ['data-table-note', tableNote],
    ]

    tableAttributes.forEach(([name, value]) => {
      if (value) this.table.setAttribute(name, value)
      else this.table.removeAttribute(name)
    })

    this.numberElement.textContent = tableNumber ? `Table ${tableNumber}` : ''
    this.numberElement.hidden = !apaTable || !tableNumber

    this.titleElement.textContent = tableTitle
    this.titleElement.hidden = !apaTable || !tableTitle

    this.metadata.hidden = !apaTable || (!tableNumber && !tableTitle)

    this.noteElement.replaceChildren()
    if (apaTable && tableNote) {
      const label = document.createElement('em')
      label.textContent = 'Note. '
      this.noteElement.append(label, document.createTextNode(tableNote))
      this.noteElement.hidden = false
    } else {
      this.noteElement.hidden = true
    }
  }

  update(node: ProseMirrorNode) {
    const updated = super.update(node)
    if (updated) this.syncApaMetadata(node)
    return updated
  }
}

const TimelessTable = Table.extend({
  addOptions() {
    const parent = this.parent?.()
    if (parent) {
      return {
        ...parent,
        View: TimelessTableView,
      }
    }

    return {
      HTMLAttributes: {},
      resizable: false,
      renderWrapper: false,
      handleWidth: 5,
      cellMinWidth: 25,
      View: TimelessTableView,
      lastColumnResizable: true,
      allowTableNodeSelection: false,
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      tableNumber: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-table-number') || '',
        renderHTML: (attributes) => attributes.tableNumber
          ? { 'data-table-number': attributes.tableNumber }
          : {},
      },
      tableTitle: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-table-title') || '',
        renderHTML: (attributes) => attributes.tableTitle
          ? { 'data-table-title': attributes.tableTitle }
          : {},
      },
      tableNote: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-table-note') || '',
        renderHTML: (attributes) => attributes.tableNote
          ? { 'data-table-note': attributes.tableNote }
          : {},
      },
      apaTable: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-apa-table') === 'true',
        renderHTML: (attributes) => attributes.apaTable
          ? { 'data-apa-table': 'true' }
          : {},
      },
    }
  },
})

export default TimelessTable
