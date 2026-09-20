import type { Editor } from '@tiptap/core'
import { redoDepth, undoDepth } from '@tiptap/pm/history'

export function htmlHasText(html: string | null | undefined) {
  if (!html) return false
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  return Boolean(parsed.body.textContent?.trim())
}

function textStats(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  return {
    words: normalized ? normalized.split(/\s+/).length : 0,
    characters: normalized.length,
  }
}

export function documentStats(editor: Editor) {
  const citationText: string[] = []
  editor.state.doc.descendants((node) => {
    if (node.type.name !== 'citation') return
    const text = typeof node.attrs.text === 'string' ? node.attrs.text.trim() : ''
    if (text) citationText.push(text)
  })

  return textStats([editor.getText({ blockSeparator: ' ' }), ...citationText].join(' '))
}

function activeHeadingLevel(editor: Editor | null): 1 | 2 | 3 | 4 | 5 | null {
  if (!editor) return null
  for (const level of [1, 2, 3, 4, 5] as const) {
    if (editor.isActive('heading', { level })) return level
  }
  return null
}

export function selectedDocumentStats(editor: Editor) {
  const { from, to, empty } = editor.state.selection
  if (empty) return null

  const citationText: string[] = []
  editor.state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name !== 'citation') return
    if (pos < from || pos + node.nodeSize > to) return
    const text = typeof node.attrs.text === 'string' ? node.attrs.text.trim() : ''
    if (text) citationText.push(text)
  })

  const selectedText = editor.state.doc.textBetween(from, to, ' ')
  const stats = textStats([selectedText, ...citationText].join(' '))
  return stats.words || stats.characters ? stats : null
}

function activeTextAlignment(activeEditor: Editor | null) {
  if (!activeEditor) return 'left'
  for (const alignment of ['center', 'right', 'justify'] as const) {
    if (activeEditor.isActive({ textAlign: alignment })) return alignment
  }
  return 'left'
}

function activeListItemType(activeEditor: Editor | null) {
  return activeEditor?.isActive('taskList') ? 'taskItem' : 'listItem'
}

export function indentList(activeEditor: Editor | null) {
  if (!activeEditor) return
  activeEditor.chain().focus().sinkListItem(activeListItemType(activeEditor)).run()
}

export function outdentList(activeEditor: Editor | null) {
  if (!activeEditor) return
  activeEditor.chain().focus().liftListItem(activeListItemType(activeEditor)).run()
}

function editorBlockStyle(activeEditor: Editor | null) {
  if (!activeEditor) return 'paragraph'
  for (const level of [1, 2, 3, 4, 5] as const) {
    if (activeEditor.isActive('heading', { level })) return `h${level}`
  }
  return 'paragraph'
}

export function applyBlockStyle(activeEditor: Editor | null, style: string) {
  if (!activeEditor) return
  if (style === 'paragraph') {
    activeEditor.chain().focus().setParagraph().run()
    return
  }

  const level = Number(style.slice(1)) as 1 | 2 | 3 | 4 | 5
  activeEditor.chain().focus().setHeading({ level }).run()
}

export function editorToolbarSnapshot(activeEditor: Editor | null) {
  if (!activeEditor) {
    return {
      headingLevel: null as 1 | 2 | 3 | 4 | 5 | null,
      blockStyle: 'paragraph',
      paragraph: false,
      fontFamily: '',
      fontSize: '',
      color: '',
      textAlign: 'left',
      canUndo: false,
      canRedo: false,
      bulletList: false,
      orderedList: false,
      taskList: false,
      canLiftListItem: false,
      canSinkListItem: false,
      blockquote: false,
      codeBlock: false,
      bold: false,
      italic: false,
      strike: false,
      code: false,
      underline: false,
      highlight: false,
      highlightColor: '',
      link: false,
      superscript: false,
      subscript: false,
      image: false,
      imageAlign: '',
      citation: false,
      referenceEntry: false,
      referenceTitle: false,
      table: false,
      tableApa: false,
      canMergeCells: false,
      canSplitCell: false,
      canSetHorizontalRule: false,
      canInsertTable: false,
      canInsertPageBreak: false,
    }
  }

  const bulletList = activeEditor.isActive('bulletList')
  const orderedList = activeEditor.isActive('orderedList')
  const taskList = activeEditor.isActive('taskList')
  const inList = bulletList || orderedList || taskList
  const inTable = activeEditor.isActive('table')
  const tableAttributes = inTable ? activeEditor.getAttributes('table') : {}
  const textStyle = activeEditor.getAttributes('textStyle')
  const image = activeEditor.isActive('image')
  const imageAttributes = image ? activeEditor.getAttributes('image') : {}
  const extensions = activeEditor.extensionManager.extensions
  const hasHorizontalRule = extensions.some((extension) => extension.name === 'horizontalRule')
  const hasTable = extensions.some((extension) => extension.name === 'table')
  const hasPageBreak = extensions.some((extension) => extension.name === 'pageBreak')

  return {
    headingLevel: activeHeadingLevel(activeEditor),
    blockStyle: editorBlockStyle(activeEditor),
    paragraph: activeEditor.isActive('paragraph'),
    fontFamily: String(textStyle.fontFamily || ''),
    fontSize: String(textStyle.fontSize || ''),
    color: String(textStyle.color || ''),
    textAlign: activeTextAlignment(activeEditor),
    canUndo: undoDepth(activeEditor.state) > 0,
    canRedo: redoDepth(activeEditor.state) > 0,
    bulletList,
    orderedList,
    taskList,
    canLiftListItem: inList && activeEditor.can().liftListItem(activeListItemType(activeEditor)),
    canSinkListItem: inList && activeEditor.can().sinkListItem(activeListItemType(activeEditor)),
    blockquote: activeEditor.isActive('blockquote'),
    codeBlock: activeEditor.isActive('codeBlock'),
    bold: activeEditor.isActive('bold'),
    italic: activeEditor.isActive('italic'),
    strike: activeEditor.isActive('strike'),
    code: activeEditor.isActive('code'),
    underline: activeEditor.isActive('underline'),
    highlight: activeEditor.isActive('highlight'),
    highlightColor: String(activeEditor.getAttributes('highlight').color || ''),
    link: activeEditor.isActive('link'),
    superscript: activeEditor.isActive('superscript'),
    subscript: activeEditor.isActive('subscript'),
    image,
    imageAlign: String(imageAttributes.align || ''),
    citation: activeEditor.isActive('citation'),
    referenceEntry: activeEditor.isActive('paragraph', { referenceEntry: true }),
    referenceTitle: activeEditor.isActive('paragraph', { referenceTitle: true }),
    table: inTable,
    tableApa: Boolean(tableAttributes.apaTable),
    canMergeCells: inTable && activeEditor.can().mergeCells(),
    canSplitCell: inTable && activeEditor.can().splitCell(),
    canSetHorizontalRule: hasHorizontalRule,
    canInsertTable: hasTable,
    canInsertPageBreak: hasPageBreak,
  }
}
