# Third-Party Notices

Timeless 1.0.0 vendors third-party components required for local metadata lookup and citation formatting. These components retain their upstream licenses and notices.

## Zotero Translation Server

- Upstream: https://github.com/zotero/translation-server
- Vendored revision: `3a9d17614896fc1fea73d7b880ea79273b605275`
- License: GNU Affero General Public License, as preserved in `vendor/translation-server/COPYING`

Vendored Translation Server submodule revisions at release time:

- `modules/translate`: `e0fe482b8a07e42cbf83545947382008ae7ddb82`
- `modules/translate/modules/utilities`: `cccf1235a318c259345fc623d5e9d6770ba19df7`
- `modules/translate/modules/utilities/resource/schema/global`: `1b12272d44134a652519e9192e5a936ac9fcd707`
- `modules/translators`: `424cfbe720650d51f710f4d9cbf9f4118673c719`
- `modules/utilities`: `1dd38e27edf81e9d9c4161c957b7efb7f5681ac3`
- `modules/utilities/resource/schema/global`: `7f04bb5a6c0c8acfb070849cec81775d1ac25947`
- `modules/zotero-schema`: `70c3aa98627413d6a30dca955886eafbde085ce9`

The nested Git metadata used to obtain these sources is not included in the Timeless repository or release archive.

## Citation Style Language styles

- Upstream: https://github.com/citation-style-language/styles
- Vendored revision: `81c3eb863d1c5a83aab7e296e045013d2422f2cb`
- Bundled styles:
  - APA
  - Chicago Author-Date
  - Modern Language Association

The style files retain their upstream licensing and attribution.

## Citation Style Language locale

- Project: https://citationstyles.org/
- Bundled file: `vendor/csl-locales/locales-en-US.xml`
- License: CC BY-SA 3.0
- Translator metadata and attribution in the locale file are preserved.

## Timeless original code

Original Timeless code is licensed under the Apache License 2.0. See the repository root `LICENSE` file. This license does not replace or override the separate upstream licenses that apply to the vendored third-party components listed above.
