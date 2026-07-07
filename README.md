# Cadence

A sticky-notes canvas built for Tempo's Cloud-Native Developer take-home assessment.

**Live demo:** [tempo-solutions-cadence.vercel.app](https://tempo-solutions-cadence.vercel.app/)

## Why "Cadence"

Tempo's own name is a rhythm-in-work metaphor. Cadence is a deliberate echo of that thesis, not a generic sticky-notes name — a small signal that the naming decision, like the architecture decisions below, was made with Tempo's own product language in mind.

## Running it

```bash
npm install
npm run dev      # local dev server
npm test         # reducer + repository suites (vitest)
npm run build    # production build, type-checked
```

No environment variables or secrets are required — there is no real backend. If this were wired to a real API, configuration would move to a local `.env` file and GitHub Actions secrets in CI; the seam for that is described below.

## Features

**Required**
- Create a note at a given position/size
- Move by dragging
- Resize by dragging (from the corner handle)
- Delete by dragging to the trash zone

**Bonus**
- Bring-to-front on interaction
- Note colors — a direct callback to Tempo's own per-project color-coding in Structure/Timesheets
- Inline text editing (double-click to enter, click away to commit)
- Async persistence via a mock REST-shaped repository (see Architecture)

**Explicitly out of scope:** multi-select, undo/redo, keyboard shortcuts, touch/mobile support, note grouping, real-time collaboration. Naming what was deliberately cut is itself part of the scoping judgment this assessment is evaluating.

## Architecture

State lives in a single `useReducer` over the notes array — one source of truth, with every mutation (create, move, resize, delete, recolor, retext, bring-to-front) expressed as an explicit, testable action rather than scattered `useState` calls.

The persistence layer is the one architectural decision worth calling out specifically. Rather than reading and writing `localStorage` directly from the React layer, the app talks to a `NotesRepository` interface — `load()` and `save(notes)`, both Promise-returning, always. The only implementation is a mock REST repository that simulates real network behavior (artificial latency, loading/error state) and uses `localStorage` purely as its own internal fake database, an implementation detail the rest of the app never touches. This is written as if it's talking to a real API from day one, so pointing it at an actual backend later is a one-file change to the repository implementation, not a rearchitecture of the UI. For a Cloud-Native Developer assessment, that seam is the actual signal — an async-shaped data layer, not a synchronous storage call wearing a network costume.

The drag interaction is a single generic `usePointerDrag` hook, parameterized by what the caller does with the movement — reused as-is for move, resize, and the trash-zone delete check, rather than three separate ad hoc handlers. During an active drag, position and size updates go straight to the DOM through a ref; the reducer only commits once, on release, so the notes array doesn't re-render on every `pointermove`. Text editing is gated behind an explicit `editing` state per note (entered via double-click, exited on blur) rather than being always-on — the first implementation had text editing intercepting all pointer input by default, which silently broke dragging; that bug and its fix are documented in the commit history rather than quietly folded away.

## One deliberate tradeoff

Vite's current default line has moved to the Rolldown bundler, which ships platform-specific native bindings as optional dependencies — these don't always resolve reliably across different machines via `npm install` (a documented npm bug). Rather than leave that risk for whoever clones this repo next, `vite` and `vitest` are pinned to their stable, pre-Rolldown majors (6.x / 3.x), which also happened to clear several dependency audit findings in the process. The tradeoff: this repo is intentionally not on the newest available tooling. Given the goal is a reliable build on an unknown evaluator machine, that's the right call — but it's a real one, not a free one, and it's worth revisiting once Rolldown's cross-platform story matures.

## If I had more time

The test suite covers the reducer and repository — the two places where real logic lives — but there's no interaction/e2e layer exercising actual pointer events. The drag-vs-edit bug that shipped in the first pass (documented in the commit history and issue log) is exactly the kind of thing that layer would have caught before a manual QA pass did. Playwright or Testing Library's pointer-event simulation would be the next investment, sized appropriately for a larger version of this app rather than a 2-3 hour assessment.

## SDLC notes

One feature branch per unit of work, atomic commits mirroring the build stages, single self-reviewed PR per branch into `main`. GitHub Actions runs install + test + build on every push. No GitHub Wiki — a Wiki is sized for a living, multi-page, evolving project, and using one here would itself be a proportionality miss; everything relevant lives in this file and the commit history.
