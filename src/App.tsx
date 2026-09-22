import { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  AtSign,
  BookOpen,
  Captions,
  CheckSquare,
  Code2,
  Columns3,
  Copy,
  ExternalLink,
  FileText,
  Film,
  Globe2,
  Highlighter,
  ImageIcon,
  ImagePlus,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  Library,
  List,
  ListOrdered,
  Maximize2,
  Mic2,
  Minus,
  Moon,
  Newspaper,
  Pencil,
  Plus,
  Quote,
  Redo2,
  RemoveFormatting,
  Rows3,
  Scale,
  Search,
  StickyNote,
  Strikethrough,
  Sun,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table2,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
  UserRound,
  CalendarDays,
  X,
} from 'lucide-react'
import { useEditor, EditorContent, useEditorState } from '@tiptap/react'
import type { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Typography from '@tiptap/extension-typography'
import FindAndReplace from '@tiptap/extension-find-and-replace'
import { Placeholder, Selection } from '@tiptap/extensions'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TableKit } from '@tiptap/extension-table'
import { NodeSelection } from '@tiptap/pm/state'
import FigureImage from './FigureImage'
import TimelessTable from './TimelessTable'
import CitationNode from './CitationNode'
import PageBreak from './PageBreak'
import ReferenceParagraph from './ReferenceParagraph'
import { applyPendingEvidenceNote } from './evidenceNotes'
import { authoredHeadingText } from './authoredText'
import { clearProjectXml, loadProjectXml, saveProjectXml } from './storage'
import {
  deserializeTimelessXml,
  openTimelessXmlFileWithHandle,
  saveTimelessXmlFile,
  serializeTimelessXml,
  supportsTimelessFileHandles,
  type TimelessDocumentSettings,
  type TimelessDocumentState,
  type TimelessFileHandle,
} from './projectXml'
import {
  APA_LAYOUT_SETTINGS,
  DEFAULT_DOCUMENT_SETTINGS,
  DEFAULT_LAYOUT_SETTINGS,
  DOCUMENT_DEFAULTS,
  DOCUMENT_FONT_SIZES,
  FONT_FAMILIES,
  FONT_SIZES,
  HIGHLIGHT_COLORS,
  normalizeDocumentSettings,
} from './documentSettings'
import { bodyStartsWithPaperTitle, buildFrontMatterHtml } from './frontMatter'
import {
  applyBlockStyle,
  documentStats,
  editorToolbarSnapshot,
  indentList,
  outdentList,
  selectedDocumentStats,
} from './editorUi'
import { sourcesForDocumentBibliography } from './bibliography'
import { citationItemsWithoutSource } from './citationIntegrity'
import {
  bibliographyLayout,
  formatCitationCluster,
  formatInlineCitation,
  type CitationClusterItem,
  type CitationSource,
  type CitationStyle,
} from './citation'
import {
  cachedFormatReferences,
  formatCitationPresentation,
} from './citationUi'
import {
  citationItemsAttribute,
  citationItemsFromAttributes,
  citedSourceCounts,
} from './citationState'
import {
  normalizeSourceToken,
  sourceOpenUrl,
  sourcesOverlap,
} from './sourceUi'
import {
  lookupSourceChoice,
  lookupSourceMetadata,
  type MetadataLookupChoice,
} from './metadataLookup'
import {
  SOURCE_TYPES,
  changeSourceItemType,
  createBlankSourceItem,
  getSourceTypeDefinition,
  sourceFromItemData,
  sourceSummary,
  sourceToItemData,
  type SourceCreator,
  type SourceItemData,
} from './sourceMetadata'
import './App.css'

type Tab = 'write' | 'evidence'

type Source = CitationSource

type OutlineItem = {
  level: number
  text: string
  pos: number
}

const DEFAULT_CONTENT = '<p></p>'
const METADATA_LOOKUP_ENABLED = import.meta.env.MODE !== 'firefox'

const OUTLINE_PAGE_SIZE = 80
function sourceTypeIcon(itemType: string) {
  const type = itemType.toLowerCase()

  if (type.includes('book') || type.includes('dictionary') || type.includes('encyclopedia')) return <BookOpen />
  if (type.includes('journal') || type.includes('magazine') || type.includes('newspaper')) return <Newspaper />
  if (type.includes('web') || type.includes('blog') || type.includes('forum')) return <Globe2 />
  if (type.includes('film') || type.includes('video') || type.includes('broadcast')) return <Film />
  if (type.includes('audio') || type.includes('podcast') || type.includes('radio')) return <Mic2 />
  if (type.includes('artwork')) return <ImageIcon />
  if (type.includes('case') || type.includes('bill') || type.includes('statute') || type.includes('hearing') || type.includes('patent')) return <Scale />

  return <FileText />
}

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('Could not read image.'))
    reader.readAsDataURL(file)
  })
}

async function insertImageFiles(editor: Editor | null, files: File[], position?: number) {
  if (!editor || !files.length) return

  const sources = await Promise.all(files.map(readImageFile))
  let chain = editor.chain().focus()

  if (typeof position === 'number') {
    chain = chain.setTextSelection(position)
  }

  sources.forEach((src) => {
    chain = chain.setImage({ src })
  })

  chain.run()
}

function imageFiles(files: FileList | null | undefined) {
  return Array.from(files || []).filter((file) => file.type.startsWith('image/'))
}

