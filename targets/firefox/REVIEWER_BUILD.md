# Mozilla reviewer build instructions

Timeless is a local-first React/TypeScript research and writing application distributed as a Firefox Manifest V3 extension.

The Firefox package uses the same application source as the Windows/web build. It is built with Vite mode `firefox`, which disables only Timeless's automatic metadata-lookup UI. The desktop release can start a bundled loopback-only Node/Zotero translation service for DOI/ISBN/PMID/arXiv/URL lookup; a Firefox extension cannot start that local process, so the service and lookup UI are intentionally absent from the Firefox package. Manual source entry, evidence notes, CSL citations/references, native XML, IndexedDB autosave, file open/download save, and direct PDF export remain available.

## Environment

The submitted version was developed and tested on:

- Windows 10/11 x64
- Node.js 24.13.0
- npm 11.x

Internet access is required only for `npm ci` / `npx web-ext` during the build. The built extension does not load remote executable code and declares that it collects no data.

## Build

From the root of this source archive:

```sh
npm ci
npm run firefox:stage
```

The reviewable extension directory is then:

```
release/firefox/
```

The staging command performs:

1. `tsc -b`
2. `vite build --mode firefox`
3. copies every file from `dist/` into `release/firefox/`
4. adds the Firefox manifest, background script, and Timeless icons
5. verifies every copied application file by SHA-256

For Mozilla linting and the packaged extension ZIP:

```sh
npm run firefox:lint
npm run firefox:package
```

These commands invoke `web-ext@10.6.0` through npm/npx.

## Firefox-specific behavior

- No browsing permissions or host permissions are requested.
- `data_collection_permissions.required` is `["none"]`.
- Automatic metadata lookup is not included in the Firefox build because the desktop implementation depends on a bundled localhost Node service.
- The Firefox source archive intentionally omits `vendor/translation-server`; that component is not imported by or shipped in the Firefox build.
- Bibliographic CSL styles and locale data under `vendor/csl-styles` and `vendor/csl-locales` are bundled locally.
- Native Timeless documents use `.timeless.xml`. Firefox opens them with the standard browser file-input fallback and saves new copies by download when writable file handles are unavailable.
- Project recovery/autosave uses IndexedDB with a localStorage fallback.
- PDF export is generated client-side with bundled JavaScript dependencies.

## Expected wrapper-only files

The files below exist only in the Firefox package and are not part of `dist/`:

- `manifest.json`
- `background.js`
- `icon-48.png`
- `icon-96.png`

Everything else under `release/firefox/` must match the Firefox-mode `dist/` build byte-for-byte.

## Mozilla linter warnings

`web-ext lint` reports no errors or notices. The remaining warnings are:

- the desktop-only Firefox minimum-version warning caused by `data_collection_permissions`, matching Mozilla's current Android compatibility warning when `gecko_android` is not declared;
- five `Function` / `eval` warnings inside the bundled `pdfmake` release code used for client-side PDF generation;
- four `innerHTML` warnings in the bundled application/framework code. Timeless uses DOM parsing and generated CSL/editor HTML in controlled local document workflows; no remote HTML is fetched or injected by the Firefox build.

Timeless does not enable `'unsafe-eval'` in its extension CSP and does not suppress Mozilla validator warnings.
