# CodeMirror 6 Proofing POC

Plain-text proofreading and rewriting editor built with CodeMirror 6, React, and TypeScript.

## Quick Start

```bash
cd codemirror-proofing-poc
npm install
npm run dev
```

For LLM rewrite functionality, start the mock API server in a separate terminal:

```bash
npm run mock-api
```

## Architecture

```
src/
├── types/          # Shared Suggestion model, Provider interface, Segmentation types
├── segmentation/   # Text segmentation (Intl.Segmenter + regex fallback)
├── diff/           # Word-level diff computation for rewrite previews
├── engine/         # Proofing orchestration (version tracker, suggestion state, controller)
├── providers/      # Spellcheck (nspell), Grammar (LanguageTool), LLM rewrite
├── codemirror/     # CM6 extensions (state field, decorations, tooltip, theme, view plugin)
├── components/     # React components (Editor, DiffPreview, RewritePanel, Toolbar)
└── mock-api/       # Mock LLM rewrite server
```

### Key Design Decisions

- **Editor/proofing separation**: CodeMirror handles rendering and transactions; the proofing layer handles segmentation, provider orchestration, and stale-result protection
- **Single Suggestion model**: All providers normalize to one `Suggestion` type — the UI only works against this shape
- **Version-based staleness**: Every async request is linked to a monotonic document version; stale results are discarded
- **Aggressive invalidation**: Suggestions overlapping edited regions are removed; suggestions after edits are shifted by the change delta
- **Dictionary via fetch**: Hunspell `.aff`/`.dic` files are loaded at runtime via fetch from `/public/dictionaries/` to avoid Node.js `fs` in the browser bundle

### Tradeoffs

- **Polling for stats**: The toolbar polls suggestion counts on a 1s interval rather than using a proper state subscription — acceptable for POC
- **No streaming rewrites**: LLM rewrites wait for full response before showing preview
- **Public LanguageTool API**: Grammar checks use the public LanguageTool API which has rate limits
- **Simple diff algorithm**: Word-level LCS diff — sufficient for POC but could be slow on very large texts

### Limitations Found

- `dictionary-en` uses top-level await and `node:fs` — cannot be imported directly in a Vite browser build; dictionary files must be served statically
- `nspell` is a CJS module which Vite handles via pre-bundling, but type definitions are absent
- CodeMirror's `EditorView.destroyed` is private — cannot be used for cleanup checks directly

### Should This Move Forward?

The architecture validates the core risks:
1. **Range mapping** works via `mapThroughChange` — tested through CM's transaction system
2. **Text segmentation** uses `Intl.Segmenter` with regex fallback
3. **Async staleness** handled via version tracking and AbortController
4. **Rewrite preview** uses word-level diff with accept/reject flow
5. **Suggestion popover** integrated via CM tooltip extension

The approach is viable for production investment if:
- LanguageTool (or equivalent) quality meets the bar
- LLM rewrite latency is acceptable for the UX
- Dictionary size is manageable for target deployment contexts
