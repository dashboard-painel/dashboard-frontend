# Research Summary — Angular 19 Dashboard Migration

**Project:** Dashboard Auditoria — React 18 → Angular 19  
**Domain:** Single-page pharmacy audit dashboard (internal tool)  
**Researched:** 2026-04-15  
**Confidence:** HIGH (all major findings verified against official angular.dev + PrimeNG docs)

---

## Executive Summary

This is a 1:1 migration of a React 18 dashboard to Angular 19. The React app is a single-page pharmacy audit tool (~70 records) with filter controls, KPI cards, a data table, charts, and a detail drawer — all state held in `App.tsx` with prop drilling. The Angular migration eliminates prop drilling entirely via injectable services + Angular Signals, replaces custom React UI components with PrimeNG 19.x and ngx-charts, and delivers a cleaner architecture with no NgModules.

The recommended approach is **Service-Driven Signals with Standalone Components**: `PharmacyService` holds data, `FilterService` holds filters + computed `filteredData`, `ThemeService` holds dark mode. All components inject services directly — no `@Input()` chains for shared state, no `Context.Provider`. PrimeNG's `p-table`, `p-multiselect`, `p-drawer`, and `p-tag` replace ~800 lines of custom React UI code. ngx-charts replaces Recharts for two chart types; the custom SVG gauge is ported directly (ngx-charts' gauge looks different).

The biggest risk is **version confusion**: `npm install primeng` without a version tag will install PrimeNG 21.x (for Angular 21), not 19.x. Always pin `primeng@19`. The second biggest risk is **signal mutation patterns** — Angular Signals use reference equality, so mutating arrays/objects in place produces silent UI freezes. Both risks are fully preventable if addressed at project setup (Phase 1).

---

## Recommended Stack

Pin these exact versions — no substitutions:

| Library | Version | Purpose |
|---------|---------|---------|
| `@angular/core` (et al.) | `^19.2.x` | Framework — Signals, standalone, `@defer`, new control flow |
| `@angular/cli` | `^19.2.x` | Scaffold + build (esbuild + Vite; no webpack) |
| `primeng` | `^19.1.4` | UI components — Table, MultiSelect, Drawer, Tag, Button |
| `@primeng/themes` | `^19.1.4` | Design token presets (Aura recommended) |
| `primeicons` | `^7.0.0` | Icon set required by PrimeNG |
| `@angular/cdk` | `^19.0.0` | PrimeNG peer dependency (overlay, a11y) |
| `@angular/animations` | `^19.0.0` | PrimeNG animation support — required |
| `@swimlane/ngx-charts` | `^23.1.0` | Angular-native SVG charts (explicit Angular 18/19/20 support) |
| `rxjs` | `^7.8.1` | Angular/PrimeNG peer dependency |
| `typescript` | `>=5.5.0 <5.9.0` | Angular 19.2.x compatibility range |
| `zone.js` | `~0.15.0` | Change detection (zoneless is still experimental in v19) |

**Critical version note:** PrimeNG mirrors Angular's major version. Angular 19 → PrimeNG 19.x. Installing `primeng` without a tag installs v21 (Angular 21) and breaks the build.

**Do NOT use:** NgModules, `BehaviorSubject` for state, `*ngIf`/`*ngFor`, `@Input()`/`@Output()` decorators for shared state, NgRx, Tailwind alongside PrimeNG, SSR, or zoneless mode.

See: `.planning/research/STACK.md` for full setup code, CLI flags, tsconfig, and PrimeNG theming configuration.

---

## Table Stakes Features

These must work at launch — users will notice immediately if any are missing:

| Feature | Angular Implementation | Notes |
|---------|----------------------|-------|
| All 6 filter types work together | `p-multiselect` × 3, `p-autocomplete` (CNPJ), `p-inputnumber` (lag) + `FilterService` | Core functionality — drives everything |
| Apply / Clear filter cycle | `FilterService.apply()` + `FilterService.reset()` | Without Clear, users get stuck |
| Sortable table columns | `pSortableColumn` directive on `p-table` | Replaces ~100 lines of React `useMemo` sort |
| Pagination 10/25/50 | `[paginator]="true"` on `p-table` | Built-in, zero custom code |
| Row click → drawer opens | `(onRowSelect)` + `SelectionService` + `p-drawer` | Primary navigation pattern |
| KPI cards update on filter change | `computed()` chain from `FilterService.filteredData()` | Proves reactive data flow works |
| Status badges in table rows | `p-tag` with `customColors` | Color-coded status is the primary data signal |
| Drawer closes on backdrop click | `p-drawer [modal]="true"` | Standard UX expectation; confirmed in PrimeNG changelog |
| Dark/light mode toggle | `ThemeService.isDark` signal + CSS class on `<html>` | Must not reset on filter changes |