async function copyText(text: string) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  }
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function App() {
  const [tab, setTab] = useState<Tab>('write')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (
    localStorage.getItem('timeless.theme') === 'light' ? 'light' : 'dark'
  ))
  const [documentZoom, setDocumentZoom] = useState(() => {
    const saved = Number(localStorage.getItem('timeless.zoom') || '100')
    return Number.isFinite(saved) ? Math.min(200, Math.max(50, saved)) : 100
  })
  const [bodyHtml, setBodyHtml] = useState(DEFAULT_CONTENT)
  const [sources, setSources] = useState<Source[]>([])
  const [outline, setOutline] = useState<OutlineItem[]>([])
  const [stats, setStats] = useState({ words: 0, characters: 0 })
  const [selectedStats, setSelectedStats] = useState<{ words: number; characters: number } | null>(null)
  const [projectSaveStatus, setProjectSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileDirty, setFileDirty] = useState(false)
  const fileDirtyRef = useRef(false)
  const [fileSaveMode, setFileSaveMode] = useState<'handle' | 'download' | null>(null)
  const [documentSettings, setDocumentSettings] = useState<TimelessDocumentSettings>(() => normalizeDocumentSettings())
  const [outlinePage, setOutlinePage] = useState(0)
  const [activeOutlinePos, setActiveOutlinePos] = useState<number | null>(null)
  const [documentName, setDocumentName] = useState('Untitled')
  const [showSourceForm, setShowSourceForm] = useState(false)
  const [sourceFilter, setSourceFilter] = useState('')
  const [sourceCitationFilter, setSourceCitationFilter] = useState<'all' | 'cited' | 'uncited'>('all')
  const [sourceSort, setSourceSort] = useState<'added' | 'author' | 'year' | 'title'>(() => {
    const saved = localStorage.getItem('timeless.sourceSort')
    return saved === 'author' || saved === 'year' || saved === 'title' ? saved : 'added'
  })
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('apa')
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(() => sources[0]?.id || null)
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null)
  const [sourceLookupPending, setSourceLookupPending] = useState(false)
  const [pdfExporting, setPdfExporting] = useState(false)
  const [sourceLookupQuery, setSourceLookupQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [layoutOpen, setLayoutOpen] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [highlightOpen, setHighlightOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [citationOpen, setCitationOpen] = useState(false)
  const [citationItems, setCitationItems] = useState<CitationClusterItem[]>([])
  const [citationMode, setCitationMode] = useState<'parenthetical' | 'narrative'>('parenthetical')
  const [citationPrefix, setCitationPrefix] = useState('')
  const [citationSuffix, setCitationSuffix] = useState('')
  const [citationManualText, setCitationManualText] = useState('')
  const [citationPickerOpen, setCitationPickerOpen] = useState(false)
  const [citationPickerQuery, setCitationPickerQuery] = useState('')
  const [manualCitationDraft, setManualCitationDraft] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [searchCaseSensitive, setSearchCaseSensitive] = useState(false)
  const [searchWholeWord, setSearchWholeWord] = useState(false)
  const [searchRegex, setSearchRegex] = useState(false)
  const [searchResultCount, setSearchResultCount] = useState(0)
  const [searchCurrentIndex, setSearchCurrentIndex] = useState<number | null>(null)
  const [sourceLookupChoices, setSourceLookupChoices] = useState<MetadataLookupChoice[]>([])
  const [sourceLookupFollowUp, setSourceLookupFollowUp] = useState<{ url: string; session: string } | undefined>()
  const outlineTimerRef = useRef<number | null>(null)
  const projectSaveTimerRef = useRef<number | null>(null)
  const projectSaveGenerationRef = useRef(0)
  const projectLoadedRef = useRef(false)
  const fileHandleRef = useRef<TimelessFileHandle | null>(null)
  const noteSaveTimerRef = useRef<number | null>(null)
  const pendingNoteRef = useRef<{ id: string } | null>(null)
  const suppressNextSourcesEffectRef = useRef(false)
  const selectedSourceIdRef = useRef<string | null>(selectedSourceId)
  const sourcesRef = useRef(sources)
  const latestBodyRef = useRef(bodyHtml)
  const documentNameRef = useRef(documentName)
  const citationStyleRef = useRef(citationStyle)
  const documentSettingsRef = useRef(documentSettings)
  const noteLoadingRef = useRef(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const linkInputRef = useRef<HTMLInputElement | null>(null)
  const citationPickerInputRef = useRef<HTMLInputElement | null>(null)
  const editorRef = useRef<Editor | null>(null)
  const noteEditorRef = useRef<Editor | null>(null)
  const [sourceDraft, setSourceDraft] = useState<Omit<Source, 'id'>>(
    () => sourceFromItemData(createBlankSourceItem('book')),
  )
  const sourceDraftRef = useRef(sourceDraft)

  function updateSourceDraft(
    update: Omit<Source, 'id'> | ((current: Omit<Source, 'id'>) => Omit<Source, 'id'>),
  ) {
    const current = sourceDraftRef.current
    const next = typeof update === 'function' ? update(current) : update
    sourceDraftRef.current = next
    setSourceDraft(next)
  }

  function currentProjectState(activeEditor: Editor): TimelessDocumentState {
    return {
      title: documentNameRef.current.trim() || 'Untitled',
      editor: activeEditor.getJSON(),
      sources: sourcesRef.current,
      citationStyle: citationStyleRef.current,
      settings: documentSettingsRef.current,
    }
  }

  function setFileDirtyState(value: boolean) {
    fileDirtyRef.current = value
    setFileDirty(value)
  }

  function markFileDirty() {
    if (!projectLoadedRef.current || fileDirtyRef.current) return
    setFileDirtyState(true)
  }

  async function persistProject(
    generation = ++projectSaveGenerationRef.current,
    activeEditor: Editor | null = editorRef.current,
  ) {
    if (!projectLoadedRef.current || !activeEditor) return false

    setProjectSaveStatus('saving')
    const saved = await saveProjectXml(serializeTimelessXml(currentProjectState(activeEditor)))
    if (generation === projectSaveGenerationRef.current) {
      setProjectSaveStatus(saved ? 'saved' : 'error')
    }
    return saved
  }

  function queueProjectSave(activeEditor: Editor | null = editorRef.current, delay = 1200) {
    if (!projectLoadedRef.current || !activeEditor) return

    const generation = ++projectSaveGenerationRef.current
    setProjectSaveStatus('saving')
    if (projectSaveTimerRef.current !== null) {
      window.clearTimeout(projectSaveTimerRef.current)
    }
    projectSaveTimerRef.current = window.setTimeout(() => {
      projectSaveTimerRef.current = null
      void persistProject(generation, activeEditor)
    }, delay)
  }

  function updateDocumentSettings(patch: Partial<TimelessDocumentSettings>) {
    setDocumentSettings((current) => {
      const next = {
        ...current,
        ...patch,
        headingSizes: patch.headingSizes
          ? { ...current.headingSizes, ...patch.headingSizes }
          : current.headingSizes,
        headingLevelStyles: patch.headingLevelStyles
          ? { ...current.headingLevelStyles, ...patch.headingLevelStyles }
          : current.headingLevelStyles,
      }
      documentSettingsRef.current = next
      return next
    })
  }

  function updateHeadingSize(level: 1 | 2 | 3 | 4 | 5, size: number) {
    setDocumentSettings((current) => {
      const next = {
        ...current,
        headingSizes: {
          ...current.headingSizes,
          [`h${level}`]: size,
        },
      }
      documentSettingsRef.current = next
      return next
    })
  }

  function updateHeadingLevelStyle(
    level: 1 | 2 | 3 | 4 | 5,
    patch: Partial<TimelessDocumentSettings['headingLevelStyles']['h1']>,
  ) {
    setDocumentSettings((current) => {
      const key = `h${level}` as keyof TimelessDocumentSettings['headingLevelStyles']
      const next = {
        ...current,
        headingLevelStyles: {
          ...current.headingLevelStyles,
          [key]: {
            ...current.headingLevelStyles[key],
            ...patch,
          },
        },
      }
      documentSettingsRef.current = next
      return next
    })
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5] },
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      FigureImage.configure({
        allowBase64: true,
        HTMLAttributes: { class: 'document-figure' },
        resize: {
          enabled: true,
          directions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
          minWidth: 120,
          minHeight: 80,
          alwaysPreserveAspectRatio: true,
        },
      }),
      CitationNode,
      PageBreak,
      ReferenceParagraph,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyleKit,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      Typography,
      FindAndReplace.configure({
        injectCSS: false,
        searchDebounceMs: 120,
      }),
      Selection,
      Placeholder.configure({
        placeholder: ({ node }) => node.type.name === 'heading' ? 'Heading' : 'Start writing…',
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TableKit.configure({ table: false }),
      TimelessTable,
    ],
    content: bodyHtml,
    editorProps: {
      attributes: {
        class: 'document-editor',
        spellcheck: 'true',
      },
      handlePaste: (_view, event) => {
        const files = imageFiles(event.clipboardData?.files)
        if (!files.length) return false

        event.preventDefault()
        void insertImageFiles(editor, files)
        return true
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false

        const files = imageFiles(event.dataTransfer?.files)
        if (!files.length) return false

        event.preventDefault()
        const position = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos
        void insertImageFiles(editor, files, position)
        return true
      },
    },
    onUpdate: ({ editor }) => {
      queueProjectSave(editor)
      markFileDirty()

      if (outlineTimerRef.current !== null) {
        window.clearTimeout(outlineTimerRef.current)
      }
      outlineTimerRef.current = window.setTimeout(() => {
        outlineTimerRef.current = null
        setStats(documentStats(editor))
        refreshOutline(editor)
      }, 400)
    },
    onCreate: ({ editor }) => {
      refreshOutline(editor)
      setStats(documentStats(editor))
      setSelectedStats(selectedDocumentStats(editor))
    },
  })

  const noteEditor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5] },
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyleKit,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      Typography,
      Placeholder.configure({ placeholder: 'Add notes for this source…' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TableKit,
    ],
    content: sources.find((source) => source.id === selectedSourceId)?.noteHtml || '<p></p>',
    editable: Boolean(selectedSourceId),
    editorProps: {
      attributes: {
        class: 'evidence-editor',
        spellcheck: 'true',
      },
    },
    onCreate: ({ editor }) => {
      noteEditorRef.current = editor
    },
    onDestroy: () => {
      noteEditorRef.current = null
    },
    onUpdate: () => {
      if (noteLoadingRef.current) return
      const id = selectedSourceIdRef.current
      if (!id) return

      pendingNoteRef.current = { id }
      markFileDirty()
      setProjectSaveStatus('saving')
      if (noteSaveTimerRef.current !== null) {
        window.clearTimeout(noteSaveTimerRef.current)
      }
      noteSaveTimerRef.current = window.setTimeout(() => commitPendingNote(), 250)
    },
  })

  const editorToolbarState = useEditorState({
    editor,
    selector: ({ editor: activeEditor }) => editorToolbarSnapshot(activeEditor),
  }) ?? editorToolbarSnapshot(null)

  const noteToolbarState = useEditorState({
    editor: noteEditor,
    selector: ({ editor: activeEditor }) => editorToolbarSnapshot(activeEditor),
  }) ?? editorToolbarSnapshot(null)

  function commitPendingNote(options: { suppressSourcesEffect?: boolean } = {}) {
    const pending = pendingNoteRef.current
    if (!pending) return false

    if (noteSaveTimerRef.current !== null) {
      window.clearTimeout(noteSaveTimerRef.current)
      noteSaveTimerRef.current = null
    }

    const html = noteEditorRef.current?.getHTML()
    if (html === undefined) return false

    const result = applyPendingEvidenceNote(sourcesRef.current, pending.id, html)
    if (!result.committed) return false

    pendingNoteRef.current = null
    sourcesRef.current = result.sources
    if (options.suppressSourcesEffect) suppressNextSourcesEffectRef.current = true
    setSources(result.sources)
    return true
  }

  function selectSource(id: string) {
    if (id === selectedSourceIdRef.current) return
    commitPendingNote()
    selectedSourceIdRef.current = id
    setSelectedSourceId(id)
  }

  function showWriteView() {
    if (tab === 'write') return
    flushSync(() => setTab('write'))
  }

  function jumpToSourceCitation(sourceId: string) {
    if (!editor) return

    let citationPos: number | null = null
    editor.state.doc.descendants((node, pos) => {
      if (citationPos !== null || node.type.name !== 'citation') return
      const containsSource = citationItemsFromAttributes(node.attrs)
        .some((item) => item.sourceId === sourceId)
      if (containsSource) citationPos = pos
    })

    if (citationPos === null) return

    showWriteView()
    const selection = NodeSelection.create(editor.state.doc, citationPos as number)
    editor.view.dispatch(editor.state.tr.setSelection(selection).scrollIntoView())
    editor.view.focus()
    openCitationPanel()
  }

  async function copyReference(source: Source) {
    const reference = referenceById.get(source.id)
    const summary = sourceSummary(source)
    const text = reference?.text || summary.title || summary.locator
    await copyText(text)
  }

  function editReferenceOverride(source: Source) {
    const nextValue = window.prompt(
      'Reference override (leave blank for automatic formatting):',
      source.manualReference || '',
    )
    if (nextValue === null) return

    const trimmed = nextValue.trim()
    const next = sourcesRef.current.map((candidate) => (
      candidate.id === source.id
        ? { ...candidate, manualReference: trimmed || undefined }
        : candidate
    ))
    sourcesRef.current = next
    setSources(next)
  }

  async function copyInlineCitation(source: Source) {
    await copyText(formatInlineCitation(sources, citationStyle, source.id))
  }

  async function copyBibliography() {
    await copyText(sourceReferences.map((reference) => reference.text).filter(Boolean).join('\n\n'))
  }

  function insertCitationText(source: Source) {
    if (!editor) return
    const text = formatInlineCitation(sources, citationStyle, source.id)
    if (!text) return

    showWriteView()
    editor.chain().focus().insertContent([
      { type: 'text', text },
      { type: 'text', text: ' ' },
    ]).run()
  }

  function insertCitation(source: Source) {
    if (!editor) return

    const items: CitationClusterItem[] = [{
      sourceId: source.id,
      locator: '',
      label: 'page',
    }]
    const text = formatCitationCluster(sources, citationStyle, items)
    if (!text) return

    showWriteView()
    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: 'citation',
          attrs: {
            items: citationItemsAttribute(items),
            text,
          },
        },
        { type: 'text', text: ' ' },
      ])
      .run()
  }

  function insertCitationFromPicker(source: Source) {
    if (!editor) return

    if (editor.isActive('citation')) {
      const attributes = editor.getAttributes('citation')
      const currentItems = citationItemsFromAttributes(attributes)
      if (currentItems.some((item) => item.sourceId === source.id)) {
        closeCitationPicker()
        return
      }

      const items = [
        ...currentItems,
        { sourceId: source.id, locator: '', label: 'page' },
      ]
      const text = formatCitationCluster(sources, citationStyle, items)

      editor
        .chain()
        .focus()
        .updateAttributes('citation', {
          items: citationItemsAttribute(items),
          text,
        })
        .run()

      closeCitationPicker()
      return
    }

    closeCitationPicker()
    insertCitation(source)
  }

  function removeSource(id: string) {
    commitPendingNote()
    const next = sourcesRef.current.filter((source) => source.id !== id)

    if (editor) {
      const citedNodes: Array<{
        pos: number
        size: number
        attributes: Record<string, unknown>
        items: CitationClusterItem[]
      }> = []

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name !== 'citation') return
        const items = citationItemsFromAttributes(node.attrs)
        if (!items.some((item) => item.sourceId === id)) return

        citedNodes.push({
          pos,
          size: node.nodeSize,
          attributes: node.attrs,
          items,
        })
      })

      if (
        citedNodes.length > 0
        && !window.confirm(
          `Remove this source? It is used in ${citedNodes.length} in-text citation${citedNodes.length === 1 ? '' : 's'}.`,
        )
      ) {
        return
      }

      if (citedNodes.length) {
        let transaction = editor.state.tr

        citedNodes
          .sort((left, right) => right.pos - left.pos)
          .forEach(({ pos, size, attributes, items }) => {
            const remaining = citationItemsWithoutSource(items, id)
            if (!remaining.length) {
              transaction = transaction.delete(pos, pos + size)
              return
            }

            transaction = transaction.setNodeMarkup(pos, undefined, {
              ...attributes,
              items: citationItemsAttribute(remaining),
              text: formatCitationCluster(next, citationStyle, remaining),
            })
          })

        editor.view.dispatch(transaction)
      }
    }

    sourcesRef.current = next
    setSources(next)

    if (selectedSourceIdRef.current === id) {
      const nextId = next[0]?.id || null
      selectedSourceIdRef.current = nextId
      setSelectedSourceId(nextId)
    }

    if (editingSourceId === id) {
      setEditingSourceId(null)
      setShowSourceForm(false)
      setSourceLookupQuery('')
      setSourceLookupChoices([])
      setSourceLookupFollowUp(undefined)
        updateSourceDraft(sourceFromItemData(createBlankSourceItem('book')))
    }

    if (citationItems.some((item) => item.sourceId === id)) {
      setCitationItems(citationItemsWithoutSource(citationItems, id))
      setCitationOpen(false)
    }
  }

  function refreshOutline(activeEditor = editor) {
    if (!activeEditor) return
    const items: OutlineItem[] = []

    activeEditor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        const authored = authoredHeadingText(node.toJSON())
        const level = node.attrs.level as number

        items.push({
          level,
          text: authored || 'Untitled section',
          pos,
        })
      }
    })
    setOutline(items)
    setOutlinePage((page) => Math.min(page, Math.max(0, Math.ceil(items.length / OUTLINE_PAGE_SIZE) - 1)))
  }

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (!editor) return

      const savedXml = await loadProjectXml()
      if (cancelled) return

      if (savedXml) {
        try {
          const savedProject = deserializeTimelessXml(savedXml)
          projectLoadedRef.current = false
          editor.commands.setContent(savedProject.editor)

          const normalizedBody = editor.getHTML()
          latestBodyRef.current = normalizedBody
          setBodyHtml(normalizedBody)

          sourcesRef.current = savedProject.sources
          setSources(savedProject.sources)

          citationStyleRef.current = savedProject.citationStyle
          setCitationStyle(savedProject.citationStyle)

          const restoredSettings = normalizeDocumentSettings(savedProject.settings)
          documentSettingsRef.current = restoredSettings
          setDocumentSettings(restoredSettings)

          const restoredName = savedProject.title.trim() || 'Untitled'
          documentNameRef.current = restoredName
          setDocumentName(restoredName)

          const firstSourceId = savedProject.sources[0]?.id || null
          selectedSourceIdRef.current = firstSourceId
          setSelectedSourceId(firstSourceId)

          fileHandleRef.current = null
          setFileName(null)
          setFileSaveMode(null)
          setFileDirtyState(true)

          projectLoadedRef.current = true
          setProjectSaveStatus('saved')
          refreshOutline(editor)
          return
        } catch (error) {
          console.warn('Saved Timeless XML is unreadable; starting a new document.', error)
          await clearProjectXml()
          if (cancelled) return
        }
      }

      fileHandleRef.current = null
      setFileName(null)
      setFileSaveMode(null)
      setFileDirtyState(false)
      projectLoadedRef.current = true
      refreshOutline(editor)
      void persistProject(undefined, editor)
    })()

    return () => {
      cancelled = true
    }
  }, [editor])

  useEffect(() => {
    const flushAll = () => {
      commitPendingNote()
      if (projectSaveTimerRef.current !== null) {
        window.clearTimeout(projectSaveTimerRef.current)
        projectSaveTimerRef.current = null
      }
      void persistProject(undefined, editorRef.current)
    }

    window.addEventListener('pagehide', flushAll)

    return () => {
      window.removeEventListener('pagehide', flushAll)
      if (outlineTimerRef.current !== null) window.clearTimeout(outlineTimerRef.current)
      flushAll()
    }
  }, [])

  useEffect(() => {
    sourcesRef.current = sources
    if (suppressNextSourcesEffectRef.current) {
      suppressNextSourcesEffectRef.current = false
      return
    }
    queueProjectSave()
    markFileDirty()
  }, [sources])

  useEffect(() => {
    citationStyleRef.current = citationStyle
    queueProjectSave()
    markFileDirty()
  }, [citationStyle])

  useEffect(() => {
    documentSettingsRef.current = documentSettings
    queueProjectSave()
    markFileDirty()
  }, [documentSettings])

  useEffect(() => {
    localStorage.setItem('timeless.theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('timeless.zoom', String(documentZoom))
  }, [documentZoom])

  useEffect(() => {
    localStorage.setItem('timeless.sourceSort', sourceSort)
  }, [sourceSort])

  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  useEffect(() => {
    selectedSourceIdRef.current = selectedSourceId
  }, [selectedSourceId])

  useEffect(() => {
    if (!noteEditor) return
    const source = sourcesRef.current.find((item) => item.id === selectedSourceId)

    noteLoadingRef.current = true
    noteEditor.setEditable(Boolean(source))
    noteEditor.commands.setContent(source?.noteHtml || '<p></p>')
    noteLoadingRef.current = false
  }, [noteEditor, selectedSourceId])

  useEffect(() => {
    documentNameRef.current = documentName
    queueProjectSave()
    markFileDirty()
  }, [documentName])

  useEffect(() => {
    const title = documentName === 'Untitled' ? 'Timeless' : `${documentName} — Timeless`
    document.title = fileDirty ? `• ${title}` : title
  }, [documentName, fileDirty])

  useEffect(() => {
    if (!editor) return

    const syncActiveHeading = () => {
      setSelectedStats(selectedDocumentStats(editor))
      if (
        editor.isActive('heading')
        || editor.isActive('paragraph', { referenceEntry: true })
        || editor.isActive('paragraph', { referenceTitle: true })
      ) setListOpen(false)
      const cursor = editor.state.selection.from
      let activeIndex = -1

      for (let index = 0; index < outline.length; index += 1) {
        if (outline[index].pos < cursor) activeIndex = index
        else break
      }

      if (activeIndex < 0) {
        setActiveOutlinePos(null)
        return
      }

      const active = outline[activeIndex]
      setActiveOutlinePos(active.pos)
      setOutlinePage(Math.floor(activeIndex / OUTLINE_PAGE_SIZE))
    }

    editor.on('selectionUpdate', syncActiveHeading)
    syncActiveHeading()
    return () => {
      editor.off('selectionUpdate', syncActiveHeading)
    }
  }, [editor, outline])

  useEffect(() => {
    if (!editor) return

    const sync = () => {
      const storage = editor.storage.findAndReplace
      setSearchResultCount(storage.results.length)
      setSearchCurrentIndex(storage.currentIndex)
    }

    editor.on('transaction', sync)
    sync()

    return () => {
      editor.off('transaction', sync)
    }
  }, [editor])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const findShortcut = (event.ctrlKey || event.metaKey)
        && event.key.toLowerCase() === 'f'

      if (findShortcut && tab === 'write') {
        event.preventDefault()
        setLayoutOpen(false)
        setListOpen(false)
        setHighlightOpen(false)
        setLinkOpen(false)
        setCitationOpen(false)
        setCitationPickerOpen(false)
        setSearchOpen(true)
        window.requestAnimationFrame(() => searchInputRef.current?.focus())
        return
      }

      if (event.key === 'Escape' && (searchOpen || layoutOpen || listOpen || linkOpen || highlightOpen || citationOpen || citationPickerOpen)) {
        event.preventDefault()

        if (searchOpen) {
          editor?.commands.clearSearch()
          editor?.commands.setReplaceTerm('')
          setSearchOpen(false)
          setSearchTerm('')
          setReplaceTerm('')
          setSearchResultCount(0)
          setSearchCurrentIndex(null)
        }

        setLayoutOpen(false)
        setListOpen(false)
        setLinkOpen(false)
        setHighlightOpen(false)
        setCitationOpen(false)
        setCitationPickerOpen(false)
        setCitationPickerQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [citationOpen, citationPickerOpen, editor, highlightOpen, layoutOpen, linkOpen, listOpen, searchOpen, tab])

  const automaticCitations = documentSettings.automaticCitations !== false
  const automaticReferences = documentSettings.automaticReferences === true
  const sourceReferences = cachedFormatReferences(sources, citationStyle)
  const citationCounts = citedSourceCounts(editor)
  const citedIds = new Set(citationCounts.keys())
  const bibliographySources = sourcesForDocumentBibliography(sources, citedIds)
  const references = cachedFormatReferences(bibliographySources, citationStyle)
  const referenceTitle = citationStyle === 'mla' ? 'Works Cited' : 'References'
  const referenceLayout = bibliographyLayout(citationStyle)
  const referenceById = new Map(sourceReferences.map((reference) => [reference.id, reference]))
  const sourceSummaryById = new Map(sources.map((source) => [source.id, sourceSummary(source)]))

  useEffect(() => {
    if (!editor || !automaticCitations) return

    let transaction = editor.state.tr
    let changed = false

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name !== 'citation') return

      const items = citationItemsFromAttributes(node.attrs)
      const encodedItems = citationItemsAttribute(items)
      const citationMode = node.attrs.citationMode === 'narrative'
        ? 'narrative'
        : 'parenthetical'
      const manualText = String(node.attrs.manualText || '')
      const nextText = formatCitationPresentation(
        sources,
        citationStyle,
        items,
        citationMode,
        manualText,
      ) || '[Missing source]'

      const attributesChanged = String(node.attrs.items || '') !== encodedItems

      if (node.attrs.text === nextText && !attributesChanged) return

      transaction = transaction.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        items: encodedItems,
        text: nextText,
      })
      changed = true
    })

    if (changed) editor.view.dispatch(transaction)
  }, [automaticCitations, citationStyle, editor, sources])

  const sourceFilterQuery = normalizeSourceToken(sourceFilter)
  const citationScopedSources = sourceCitationFilter === 'all'
    ? sources
    : sources.filter((source) => (
      sourceCitationFilter === 'cited'
        ? citedIds.has(source.id)
        : !citedIds.has(source.id)
    ))
  const filteredSources = !sourceFilterQuery
    ? citationScopedSources
    : citationScopedSources.filter((source) => {
      const itemType = getSourceTypeDefinition(sourceToItemData(source).itemType).label
      const reference = referenceById.get(source.id)?.text || ''
      const summary = sourceSummaryById.get(source.id) || sourceSummary(source)
      const haystack = normalizeSourceToken([
        itemType,
        summary.title,
        summary.author,
        summary.year,
        summary.publication,
        summary.locator,
        reference,
        new DOMParser().parseFromString(source.noteHtml || '', 'text/html').body.textContent || '',
      ].join(' '))

      return haystack.includes(sourceFilterQuery)
    })
  const visibleSources = sourceSort === 'added'
    ? filteredSources
    : [...filteredSources].sort((left, right) => {
      const leftSummary = sourceSummaryById.get(left.id) || sourceSummary(left)
      const rightSummary = sourceSummaryById.get(right.id) || sourceSummary(right)
      if (sourceSort === 'year') {
        return rightSummary.year.localeCompare(leftSummary.year, undefined, { numeric: true })
      }
      const leftValue = sourceSort === 'author' ? leftSummary.author : leftSummary.title
      const rightValue = sourceSort === 'author' ? rightSummary.author : rightSummary.title
      return leftValue.localeCompare(rightValue, undefined, { sensitivity: 'base' })
    })
  const citationPickerNeedle = normalizeSourceToken(citationPickerQuery)
  const citationPickerSources = sources
    .filter((source) => {
      if (!citationPickerNeedle) return true
      const summary = sourceSummaryById.get(source.id) || sourceSummary(source)
      return normalizeSourceToken([
        summary.title,
        summary.author,
        summary.year,
        summary.publication,
        summary.locator,
      ].join(' ')).includes(citationPickerNeedle)
    })
    .slice(0, 20)

  const selectedSource = useMemo(
    () => sources.find((source) => source.id === selectedSourceId) || null,
    [selectedSourceId, sources],
  )
  const selectedSourceSummary = selectedSource
    ? sourceSummaryById.get(selectedSource.id) || sourceSummary(selectedSource)
    : null
  const manualItem = useMemo(() => sourceToItemData(sourceDraft), [sourceDraft])
  const manualType = getSourceTypeDefinition(manualItem.itemType)
  const outlinePageCount = Math.max(1, Math.ceil(outline.length / OUTLINE_PAGE_SIZE))
  const visibleOutline = useMemo(
    () => outline.slice(outlinePage * OUTLINE_PAGE_SIZE, (outlinePage + 1) * OUTLINE_PAGE_SIZE),
    [outline, outlinePage],
  )
  const activeOutlineItem = useMemo(
    () => outline.find((item) => item.pos === activeOutlinePos) || null,
    [activeOutlinePos, outline],
  )

  const portraitWidth = documentSettings.pageSize === 'a4' ? '8.27in' : '8.5in'
  const portraitHeight = documentSettings.pageSize === 'a4' ? '11.69in' : '11in'
  const isLandscape = documentSettings.orientation === 'landscape'
  const pageWidth = isLandscape ? portraitHeight : portraitWidth
  const pageMinHeight = isLandscape ? portraitWidth : portraitHeight
  const saveStatus = projectSaveStatus
  const fileStatusText = fileName
    ? `${fileName} · ${fileDirty ? 'Modified' : fileSaveMode === 'download' ? 'Downloaded' : 'On disk'}`
    : fileDirty
      ? 'Not saved to file'
      : 'New document'
  const fileStatusTitle = fileName
    ? fileSaveMode === 'download'
      ? `${fileName} — the last file save was downloaded as a new copy.`
      : fileSaveMode === 'handle'
        ? `${fileName} — subsequent Save commands write directly to this file.`
        : `${fileName} — this browser cannot overwrite the opened file directly; Save will download a new copy.`
    : 'This document is protected by browser autosave but has not been saved as a Timeless XML file.'

  const currentHeadingLevel = editorToolbarState.headingLevel
  const headingDefaultsOwnedByStructure = Boolean(currentHeadingLevel && editor?.state.selection.empty)
  const headingNodeOwnedByStructure = Boolean(currentHeadingLevel)
  const referenceEntryOwnedByStructure = editorToolbarState.referenceEntry
  const referenceTitleOwnedByStructure = editorToolbarState.referenceTitle
  const structuralBlockOwnedByStructure = (
    headingNodeOwnedByStructure
    || referenceEntryOwnedByStructure
    || referenceTitleOwnedByStructure
  )
  const structuralBlockLabel = referenceTitleOwnedByStructure
    ? 'References title'
    : referenceEntryOwnedByStructure
      ? 'Reference entry'
      : 'Heading'
  const fontDefaultsOwnedByStructure = Boolean(
    (currentHeadingLevel || referenceEntryOwnedByStructure || referenceTitleOwnedByStructure)
    && editor?.state.selection.empty
  )
  const inheritedFontFamily = currentHeadingLevel
    ? documentSettings.headingFont
    : documentSettings.bodyFont
  const inheritedFontSize = currentHeadingLevel
    ? (documentSettings.headingSizes[`h${currentHeadingLevel}`] ?? documentSettings.bodyFontSize)
    : documentSettings.bodyFontSize
  const toolbarFontFamilyValue = editorToolbarState.fontFamily || inheritedFontFamily
  const toolbarFontSizeValue = editorToolbarState.fontSize || `${inheritedFontSize}pt`
  const inheritedDocumentTextColor = theme === 'dark' ? '#eee8dd' : '#29251f'
  const inheritedNoteTextColor = theme === 'dark' ? '#e7dfd1' : '#2e2922'

  const documentStyle = {
    '--doc-font': documentSettings.bodyFont,
    '--heading-font': documentSettings.headingFont,
    '--doc-font-size': `${documentSettings.bodyFontSize}pt`,
    '--doc-line-height': documentSettings.lineHeight,
    '--paragraph-spacing': `${documentSettings.paragraphSpacing}pt`,
    '--first-line-indent': `${documentSettings.firstLineIndent}in`,
    '--body-alignment': DOCUMENT_DEFAULTS.bodyAlignment,
    '--page-margin': `${documentSettings.marginInches}in`,
    '--page-width': pageWidth,
    '--page-min-height': pageMinHeight,
    '--heading-1-size': `${documentSettings.headingSizes.h1}pt`,
    '--heading-2-size': `${documentSettings.headingSizes.h2}pt`,
    '--heading-3-size': `${documentSettings.headingSizes.h3}pt`,
    '--heading-4-size': `${documentSettings.headingSizes.h4}pt`,
    '--heading-5-size': `${documentSettings.headingSizes.h5 ?? documentSettings.bodyFontSize}pt`,
    '--heading-1-align': documentSettings.headingLevelStyles.h1.align,
    '--heading-2-align': documentSettings.headingLevelStyles.h2.align,
    '--heading-3-align': documentSettings.headingLevelStyles.h3.align,
    '--heading-4-align': documentSettings.headingLevelStyles.h4.align,
    '--heading-5-align': documentSettings.headingLevelStyles.h5.align,
    '--heading-1-weight': documentSettings.headingLevelStyles.h1.bold ? 700 : 400,
    '--heading-2-weight': documentSettings.headingLevelStyles.h2.bold ? 700 : 400,
    '--heading-3-weight': documentSettings.headingLevelStyles.h3.bold ? 700 : 400,
    '--heading-4-weight': documentSettings.headingLevelStyles.h4.bold ? 700 : 400,
    '--heading-5-weight': documentSettings.headingLevelStyles.h5.bold ? 700 : 400,
    '--heading-1-style': documentSettings.headingLevelStyles.h1.italic ? 'italic' : 'normal',
    '--heading-2-style': documentSettings.headingLevelStyles.h2.italic ? 'italic' : 'normal',
    '--heading-3-style': documentSettings.headingLevelStyles.h3.italic ? 'italic' : 'normal',
    '--heading-4-style': documentSettings.headingLevelStyles.h4.italic ? 'italic' : 'normal',
    '--heading-5-style': documentSettings.headingLevelStyles.h5.italic ? 'italic' : 'normal',
    '--document-zoom': documentZoom / 100,
  } as React.CSSProperties

  function applyToolbarFontFamily(value: string) {
    if (!editor) return

    if (!editor.state.selection.empty) {
      const chain = editor.chain().focus()
      if (value) chain.setFontFamily(value).run()
      else chain.unsetFontFamily().run()
      return
    }

    if (currentHeadingLevel || referenceEntryOwnedByStructure || referenceTitleOwnedByStructure) return

    editor.chain().focus().unsetFontFamily().run()
    updateDocumentSettings({
      bodyFont: value || DEFAULT_DOCUMENT_SETTINGS.bodyFont,
    })
  }

  function applyToolbarFontSize(value: string) {
    if (!editor) return

    if (!editor.state.selection.empty) {
      const chain = editor.chain().focus()
      if (value) chain.setFontSize(value).run()
      else chain.unsetFontSize().run()
      return
    }

    if (currentHeadingLevel || referenceEntryOwnedByStructure || referenceTitleOwnedByStructure) return

    editor.chain().focus().unsetFontSize().run()
    const parsed = Number.parseFloat(value)
    updateDocumentSettings({
      bodyFontSize: Number.isFinite(parsed)
        ? parsed
        : DEFAULT_DOCUMENT_SETTINGS.bodyFontSize,
    })
  }

  function clearEditorFormatting() {
    if (!editor) return

    const { selection } = editor.state
    const startNode = selection.$from.parent
    let containsStructuralBlock = (
      startNode.type.name === 'heading'
      || (
        startNode.type.name === 'paragraph'
        && (startNode.attrs.referenceEntry === true || startNode.attrs.referenceTitle === true)
      )
    )
    if (!containsStructuralBlock && !selection.empty) {
      editor.state.doc.nodesBetween(selection.from, selection.to, (node) => {
        if (
          node.type.name === 'heading'
          || (
            node.type.name === 'paragraph'
            && (node.attrs.referenceEntry === true || node.attrs.referenceTitle === true)
          )
        ) containsStructuralBlock = true
      })
    }

    const chain = editor.chain().focus().unsetAllMarks()
    if (!containsStructuralBlock) chain.clearNodes()
    chain.run()
  }

  function jumpTo(item: OutlineItem) {
    if (!editor) return
    editor.chain().focus().setTextSelection(item.pos + 1).scrollIntoView().run()
  }

  async function applyOpenedDocument(
    project: TimelessDocumentState,
    openedFileName: string,
    handle: TimelessFileHandle | null,
    mode: 'handle' | null,
  ) {
    if (!editor) return

    commitPendingNote()
    projectLoadedRef.current = false

    editor.commands.setContent(project.editor)
    const normalizedHtml = editor.getHTML()
    latestBodyRef.current = normalizedHtml
    setBodyHtml(normalizedHtml)

    sourcesRef.current = project.sources
    setSources(project.sources)

    citationStyleRef.current = project.citationStyle
    setCitationStyle(project.citationStyle)

    const restoredSettings = normalizeDocumentSettings(project.settings)
    documentSettingsRef.current = restoredSettings
    setDocumentSettings(restoredSettings)

    const fallbackName = openedFileName.replace(/\.timeless\.xml$/i, '') || 'Untitled'
    const restoredName = project.title.trim() || fallbackName
    documentNameRef.current = restoredName
    setDocumentName(restoredName)

    const firstSourceId = project.sources[0]?.id || null
    selectedSourceIdRef.current = firstSourceId
    setSelectedSourceId(firstSourceId)
    if (noteEditor) {
      noteLoadingRef.current = true
      noteEditor.setEditable(Boolean(firstSourceId))
      noteEditor.commands.setContent(project.sources[0]?.noteHtml || '<p></p>')
      noteLoadingRef.current = false
    }

    setSourceFilter('')
    setSourceCitationFilter('all')
    setShowSourceForm(false)
    setEditingSourceId(null)
    setSourceLookupQuery('')
    setSourceLookupChoices([])
    setSourceLookupFollowUp(undefined)
    setCitationOpen(false)
    setCitationItems([])
    setCitationPickerOpen(false)
    setCitationPickerQuery('')
    setLayoutOpen(false)
    setOutlinePage(0)
    setActiveOutlinePos(null)
    setTab('write')

    fileHandleRef.current = handle
    setFileName(openedFileName)
    setFileSaveMode(mode)

    projectLoadedRef.current = true
    await persistProject(undefined, editor)
    setFileDirtyState(false)
    refreshOutline(editor)
  }

  async function openDocument() {
    if (!editor) return
    if (fileDirty && !window.confirm(
      fileName
        ? 'Open another document? Changes since the last file save will be replaced.'
        : 'Open another document? This document has not been saved to a file and browser recovery will be replaced.',
    )) return

    try {
      if (supportsTimelessFileHandles()) {
        const opened = await openTimelessXmlFileWithHandle()
        if (!opened) return
        await applyOpenedDocument(opened.state, opened.fileName, opened.handle, 'handle')
        return
      }

      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.timeless.xml,application/xml,text/xml'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return

        try {
          const project = deserializeTimelessXml(await file.text())
          await applyOpenedDocument(project, file.name, null, null)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Could not open this Timeless document.'
          window.alert(message)
        }
      }
      input.click()
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      const message = error instanceof Error ? error.message : 'Could not open this Timeless document.'
      window.alert(message)
    }
  }

  function newDocument() {
    if (!editor) return
    const hasUserContent = Boolean(editor.getText().trim()) || sources.length > 0
    const replacementWarning = fileDirty
      ? fileName
        ? 'New document? Changes since the last file save will be replaced.'
        : 'New document? This document has not been saved to a file and browser recovery will be replaced.'
      : 'New document?'
    if ((hasUserContent || fileDirty) && !window.confirm(replacementWarning)) return

    commitPendingNote()
    projectLoadedRef.current = false
    editor.commands.setContent(DEFAULT_CONTENT)
    const freshHtml = editor.getHTML()
    latestBodyRef.current = freshHtml
    setBodyHtml(freshHtml)
    sourcesRef.current = []
    setSources([])
    selectedSourceIdRef.current = null
    setSelectedSourceId(null)
    if (noteEditor) {
      noteLoadingRef.current = true
      noteEditor.setEditable(false)
      noteEditor.commands.setContent('<p></p>')
      noteLoadingRef.current = false
    }
    setSourceFilter('')
    setSourceCitationFilter('all')
    setShowSourceForm(false)
    setEditingSourceId(null)
    setSourceLookupQuery('')
    setSourceLookupChoices([])
    setSourceLookupFollowUp(undefined)
    setCitationOpen(false)
    setCitationItems([])
    setCitationPickerOpen(false)
    setCitationPickerQuery('')
    setLayoutOpen(false)
    citationStyleRef.current = DOCUMENT_DEFAULTS.citationStyle
    setCitationStyle(DOCUMENT_DEFAULTS.citationStyle)
    const freshSettings = normalizeDocumentSettings()
    documentSettingsRef.current = freshSettings
    setDocumentSettings(freshSettings)
    documentNameRef.current = 'Untitled'
    setDocumentName('Untitled')
    setOutlinePage(0)
    setActiveOutlinePos(null)
    setTab('write')

    fileHandleRef.current = null
    setFileName(null)
    setFileSaveMode(null)
    setFileDirtyState(false)

    void clearProjectXml().then(() => {
      projectLoadedRef.current = true
      void persistProject(undefined, editor)
    })
    refreshOutline(editor)
  }

  function insertFigure() {
    if (!editor) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const src = String(reader.result)
        let existingFigures = 0
        editor.state.doc.descendants((node) => {
          if (node.type.name === 'image') existingFigures += 1
        })
        const figureNumber = window.prompt('Figure number:', String(existingFigures + 1))
        if (figureNumber === null) return
        const figureTitle = window.prompt('Figure title (optional):', '')
        if (figureTitle === null) return
        const figureNote = window.prompt('Figure note (optional):', '')
        if (figureNote === null) return
        const cleanNumber = figureNumber.trim().replace(/[<>&]/g, '')
        const cleanTitle = figureTitle.trim().replace(/[<>&]/g, '')
        const cleanNote = figureNote.trim().replace(/[<>&]/g, '')
        editor.chain().focus().setImage({
          src,
          alt: cleanTitle || file.name,
        }).updateAttributes('image', {
          figureNumber: cleanNumber,
          figureTitle: cleanTitle,
          figureNote: cleanNote,
        }).run()
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  function setFigureAlignment(align: 'left' | 'center' | 'right') {
    if (!editor?.isActive('image')) return
    editor.chain().focus().updateAttributes('image', { align }).run()
  }

  function resetFigureSize() {
    if (!editor?.isActive('image')) return

    const position = editor.state.selection.from
    const dom = editor.view.nodeDOM(position)
    const image = dom instanceof HTMLImageElement
      ? dom
      : dom instanceof HTMLElement
        ? dom.querySelector('img')
        : null

    if (image instanceof HTMLImageElement) {
      image.style.removeProperty('width')
      image.style.removeProperty('height')
    }

    editor.chain().focus().updateAttributes('image', { width: null, height: null }).run()
  }

  function editFigureDetails() {
    if (!editor?.isActive('image')) return
    const attributes = editor.getAttributes('image')
    const figureNumber = window.prompt('Figure number:', String(attributes.figureNumber || ''))
    if (figureNumber === null) return
    const figureTitle = window.prompt('Figure title:', String(attributes.figureTitle || ''))
    if (figureTitle === null) return
    const figureNote = window.prompt('Figure note (optional):', String(attributes.figureNote || ''))
    if (figureNote === null) return

    editor.chain().focus().updateAttributes('image', {
      figureNumber: figureNumber.trim().replace(/[<>&]/g, ''),
      figureTitle: figureTitle.trim().replace(/[<>&]/g, ''),
      figureNote: figureNote.trim().replace(/[<>&]/g, ''),
    }).run()
  }

  function editFigureAlt() {
    if (!editor?.isActive('image')) return
    const current = String(editor.getAttributes('image').alt || '')
    const next = window.prompt('Figure description:', current)
    if (next === null) return
    editor.chain().focus().updateAttributes('image', { alt: next.trim() }).run()
  }

  function deleteFigure() {
    if (!editor?.isActive('image')) return
    editor.chain().focus().deleteSelection().run()
  }

  function insertApaTable() {
    if (!editor) return
    let existingTables = 0
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'table') existingTables += 1
    })
    const tableNumber = window.prompt('Table number:', String(existingTables + 1))
    if (tableNumber === null) return
    const tableTitle = window.prompt('Table title (optional):', '')
    if (tableTitle === null) return
    const tableNote = window.prompt('Table note (optional):', '')
    if (tableNote === null) return

    editor.chain().focus().insertTable({
      rows: 3,
      cols: 3,
      withHeaderRow: true,
    }).updateAttributes('table', {
      apaTable: true,
      tableNumber: tableNumber.trim().replace(/[<>&]/g, ''),
      tableTitle: tableTitle.trim().replace(/[<>&]/g, ''),
      tableNote: tableNote.trim().replace(/[<>&]/g, ''),
    }).run()
  }

  function editApaTableDetails() {
    if (!editor?.isActive('table')) return
    const attributes = editor.getAttributes('table')
    const tableNumber = window.prompt('Table number:', String(attributes.tableNumber || ''))
    if (tableNumber === null) return
    const tableTitle = window.prompt('Table title:', String(attributes.tableTitle || ''))
    if (tableTitle === null) return
    const tableNote = window.prompt('Table note (optional):', String(attributes.tableNote || ''))
    if (tableNote === null) return

    editor.chain().focus().updateAttributes('table', {
      apaTable: true,
      tableNumber: tableNumber.trim().replace(/[<>&]/g, ''),
      tableTitle: tableTitle.trim().replace(/[<>&]/g, ''),
      tableNote: tableNote.trim().replace(/[<>&]/g, ''),
    }).run()
  }

  function setApaTableMode(enabled: boolean) {
    if (!editor?.isActive('table')) return
    editor.chain().focus().updateAttributes('table', { apaTable: enabled }).run()
  }

  function handleEditorToolbarKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return

    const controls = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not(:disabled), select:not(:disabled)',
      ),
    )
    if (!controls.length) return

    const currentIndex = controls.indexOf(event.target as HTMLElement)
    let nextIndex = currentIndex

    if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = controls.length - 1
    else if (event.key === 'ArrowRight') {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % controls.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = currentIndex < 0
        ? controls.length - 1
        : (currentIndex - 1 + controls.length) % controls.length
    }

    event.preventDefault()
    controls[nextIndex]?.focus()
  }

  function editLink(activeEditor: Editor | null) {
    if (!activeEditor) return
    const current = String(activeEditor.getAttributes('link').href || '')
    const next = window.prompt('Link URL:', current || 'https://')
    if (next === null) return

    const href = next.trim()
    if (!href) {
      activeEditor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    activeEditor.chain().focus().extendMarkRange('link').setLink({ href }).run()
  }

  function openSearch() {
    setLayoutOpen(false)
    setListOpen(false)
    setHighlightOpen(false)
    setLinkOpen(false)
    setCitationOpen(false)
    setCitationPickerOpen(false)
    setSearchOpen(true)
    window.requestAnimationFrame(() => searchInputRef.current?.focus())
  }

  function openLinkPanel() {
    if (!editor) return
    closeSearch()
    setLayoutOpen(false)
    setListOpen(false)
    setHighlightOpen(false)
    setCitationOpen(false)
    setCitationPickerOpen(false)
    setLinkUrl(String(editor.getAttributes('link').href || 'https://'))
    setLinkOpen(true)
    window.requestAnimationFrame(() => linkInputRef.current?.select())
  }

  function closeLinkPanel() {
    setLinkOpen(false)
    setLinkUrl('')
  }

  function applyLink() {
    if (!editor) return
    const href = linkUrl.trim()

    if (!href) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      closeLinkPanel()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    closeLinkPanel()
  }

  function openCitationPanel() {
    if (!editor?.isActive('citation')) return

    closeSearch()
    setLayoutOpen(false)
    setListOpen(false)
    setHighlightOpen(false)
    setLinkOpen(false)
    setCitationPickerOpen(false)

    const attributes = editor.getAttributes('citation')
    setCitationItems(citationItemsFromAttributes(attributes))
    setCitationMode(attributes.citationMode === 'narrative' ? 'narrative' : 'parenthetical')
    setCitationPrefix(String(attributes.prefix || ''))
    setCitationSuffix(String(attributes.suffix || ''))
    setCitationManualText(String(attributes.manualText || ''))
    setCitationOpen(true)
  }

  function closeCitationPanel() {
    setCitationOpen(false)
    setCitationItems([])
  }

  function openCitationPicker() {
    if (!editor) return

    closeSearch()
    setLayoutOpen(false)
    setListOpen(false)
    setHighlightOpen(false)
    setLinkOpen(false)
    setCitationOpen(false)
    setCitationPickerOpen(true)
    window.requestAnimationFrame(() => citationPickerInputRef.current?.focus())
  }

  function closeCitationPicker() {
    setCitationPickerOpen(false)
    setCitationPickerQuery('')
    setManualCitationDraft('')
  }

  function insertManualCitationText() {
    if (!editor) return
    const text = manualCitationDraft.trim()
    if (!text) return

    editor.chain().focus().insertContent([
      { type: 'text', text },
      { type: 'text', text: ' ' },
    ]).run()
    closeCitationPicker()
  }

  function editableReferenceTitleHtml() {
    const title = escapeHtml(referenceTitle)
    return citationStyle === 'apa' ? `<strong>${title}</strong>` : title
  }

  function editableReferenceDataAttributes(includeEntrySpacing = true) {
    return [
      `data-reference-style="${citationStyle}"`,
      `data-reference-line-spacing="${referenceLayout.lineSpacing}"`,
      includeEntrySpacing ? `data-reference-entry-spacing="${referenceLayout.entrySpacing}"` : '',
    ].filter(Boolean).join(' ')
  }

  function referenceSectionPageBreakHtml() {
    if (!editor || (citationStyle !== 'apa' && citationStyle !== 'mla')) return ''

    const { $from } = editor.state.selection
    const blockIndex = $from.index(0)
    const atDocumentStart = blockIndex === 0 && $from.parentOffset === 0
    const previousBlock = blockIndex > 0 ? editor.state.doc.child(blockIndex - 1) : null
    if (atDocumentStart || previousBlock?.type.name === 'pageBreak') return ''
    return '<div data-timeless-page-break="true"></div>'
  }

  function startManualReferencesSection() {
    if (!editor) return

    updateDocumentSettings({ automaticReferences: false })
    editor.chain().focus().insertContent(
      `${referenceSectionPageBreakHtml()}<p data-reference-title="true" ${editableReferenceDataAttributes(false)}>${editableReferenceTitleHtml()}</p><p data-reference-entry="true" ${editableReferenceDataAttributes()}></p>`,
    ).run()
    closeCitationPicker()
  }

  function insertEditableReferences(scope: 'cited' | 'all' = 'cited') {
    if (!editor) return
    const list = scope === 'all' ? sourceReferences : references
    if (!list.length) return

    const entries = list.map((reference) => {
      const parsed = new DOMParser().parseFromString(reference.html, 'text/html')
      const inner = parsed.body.firstElementChild?.innerHTML || escapeHtml(reference.text)
      return `<p data-reference-entry="true" ${editableReferenceDataAttributes()}>${inner}</p>`
    }).join('')

    editor.chain().focus().insertContent(
      `${referenceSectionPageBreakHtml()}<p data-reference-title="true" ${editableReferenceDataAttributes(false)}>${editableReferenceTitleHtml()}</p>${entries}<p></p>`,
    ).run()
    updateDocumentSettings({ automaticReferences: false })
    closeCitationPicker()
  }

  function insertReference(source: Source) {
    if (!editor) return
    const reference = referenceById.get(source.id)
    if (!reference) return

    const parsed = new DOMParser().parseFromString(reference.html, 'text/html')
    const inner = parsed.body.firstElementChild?.innerHTML || escapeHtml(reference.text)
    updateDocumentSettings({ automaticReferences: false })
    showWriteView()
    editor.chain().focus().insertContent(
      `<p data-reference-entry="true" ${editableReferenceDataAttributes()}>${inner}</p><p></p>`,
    ).run()
  }

  function toggleCurrentReferenceEntry() {
    if (!editor || !editor.isActive('paragraph')) return
    const isReference = Boolean(editor.getAttributes('paragraph').referenceEntry)
    if (!isReference) updateDocumentSettings({ automaticReferences: false })
    editor.chain().focus().toggleReferenceEntry({
      style: citationStyle,
      lineSpacing: referenceLayout.lineSpacing,
      entrySpacing: referenceLayout.entrySpacing,
    }).run()
  }

  function updateCitationItem(index: number, patch: Partial<CitationClusterItem>) {
    setCitationItems((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, ...patch } : item
    )))
  }

  function removeCitationItem(index: number) {
    setCitationItems((current) => current.filter((_item, itemIndex) => itemIndex !== index))
  }

  function applyCitationEdit() {
    if (!editor?.isActive('citation')) return

    const items = citationItems
      .filter((item) => item.sourceId)
      .map((item, index, all) => ({
        sourceId: item.sourceId,
        locator: item.locator?.trim() || '',
        label: item.label || 'page',
        mode: item.mode || 'normal',
        prefix: index === 0
          ? citationPrefix.trim()
          : item.prefix?.trim() || '',
        suffix: index === all.length - 1
          ? citationSuffix.trim()
          : item.suffix?.trim() || '',
      }))

    if (!items.length) {
      deleteSelectedCitation()
      return
    }

    const text = formatCitationPresentation(
      sources,
      citationStyle,
      items,
      citationMode,
      citationManualText,
    )
    editor
      .chain()
      .focus()
      .updateAttributes('citation', {
        items: citationItemsAttribute(items),
        citationMode,
        prefix: citationPrefix.trim(),
        suffix: citationSuffix.trim(),
        manualText: citationManualText.trim(),
        text,
      })
      .run()

    closeCitationPanel()
  }

  function convertSelectedCitationToText() {
    if (!editor?.isActive('citation')) return

    const items = citationItems
      .filter((item) => item.sourceId)
      .map((item, index, all) => ({
        sourceId: item.sourceId,
        locator: item.locator?.trim() || '',
        label: item.label || 'page',
        mode: item.mode || 'normal',
        prefix: index === 0 ? citationPrefix.trim() : item.prefix?.trim() || '',
        suffix: index === all.length - 1 ? citationSuffix.trim() : item.suffix?.trim() || '',
      }))
    const currentText = String(editor.getAttributes('citation').text || '')
    const text = items.length
      ? formatCitationPresentation(sources, citationStyle, items, citationMode, citationManualText) || currentText
      : currentText
    if (!text) return

    editor.chain().focus().deleteSelection().insertContent(text).run()
    closeCitationPanel()
  }

  function deleteSelectedCitation() {
    if (!editor?.isActive('citation')) return
    editor.chain().focus().deleteSelection().run()
    closeCitationPanel()
  }

  function closeSearch() {
    editor?.commands.clearSearch()
    editor?.commands.setReplaceTerm('')
    setSearchOpen(false)
    setSearchTerm('')
    setReplaceTerm('')
    setSearchResultCount(0)
    setSearchCurrentIndex(null)
  }

  function updateSearch(value: string) {
    setSearchTerm(value)
    editor?.commands.setSearchTerm(value)
  }

  function updateReplace(value: string) {
    setReplaceTerm(value)
    editor?.commands.setReplaceTerm(value)
  }

  function setSearchOption(
    option: 'case' | 'word' | 'regex',
    enabled: boolean,
  ) {
    if (!editor) return

    if (option === 'case') {
      setSearchCaseSensitive(enabled)
      editor.commands.setCaseSensitive(enabled)
    } else if (option === 'word') {
      setSearchWholeWord(enabled)
      editor.commands.setWholeWord(enabled)
    } else {
      setSearchRegex(enabled)
      editor.commands.setUseRegex(enabled)
      if (enabled && searchWholeWord) {
        setSearchWholeWord(false)
        editor.commands.setWholeWord(false)
      }
    }
  }

  function setManualItem(item: SourceItemData) {
    updateSourceDraft((current) => sourceFromItemData(item, current))
  }

  function updateManualItem(mutator: (item: SourceItemData) => void) {
    updateSourceDraft((current) => {
      const next = sourceToItemData(current)
      mutator(next)
      return sourceFromItemData(next, current)
    })
  }

  function updateManualField(field: string, value: string) {
    updateManualItem((item) => {
      item[field] = value
    })
  }

  function updateManualCreator(index: number, patch: Partial<SourceCreator>) {
    updateManualItem((item) => {
      const creators = Array.isArray(item.creators) ? item.creators : []
      creators[index] = { ...creators[index], ...patch }
      item.creators = creators
    })
  }

  function addManualCreator() {
    updateManualItem((item) => {
      const type = getSourceTypeDefinition(item.itemType)
      if (!type.creatorTypes.length) return

      const creators = Array.isArray(item.creators) ? item.creators : []
      const creatorType = type.creatorTypes.find((creator) => creator.primary)?.creatorType
        || type.creatorTypes[0].creatorType
      creators.push({ creatorType, firstName: '', lastName: '' })
      item.creators = creators
    })
  }

  function removeManualCreator(index: number) {
    updateManualItem((item) => {
      const creators = Array.isArray(item.creators) ? item.creators : []
      item.creators = creators.filter((_, creatorIndex) => creatorIndex !== index)
    })
  }

  function saveSource() {
    commitPendingNote()
    const draft = sourceDraftRef.current
    const draftItem = sourceToItemData(draft)
    const currentSource = editingSourceId
      ? sourcesRef.current.find((source) => source.id === editingSourceId)
      : undefined
    const previous = currentSource
      ? { noteHtml: currentSource.noteHtml, manualReference: draft.manualReference }
      : draft
    const normalizedDraft = sourceFromItemData(draftItem, previous)
    const creators = Array.isArray(draftItem.creators) ? draftItem.creators : []
    const hasCreator = creators.some((creator) => (
      creator.name?.trim()
      || creator.firstName?.trim()
      || creator.lastName?.trim()
    ))
    const hasField = Object.entries(draftItem).some(([key, value]) => (
      key !== 'itemType'
      && key !== 'creators'
      && typeof value === 'string'
      && value.trim()
    ))

    if (!hasCreator && !hasField) return

    const duplicate = sourcesRef.current.find((source) => (
      source.id !== editingSourceId
      && sourcesOverlap(source, normalizedDraft)
    ))
    if (duplicate) {
      const duplicateSummary = sourceSummary(duplicate)
      window.alert(`Already in Evidence: ${duplicateSummary.title || duplicateSummary.locator || 'source'}`)
      return
    }

    if (editingSourceId) {
      const next = sourcesRef.current.map((source) => (
        source.id === editingSourceId
          ? { id: source.id, ...normalizedDraft }
          : source
      ))
      sourcesRef.current = next
      setSources(next)
      setSelectedSourceId(editingSourceId)
      selectedSourceIdRef.current = editingSourceId
    } else {
      const id = crypto.randomUUID()
      const next = [
        ...sourcesRef.current,
        { id, ...normalizedDraft },
      ]
      sourcesRef.current = next
      setSources(next)
      setSelectedSourceId(id)
      selectedSourceIdRef.current = id
    }

    updateSourceDraft(sourceFromItemData(createBlankSourceItem('book')))
    setSourceLookupQuery('')
    setSourceLookupChoices([])
    setSourceLookupFollowUp(undefined)
    setEditingSourceId(null)
    setShowSourceForm(false)
  }

  function startSourceEdit(source: Source) {
    selectSource(source.id)
    updateSourceDraft(sourceFromItemData(sourceToItemData(source), source))
    setSourceLookupQuery(sourceSummary(source).locator)
    setSourceLookupChoices([])
    setSourceLookupFollowUp(undefined)
    setEditingSourceId(source.id)
    setShowSourceForm(true)
  }

  async function lookupSource() {
    if (!sourceLookupQuery.trim() || sourceLookupPending) return

    setSourceLookupPending(true)
    setSourceLookupChoices([])
    setSourceLookupFollowUp(undefined)
    try {
      const result = await lookupSourceMetadata(sourceLookupQuery)
      if (result.kind === 'single') {
        updateSourceDraft((current) => ({ ...result.source, noteHtml: current.noteHtml }))
      } else {
        setSourceLookupChoices(result.choices)
        setSourceLookupFollowUp(result.followUp)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lookup failed.'
      window.alert(message)
    } finally {
      setSourceLookupPending(false)
    }
  }

  async function chooseLookupSource(choice: MetadataLookupChoice) {
    if (sourceLookupPending) return

    setSourceLookupPending(true)
    try {
      const source = await lookupSourceChoice(choice, sourceLookupFollowUp)
      updateSourceDraft((current) => ({
        ...source,
        noteHtml: current.noteHtml,
        manualReference: current.manualReference,
      }))
      setSourceLookupChoices([])
      setSourceLookupFollowUp(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lookup failed.'
      window.alert(message)
    } finally {
      setSourceLookupPending(false)
    }
  }

  function toggleSourceForm() {
    if (showSourceForm) {
      setShowSourceForm(false)
      setEditingSourceId(null)
      setSourceLookupQuery('')
      setSourceLookupChoices([])
      setSourceLookupFollowUp(undefined)
      updateSourceDraft(sourceFromItemData(createBlankSourceItem('book')))
      return
    }

    setEditingSourceId(null)
    setSourceLookupQuery('')
    setSourceLookupChoices([])
    setSourceLookupFollowUp(undefined)
    updateSourceDraft(sourceFromItemData(createBlankSourceItem('book')))
    setShowSourceForm(true)
  }

  function frontMatterHtml() {
    return buildFrontMatterHtml(documentNameRef.current, documentSettings)
  }

  function exportFragment() {
    const citationHtml = references
      .map((reference, index) => {
        const citationDocument = new DOMParser().parseFromString(reference.html, 'text/html')
        const citationElement = citationDocument.body.firstElementChild as HTMLElement | null
        if (citationElement) {
          citationElement.classList.add('generated-citation')
          citationElement.style.lineHeight = String(referenceLayout.lineSpacing)
          citationElement.style.marginBottom = `${referenceLayout.entrySpacing}em`
          if (index === 0) citationElement.id = 'timeless-citations'
        }
        return citationDocument.body.innerHTML
      })
      .join('')

    const referenceHtml = automaticReferences && references.length
      ? `<section class="references citation-style-${citationStyle}"><p class="references-title" id="timeless-references" data-reference-line-spacing="${referenceLayout.lineSpacing}">${escapeHtml(referenceTitle)}</p>${citationHtml}</section>`
      : ''

    const currentBodyHtml = editor?.getHTML() || bodyHtml
    const shouldAddBodyTitle = (
      (documentSettings.titlePage || 'none') !== 'none'
      && !bodyStartsWithPaperTitle(documentNameRef.current, editor?.getJSON())
    )
    const bodyTitleHtml = shouldAddBodyTitle
      ? `<p class="timeless-body-title"><strong>${escapeHtml(documentNameRef.current.trim() || 'Untitled')}</strong></p>`
      : ''
    const exportDocument = new DOMParser().parseFromString(
      `${frontMatterHtml()}${bodyTitleHtml}${currentBodyHtml}${referenceHtml}`,
      'text/html',
    )

    exportDocument.body.querySelectorAll<HTMLElement>('p, li').forEach((element) => {
      element.style.fontFamily = documentSettings.bodyFont
      element.style.fontSize = `${documentSettings.bodyFontSize}pt`
      element.style.lineHeight = String(documentSettings.lineHeight)
      element.style.marginBottom = `${documentSettings.paragraphSpacing}pt`
    })

    exportDocument.body.querySelectorAll<HTMLElement>('p').forEach((element) => {
      element.style.textIndent = `${documentSettings.firstLineIndent}in`
      if (!element.style.textAlign) element.style.textAlign = DOCUMENT_DEFAULTS.bodyAlignment
    })

    exportDocument.body
      .querySelectorAll<HTMLElement>('p[data-reference-entry="true"]')
      .forEach((element) => {
        element.style.marginLeft = '0.5in'
        element.style.textIndent = '-0.5in'
        element.style.textAlign = 'left'
        const lineSpacing = Number(element.dataset.referenceLineSpacing)
        const entrySpacing = Number(element.dataset.referenceEntrySpacing)
        if (Number.isFinite(lineSpacing) && lineSpacing > 0) element.style.lineHeight = String(lineSpacing)
        if (Number.isFinite(entrySpacing) && entrySpacing >= 0) element.style.marginBottom = `${entrySpacing}em`
      })

    exportDocument.body
      .querySelectorAll<HTMLElement>('p[data-reference-title="true"]')
      .forEach((element) => {
        element.style.marginLeft = '0'
        element.style.marginBottom = '0'
        element.style.textIndent = '0'
        element.style.textAlign = 'center'
        const lineSpacing = Number(element.dataset.referenceLineSpacing)
        if (Number.isFinite(lineSpacing) && lineSpacing > 0) element.style.lineHeight = String(lineSpacing)
      })

    exportDocument.body
      .querySelectorAll<HTMLElement>('.timeless-title-page p, .timeless-abstract-page p')
      .forEach((element) => {
        element.style.textIndent = '0'
      })

    exportDocument.body
      .querySelectorAll<HTMLElement>('.timeless-title-page-main p, .timeless-body-title')
      .forEach((element) => {
        element.style.textAlign = 'center'
      })

    exportDocument.body
      .querySelectorAll<HTMLElement>('.timeless-body-title')
      .forEach((element) => {
        element.style.textIndent = '0'
      })

    exportDocument.body
      .querySelectorAll<HTMLElement>('.timeless-title-page h1, .timeless-abstract-page h1, .timeless-author-note h2')
      .forEach((element) => {
        element.style.textAlign = 'center'
      })

    exportDocument.body.querySelectorAll<HTMLTableElement>('table[data-apa-table="true"]').forEach((table) => {
      const tableNumber = table.dataset.tableNumber?.trim() || ''
      const tableTitle = table.dataset.tableTitle?.trim() || ''
      const tableNote = table.dataset.tableNote?.trim() || ''
      const wrapper = exportDocument.createElement('div')
      wrapper.className = 'timeless-pdf-table'
      wrapper.style.marginTop = '1.5em'
      wrapper.style.marginBottom = '1.5em'

      const metadataStyle = (element: HTMLElement) => {
        element.style.fontFamily = documentSettings.bodyFont
        element.style.fontSize = `${documentSettings.bodyFontSize}pt`
        element.style.lineHeight = String(documentSettings.lineHeight)
        element.style.textAlign = 'left'
        element.style.textIndent = '0'
        element.style.margin = '0'
      }

      if (tableNumber) {
        const numberElement = exportDocument.createElement('div')
        numberElement.className = 'timeless-table-number'
        metadataStyle(numberElement)
        const strong = exportDocument.createElement('strong')
        strong.textContent = `Table ${tableNumber}`
        numberElement.appendChild(strong)
        wrapper.appendChild(numberElement)
      }

      if (tableTitle) {
        const titleElement = exportDocument.createElement('div')
        titleElement.className = 'timeless-table-title'
        metadataStyle(titleElement)
        const emphasis = exportDocument.createElement('em')
        emphasis.textContent = tableTitle
        titleElement.appendChild(emphasis)
        wrapper.appendChild(titleElement)
      }

      table.classList.add('timeless-apa-table')
      table.style.width = '100%'
      table.style.borderCollapse = 'collapse'
      table.replaceWith(wrapper)
      wrapper.appendChild(table)

      if (tableNote) {
        const noteElement = exportDocument.createElement('div')
        noteElement.className = 'timeless-table-note'
        metadataStyle(noteElement)
        const noteLabel = exportDocument.createElement('em')
        noteLabel.textContent = 'Note. '
        noteElement.appendChild(noteLabel)
        noteElement.append(tableNote)
        wrapper.appendChild(noteElement)
      }
    })

    exportDocument.body.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
      const align = image.dataset.align || 'center'
      const figureNumber = image.dataset.figureNumber?.trim() || ''
      const figureTitle = image.dataset.figureTitle?.trim() || ''
      const figureNote = image.dataset.figureNote?.trim() || ''
      const wrapper = exportDocument.createElement('div')
      wrapper.className = 'timeless-pdf-figure'
      wrapper.setAttribute('data-figure-align', align)
      wrapper.style.textAlign = align
      wrapper.style.marginTop = '1.5em'
      wrapper.style.marginBottom = '.5em'

      const metadataStyle = (element: HTMLElement) => {
        element.style.fontFamily = documentSettings.bodyFont
        element.style.fontSize = `${documentSettings.bodyFontSize}pt`
        element.style.lineHeight = String(documentSettings.lineHeight)
        element.style.textAlign = 'left'
        element.style.textIndent = '0'
        element.style.margin = '0'
      }

      if (figureNumber) {
        const numberElement = exportDocument.createElement('div')
        numberElement.className = 'timeless-figure-number'
        metadataStyle(numberElement)
        const strong = exportDocument.createElement('strong')
        strong.textContent = `Figure ${figureNumber}`
        numberElement.appendChild(strong)
        wrapper.appendChild(numberElement)
      }

      if (figureTitle) {
        const titleElement = exportDocument.createElement('div')
        titleElement.className = 'timeless-figure-title'
        metadataStyle(titleElement)
        const emphasis = exportDocument.createElement('em')
        emphasis.textContent = figureTitle
        titleElement.appendChild(emphasis)
        wrapper.appendChild(titleElement)
      }

      image.style.display = 'inline-block'
      image.style.maxWidth = '100%'
      image.style.height = image.getAttribute('height') ? `${image.getAttribute('height')}px` : 'auto'
      if (image.getAttribute('width')) image.style.width = `${image.getAttribute('width')}px`
      image.style.margin = '0'

      image.replaceWith(wrapper)
      wrapper.appendChild(image)

      if (figureNote) {
        const noteElement = exportDocument.createElement('div')
        noteElement.className = 'timeless-figure-note'
        metadataStyle(noteElement)
        const noteLabel = exportDocument.createElement('em')
        noteLabel.textContent = 'Note. '
        noteElement.appendChild(noteLabel)
        noteElement.append(figureNote)
        wrapper.appendChild(noteElement)
      }
    })

    exportDocument.body.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5').forEach((element) => {
      const level = Number(element.tagName.slice(1)) as 1 | 2 | 3 | 4 | 5
      const key = `h${level}` as keyof TimelessDocumentSettings['headingLevelStyles']
      const headingSize = documentSettings.headingSizes[key] ?? documentSettings.bodyFontSize
      const levelStyle = documentSettings.headingLevelStyles[key]
      element.style.fontFamily = documentSettings.headingFont
      element.style.fontSize = `${headingSize}pt`
      element.style.lineHeight = String(documentSettings.lineHeight)

      if (documentSettings.headingStyle === 'apa') {
        element.style.textAlign = level === 1 ? 'center' : 'left'
        element.style.fontWeight = '700'
        element.style.fontStyle = level === 3 || level === 5 ? 'italic' : 'normal'
      } else {
        element.style.textAlign = levelStyle.align
        element.style.fontWeight = levelStyle.bold ? '700' : '400'
        element.style.fontStyle = levelStyle.italic ? 'italic' : 'normal'
      }
    })

    exportDocument.body.querySelectorAll<HTMLElement>('[data-timeless-page-break]').forEach((element) => {
      element.innerHTML = ''
      element.style.breakAfter = 'page'
      element.style.pageBreakAfter = 'always'
      element.style.height = '0'
      element.style.margin = '0'
      element.style.border = '0'
    })

    return exportDocument.body.innerHTML
  }

  async function saveDocument(forceSaveAs = false) {
    if (!editor) return

    try {
      commitPendingNote({ suppressSourcesEffect: true })
      const state = currentProjectState(editor)
      const xml = serializeTimelessXml(state)
      const savedLocally = await saveProjectXml(xml)
      setProjectSaveStatus(savedLocally ? 'saved' : 'error')

      const result = await saveTimelessXmlFile(
        state,
        fileHandleRef.current,
        forceSaveAs,
      )

      fileHandleRef.current = result.handle
      setFileName(result.fileName)
      setFileSaveMode(result.mode)
      const currentXml = serializeTimelessXml(currentProjectState(editor))
      setFileDirtyState(currentXml !== xml)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      const message = error instanceof Error ? error.message : 'Could not save this Timeless document.'
      window.alert(message)
    }
  }

  async function exportPdf() {
    if (pdfExporting) return
    setPdfExporting(true)

    try {
      const { exportTimelessPdf } = await import('./pdfExport')
      await exportTimelessPdf({
        title: documentNameRef.current || 'Untitled',
        contentHtml: exportFragment(),
        settings: documentSettingsRef.current,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not export this Timeless document as PDF.'
      window.alert(message)
    } finally {
      setPdfExporting(false)
    }
  }

  useEffect(() => {
    const handleDocumentShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return

      const key = event.key.toLowerCase()
      if (!['s', 'o', 'n', 'p'].includes(key)) return

      event.preventDefault()
      if (key === 's') void saveDocument(event.shiftKey)
      else if (key === 'o') openDocument()
      else if (key === 'p') void exportPdf()
      else newDocument()
    }

    window.addEventListener('keydown', handleDocumentShortcut)
    return () => window.removeEventListener('keydown', handleDocumentShortcut)
  })

  return (
    <div className={`app-shell ${theme}-theme`}>
      <header className="topbar">
        <div className="brand">
          <img className="brand-icon" src="/favicon.svg" alt="" />
          <span className="brand-name">Timeless</span>
          <span className="brand-title-separator" />
          <input
            className="document-title-input"
            value={documentName}
            aria-label="Document title"
            title="Document title"
            spellCheck={false}
            onChange={(event) => {
              documentNameRef.current = event.target.value
              setDocumentName(event.target.value)
            }}
            onBlur={() => {
              const normalized = documentName.trim() || 'Untitled'
              if (normalized !== documentName) {
                documentNameRef.current = normalized
                setDocumentName(normalized)
              }
            }}
          />
        </div>
        <nav className="tabs" aria-label="Main views">
          <button className={tab === 'write' ? 'active' : ''} onClick={() => setTab('write')}>Write</button>
          <button className={tab === 'evidence' ? 'active' : ''} onClick={() => setTab('evidence')}><BookOpen />Evidence</button>
        </nav>
        <div className="export-menu">
          <button title="New document (Ctrl+N)" onClick={newDocument}>New</button>
          <button title="Open Timeless XML (Ctrl+O)" onClick={openDocument}>Open</button>
          <button
            className="theme-toggle"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
          <span className="topbar-separator" />
          <button title="Save Timeless XML (Ctrl+S)" onClick={() => void saveDocument()}>Save</button>
          <button title="Save As Timeless XML (Ctrl+Shift+S)" onClick={() => void saveDocument(true)}>Save As</button>
          <button
            title="Export PDF (Ctrl+P)"
            disabled={pdfExporting}
            aria-busy={pdfExporting}
            onClick={() => void exportPdf()}
          >
            {pdfExporting ? 'PDF…' : 'PDF'}
          </button>
        </div>
      </header>

      {tab === 'write' && (
        <main className="write-view">
          <aside className="outline-pane">
            <section className="outline-structure" aria-label="Document structure">
              <div className="outline-section-heading">
                <span>Structure</span>
                <span className="outline-current-style">
                  {editorToolbarState.headingLevel === null ? 'Body' : `H${editorToolbarState.headingLevel}`}
                </span>
              </div>
              <div className="heading-level-buttons" aria-label="Paragraph structure">
                <button
                  type="button"
                  className={editorToolbarState.headingLevel === null ? 'active' : ''}
                  onClick={() => editor?.chain().focus().setParagraph().run()}
                >
                  Body
                </button>
                {([1, 2, 3, 4, 5] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={editorToolbarState.headingLevel === level ? 'active' : ''}
                    onClick={() => editor?.chain().focus().setHeading({ level }).run()}
                  >
                    H{level}
                  </button>
                ))}
              </div>
              <div className="outline-active-section" aria-live="polite">
                <span>
                  {activeOutlineItem ? `H${activeOutlineItem.level} · Active section` : 'Active section'}
                </span>
                <strong>
                  {activeOutlineItem?.text || (outline.length ? 'Before first heading' : 'No headings yet')}
                </strong>
              </div>
              <div className="heading-style-controls">
                <label>
                  <span>Heading font</span>
                  <select
                    value={documentSettings.headingFont}
                    onChange={(event) => updateDocumentSettings({ headingFont: event.target.value })}
                  >
                    {FONT_FAMILIES.filter((option) => option.value).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Heading system</span>
                  <select
                    value={documentSettings.headingStyle || 'standard'}
                    onChange={(event) => updateDocumentSettings({
                      headingStyle: event.target.value as 'standard' | 'apa',
                    })}
                  >
                    <option value="standard">Standard</option>
                    <option value="apa">APA</option>
                  </select>
                </label>
                {editorToolbarState.headingLevel ? (() => {
                  const level = editorToolbarState.headingLevel
                  const key = `h${level}` as keyof TimelessDocumentSettings['headingLevelStyles']
                  const levelStyle = documentSettings.headingLevelStyles[key]
                  const apaLocked = documentSettings.headingStyle === 'apa'
                  return (
                    <div className={`heading-active-style${apaLocked ? ' locked' : ''}`}>
                      <div className="heading-active-style-title">
                        <strong>H{level} appearance</strong>
                        <span>{apaLocked ? 'APA controlled' : 'Custom'}</span>
                      </div>
                      <label>
                        <span>Size</span>
                        <select
                          value={String(documentSettings.headingSizes[key] ?? documentSettings.bodyFontSize)}
                          onChange={(event) => updateHeadingSize(level, Number(event.target.value))}
                        >
                          {DOCUMENT_FONT_SIZES.map((size) => <option key={size} value={size}>{size} pt</option>)}
                        </select>
                      </label>
                      <label>
                        <span>Alignment</span>
                        <select
                          value={levelStyle.align}
                          disabled={apaLocked}
                          onChange={(event) => updateHeadingLevelStyle(level, {
                            align: event.target.value as 'left' | 'center' | 'right',
                          })}
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </label>
                      <div className="heading-emphasis-controls" aria-label={`H${level} emphasis`}>
                        <button
                          type="button"
                          className={levelStyle.bold ? 'active' : ''}
                          disabled={apaLocked}
                          onClick={() => updateHeadingLevelStyle(level, { bold: !levelStyle.bold })}
                        >
                          Bold
                        </button>
                        <button
                          type="button"
                          className={levelStyle.italic ? 'active' : ''}
                          disabled={apaLocked}
                          onClick={() => updateHeadingLevelStyle(level, { italic: !levelStyle.italic })}
                        >
                          Italic
                        </button>
                      </div>
                      {apaLocked && (
                        <div className="heading-style-note">
                          APA controls alignment and emphasis for this level. Size and heading font remain configurable.
                        </div>
                      )}
                    </div>
                  )
                })() : (
                  <div className="heading-style-note">Select a heading in the outline to customize that level.</div>
                )}
              </div>
            </section>
            <div className="pane-label outline-title">Outline</div>
            <div className="outline-list">
              {visibleOutline.map((item, index) => (
                <button
                  key={`${item.pos}-${index}`}
                  className={`outline-item level-${item.level}${activeOutlinePos === item.pos ? ' active' : ''}`}
                  style={{ paddingLeft: `${10 + (item.level - 1) * 12}px` }}
                  onClick={() => jumpTo(item)}
                  title={item.text}
                >
                  <span className="outline-level-badge">H{item.level}</span>
                  <span className="outline-item-text">{item.text}</span>
                </button>
              ))}
            </div>
            {outlinePageCount > 1 && (
              <div className="outline-pager">
                <button onClick={() => setOutlinePage((page) => Math.max(0, page - 1))} disabled={outlinePage === 0}>‹</button>
                <span>{outlinePage + 1}/{outlinePageCount}</span>
                <button onClick={() => setOutlinePage((page) => Math.min(outlinePageCount - 1, page + 1))} disabled={outlinePage === outlinePageCount - 1}>›</button>
              </div>
            )}
          </aside>

          <section className="workspace" style={documentStyle}>
            <div className="editor-toolbar" onKeyDown={handleEditorToolbarKeyDown}>
              <button className="toolbar-icon-button" title="Undo" aria-label="Undo" disabled={!editorToolbarState.canUndo} onClick={() => editor?.chain().focus().undo().run()}><Undo2 /></button>
              <button className="toolbar-icon-button" title="Redo" aria-label="Redo" disabled={!editorToolbarState.canRedo} onClick={() => editor?.chain().focus().redo().run()}><Redo2 /></button>
              <select
                className="mobile-structure-select"
                aria-label="Structure"
                value={editorToolbarState.headingLevel === null ? 'body' : `h${editorToolbarState.headingLevel}`}
                onChange={(event) => {
                  if (!editor) return
                  if (event.target.value === 'body') editor.chain().focus().setParagraph().run()
                  else editor.chain().focus().setHeading({
                    level: Number(event.target.value.slice(1)) as 1 | 2 | 3 | 4 | 5,
                  }).run()
                }}
              >
                <option value="body">Body</option>
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
                <option value="h4">H4</option>
                <option value="h5">H5</option>
              </select>

              <span className="toolbar-divider" />
              <button
                className={`toolbar-icon-button${editorToolbarState.bulletList || editorToolbarState.orderedList || editorToolbarState.taskList || listOpen ? ' active' : ''}`}
                title={structuralBlockOwnedByStructure ? `${structuralBlockLabel} block type is structurally managed` : 'Lists'}
                aria-label="Lists"
                disabled={structuralBlockOwnedByStructure}
                onClick={() => {
                  closeSearch()
                                setLayoutOpen(false)
                  setHighlightOpen(false)
                  setLinkOpen(false)
                  setCitationOpen(false)
                  setCitationPickerOpen(false)
                  setListOpen((open) => !open)
                }}
              >
                <List />
              </button>
              {(editorToolbarState.bulletList || editorToolbarState.orderedList || editorToolbarState.taskList) && (
                <>
                  <button
                    className="toolbar-icon-button"
                    title="Outdent list item"
                    aria-label="Outdent list item"
                    disabled={!editorToolbarState.canLiftListItem}
                    onClick={() => outdentList(editor)}
                  >
                    <IndentDecrease />
                  </button>
                  <button
                    className="toolbar-icon-button"
                    title="Indent list item"
                    aria-label="Indent list item"
                    disabled={!editorToolbarState.canSinkListItem}
                    onClick={() => indentList(editor)}
                  >
                    <IndentIncrease />
                  </button>
                </>
              )}
              <button className={`toolbar-icon-button${editorToolbarState.blockquote ? ' active' : ''}`} title={structuralBlockOwnedByStructure ? `${structuralBlockLabel} block type is structurally managed` : 'Blockquote'} aria-label="Blockquote" disabled={structuralBlockOwnedByStructure} onClick={() => editor?.chain().focus().toggleBlockquote().run()}><Quote /></button>
              <button className={`toolbar-icon-button${editorToolbarState.codeBlock ? ' active' : ''}`} title={structuralBlockOwnedByStructure ? `${structuralBlockLabel} block type is structurally managed` : 'Code block'} aria-label="Code block" disabled={structuralBlockOwnedByStructure} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}><Code2 /></button>
              <button className="toolbar-icon-button" title="Horizontal rule" aria-label="Horizontal rule" disabled={!editorToolbarState.canSetHorizontalRule} onClick={() => editor?.chain().focus().setHorizontalRule().run()}><Minus /></button>
              <button
                className="toolbar-icon-button"
                title="Insert page break"
                aria-label="Insert page break"
                disabled={!editorToolbarState.canInsertPageBreak}
                onClick={() => editor?.chain().focus().insertPageBreak().run()}
              >
                <FileText />
              </button>
              <button
                className={`toolbar-icon-button${layoutOpen ? ' active' : ''}`}
                title="Document layout"
                aria-label="Document layout"
                onClick={() => {
                  closeSearch()
                                setListOpen(false)
                  setHighlightOpen(false)
                  setLinkOpen(false)
                  setCitationOpen(false)
                  setCitationPickerOpen(false)
                  setLayoutOpen((open) => !open)
                }}
              >
                <Scale />
              </button>

              <span className="toolbar-divider" />
              <button
                title={headingDefaultsOwnedByStructure ? 'Heading emphasis is managed in Structure' : 'Bold'}
                aria-label="Bold"
                disabled={headingDefaultsOwnedByStructure}
                className={`toolbar-icon-button${editorToolbarState.bold ? ' active' : ''}`}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              ><Bold /></button>
              <button
                title={headingDefaultsOwnedByStructure ? 'Heading emphasis is managed in Structure' : 'Italic'}
                aria-label="Italic"
                disabled={headingDefaultsOwnedByStructure}
                className={`toolbar-icon-button${editorToolbarState.italic ? ' active' : ''}`}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              ><Italic /></button>
              <button title="Strikethrough" aria-label="Strikethrough" className={`toolbar-icon-button${editorToolbarState.strike ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleStrike().run()}><Strikethrough /></button>
              <button title="Inline code" aria-label="Inline code" className={`toolbar-icon-button${editorToolbarState.code ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleCode().run()}><Code2 /></button>
              <button title="Underline" aria-label="Underline" className={`toolbar-icon-button${editorToolbarState.underline ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleUnderline().run()}><UnderlineIcon /></button>
              <button
                className="toolbar-icon-button"
                title={
                  currentHeadingLevel || editorToolbarState.referenceEntry || editorToolbarState.referenceTitle
                    ? 'Clear text formatting (keep structural paragraph formatting)'
                    : 'Clear formatting'
                }
                aria-label="Clear formatting"
                onClick={clearEditorFormatting}
              >
                <RemoveFormatting />
              </button>
              <select
                className="toolbar-text-select toolbar-font-family"
                title={fontDefaultsOwnedByStructure ? `${structuralBlockLabel} font follows document structure` : 'Font family'}
                aria-label="Font family"
                disabled={fontDefaultsOwnedByStructure}
                value={FONT_FAMILIES.some((option) => option.value === toolbarFontFamilyValue)
                  ? toolbarFontFamilyValue
                  : ''}
                onChange={(event) => applyToolbarFontFamily(event.target.value)}
              >
                {FONT_FAMILIES.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
              </select>
              <select
                className="toolbar-text-select toolbar-font-size"
                title={fontDefaultsOwnedByStructure ? `${structuralBlockLabel} font size follows document structure` : 'Font size'}
                aria-label="Font size"
                disabled={fontDefaultsOwnedByStructure}
                value={FONT_SIZES.includes(toolbarFontSizeValue)
                  ? toolbarFontSizeValue
                  : ''}
                onChange={(event) => applyToolbarFontSize(event.target.value)}
              >
                <option value="">Default</option>
                {FONT_SIZES.filter(Boolean).map((size) => <option key={size} value={size}>{size.replace('pt', '')}</option>)}
              </select>
              <label className="toolbar-color-control" title="Text color">
                <span>A</span>
                <input
                  type="color"
                  aria-label="Text color"
                  value={/^#[0-9a-f]{6}$/i.test(editorToolbarState.color)
                    ? editorToolbarState.color
                    : inheritedDocumentTextColor}
                  onChange={(event) => editor?.chain().focus().setColor(event.target.value).run()}
                />
              </label>
              <button
                title="Highlight"
                aria-label="Highlight"
                className={`toolbar-icon-button${editorToolbarState.highlight || highlightOpen ? ' active' : ''}`}
                onClick={() => {
                  closeSearch()
                                setLayoutOpen(false)
                  setLinkOpen(false)
                  setCitationOpen(false)
                  setCitationPickerOpen(false)
                  setHighlightOpen((open) => !open)
                }}
              >
                <Highlighter />
              </button>
              <button title="Edit link" aria-label="Edit link" className={`toolbar-icon-button${editorToolbarState.link || linkOpen ? ' active' : ''}`} onClick={openLinkPanel}><Link2 /></button>
              {editorToolbarState.link && <button className="toolbar-icon-button" title="Remove link" aria-label="Remove link" onClick={() => editor?.chain().focus().unsetLink().run()}><Unlink /></button>}

              <span className="toolbar-divider" />
              <button title="Superscript" aria-label="Superscript" className={`toolbar-icon-button${editorToolbarState.superscript ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleSuperscript().run()}><SuperscriptIcon /></button>
              <button title="Subscript" aria-label="Subscript" className={`toolbar-icon-button${editorToolbarState.subscript ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleSubscript().run()}><SubscriptIcon /></button>

              <span className="toolbar-divider" />
              <button title={structuralBlockOwnedByStructure ? `${structuralBlockLabel} alignment is structurally managed` : 'Align left'} aria-label="Align left" disabled={structuralBlockOwnedByStructure} className={`toolbar-icon-button${editorToolbarState.textAlign === 'left' ? ' active' : ''}`} onClick={() => editor?.chain().focus().setTextAlign('left').run()}><AlignLeft /></button>
              <button title={structuralBlockOwnedByStructure ? `${structuralBlockLabel} alignment is structurally managed` : 'Center'} aria-label="Center" disabled={structuralBlockOwnedByStructure} className={`toolbar-icon-button${editorToolbarState.textAlign === 'center' ? ' active' : ''}`} onClick={() => editor?.chain().focus().setTextAlign('center').run()}><AlignCenter /></button>
              <button title={structuralBlockOwnedByStructure ? `${structuralBlockLabel} alignment is structurally managed` : 'Align right'} aria-label="Align right" disabled={structuralBlockOwnedByStructure} className={`toolbar-icon-button${editorToolbarState.textAlign === 'right' ? ' active' : ''}`} onClick={() => editor?.chain().focus().setTextAlign('right').run()}><AlignRight /></button>
              <button title={structuralBlockOwnedByStructure ? `${structuralBlockLabel} alignment is structurally managed` : 'Justify'} aria-label="Justify" disabled={structuralBlockOwnedByStructure} className={`toolbar-icon-button${editorToolbarState.textAlign === 'justify' ? ' active' : ''}`} onClick={() => editor?.chain().focus().setTextAlign('justify').run()}><AlignJustify /></button>

              <span className="toolbar-divider" />
              <button className={`toolbar-icon-button${searchOpen ? ' active' : ''}`} title="Find and replace" aria-label="Find and replace" onClick={openSearch}><Search /></button>
              <button
                className={`toolbar-icon-button${citationPickerOpen ? ' active' : ''}`}
                title="Citations and references"
                aria-label="Citations and references"
                onClick={() => citationPickerOpen ? closeCitationPicker() : openCitationPicker()}
              >
                <AtSign />
              </button>
              <button
                className={`toolbar-icon-button${editorToolbarState.referenceEntry ? ' active' : ''}`}
                title="Reference entry (hanging indent)"
                aria-label="Toggle reference entry formatting"
                disabled={
                  !editorToolbarState.paragraph
                  || editorToolbarState.bulletList
                  || editorToolbarState.orderedList
                  || editorToolbarState.taskList
                  || editorToolbarState.table
                  || editorToolbarState.referenceTitle
                }
                onClick={toggleCurrentReferenceEntry}
              >
                <FileText />
              </button>

              <span className="toolbar-spacer" />
              {editorToolbarState.image && (
                <>
                  <span className="toolbar-context">Figure</span>
                  <button className={`toolbar-icon-button${editorToolbarState.imageAlign === 'left' ? ' active' : ''}`} title="Figure left" aria-label="Figure left" onClick={() => setFigureAlignment('left')}><AlignLeft /></button>
                  <button className={`toolbar-icon-button${(editorToolbarState.imageAlign || 'center') === 'center' ? ' active' : ''}`} title="Figure center" aria-label="Figure center" onClick={() => setFigureAlignment('center')}><AlignCenter /></button>
                  <button className={`toolbar-icon-button${editorToolbarState.imageAlign === 'right' ? ' active' : ''}`} title="Figure right" aria-label="Figure right" onClick={() => setFigureAlignment('right')}><AlignRight /></button>
                  <button className="toolbar-icon-button" title="Fit figure" aria-label="Fit figure" onClick={resetFigureSize}><Maximize2 /></button>
                  <button className="toolbar-icon-button" title="Edit figure details" aria-label="Edit figure details" onClick={editFigureDetails}><Captions /></button>
                  <button className="toolbar-icon-button" title="Edit alt text" aria-label="Edit alt text" onClick={editFigureAlt}><ImageIcon /></button>
                  <button className="toolbar-icon-button danger-tool" title="Delete figure" aria-label="Delete figure" onClick={deleteFigure}><Trash2 /></button>
                </>
              )}
              {editorToolbarState.citation && (
                <>
                  <span className="toolbar-context">Citation</span>
                  <button
                    className={`toolbar-icon-button${citationOpen ? ' active' : ''}`}
                    title="Edit citation"
                    aria-label="Edit citation"
                    onClick={openCitationPanel}
                  >
                    <AtSign />
                  </button>
                  <button
                    className="toolbar-icon-button danger-tool"
                    title="Delete citation"
                    aria-label="Delete citation"
                    onClick={deleteSelectedCitation}
                  >
                    <Trash2 />
                  </button>
                </>
              )}
              {editorToolbarState.table && (
                <>
                  <span className="toolbar-context">Table</span>
                  <button className="table-action-button" title="Add row above" onClick={() => editor.chain().focus().addRowBefore().run()}><Rows3 /> Row ↑</button>
                  <button className="table-action-button" title="Add row below" onClick={() => editor.chain().focus().addRowAfter().run()}><Rows3 /> Row ↓</button>
                  <button className="table-action-button danger-tool" title="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}>× Row</button>
                  <button className="table-action-button" title="Add column left" onClick={() => editor.chain().focus().addColumnBefore().run()}><Columns3 /> Col ←</button>
                  <button className="table-action-button" title="Add column right" onClick={() => editor.chain().focus().addColumnAfter().run()}><Columns3 /> Col →</button>
                  <button className="table-action-button danger-tool" title="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}>× Col</button>
                  <button className="table-action-button" title="Merge selected cells" disabled={!editorToolbarState.canMergeCells} onClick={() => editor.chain().focus().mergeCells().run()}>Merge</button>
                  <button className="table-action-button" title="Split current cell" disabled={!editorToolbarState.canSplitCell} onClick={() => editor.chain().focus().splitCell().run()}>Split</button>
                  <button className="table-action-button" title="Toggle header row" onClick={() => editor.chain().focus().toggleHeaderRow().run()}><Rows3 /> Header</button>
                  <button className="table-action-button" title="Toggle header column" onClick={() => editor.chain().focus().toggleHeaderColumn().run()}><Columns3 /> Header</button>
                  {editorToolbarState.tableApa ? (
                    <>
                      <button className="table-action-button active" title="Edit APA table details" onClick={editApaTableDetails}>APA details</button>
                      <button className="table-action-button" title="Use generic table styling" onClick={() => setApaTableMode(false)}>Generic</button>
                    </>
                  ) : (
                    <button className="table-action-button" title="Convert to APA table" onClick={editApaTableDetails}>APA</button>
                  )}
                  <button className="toolbar-icon-button danger-tool" title="Delete table" aria-label="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}><Trash2 /></button>
                </>
              )}
              <button className="toolbar-icon-button" title="Insert table" aria-label="Insert table" disabled={!editorToolbarState.canInsertTable} onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 /></button>
              <button className="table-action-button" title="Insert APA table" disabled={!editorToolbarState.canInsertTable} onClick={insertApaTable}>APA table</button>
              <button className="toolbar-icon-button" title="Insert figure" aria-label="Insert figure" onClick={insertFigure}><ImagePlus /></button>
            </div>

            {citationPickerOpen && (
              <div className="citation-picker-panel">
                <div className="citation-picker-search">
                  <Search />
                  <input
                    ref={citationPickerInputRef}
                    value={citationPickerQuery}
                    placeholder="Find source"
                    aria-label="Find source for citation or reference"
                    onChange={(event) => setCitationPickerQuery(event.target.value)}
                  />
                  <button type="button" onClick={closeCitationPicker}>×</button>
                </div>
                <div className="citation-manual-entry">
                  <input
                    value={manualCitationDraft}
                    placeholder="Manual citation text, e.g. (Smith, 2024)"
                    aria-label="Manual citation text to insert"
                    onChange={(event) => setManualCitationDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        insertManualCitationText()
                      }
                    }}
                  />
                  <button type="button" disabled={!manualCitationDraft.trim()} onClick={insertManualCitationText}>
                    Insert text
                  </button>
                </div>
                <button
                  type="button"
                  className="insert-editable-references"
                  onClick={startManualReferencesSection}
                >
                  Start manual {referenceTitle.toLowerCase()} here
                </button>
                {references.length > 0 && (
                  <button
                    type="button"
                    className="insert-editable-references"
                    onClick={() => insertEditableReferences('cited')}
                  >
                    Insert linked {referenceTitle.toLowerCase()} here
                  </button>
                )}
                {sourceReferences.length > 0 && sourceReferences.length !== references.length && (
                  <button
                    type="button"
                    className="insert-editable-references"
                    onClick={() => insertEditableReferences('all')}
                  >
                    Insert all source references here
                  </button>
                )}
                <div className="citation-picker-results">
                  {citationPickerSources.length === 0 ? (
                    <div className="citation-picker-empty">No sources</div>
                  ) : citationPickerSources.map((source) => (
                    <button
                      type="button"
                      key={source.id}
                      onClick={() => insertCitationFromPicker(source)}
                    >
                      <span className="citation-picker-title">
                        {sourceSummaryById.get(source.id)?.title || sourceSummaryById.get(source.id)?.locator || 'Untitled source'}
                      </span>
                      <span className="citation-picker-preview">
                        {formatInlineCitation(sources, citationStyle, source.id)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {layoutOpen && (
              <div className="layout-menu-panel">
                <label>
                  <span>Page</span>
                  <select
                    value={documentSettings.pageSize}
                    onChange={(event) => updateDocumentSettings({ pageSize: event.target.value as 'letter' | 'a4' })}
                  >
                    <option value="letter">Letter</option>
                    <option value="a4">A4</option>
                  </select>
                </label>
                <label>
                  <span>Orientation</span>
                  <select
                    value={documentSettings.orientation || 'portrait'}
                    onChange={(event) => updateDocumentSettings({
                      orientation: event.target.value as 'portrait' | 'landscape',
                    })}
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </label>
                <label>
                  <span>Margins</span>
                  <select
                    value={String(documentSettings.marginInches)}
                    onChange={(event) => updateDocumentSettings({ marginInches: Number(event.target.value) })}
                  >
                    <option value="0.5">0.5 in</option>
                    <option value="0.75">0.75 in</option>
                    <option value="1">1 in</option>
                    <option value="1.25">1.25 in</option>
                    <option value="1.5">1.5 in</option>
                  </select>
                </label>
                <label className="layout-running-head">
                  <span>Running head</span>
                  <input
                    value={documentSettings.runningHead || ''}
                    placeholder="Optional"
                    onChange={(event) => updateDocumentSettings({ runningHead: event.target.value })}
                  />
                </label>
                <label>
                  <span>Page numbers</span>
                  <select
                    value={documentSettings.pageNumbers ? 'on' : 'off'}
                    onChange={(event) => updateDocumentSettings({ pageNumbers: event.target.value === 'on' })}
                  >
                    <option value="off">Off</option>
                    <option value="on">Header right</option>
                  </select>
                </label>
                <label>
                  <span>Title page</span>
                  <select
                    value={documentSettings.titlePage || 'none'}
                    onChange={(event) => updateDocumentSettings({
                      titlePage: event.target.value as 'none' | 'student' | 'professional',
                    })}
                  >
                    <option value="none">None</option>
                    <option value="student">APA student</option>
                    <option value="professional">APA professional</option>
                  </select>
                </label>
                {(documentSettings.titlePage || 'none') !== 'none' && (
                  <>
                    <label className="layout-front-matter-field">
                      <span>Author</span>
                      <input
                        value={documentSettings.titlePageAuthor || ''}
                        placeholder="Name(s)"
                        onChange={(event) => updateDocumentSettings({ titlePageAuthor: event.target.value })}
                      />
                    </label>
                    <label className="layout-front-matter-field">
                      <span>Affiliation</span>
                      <input
                        value={documentSettings.titlePageAffiliation || ''}
                        placeholder="Institution or department"
                        onChange={(event) => updateDocumentSettings({ titlePageAffiliation: event.target.value })}
                      />
                    </label>
                    {documentSettings.titlePage === 'student' ? (
                      <>
                        <label className="layout-front-matter-field">
                          <span>Course</span>
                          <input
                            value={documentSettings.titlePageCourse || ''}
                            placeholder="Course"
                            onChange={(event) => updateDocumentSettings({ titlePageCourse: event.target.value })}
                          />
                        </label>
                        <label className="layout-front-matter-field">
                          <span>Instructor</span>
                          <input
                            value={documentSettings.titlePageInstructor || ''}
                            placeholder="Instructor"
                            onChange={(event) => updateDocumentSettings({ titlePageInstructor: event.target.value })}
                          />
                        </label>
                        <label className="layout-front-matter-field">
                          <span>Due date</span>
                          <input
                            value={documentSettings.titlePageDueDate || ''}
                            placeholder="Month D, YYYY"
                            onChange={(event) => updateDocumentSettings({ titlePageDueDate: event.target.value })}
                          />
                        </label>
                      </>
                    ) : (
                      <label className="layout-front-matter-field layout-front-matter-wide">
                        <span>Author note</span>
                        <textarea
                          value={documentSettings.titlePageAuthorNote || ''}
                          placeholder="Optional author note"
                          onChange={(event) => updateDocumentSettings({ titlePageAuthorNote: event.target.value })}
                        />
                      </label>
                    )}
                  </>
                )}
                <label>
                  <span>Abstract</span>
                  <select
                    value={documentSettings.abstractEnabled ? 'on' : 'off'}
                    onChange={(event) => updateDocumentSettings({ abstractEnabled: event.target.value === 'on' })}
                  >
                    <option value="off">Off</option>
                    <option value="on">Include</option>
                  </select>
                </label>
                {documentSettings.abstractEnabled && (
                  <>
                    <label className="layout-front-matter-field layout-front-matter-wide">
                      <span>Abstract text</span>
                      <textarea
                        value={documentSettings.abstractText || ''}
                        placeholder="Abstract"
                        onChange={(event) => updateDocumentSettings({ abstractText: event.target.value })}
                      />
                    </label>
                    <label className="layout-front-matter-field">
                      <span>Keywords</span>
                      <input
                        value={documentSettings.abstractKeywords || ''}
                        placeholder="Optional"
                        onChange={(event) => updateDocumentSettings({ abstractKeywords: event.target.value })}
                      />
                    </label>
                  </>
                )}
                <label>
                  <span>Line spacing</span>
                  <select
                    value={String(documentSettings.lineHeight)}
                    onChange={(event) => updateDocumentSettings({ lineHeight: Number(event.target.value) })}
                  >
                    <option value="1">Single</option>
                    <option value="1.15">1.15</option>
                    <option value="1.5">1.5</option>
                    <option value="2">Double</option>
                  </select>
                </label>
                <label>
                  <span>After paragraph</span>
                  <select
                    value={String(documentSettings.paragraphSpacing)}
                    onChange={(event) => updateDocumentSettings({ paragraphSpacing: Number(event.target.value) })}
                  >
                    <option value="0">0 pt</option>
                    <option value="6">6 pt</option>
                    <option value="10">10 pt</option>
                    <option value="12">12 pt</option>
                    <option value="18">18 pt</option>
                  </select>
                </label>
                <label>
                  <span>First-line indent</span>
                  <select
                    value={String(documentSettings.firstLineIndent)}
                    onChange={(event) => updateDocumentSettings({ firstLineIndent: Number(event.target.value) })}
                  >
                    <option value="0">None</option>
                    <option value="0.25">0.25 in</option>
                    <option value="0.5">0.5 in</option>
                  </select>
                </label>
                <label>
                  <span>Body font</span>
                  <select
                    value={documentSettings.bodyFont}
                    onChange={(event) => updateDocumentSettings({ bodyFont: event.target.value })}
                  >
                    {FONT_FAMILIES.filter((option) => option.value).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Body size</span>
                  <select
                    value={String(documentSettings.bodyFontSize)}
                    onChange={(event) => updateDocumentSettings({ bodyFontSize: Number(event.target.value) })}
                  >
                    {DOCUMENT_FONT_SIZES.map((size) => <option key={size} value={size}>{size} pt</option>)}
                  </select>
                </label>
                <button
                  type="button"
                  className="layout-preset-button"
                  onClick={() => updateDocumentSettings(APA_LAYOUT_SETTINGS)}
                >
                  APA layout
                </button>
                <button
                  type="button"
                  className="layout-preset-button"
                  onClick={() => updateDocumentSettings(DEFAULT_LAYOUT_SETTINGS)}
                >
                  Reset layout
                </button>
              </div>
            )}

            {listOpen && !structuralBlockOwnedByStructure && (
              <div className="list-menu-panel">
                <button
                  type="button"
                  className={editorToolbarState.bulletList ? 'active' : ''}
                  onClick={() => {
                    editor?.chain().focus().toggleBulletList().run()
                    setListOpen(false)
                  }}
                >
                  <List /> Bulleted list
                </button>
                <button
                  type="button"
                  className={editorToolbarState.orderedList ? 'active' : ''}
                  onClick={() => {
                    editor?.chain().focus().toggleOrderedList().run()
                    setListOpen(false)
                  }}
                >
                  <ListOrdered /> Numbered list
                </button>
                <button
                  type="button"
                  className={editorToolbarState.taskList ? 'active' : ''}
                  onClick={() => {
                    editor?.chain().focus().toggleTaskList().run()
                    setListOpen(false)
                  }}
                >
                  <CheckSquare /> Task list
                </button>
              </div>
            )}

            {linkOpen && (
              <div className="link-editor-panel">
                <input
                  ref={linkInputRef}
                  value={linkUrl}
                  placeholder="https://"
                  onChange={(event) => setLinkUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      applyLink()
                    } else if (event.key === 'Escape') {
                      event.preventDefault()
                      closeLinkPanel()
                    }
                  }}
                />
                <button type="button" onClick={applyLink}>Apply</button>
                {editorToolbarState.link && (
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().extendMarkRange('link').unsetLink().run()
                      closeLinkPanel()
                    }}
                  >
                    Remove
                  </button>
                )}
                <button type="button" onClick={closeLinkPanel}>×</button>
              </div>
            )}

            {citationOpen && (
              <div className="citation-editor-panel">
                <div className="citation-cluster-items">
                  {citationItems.map((item, index) => {
                    const source = sources.find((candidate) => candidate.id === item.sourceId)
                    const summary = source ? sourceSummaryById.get(source.id) || sourceSummary(source) : null
                    return (
                      <div className="citation-cluster-row" key={`${item.sourceId}-${index}`}>
                        <span className="citation-cluster-source" title={summary?.title || item.sourceId}>
                          {summary?.title || 'Missing source'}
                        </span>
                        <select
                          value={item.mode || 'normal'}
                          onChange={(event) => updateCitationItem(index, {
                            mode: event.target.value as 'normal' | 'suppress-author' | 'author-only',
                          })}
                          aria-label="Citation author mode"
                        >
                          <option value="normal">Normal</option>
                          <option value="suppress-author">Suppress author</option>
                          <option value="author-only">Author only</option>
                        </select>
                        <select
                          value={item.label || 'page'}
                          onChange={(event) => updateCitationItem(index, { label: event.target.value })}
                          aria-label="Citation locator type"
                        >
                          <option value="page">Page</option>
                          <option value="chapter">Chapter</option>
                          <option value="section">Section</option>
                          <option value="paragraph">Paragraph</option>
                          <option value="figure">Figure</option>
                          <option value="table">Table</option>
                        </select>
                        <input
                          value={item.locator || ''}
                          placeholder="Locator"
                          aria-label="Citation locator"
                          onChange={(event) => updateCitationItem(index, { locator: event.target.value })}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              applyCitationEdit()
                            } else if (event.key === 'Escape') {
                              event.preventDefault()
                              closeCitationPanel()
                            }
                          }}
                        />
                        {citationItems.length > 1 && (
                          <button
                            type="button"
                            className="danger-tool"
                            title="Remove source from citation"
                            onClick={() => removeCitationItem(index)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )
                  })}
                  <div className="citation-presentation-controls">
                    <select
                      value={citationMode}
                      aria-label="Citation presentation"
                      onChange={(event) => setCitationMode(
                        event.target.value === 'narrative' ? 'narrative' : 'parenthetical',
                      )}
                    >
                      <option value="parenthetical">Parenthetical</option>
                      <option value="narrative">Narrative</option>
                    </select>
                    <input
                      value={citationPrefix}
                      placeholder="Prefix"
                      aria-label="Citation prefix"
                      onChange={(event) => setCitationPrefix(event.target.value)}
                    />
                    <input
                      value={citationSuffix}
                      placeholder="Suffix"
                      aria-label="Citation suffix"
                      onChange={(event) => setCitationSuffix(event.target.value)}
                    />
                    <input
                      value={citationManualText}
                      placeholder="Manual display override"
                      aria-label="Manual citation text"
                      onChange={(event) => setCitationManualText(event.target.value)}
                    />
                  </div>
                </div>
                <div className="citation-editor-actions">
                  <button type="button" onClick={applyCitationEdit}>Apply</button>
                  <button type="button" onClick={convertSelectedCitationToText}>Convert to editable text</button>
                  <button className="danger-tool" type="button" onClick={deleteSelectedCitation}>Delete citation</button>
                  <button type="button" onClick={closeCitationPanel}>×</button>
                </div>
              </div>
            )}

            {highlightOpen && (
              <div className="highlight-palette-panel">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    title={color.label}
                    aria-label={color.label}
                    className={editorToolbarState.highlightColor === color.value ? 'active' : ''}
                    style={{ '--highlight-swatch': color.value } as React.CSSProperties}
                    onClick={() => {
                      editor?.chain().focus().setHighlight({ color: color.value }).run()
                      setHighlightOpen(false)
                    }}
                  />
                ))}
                <button
                  type="button"
                  className="highlight-clear"
                  onClick={() => {
                    editor?.chain().focus().unsetHighlight().run()
                    setHighlightOpen(false)
                  }}
                >
                  Clear
                </button>
              </div>
            )}

            {searchOpen && (
              <div className="search-replace-panel">
                <div className="search-replace-row">
                  <input
                    ref={searchInputRef}
                    className="search-replace-input"
                    value={searchTerm}
                    placeholder="Find"
                    onChange={(event) => updateSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        if (event.shiftKey) editor?.commands.goToPreviousResult()
                        else editor?.commands.goToNextResult()
                      }
                    }}
                  />
                  <span className="search-result-count">
                    {searchResultCount > 0 && searchCurrentIndex !== null
                      ? `${searchCurrentIndex + 1}/${searchResultCount}`
                      : `0/${searchResultCount}`}
                  </span>
                  <button
                    type="button"
                    title="Previous result"
                    disabled={!searchResultCount}
                    onClick={() => editor?.commands.goToPreviousResult()}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    title="Next result"
                    disabled={!searchResultCount}
                    onClick={() => editor?.commands.goToNextResult()}
                  >
                    ↓
                  </button>
                  <label className={searchCaseSensitive ? 'search-option active' : 'search-option'}>
                    <input
                      type="checkbox"
                      checked={searchCaseSensitive}
                      onChange={(event) => setSearchOption('case', event.target.checked)}
                    />
                    Aa
                  </label>
                  <label className={searchWholeWord ? 'search-option active' : 'search-option'}>
                    <input
                      type="checkbox"
                      checked={searchWholeWord}
                      disabled={searchRegex}
                      onChange={(event) => setSearchOption('word', event.target.checked)}
                    />
                    Word
                  </label>
                  <label className={searchRegex ? 'search-option active' : 'search-option'}>
                    <input
                      type="checkbox"
                      checked={searchRegex}
                      onChange={(event) => setSearchOption('regex', event.target.checked)}
                    />
                    .*
                  </label>
                  <button type="button" title="Close" onClick={closeSearch}>×</button>
                </div>

                <div className="search-replace-row">
                  <input
                    className="search-replace-input"
                    value={replaceTerm}
                    placeholder="Replace"
                    onChange={(event) => updateReplace(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && searchResultCount) {
                        event.preventDefault()
                        editor?.commands.replace()
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={!searchResultCount}
                    onClick={() => editor?.commands.replace()}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    disabled={!searchResultCount}
                    onClick={() => editor?.commands.replaceAll()}
                  >
                    Replace all
                  </button>
                </div>
              </div>
            )}

            <article className={`paper${documentSettings.headingStyle === 'apa' ? ' apa-headings' : ''}`}>
              <div className="paper-header-editor" aria-label="Document header">
                <span className="paper-header-label" aria-hidden="true">Header</span>
                <input
                  className="paper-running-head-input"
                  value={documentSettings.runningHead || ''}
                  placeholder="Running head (optional)"
                  aria-label="Running head"
                  onChange={(event) => updateDocumentSettings({ runningHead: event.target.value })}
                />
                <button
                  type="button"
                  className={`paper-page-number-toggle${documentSettings.pageNumbers ? ' active' : ''}`}
                  aria-pressed={Boolean(documentSettings.pageNumbers)}
                  title={documentSettings.pageNumbers ? 'Page numbers on — click to turn off' : 'Page numbers off — click to turn on'}
                  onClick={() => updateDocumentSettings({ pageNumbers: !documentSettings.pageNumbers })}
                >
                  <span className="paper-page-number-label">Page</span>
                  <span className="paper-page-number-value">{documentSettings.pageNumbers ? '1' : '—'}</span>
                </button>
              </div>
              <EditorContent editor={editor} />
              {automaticReferences && references.length > 0 && (
                <section className={`references citation-style-${citationStyle}`} aria-label={referenceTitle}>
                  <p
                    className="references-title"
                    style={{ lineHeight: referenceLayout.lineSpacing, marginBottom: 0 }}
                  >{referenceTitle}</p>
                  {references.map((reference) => (
                    <div
                      className="generated-citation"
                      key={reference.id}
                      style={{
                        lineHeight: referenceLayout.lineSpacing,
                        marginBottom: `${referenceLayout.entrySpacing}em`,
                      }}
                      dangerouslySetInnerHTML={{ __html: reference.html }}
                    />
                  ))}
                </section>
              )}
            </article>
            <div className="document-statusbar" aria-label="Document status">
              <div className="status-zoom" aria-label="Document zoom">
                <button
                  type="button"
                  title="Zoom out"
                  aria-label="Zoom out"
                  disabled={documentZoom <= 50}
                  onClick={() => setDocumentZoom((current) => Math.max(50, current - 10))}
                >
                  <Minus />
                </button>
                <button
                  type="button"
                  className="zoom-reset"
                  title="Reset zoom"
                  aria-label="Reset zoom to 100 percent"
                  onClick={() => setDocumentZoom(100)}
                >
                  {documentZoom}%
                </button>
                <button
                  type="button"
                  title="Zoom in"
                  aria-label="Zoom in"
                  disabled={documentZoom >= 200}
                  onClick={() => setDocumentZoom((current) => Math.min(200, current + 10))}
                >
                  <Plus />
                </button>
              </div>
              <span
                className={`save-status ${saveStatus}`}
                title={saveStatus === 'error' ? 'Timeless could not persist the latest changes to browser autosave.' : 'Browser autosave status'}
              >
                {saveStatus === 'saving' ? 'Autosaving…' : saveStatus === 'error' ? 'Autosave failed' : 'Autosaved'}
              </span>
              <span
                className={`file-status${fileDirty ? ' modified' : ''}`}
                title={fileStatusTitle}
              >
                {fileStatusText}
              </span>
              <span className="status-spacer" />
              {selectedStats ? (
                <>
                  <span>{selectedStats.words.toLocaleString()} of {stats.words.toLocaleString()} words</span>
                  <span className="status-character-count">{selectedStats.characters.toLocaleString()} selected characters</span>
                </>
              ) : (
                <>
                  <span>{stats.words.toLocaleString()} {stats.words === 1 ? 'word' : 'words'}</span>
                  <span className="status-character-count">{stats.characters.toLocaleString()} {stats.characters === 1 ? 'character' : 'characters'}</span>
                </>
              )}
            </div>
          </section>
        </main>
      )}

      {tab === 'evidence' && (
        <main className="evidence-view">
          <section className="evidence-header">
            <div className="evidence-title">
              <BookOpen />
              <h1>Evidence</h1>
            </div>
            <div className="evidence-header-actions">
              <label className="citation-style-control">
                <span>Style</span>
                <select
                  value={citationStyle}
                  onChange={(event) => {
                    const nextStyle = event.target.value as CitationStyle
                    citationStyleRef.current = nextStyle
                    setCitationStyle(nextStyle)
                  }}
                  aria-label="Citation style"
                >
                  <option value="apa">APA</option>
                  <option value="mla">MLA</option>
                  <option value="chicago-author-date">Chicago Author-Date</option>
                </select>
              </label>
              <label className="citation-style-control">
                <span>Inline citations</span>
                <select
                  value={automaticCitations ? 'automatic' : 'manual'}
                  onChange={(event) => {
                    const enabled = event.target.value === 'automatic'
                    updateDocumentSettings({ automaticCitations: enabled })
                  }}
                  aria-label="Citation automation"
                >
                  <option value="automatic">Automatic refresh</option>
                  <option value="manual">Manual / frozen</option>
                </select>
              </label>
              <label className="citation-style-control">
                <span>References</span>
                <select
                  value={automaticReferences ? 'automatic' : 'manual'}
                  onChange={(event) => updateDocumentSettings({
                    automaticReferences: event.target.value === 'automatic',
                  })}
                  aria-label="Reference list mode"
                >
                  <option value="manual">Manual in document</option>
                  <option value="automatic">Automatic at end (linked cites)</option>
                </select>
              </label>
              <button
                className="icon-text-button"
                title="Copy bibliography"
                disabled={!sourceReferences.length}
                onClick={() => void copyBibliography()}
              >
                <Copy />Copy bibliography
              </button>
              <button className="primary icon-text-button" onClick={toggleSourceForm}>
                {showSourceForm ? <X /> : <Plus />}
                {showSourceForm ? 'Close' : 'Add source'}
              </button>
            </div>
          </section>

          {showSourceForm && (
            <section className="source-form manual-source-form">
              {METADATA_LOOKUP_ENABLED && (
                <>
                  <label>Lookup
                    <div className="lookup-field">
                      <input
                        value={sourceLookupQuery}
                        placeholder="DOI, ISBN, PMID, arXiv, URL, title, or author"
                        onChange={(e) => {
                          setSourceLookupQuery(e.target.value)
                          setSourceLookupChoices([])
                          setSourceLookupFollowUp(undefined)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            void lookupSource()
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => void lookupSource()}
                        disabled={!sourceLookupQuery.trim() || sourceLookupPending}
                      >
                        <Search />
                        {sourceLookupPending ? '…' : 'Metadata'}
                      </button>
                    </div>
                  </label>

                  {sourceLookupChoices.length > 0 && (
                    <div className="lookup-results" role="listbox" aria-label="Lookup results">
                      {sourceLookupChoices.map((choice) => (
                        <button
                          key={choice.key}
                          type="button"
                          onClick={() => void chooseLookupSource(choice)}
                          disabled={sourceLookupPending}
                        >
                          {choice.title}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              <label>Item Type
                <select
                  value={manualItem.itemType}
                  onChange={(e) => setManualItem(changeSourceItemType(manualItem, e.target.value))}
                  autoFocus
                >
                  {SOURCE_TYPES.map((type) => (
                    <option key={type.itemType} value={type.itemType}>{type.label}</option>
                  ))}
                </select>
              </label>

              {manualType.fields
                .filter((field) => field.field === manualType.titleField)
                .map((field) => (
                  <label key={field.field}>{field.label}
                    <input
                      value={String(manualItem[field.field] ?? '')}
                      onChange={(e) => updateManualField(field.field, e.target.value)}
                    />
                  </label>
                ))}

              {manualType.creatorTypes.length > 0 && (
                <div className="creator-editor">
                  <div className="manual-section-heading">
                    <span>Creators</span>
                    <button type="button" onClick={addManualCreator}>+ Creator</button>
                  </div>
                  {(Array.isArray(manualItem.creators) ? manualItem.creators : []).map((creator, index) => (
                    <div className="creator-row" key={index}>
                      <select
                        value={creator.creatorType}
                        onChange={(e) => updateManualCreator(index, { creatorType: e.target.value })}
                        aria-label="Creator type"
                      >
                        {manualType.creatorTypes.map((type) => (
                          <option key={type.creatorType} value={type.creatorType}>{type.label}</option>
                        ))}
                      </select>
                      {creator.name !== undefined ? (
                        <>
                          <input
                            value={creator.name || ''}
                            placeholder="Name"
                            onChange={(e) => updateManualCreator(index, { name: e.target.value })}
                          />
                          <button
                            type="button"
                            className="creator-mode"
                            onClick={() => updateManualCreator(index, { name: undefined, firstName: '', lastName: '' })}
                          >
                            Person
                          </button>
                        </>
                      ) : (
                        <>
                          <input
                            value={creator.firstName || ''}
                            placeholder="First name"
                            onChange={(e) => updateManualCreator(index, { firstName: e.target.value })}
                          />
                          <input
                            value={creator.lastName || ''}
                            placeholder="Last name"
                            onChange={(e) => updateManualCreator(index, { lastName: e.target.value })}
                          />
                          <button
                            type="button"
                            className="creator-mode"
                            onClick={() => updateManualCreator(index, { name: [creator.firstName, creator.lastName].filter(Boolean).join(' '), firstName: undefined, lastName: undefined })}
                          >
                            Single
                          </button>
                        </>
                      )}
                      <button type="button" className="creator-remove" onClick={() => removeManualCreator(index)}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="manual-fields">
                {manualType.fields
                  .filter((field) => (
                    field.field !== manualType.titleField
                    && field.field !== 'abstractNote'
                    && field.field !== 'extra'
                  ))
                  .map((field) => (
                    <label key={field.field}>{field.label}
                      <input
                        value={String(manualItem[field.field] ?? '')}
                        onChange={(e) => updateManualField(field.field, e.target.value)}
                      />
                    </label>
                  ))}
              </div>

              {manualType.fields
                .filter((field) => field.field === 'abstractNote' || field.field === 'extra')
                .map((field) => (
                  <label key={field.field}>{field.label}
                    <textarea
                      value={String(manualItem[field.field] ?? '')}
                      onChange={(e) => updateManualField(field.field, e.target.value)}
                      rows={field.field === 'abstractNote' ? 4 : 3}
                    />
                  </label>
                ))}

              <label>Reference override
                <textarea
                  value={sourceDraft.manualReference || ''}
                  placeholder="Leave blank to use the selected citation style automatically"
                  onChange={(event) => updateSourceDraft((current) => ({
                    ...current,
                    manualReference: event.target.value || undefined,
                  }))}
                  rows={3}
                />
              </label>

              <div className="form-actions">
                <button className="primary" onClick={saveSource}>{editingSourceId ? 'Update' : 'Add'}</button>
              </div>
            </section>
          )}

          <div className="evidence-workspace">
            <section className="source-list">
              <div className="source-list-header">
                <span className="evidence-column-label"><FileText />Sources</span>
                <span className="source-count" aria-label="Source count">
                  {sourceFilterQuery || sourceCitationFilter !== 'all'
                    ? `${visibleSources.length}/${sources.length}`
                    : sources.length}
                </span>
                {sources.length > 0 && (
                  <div className="source-list-controls">
                    <select
                      className="source-citation-filter"
                      value={sourceCitationFilter}
                      aria-label="Filter by linked-citation status"
                      title="Filter by linked-citation status"
                      onChange={(event) => setSourceCitationFilter(event.target.value as 'all' | 'cited' | 'uncited')}
                    >
                      <option value="all">All</option>
                      <option value="cited">Linked</option>
                      <option value="uncited">Unlinked</option>
                    </select>
                    <select
                      className="source-sort"
                      value={sourceSort}
                      aria-label="Sort sources"
                      title="Sort sources"
                      onChange={(event) => setSourceSort(event.target.value as 'added' | 'author' | 'year' | 'title')}
                    >
                      <option value="added">Added</option>
                      <option value="author">Author</option>
                      <option value="year">Year ↓</option>
                      <option value="title">Title</option>
                    </select>
                    <div className="source-filter-wrap">
                      <Search />
                      <input
                        className="source-filter"
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        placeholder="Filter"
                        aria-label="Filter sources"
                      />
                    </div>
                  </div>
                )}
              </div>
              {sources.length === 0 ? (
                <div className="empty-state">
                  <h2>No sources</h2>
                </div>
              ) : visibleSources.length === 0 ? (
                <div className="empty-state">
                  <h2>No matches</h2>
                </div>
              ) : visibleSources.map((source) => {
                const summary = sourceSummaryById.get(source.id) || sourceSummary(source)
                return (
                <article
                  className={`source-card${selectedSourceId === source.id ? ' active' : ''}`}
                  key={source.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectSource(source.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      selectSource(source.id)
                    }
                  }}
                >
                  <div className="source-main">
                    <div className="source-type">
                      {sourceTypeIcon(sourceToItemData(source).itemType)}
                      <span>{getSourceTypeDefinition(sourceToItemData(source).itemType).label}</span>
                      {citationCounts.has(source.id) && (
                        <span className="source-cited-badge">
                          Linked {citationCounts.get(source.id)}
                        </span>
                      )}
                    </div>
                    <h2>{summary.title || summary.locator}</h2>
                    {(summary.author || summary.year || summary.publication) && (
                      <div className="source-meta" aria-label="Source metadata">
                        {summary.author && <span><UserRound />{summary.author}</span>}
                        {summary.year && <span><CalendarDays />{summary.year}</span>}
                        {summary.publication && <span><Library />{summary.publication}</span>}
                      </div>
                    )}
                    <div
                      className="source-citation"
                      dangerouslySetInnerHTML={{
                        __html: referenceById.get(source.id)?.html || '',
                      }}
                    />
                  </div>
                  <div className="source-actions">
                        <button className="source-cite icon-text-button" onClick={(event) => { event.stopPropagation(); insertCitation(source) }}>
                          <AtSign />Cite
                        </button>
                        <button className="source-cite icon-text-button" onClick={(event) => { event.stopPropagation(); insertCitationText(source) }}>
                          <AtSign />Cite as text
                        </button>
                        <button className="source-cite icon-text-button" onClick={(event) => { event.stopPropagation(); insertReference(source) }}>
                          <FileText />Insert reference
                        </button>
                        <button className="source-edit icon-text-button" onClick={(event) => { event.stopPropagation(); startSourceEdit(source) }}>
                          <Pencil />Edit
                        </button>
                        <button
                          className="source-edit-reference icon-text-button"
                          title="Edit reference text"
                          onClick={(event) => { event.stopPropagation(); editReferenceOverride(source) }}
                        >
                          <FileText />Edit reference
                        </button>
                        <button
                          className="source-copy-cite icon-text-button"
                          title="Copy in-text citation"
                          onClick={(event) => { event.stopPropagation(); void copyInlineCitation(source) }}
                        >
                          <AtSign />Copy cite
                        </button>
                        {citationCounts.has(source.id) && (
                          <button
                            className="source-jump icon-text-button"
                            title="Go to first citation"
                            onClick={(event) => { event.stopPropagation(); jumpToSourceCitation(source.id) }}
                          >
                            <AtSign />Go to cite
                          </button>
                        )}
                    {sourceOpenUrl(source) && (
                      <button
                        className="source-open icon-text-button"
                        title="Open source"
                        onClick={(event) => {
                          event.stopPropagation()
                          const opened = window.open(sourceOpenUrl(source), '_blank', 'noopener,noreferrer')
                          if (opened) opened.opener = null
                        }}
                      >
                        <ExternalLink />Open
                      </button>
                    )}
                    <button
                      className="source-copy icon-text-button"
                      title="Copy formatted reference"
                      onClick={(event) => { event.stopPropagation(); void copyReference(source) }}
                    >
                      <Copy />Copy
                    </button>
                    <button className="danger-quiet icon-text-button" onClick={(event) => { event.stopPropagation(); removeSource(source.id) }}>
                      <Trash2 />Remove
                    </button>
                  </div>
                </article>
                )
              })}
            </section>

            <section className="evidence-notes">
              <div className="evidence-notes-toolbar">
                <span className="evidence-column-label"><StickyNote />Notes</span>
                {selectedSourceSummary && <span className="note-source-title">{selectedSourceSummary.title || selectedSourceSummary.locator}</span>}
                <span className="toolbar-spacer" />
                <select
                  className="note-block-style"
                  title="Paragraph style"
                  aria-label="Paragraph style"
                  disabled={!selectedSource}
                  value={noteToolbarState.blockStyle}
                  onChange={(event) => applyBlockStyle(noteEditor, event.target.value)}
                >
                  <option value="paragraph">Body</option>
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                  <option value="h4">H4</option>
                  <option value="h5">H5</option>
                </select>
                <select
                  className="note-text-select note-font-family"
                  title="Font family"
                  aria-label="Font family"
                  disabled={!selectedSource}
                  value={FONT_FAMILIES.some((option) => option.value === noteToolbarState.fontFamily)
                    ? noteToolbarState.fontFamily
                    : ''}
                  onChange={(event) => {
                    const value = event.target.value
                    if (value) noteEditor?.chain().focus().setFontFamily(value).run()
                    else noteEditor?.chain().focus().unsetFontFamily().run()
                  }}
                >
                  {FONT_FAMILIES.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
                </select>
                <select
                  className="note-text-select note-font-size"
                  title="Font size"
                  aria-label="Font size"
                  disabled={!selectedSource}
                  value={FONT_SIZES.includes(noteToolbarState.fontSize)
                    ? noteToolbarState.fontSize
                    : ''}
                  onChange={(event) => {
                    const value = event.target.value
                    if (value) noteEditor?.chain().focus().setFontSize(value).run()
                    else noteEditor?.chain().focus().unsetFontSize().run()
                  }}
                >
                  <option value="">Default</option>
                  {FONT_SIZES.filter(Boolean).map((size) => <option key={size} value={size}>{size.replace('pt', '')}</option>)}
                </select>
                <label className="note-color-control" title="Text color">
                  <span>A</span>
                  <input
                    type="color"
                    aria-label="Text color"
                    disabled={!selectedSource}
                    value={/^#[0-9a-f]{6}$/i.test(noteToolbarState.color)
                      ? noteToolbarState.color
                      : inheritedNoteTextColor}
                    onChange={(event) => noteEditor?.chain().focus().setColor(event.target.value).run()}
                  />
                </label>
                <button title="Bold" aria-label="Bold" disabled={!selectedSource} className={noteToolbarState.bold ? 'active' : ''} onClick={() => noteEditor?.chain().focus().toggleBold().run()}><Bold /></button>
                <button title="Italic" aria-label="Italic" disabled={!selectedSource} className={noteToolbarState.italic ? 'active' : ''} onClick={() => noteEditor?.chain().focus().toggleItalic().run()}><Italic /></button>
                <button title="Underline" aria-label="Underline" disabled={!selectedSource} className={noteToolbarState.underline ? 'active' : ''} onClick={() => noteEditor?.chain().focus().toggleUnderline().run()}><UnderlineIcon /></button>
                <button title="Strikethrough" aria-label="Strikethrough" disabled={!selectedSource} className={noteToolbarState.strike ? 'active' : ''} onClick={() => noteEditor?.chain().focus().toggleStrike().run()}><Strikethrough /></button>
                <button title="Highlight" aria-label="Highlight" disabled={!selectedSource} className={noteToolbarState.highlight ? 'active' : ''} onClick={() => noteEditor?.chain().focus().toggleHighlight().run()}><Highlighter /></button>
                <button title="Clear formatting" aria-label="Clear formatting" disabled={!selectedSource} onClick={() => noteEditor?.chain().focus().unsetAllMarks().clearNodes().run()}><RemoveFormatting /></button>
                <button title="Superscript" aria-label="Superscript" disabled={!selectedSource} className={noteToolbarState.superscript ? 'active' : ''} onClick={() => noteEditor?.chain().focus().toggleSuperscript().run()}><SuperscriptIcon /></button>
                <button title="Subscript" aria-label="Subscript" disabled={!selectedSource} className={noteToolbarState.subscript ? 'active' : ''} onClick={() => noteEditor?.chain().focus().toggleSubscript().run()}><SubscriptIcon /></button>
                <button title="Link" aria-label="Link" disabled={!selectedSource} className={noteToolbarState.link ? 'active' : ''} onClick={() => editLink(noteEditor)}><Link2 /></button>
                <button title="Align left" aria-label="Align left" disabled={!selectedSource} className={noteToolbarState.textAlign === 'left' ? 'active' : ''} onClick={() => noteEditor?.chain().focus().setTextAlign('left').run()}><AlignLeft /></button>
                <button title="Center" aria-label="Center" disabled={!selectedSource} className={noteToolbarState.textAlign === 'center' ? 'active' : ''} onClick={() => noteEditor?.chain().focus().setTextAlign('center').run()}><AlignCenter /></button>
                <button title="Align right" aria-label="Align right" disabled={!selectedSource} className={noteToolbarState.textAlign === 'right' ? 'active' : ''} onClick={() => noteEditor?.chain().focus().setTextAlign('right').run()}><AlignRight /></button>
                <button title="Justify" aria-label="Justify" disabled={!selectedSource} className={noteToolbarState.textAlign === 'justify' ? 'active' : ''} onClick={() => noteEditor?.chain().focus().setTextAlign('justify').run()}><AlignJustify /></button>
                <button title="Bulleted list" aria-label="Bulleted list" disabled={!selectedSource} className={noteToolbarState.bulletList ? 'active' : ''} onClick={() => noteEditor?.chain().focus().toggleBulletList().run()}><List /></button>
                <button title="Numbered list" aria-label="Numbered list" disabled={!selectedSource} className={noteToolbarState.orderedList ? 'active' : ''} onClick={() => noteEditor?.chain().focus().toggleOrderedList().run()}><ListOrdered /></button>
                <button title="Task list" aria-label="Task list" disabled={!selectedSource} className={noteToolbarState.taskList ? 'active' : ''} onClick={() => noteEditor?.chain().focus().toggleTaskList().run()}><CheckSquare /></button>
                {(noteToolbarState.bulletList || noteToolbarState.orderedList || noteToolbarState.taskList) && (
                  <>
                    <button title="Outdent list item" aria-label="Outdent list item" disabled={!noteToolbarState.canLiftListItem} onClick={() => outdentList(noteEditor)}><IndentDecrease /></button>
                    <button title="Indent list item" aria-label="Indent list item" disabled={!noteToolbarState.canSinkListItem} onClick={() => indentList(noteEditor)}><IndentIncrease /></button>
                  </>
                )}
                <button title="Blockquote" aria-label="Blockquote" disabled={!selectedSource} className={noteToolbarState.blockquote ? 'active' : ''} onClick={() => noteEditor?.chain().focus().toggleBlockquote().run()}><Quote /></button>
                <button title="Horizontal rule" aria-label="Horizontal rule" disabled={!selectedSource || !noteToolbarState.canSetHorizontalRule} onClick={() => noteEditor?.chain().focus().setHorizontalRule().run()}><Minus /></button>
                <button title="Inline code" aria-label="Inline code" disabled={!selectedSource} className={noteToolbarState.code ? 'active' : ''} onClick={() => noteEditor?.chain().focus().toggleCode().run()}><Code2 /></button>
                <button title="Code block" aria-label="Code block" disabled={!selectedSource} className={noteToolbarState.codeBlock ? 'active' : ''} onClick={() => noteEditor?.chain().focus().toggleCodeBlock().run()}><Code2 /></button>
                {noteToolbarState.table && (
                  <>
                    <button title="Add row above" aria-label="Add row above" onClick={() => noteEditor.chain().focus().addRowBefore().run()}><Rows3 /></button>
                    <button title="Add row below" aria-label="Add row below" onClick={() => noteEditor.chain().focus().addRowAfter().run()}><Rows3 /></button>
                    <button title="Delete row" aria-label="Delete row" onClick={() => noteEditor.chain().focus().deleteRow().run()}>×R</button>
                    <button title="Add column left" aria-label="Add column left" onClick={() => noteEditor.chain().focus().addColumnBefore().run()}><Columns3 /></button>
                    <button title="Add column right" aria-label="Add column right" onClick={() => noteEditor.chain().focus().addColumnAfter().run()}><Columns3 /></button>
                    <button title="Delete column" aria-label="Delete column" onClick={() => noteEditor.chain().focus().deleteColumn().run()}>×C</button>
                    <button title="Merge selected cells" aria-label="Merge selected cells" disabled={!noteToolbarState.canMergeCells} onClick={() => noteEditor.chain().focus().mergeCells().run()}>M</button>
                    <button title="Split current cell" aria-label="Split current cell" disabled={!noteToolbarState.canSplitCell} onClick={() => noteEditor.chain().focus().splitCell().run()}>S</button>
                    <button title="Toggle header row" aria-label="Toggle header row" onClick={() => noteEditor.chain().focus().toggleHeaderRow().run()}>HR</button>
                    <button title="Toggle header column" aria-label="Toggle header column" onClick={() => noteEditor.chain().focus().toggleHeaderColumn().run()}>HC</button>
                    <button title="Delete table" aria-label="Delete table" onClick={() => noteEditor.chain().focus().deleteTable().run()}><Trash2 /></button>
                  </>
                )}
                <button title="Insert table" aria-label="Insert table" disabled={!selectedSource || !noteToolbarState.canInsertTable} onClick={() => noteEditor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 /></button>
                <button title="Undo" aria-label="Undo" disabled={!selectedSource || !noteToolbarState.canUndo} onClick={() => noteEditor?.chain().focus().undo().run()}><Undo2 /></button>
                <button title="Redo" aria-label="Redo" disabled={!selectedSource || !noteToolbarState.canRedo} onClick={() => noteEditor?.chain().focus().redo().run()}><Redo2 /></button>
              </div>
              {selectedSource ? <EditorContent editor={noteEditor} /> : <div className="note-empty" />}
            </section>
          </div>
        </main>
      )}

    </div>
  )
}

export default App
