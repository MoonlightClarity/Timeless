# Timeless

Research editor built around Tiptap with a generated outline, integrated source management, and CSL-based citations.

**Current release: 1.0.1**

Timeless is Windows-first in this release. The portable Windows binary includes its own runtime and does not require Node.js or npm. The source launcher requires Node.js and npm to be installed and available on `PATH`.

## Features

- **Write** — full rich-text editor with a structural H1-H5 outline that follows the active section. Heading level is controlled from the left Structure pane rather than a generic paragraph-style dropdown, and the outline uses explicit H1-H5 badges plus stronger visual hierarchy. Structure also shows the active section while the cursor is in body text beneath it, so block type and section context remain distinct. The document title is editable in the top bar and auto-follows only the authored text of the first H1 while the document remains Untitled; inline citation atoms are excluded from both outline labels and automatic title derivation.
- **Tiptap editing surface** — icon-first toolbar structure and editor configuration aligned to Tiptap's open-source Simple Editor baseline for inline and block editing: undo/redo, lists, blockquotes, code blocks, bold, italic, strikethrough, inline code, underline, multicolor highlights, inline link editing, superscript/subscript, text alignment, image upload, tables, and figures. Document structure is intentionally owned by Timeless's left pane instead of the generic editor toolbar.
- **Responsive toolbar** — desktop sticky toolbar with grouped icon controls; on narrow screens the editor toolbar docks to the bottom. Because the structural pane is hidden on small screens, a compact Body/H1-H5 control remains in the mobile toolbar while list/link/highlight/search panels open directly above it.
- **Theme** — persistent light/dark mode with a top-bar toggle. Dark mode now includes the writing page itself, with theme-aware document text, links, blockquotes, code, rules, tables, and placeholders; PDF output remains a normal light print document.
- **Trailing node** — Tiptap's trailing-node extension keeps an editable paragraph after terminal block content such as tables, figures, or code blocks.
- **Live document stats** — Write shows live word and character counts, including inline citations and any manually authored reference entries. Only the optional generated end-of-document bibliography is excluded because it is not part of the editable document. When text is selected, the status bar shows selection counts against the document total. The status strip is UI-only and never enters exports.
- **Document zoom** — persistent 50–200% Write zoom controls live in the status bar. Zoom changes only the editing view and does not alter native XML or PDF output.
- **Document shortcuts** — Ctrl/Cmd+S saves the native `.timeless.xml` document, Ctrl/Cmd+O opens native Timeless XML, Ctrl/Cmd+N starts a new document, and Ctrl/Cmd+P routes through Timeless's controlled PDF export instead of printing the application chrome.
- **Placeholders** — blank document paragraphs/headings and per-source Evidence notes use Tiptap placeholders rather than inserting instructional text into saved content.
- **Toolbar keyboard navigation** — Left/Right arrows wrap across enabled controls, Home/End jump to the first/last control, and Tab/Shift+Tab retain normal exit behavior.
- **Find and replace** — native Tiptap Find and Replace with Ctrl/Cmd+F, live highlighting, wrap-around next/previous navigation, match case, whole word, regex, replace, and replace-all.
- **Editor nodes** — explicit styling for selection feedback, inline/code blocks, checked tasks, blockquotes, horizontal rules, links, highlights, tables, figures, and semantic page breaks. Ctrl/Cmd+Enter inserts a page break that survives native save/open and becomes a real PDF page boundary.
- **Typography and layout** — Tiptap typography transformations plus font family, font size, and text color controls are enabled in Write and Evidence notes. In Write, font family/size apply inline when text is selected; with only a body-text cursor they change the XML-backed body defaults. Heading defaults are owned by the Structure pane, so an idle heading cursor cannot silently change them from the generic toolbar. Document Layout controls page size, portrait/landscape orientation, margins, line spacing, paragraph spacing, first-line indent, body font, and body size. Structure owns heading font and heading system; clicking a heading in the outline exposes that active level's size, alignment, bold, and italic settings. Standard headings are fully customizable and persist into native XML and PDF export. APA headings deliberately lock alignment/emphasis to the APA hierarchy while preserving the chosen heading font/size. Neutral Timeless headings default to a visible 18/16/14/12/12 pt hierarchy; APA Layout normalizes headings to 12 pt Times New Roman along with portrait Letter, double spacing, 0.5 in first-line indent, 1 in margins, page numbers, and APA heading behavior. Reset Layout restores only the neutral layout fields without clearing front matter or citation settings.
- **APA front matter** — optional APA student/professional title pages and abstracts are XML-backed and generated only for export. Student title pages use the APA line order and spacing; professional pages support a running head and multi-paragraph Author Note in the lower half of page 1. Abstracts use a centered Abstract label, unindented abstract text, and an italic `Keywords:` label with a 0.5 in first-line indent. When an APA title page is enabled, PDF export repeats the paper title at the top of the first text page unless the authored document already begins with the same H1; this generated title never enters the editable/native document.
- **List nesting** — bullet, numbered, and task lists expose context-sensitive indent/outdent controls in Write and Evidence notes, with invalid nesting actions disabled.
- **Figures** — image upload, paste, drag/drop, interactive resize handles, left/center/right alignment, caption editing, alt text, fit/reset size, and delete controls.
- **Tables** — editable document tables with add/delete row and column controls plus native merge/split cells, header-row/header-column toggles, and delete-table. Write can also insert structured APA tables with a table number, italic title, and note shown live around the table, preserved in native XML, and rendered in direct PDF export. Evidence-note tables expose the same generic structural controls after insertion, including row-above/below, column-left/right, merge/split, header toggles, and delete.
- **Formatting cleanup** — Write and Evidence notes expose clear-formatting behavior for selected content. In Write, clearing text formatting deliberately preserves structural headings, reference-section titles, and reference-entry paragraphs rather than silently converting them back to generic body text.
- **Evidence** — integrated source list with per-source rich-text notes. Source cards use type-specific icons, show author/year/publication scan metadata, display linked-citation counts, and provide Cite/Cite as text/Insert reference/Edit/Copy cite/Copy reference/Go to cite/Open actions where applicable. Evidence can be filtered to All/Linked/Unlinked without pretending that Timeless can detect manually typed citations. Notes expose Body/H1-H4 block styles along with inline formatting, alignment, lists, links, code, and tables. Citation previews use CSL HTML, Times New Roman, and hanging indents. Notes remain attached to their source and do not enter document reference text unless the user explicitly inserts or enables it.
- **Add source** — one combined source form supports metadata lookup plus manual entry across 37 bibliographic source types, with type-specific fields, creator roles, and field preservation when changing source type.
- **Source lookup** — DOI, ISBN, PMID, arXiv identifiers, and URLs resolve through Timeless's bundled local metadata service; no external reference manager is required.
- **Source list** — text filtering with filtered/total counts, persisted display sorting by Added/Author/Year/Title, per-source Copy reference, Edit reference override, and Copy cite, whole-list Copy bibliography, direct Open for URL/DOI sources, plus duplicate protection using DOI, ISBN, URL, or title + year.
- **Citations and references** — live CSL in-text citations are integrated. APA is the default; Evidence can switch between APA, MLA, and Chicago Author-Date. Write has a searchable Cite picker, selected source-backed citations support per-source page/chapter/section/paragraph/figure/table locators, and one citation can contain multiple Evidence sources as a CSL cluster. Inline citation automation and the reference list are independent: Automatic refresh keeps source-backed citation text synchronized with source/style changes, while Manual / frozen stops background reformatting. The citation picker also accepts plain manual citation text, inserted as ordinary editable document text even when there are no Evidence sources. Evidence provides both Cite and Cite as text, and any source-backed citation can be converted in place to editable text, permanently detaching it from source/style automation. References default to Manual in document rather than being locked to the end. Even with no Evidence sources, the citation/reference picker can start an editable References/Works Cited section at the cursor. Users can also insert one source reference, the linked-citation reference list, or all Evidence sources at the current cursor. The editable section title and inserted references are ordinary paragraphs carrying only lightweight reference-title/reference-entry attributes so centering, zero title indent, and left-aligned hanging indents survive the editor, XML, and PDF without becoming locked content. Bibliography layout is derived from the selected bundled CSL style rather than from generic document paragraph settings: automatic references follow the current CSL line/entry spacing live, while manual reference paragraphs freeze the style and bibliography spacing they had when inserted and persist that metadata through native XML and PDF. The Write toolbar exposes Reference entry directly; manually typed or pasted paragraphs can be toggled into or out of that mode. Splitting a populated reference continues reference formatting, while Enter on a blank reference line exits back to normal body text. Any manual reference insertion turns off Automatic at end to avoid duplicate lists. Automatic at end remains available as an optional generated References/Works Cited section; its title is formatted independently of the document H1 theme, so changing essay heading styles does not resize, left-align, or otherwise restyle the bibliography title. Citation-style rules own the reference section itself: APA uses a bold centered References title, MLA and Chicago Author-Date use centered regular-weight titles, and APA/MLA reference sections begin on a separate page unless the insertion point is already at the start of a page. Per-source reference overrides remain available, and the generic Other source type covers sources outside the built-in bibliographic list.
- **Native document format** — `.timeless.xml` is authoritative. A Timeless-specific XML root stores the semantic Tiptap document, canonical structured source records and per-source notes, citation style, document title, page breaks, and the complete current document-layout settings without an Office compatibility layer. Source-card/search/citation summary values are derived from each source record rather than duplicated in XML. The root carries the format version once; obsolete pre-release shapes are rejected rather than silently migrated.
- **Open / Save** — native Timeless XML only. Where the browser exposes writable file handles, Open retains the handle and later Save writes back to that same `.timeless.xml` file; Save As selects a new file. Browsers without writable-handle support fall back to opening through a file input and saving by downloading a new XML copy rather than pretending to overwrite the source file. Timeless deliberately does not advertise DOCX or RTF compatibility when it cannot guarantee faithful interchange.
- **Export** — PDF is the presentation output. Timeless builds a dedicated direct-PDF document from the current native state, honors explicit page breaks plus automatic pagination rules, keeps headings/figures/tables/references from splitting where practical, and embeds supported figures into the generated PDF without routing through the browser print dialog.
- **Autosave vs. file save** — the complete native XML document is persisted atomically in IndexedDB with a localStorage fallback, but browser autosave is tracked separately from the disk file. The status bar shows Autosaving/Autosaved/Autosave failed plus the external file name and whether it is Modified, On disk, or Downloaded. Full XML serialization is idle-debounced and kept out of the keystroke path; whole-document HTML, outline extraction, and word counting are likewise not regenerated synchronously for every typed character.
- **Regression tests** — `npm test` covers citation/bibliography integrity, citation-safe H1 title extraction, APA student/professional front matter, strict current-format native XML round trips, special-character escaping, layout/orientation settings, semantic page breaks, PDF layout, writable file-handle reuse, malformed XML rejection, and Timeless-specific filenames.