**Should-have differentiators (improve on React original):**
- Instant filter feedback without "Aplicar" click (change `FilterBar` to direct binding)
- Animated drawer open/close (free with `p-drawer`)
- Full keyboard navigation in dropdowns (free with `p-multiselect`)
- Active filter count badge in header

**Defer to v2+:** Export to Excel (non-functional buttons in React original are fine at launch), real API calls (mock data only), route-based navigation.

See: `.planning/research/FEATURES.md` for complete component-by-component React→Angular mapping with code examples.

---

## Architecture in One Page

**Pattern:** Service-Driven Signals + Standalone Components + OnPush everywhere.

```
Angular DI Root
├── PharmacyService        → allPharmacies: Signal<Pharmacy[]>  (source of truth)
├── FilterService          → filters: WritableSignal<Filters>
│                          → filteredData: computed()            (derived, memoized)
│                          → selectedPharmacy: WritableSignal<Pharmacy|null>
└── ThemeService           → isDark: WritableSignal<boolean>
                           → toggle() → writes CSS class to <html>

Component Tree (all standalone, all OnPush)
AppComponent → router-outlet
└── DashboardComponent
    ├── HeaderComponent         [injects ThemeService]
    ├── FilterBarComponent      [injects FilterService → writes filters]
    ├── KpiCardsComponent       [injects FilterService → reads filteredData()]
    ├── ChartsSectionComponent  [injects FilterService → reads filteredData()]
    ├── MainTableComponent      [injects FilterService → reads + writes selectedPharmacy]
    └── DetailDrawerComponent   [injects FilterService → reads selectedPharmacy()]
```

**Folder structure:** `src/app/core/` (services) · `src/app/models/` (interfaces only) · `src/app/dashboard/` (all feature components as subfolders)

**Key patterns:**
- `inject()` over constructor injection (Angular Style Guide 2026)
- `input()` / `output()` signal-based API over `@Input()` / `@Output()` decorators
- `ChangeDetectionStrategy.OnPush` on ALL components — signals auto-mark for re-render
- CSS custom properties on `:root` / `:root.dark-theme` for theming — no prop drilling
- `@defer (on viewport)` on `ChartsSectionComponent` to reduce initial bundle
- React's `useMemo` → `computed()` · React's `useState` → `signal()` · `useContext` → `inject()`

**Dark mode requires coordinating two systems:** toggle both `p-dark` (PrimeNG) and `dark-theme` (custom CSS) classes on `<html>` simultaneously in `ThemeService.toggle()`.

See: `.planning/research/ARCHITECTURE.md` for data flow diagrams, service code, `ng new` command, and routing setup.

---

## Top 5 Watch Out For

1. **`npm install primeng` without version tag installs v21 (Angular 21), not v19** — always pin: `npm install primeng@19`. The peer dep conflict will break the build silently or noisily.

2. **Mutating signal values in place produces silent UI freezes** — Angular Signals use reference equality (`Object.is`). Never `array.push()` on a signal value; always `.update(arr => [...arr, item])`. This is the #1 React-to-Angular gotcha.

3. **Replicating React's `Theme` object prop-drilling in Angular** — do NOT create a `ThemeService` that holds a typed `Theme` object and inject it into every component. Use CSS custom properties on `<html>` instead. PrimeNG's own `--p-*` CSS variables conflict with TypeScript theme objects applied via inline styles.

4. **ngx-charts data format is completely different from Recharts** — the `name` field must always be a string (not a Date, not a number). Multi-series line charts use `{ name, series: [{name, value}] }[]`, not Recharts' flat array. Build data transformers with `computed()` from scratch; do not port Recharts data structures.

5. **Forgetting to import PrimeNG/ngx-charts modules per standalone component** — with standalone components (Angular 19 default), every `@Component` must list `TableModule`, `MultiSelectModule`, `DrawerModule`, etc. in its own `imports: []` array. The error `'p-table' is not a known element` means the import is missing.

**Bonus (phase-specific):** Add `provideAnimationsAsync()` to `app.config.ts` providers from day one — both PrimeNG and ngx-charts require it, and missing it causes runtime errors that surface late.

See: `.planning/research/PITFALLS.md` for phase-specific warning matrix and the full React→Angular hook/pattern translation guide.

---

## Build Order Recommendation

10 phases derived from dependency analysis across all 4 research docs. Each phase is independently runnable before the next starts.

| Phase | What to Build | Key Dependency | Pitfall to Avoid |
|-------|--------------|----------------|-----------------|
| **1. Scaffold + Infra** | `ng new angular-app`, install primeng@19 + ngx-charts, `app.config.ts` with `provideAnimationsAsync()`, global SCSS, folder skeleton | Nothing — this unblocks everything | Pin `primeng@19`; add animations provider now |
| **2. Models + Mock Data** | `pharmacy.model.ts`, `filters.model.ts`, `constants.ts` (STATUS_INFO, colors), mock data array | Phase 1 | Types must be stable before services use them |
| **3. Core Services** | `PharmacyService`, `FilterService` (signals + `computed()`), `ThemeService`, signal mutation discipline | Phase 2 | Use `computed()` for `filteredData`, never `effect()`; `.update()` not `.push()` |
| **4. Shell + Routing** | `AppComponent` + `router-outlet`, `DashboardComponent` layout, dark mode CSS variables, `p-dark` + `dark-theme` class coordination | Phase 3 | Both PrimeNG and custom CSS class must toggle together |
| **5. Header** | `HeaderComponent` — theme toggle button wired to `ThemeService` | Phase 4 | Simple first real component; validates DI + Signal pattern end-to-end |
| **6. Filter Bar** | `FilterBarComponent` — `p-multiselect` × 3, `p-autocomplete` (CNPJ), `p-inputnumber` (lag), pending signal state, Apply/Clear | Phase 5 | Filter arrays: `.update(f => ({...f, systems: [...]}))`, never `push()` |
| **7. KPI Cards** | `KpiCardsComponent` — reads `filteredData()` computed, port custom SVG donut directly | Phase 6 | Validates reactive chain; proves Signal graph is correct |
| **8. Charts Section** | `ChartsSectionComponent` — ngx-charts horizontal bar + port gauge SVG directly, `@defer` wrapper | Phase 7 | Build ngx-charts data transformers fresh; `name` must be string; provide `[view]` or flex parent |
| **9. Main Table** | `MainTableComponent` — `p-table` with `pSortableColumn`, pagination, `selectionMode="single"` + `(onRowSelect)` → `SelectionService` | Phase 8 | Use PrimeNG selection API, not raw `(click)` on `<tr>`; `track pharmacy.id` in `@for` |
| **10. Detail Drawer** | `DetailDrawerComponent` — `p-drawer position="right"`, line chart, reads `selectedPharmacy()` | Phase 9 | `drawerVisible` should be `WritableSignal<boolean>` for two-way `[(visible)]` binding |

**Phase ordering rationale:**
- Infrastructure before models before services — every later phase depends on types being locked
- Services before any UI — the reactive graph (FilterService → filteredData) must exist before components consume it
- Header before FilterBar — proves DI and signal pattern work before complex form state
- FilterBar before KPI/Charts/Table — FilterBar *writes* to FilterService; other components *read* from it; write side must exist first
- Table before Drawer — Drawer opens from row selection; selection must be wired first

### Research Flags

**Standard patterns (skip research-phase):**
- Phase 1–5: Well-documented Angular 19 + PrimeNG setup patterns; all code examples exist in STACK.md / ARCHITECTURE.md
- Phase 6: PrimeNG `p-multiselect` is well-documented; signal pending-state pattern is in FEATURES.md
- Phase 9: PrimeNG Table API is thoroughly documented in FEATURES.md with exact templates
- Phase 10: `p-drawer` pattern is fully resolved in FEATURES.md