## Windows binary

Download `Timeless-1.0.1-Windows.exe` from the GitHub release and run it directly. It is a portable x64 Windows application: no installer, Node.js, npm, or separate browser is required. The application and metadata service remain local to the machine; the metadata service binds only to loopback.

The binary is currently unsigned, so Windows SmartScreen may show an unrecognized-app warning.

## Run from source

### Requirements

- Windows 10 or 11
- Node.js with npm available on `PATH`
- A modern desktop browser

Double-click `run.ps1`.

The launcher installs missing local dependencies, builds the production bundle, starts Timeless's bundled local metadata translation service on `127.0.0.1:1969` when needed, then serves the built app locally at:

`http://127.0.0.1:5174`

The normal launcher uses the built production bundle rather than Vite's development server. Port 5173 is intentionally not used by Timeless.

The translation service is loopback-only and only permits the Timeless origin from a browser.

To build the portable Windows binary from source, run `npm run dist:win`.

## Upstream components

Vendored upstream sources:

- `vendor/translation-server`
- `vendor/csl-styles`
- `vendor/csl-locales`

The translation server retains its upstream AGPL license. CSL style files retain their upstream licenses; the bundled CSL locale is CC BY-SA 3.0 with CSL project attribution preserved. Available upstream revisions and provenance are recorded in `THIRD_PARTY_NOTICES.md`.

## License

Original Timeless code is licensed under the Apache License 2.0. See `LICENSE`. Third-party components retain their own upstream licenses as described above and in `THIRD_PARTY_NOTICES.md`.