**May benefit from deeper research during planning:**
- Phase 8 (Charts): ngx-charts has 729 open issues and sparse recent docs; the gauge chart recommendation is to port custom SVG directly rather than use ngx-charts gauge (style mismatch). Verify `[view]` responsive behavior before finalizing.
- Phase 8 (Dark mode + charts): ngx-charts does NOT auto-respond to PrimeNG dark mode; requires manual `colorScheme` switching via `ThemeService.isDark()` signal — double-check implementation approach.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack (Angular 19, PrimeNG 19.x, TypeScript range) | **HIGH** | Verified against angular.dev official docs + PrimeNG GitHub tags |
| Stack (ngx-charts 23.1.0 Angular 19 compat) | **HIGH** | Peer dep in package.json explicitly lists `"@angular/core": "18.x \|\| 19.x \|\| 20.x"` |
| Features (React→Angular component mapping) | **HIGH** | Each feature mapped against both React source and PrimeNG v19 docs |
| Architecture (Signals, standalone, DI patterns) | **HIGH** | All sourced from angular.dev/style-guide and angular.dev/guide/signals |
| Pitfalls (signal mutation, track, inline styles) | **HIGH** | Sourced from angular.dev official best-practices docs |
| PrimeNG theming (design token system) | **HIGH** | Verified at v19.primeng.org/theming |
| ngx-charts dark mode behavior | **MEDIUM** | No auto dark mode — manual color scheme switching; based on library docs + known patterns |
| ngx-charts gauge chart fidelity | **MEDIUM** | Recommendation to port custom SVG is inference; ngx-charts gauge style differs from React original |
| PrimeNG installation page | **MEDIUM** | PrimeNG docs site partially non-scrapable; setup based on verified package.json peer deps + known PrimeNG 18+ patterns |

**Overall confidence: HIGH**

### Gaps to Address During Planning/Implementation

- **PrimeNG Drawer `[(visible)]` two-way binding** — FEATURES.md notes that `computed()` (read-only) won't work for two-way binding; a `WritableSignal<boolean>` is needed. Confirm exact wiring pattern when implementing Phase 10.
- **ngx-charts responsive sizing** — verify whether parent flex container is sufficient or if `HostListener('window:resize')` is needed for the charts section. Test early in Phase 8.
- **Angular 19 LTS expiry (May 2026)** — the project targets v19 (LTS ends 2026-05-19). If the app will be maintained beyond that date, plan an upgrade path to Angular 20+. Not a blocker for migration.
- **`p-dark` vs `dark-theme` class naming** — STACK.md uses `app-dark`, FEATURES.md uses `dark-mode`, PITFALLS.md uses `dark-theme`. Standardize on one class name in Phase 4 and apply consistently.

---

## Sources

### Primary (HIGH confidence)
- `angular.dev/guide/signals` — Signals, computed, effect, linkedSignal APIs
- `angular.dev/style-guide` — inject() preference, standalone defaults, file naming
- `angular.dev/reference/versions` — TypeScript 5.5–5.8 range, Angular 19.2.x
- `angular.dev/reference/releases` — LTS schedule (v19 ends 2026-05-19)
- `angular.dev/guide/templates/defer` — @defer blocks, on viewport/idle/interaction
- `angular.dev/best-practices/` — Zone pollution, slow computations, skipping subtrees, OnPush
- `github.com/primefaces/primeng` tag `19.1.4/packages/primeng/package.json` — confirmed peer dep `"@angular/core": "^19.0.0"`
- `v19.primeng.org/theming` — Design token system, definePreset(), providePrimeNG()
- `github.com/primefaces/primeng/blob/master/CHANGELOG.md` — Drawer component existence confirmed
- `swimlane.gitbook.io/ngx-charts/llms-full.txt` — Data formats, customColors, responsive sizing, animation requirements
- `raw.githubusercontent.com/swimlane/ngx-charts/.../package.json` — Angular 18/19/20 peer dep confirmation

### Secondary (MEDIUM confidence)
- `github.com/swimlane/ngx-charts` (4.4k stars, 729 open issues) — maintenance status assessment
- PrimeNG installation page (partially non-scrapable) — setup patterns inferred from package.json + PrimeNG 18+ known patterns

### Project source
- `src/` React source files (App.tsx, FilterBar.tsx, KPICards.tsx, etc.) — direct analysis for React→Angular pattern mapping

---

*Research completed: 2026-04-15*  
*Ready for roadmap: yes*
