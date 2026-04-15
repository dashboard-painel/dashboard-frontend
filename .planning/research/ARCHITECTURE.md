# Architecture Research — Angular 19 Dashboard

**Project:** Pharmacy Audit Dashboard (React → Angular 19 migration)
**Researched:** 2026-04-15
**Angular CLI version at time of research:** v21 (latest; Angular 19 is LTS, CLI is version-agnostic for `ng new`)
**Overall confidence:** HIGH — all findings sourced from official angular.dev documentation

> **Version note:** The Angular CLI and docs site are currently at v21. Angular 19 entered LTS
> in May 2025 (supported until May 2026). For a new project, `ng new` with
> `@angular/cli@19` pins v19, or you can target the latest stable (v21) which has
> the same standalone + Signals APIs with more refinements. This document is valid
> for Angular 19 through 21.

---

## Recommended Architecture Pattern

**Pattern: Service-Driven Signals with Standalone Components**

This is the Angular-idiomatic equivalent of the React app's current "all state in
App.tsx + props down" pattern, but inverted: state lives in injected services
(singletons), components inject services directly and read signals reactively.
No NgModules required. No Context API equivalent needed.

```
┌─────────────────────────────────────────────────┐
│               Angular DI Container               │
│                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │PharmacyService│  │FilterService │  │ThemeServ│ │
│  │ (data + mock) │  │(signals)     │  │(signals)│ │
│  └──────┬───────┘  └──────┬───────┘  └────┬────┘ │
└─────────│──────────────────│───────────────│──────┘
          │inject()          │inject()       │inject()
          ▼                  ▼               ▼
┌─────────────────────────────────────────────────┐
│             DashboardComponent (host)            │
│  Orchestrates layout; injects all three services │
│  Contains: <app-header>, <app-filter-bar>,       │
│            <app-kpi-cards>, <app-charts-section>,│
│            <app-main-table>, <app-detail-drawer> │
└─────────────────────────────────────────────────┘
          │ @Input / inject service directly
          ▼
  Feature components (all standalone, ChangeDetection.OnPush)
```

**Key principles confirmed by official docs (angular.dev):**

1. **Standalone by default** — `standalone: true` is the default in Angular 17+.
   No NgModules needed. Components declare their own `imports: []` array.
2. **`inject()` over constructor injection** — Angular Style Guide (2026) explicitly
   prefers `inject(Service)` in field initializers over constructor params.
3. **`input()` signal function over `@Input()` decorator** — Style Guide recommends
   signal-based `input()`, which returns an `InputSignal<T>` (read-only).
4. **`readonly` on all Angular-managed properties** — `input()`, `output()`,
   `model()`, and query results should be `readonly`.
5. **`protected` on template-only computed values** — members used only in the
   template, not in a public API, should be `protected`.
6. **Organize by feature, not by type** — Style Guide says avoid `components/`,
   `services/`, `directives/` directories; prefer `dashboard/`, `shared/` etc.

---

## Folder Structure

```
angular-app/
├── src/
│   ├── main.ts                          # Bootstrap entry point
│   ├── index.html                       # HTML shell
│   ├── styles.scss                      # Global styles (PrimeNG theme import goes here)
│   │
│   └── app/
│       ├── app.ts                       # Root AppComponent (shell + router-outlet)
│       ├── app.html                     # Root template
│       ├── app.routes.ts                # Route definitions (provideRouter)
│       ├── app.config.ts                # ApplicationConfig (provideRouter, etc.)
│       │
│       ├── core/                        # Singleton services (providedIn: 'root')
│       │   ├── pharmacy.service.ts      # Mock data + Pharmacy[] signal
│       │   ├── filter.service.ts        # Filter state as WritableSignals + filteredPharmacies computed()
│       │   ├── theme.service.ts         # isDark signal, toggleTheme(), CSS class application
│       │   └── constants.ts             # STATUS_INFO, SYSTEM_COLORS, CONTRACT_COLORS, formatDate()
│       │
│       ├── models/                      # TypeScript interfaces only (no logic)
│       │   ├── pharmacy.model.ts        # Pharmacy, AuditHistory, DayRecord, IntegrationError
│       │   └── filters.model.ts         # Filters interface
│       │
│       └── dashboard/                   # Dashboard feature (single route)
│           ├── dashboard.ts             # DashboardComponent — layout shell
│           ├── dashboard.html
│           ├── dashboard.scss
│           │
│           ├── header/
│           │   ├── header.ts            # HeaderComponent — theme toggle, title
│           │   ├── header.html
│           │   └── header.scss
│           │
│           ├── filter-bar/
│           │   ├── filter-bar.ts        # FilterBarComponent — multi-select dropdowns
│           │   ├── filter-bar.html
│           │   └── filter-bar.scss
│           │
│           ├── kpi-cards/
│           │   ├── kpi-cards.ts         # KpiCardsComponent — aggregated metrics
│           │   ├── kpi-cards.html
│           │   └── kpi-cards.scss
│           │
│           ├── charts-section/
│           │   ├── charts-section.ts    # ChartsSectionComponent — ngx-charts
│           │   ├── charts-section.html
│           │   └── charts-section.scss
│           │
│           ├── main-table/
│           │   ├── main-table.ts        # MainTableComponent — PrimeNG Table, row select
│           │   ├── main-table.html
│           │   └── main-table.scss
│           │
│           └── detail-drawer/
│               ├── detail-drawer.ts     # DetailDrawerComponent — PrimeNG Sidebar/Drawer
│               ├── detail-drawer.html
│               └── detail-drawer.scss
│
├── angular.json
├── tsconfig.json
├── tsconfig.app.json
└── package.json
```

**Naming notes (Angular Style Guide 2025 format):**
- Files: `kebab-case.ts` — e.g., `filter-bar.ts`, `pharmacy.service.ts`
- Classes: `PascalCase` — e.g., `FilterBarComponent`, `PharmacyService`
- Selectors: `app-` prefix — e.g., `app-filter-bar`, `app-kpi-cards`
- The 2025 file-name style (default in CLI v17+) omits `.component` suffix:
  `filter-bar.ts` not `filter-bar.component.ts`

---

## Data Flow Diagram

```
                    ┌─────────────────┐
                    │  PharmacyService │
                    │                 │
                    │ allPharmacies    │  ← readonly signal (static mock data)
                    └────────┬────────┘
                             │ inject()
                             ▼
                    ┌─────────────────┐
                    │  FilterService  │
                    │                 │
                    │ filters          │  ← WritableSignal<Filters>
                    │ filteredData     │  ← computed(() => filter(all, filters()))
                    │ selectedPharmacy │  ← WritableSignal<Pharmacy | null>
                    └────────┬────────┘
                             │ inject() in each component
              ┌──────────────┼──────────────────────┐
              ▼              ▼                       ▼
    ┌──────────────┐  ┌──────────────┐    ┌──────────────────┐
    │ FilterBar    │  │  KpiCards    │    │   MainTable      │
    │              │  │              │    │                  │
    │ reads:       │  │ reads:       │    │ reads:           │
    │  filters()   │  │  filtered    │    │  filteredData()  │
    │              │  │  Data()      │    │                  │
    │ writes:      │  │  (computed)  │    │ writes:          │
    │  filters.set │  └──────────────┘    │  selectedPharmacy│
    └──────────────┘                      │  .set(pharmacy)  │
                                          └──────────────────┘
                                                   │
                    ┌──────────────────────────────┘
                    ▼
          ┌──────────────────┐
          │  DetailDrawer    │
          │                  │
          │ reads:           │
          │  selectedPharmacy│
          │  ()              │
          │                  │
          │ shown when ≠ null│
          └──────────────────┘

    ┌──────────────┐
    │ ThemeService  │
    │               │
    │ isDark        │  ← WritableSignal<boolean>
    │ toggleTheme() │  → applies 'dark' CSS class to <html>
    └───────────────┘
          │ inject()
          ▼
    ┌──────────────┐
    │   Header     │
    │               │
    │ reads isDark()│
    │ calls toggle()|
    └──────────────┘
```

**React → Angular signal mapping:**

| React (App.tsx)                  | Angular (Services)                              |
|----------------------------------|-------------------------------------------------|
| `useState<Filters>(defaultFilters)` | `FilterService.filters = signal<Filters>(defaults)` |
| `useMemo(() => filter(...), [filters])` | `FilterService.filteredData = computed(() => ...)` |
| `useState<Pharmacy \| null>(null)` | `FilterService.selectedPharmacy = signal<Pharmacy \| null>(null)` |
| `useState<boolean>(false)` (dark) | `ThemeService.isDark = signal(false)` |
| `setFilters(newFilters)` callback prop | `filterService.filters.set(newFilters)` (direct) |
| `onSelectPharmacy(p)` callback prop | `filterService.selectedPharmacy.set(p)` (direct) |
| `onToggleDarkMode()` callback prop | `themeService.toggleTheme()` (direct) |
| Props drilling theme to every component | Components inject `ThemeService` directly |

---

## Service Architecture

### PharmacyService (`core/pharmacy.service.ts`)
```typescript
@Injectable({ providedIn: 'root' })
export class PharmacyService {
  // Static mock data — equivalent to mockData.ts
  private readonly _allPharmacies = signal<Pharmacy[]>(MOCK_PHARMACIES);
  readonly allPharmacies = this._allPharmacies.asReadonly();

  // Detail data generators (moved from React's DetailDrawer local calls)
  generateAuditHistory(pharmacy: Pharmacy): AuditHistory[] { ... }
  generateDayData(pharmacy: Pharmacy): DayRecord[] { ... }
}
```
**State held:** Source-of-truth pharmacy array (read-only)
**Does NOT hold:** Filter state, selection state — those are FilterService's job

---

### FilterService (`core/filter.service.ts`)
```typescript
@Injectable({ providedIn: 'root' })
export class FilterService {
  private readonly pharmacyService = inject(PharmacyService);

  // Writable state — replaces App.tsx useState
  readonly filters = signal<Filters>(DEFAULT_FILTERS);
  readonly selectedPharmacy = signal<Pharmacy | null>(null);

  // Derived state — replaces App.tsx useMemo
  readonly filteredData = computed(() =>
    applyFilters(this.pharmacyService.allPharmacies(), this.filters())
  );

  // Actions — replaces callback props
  applyFilters(newFilters: Filters): void {
    this.filters.set(newFilters);
  }
  selectPharmacy(pharmacy: Pharmacy | null): void {
    this.selectedPharmacy.set(pharmacy);
  }
  resetFilters(): void {
    this.filters.set(DEFAULT_FILTERS);
  }
}
```
**State held:** Active filters, selected pharmacy, filtered data (derived)
**Critical:** `filteredData` is a `computed()` — it is lazily evaluated and memoized
automatically, exactly like React's `useMemo`. No manual dependency array needed.

---

### ThemeService (`core/theme.service.ts`)
```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(false);

  toggleTheme(): void {
    this.isDark.update(v => !v);
    // Apply to document root for CSS variable cascade
    document.documentElement.classList.toggle('dark', this.isDark());
  }
}
```
**State held:** Dark mode boolean signal
**Approach:** CSS class on `<html>` element drives all theming via CSS custom
properties / PrimeNG dark mode class. This replaces React's prop-drilling of the
`theme` object to every component — components just read CSS variables.

---

## Component Tree

```
AppComponent (app-root)
└── router-outlet
    └── DashboardComponent (app-dashboard)          [injects: FilterService, ThemeService]
        ├── HeaderComponent (app-header)             [injects: ThemeService]
        │   └── PrimeNG: Button, ToggleButton
        │
        ├── FilterBarComponent (app-filter-bar)      [injects: FilterService]
        │   └── PrimeNG: MultiSelect, InputNumber, Button
        │
        ├── KpiCardsComponent (app-kpi-cards)        [injects: FilterService]
        │   └── PrimeNG: Card
        │   └── reads: filterService.filteredData()
        │
        ├── ChartsSectionComponent (app-charts-section) [injects: FilterService]
        │   └── ngx-charts: BarChart, PieChart, LineChart
        │   └── reads: filterService.filteredData()
        │
        ├── MainTableComponent (app-main-table)      [injects: FilterService]
        │   └── PrimeNG: Table (p-table)
        │   └── reads: filterService.filteredData()
        │   └── writes: filterService.selectPharmacy()
        │
        └── DetailDrawerComponent (app-detail-drawer) [injects: FilterService, PharmacyService]
            └── PrimeNG: Sidebar or Drawer
            └── reads: filterService.selectedPharmacy()
            └── shown when selectedPharmacy() !== null
```

**Standalone imports pattern** (each component declares its own `imports`):

```typescript
// Example: main-table.ts
@Component({
  selector: 'app-main-table',
  standalone: true,              // explicit (default in ng17+, good to be explicit)
  changeDetection: ChangeDetectionStrategy.OnPush,  // required for signal perf
  imports: [
    CommonModule,                // NgIf, NgFor (or use @if / @for control flow)
    TableModule,                 // PrimeNG p-table
    ButtonModule,                // PrimeNG p-button
  ],
  templateUrl: './main-table.html',
  styleUrl: './main-table.scss',
})
export class MainTableComponent {
  protected readonly filterService = inject(FilterService);
  protected readonly data = this.filterService.filteredData;  // signal ref, not call
}
```

**Use `ChangeDetectionStrategy.OnPush` on ALL components.** Angular's signal
system + OnPush means Angular only re-renders a component when its signals change.
This is the performance sweet spot — equivalent to React's memo-by-default behavior
with hooks.

---

## Angular CLI Scaffold Command

```bash
# Run from the Dashboard Auditoria root directory (NOT inside any existing project)
# This creates the angular-app/ subfolder with a complete Angular 19 workspace

ng new angular-app \
  --directory=angular-app \
  --routing=true \
  --standalone=true \
  --style=scss \
  --strict=true \
  --skip-tests=false \
  --package-manager=npm \
  --ssr=false \
  --prefix=app

# After scaffold, install PrimeNG and ngx-charts
cd angular-app
npm install primeng @primeng/themes
npm install @swimlane/ngx-charts
npm install d3-scale d3-shape d3-array   # ngx-charts peer deps
```

**Flag explanations:**
- `--directory=angular-app` — creates the project at `./angular-app/` relative to CWD
- `--standalone=true` — default since Angular 17, explicit here for clarity
- `--routing=true` — generates `app.routes.ts` and `provideRouter()` in `app.config.ts`
- `--style=scss` — SCSS for PrimeNG theme overrides and custom styles
- `--strict=true` — strict TypeScript; matches the React project's TS config quality
- `--ssr=false` — confirmed out-of-scope in PROJECT.md
- `--skip-tests=false` — keep spec files; they're generated but unused (out-of-scope)
- `--prefix=app` — component selector prefix: `app-header`, `app-filter-bar`, etc.

**Post-scaffold: add PrimeNG theme in `styles.scss`:**
```scss
// styles.scss
@import "primeng/resources/themes/lara-dark-blue/theme.css";  // or any preset
@import "primeng/resources/primeng.css";
@import "primeicons/primeicons.css";
```

**Or with new PrimeNG 18+ `@primeng/themes` preset approach:**
```typescript
// app.config.ts
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    providePrimeNG({ theme: { preset: Aura } }),
  ],
};
```

---

## Routing Setup (Single-View Dashboard)

Since the React app has no routing (single view, all sections visible), Angular
routing is configured with a single route mapping `''` to `DashboardComponent`.
This satisfies the PROJECT.md requirement: "Roteamento Angular configurado (mesmo
que single-page)."

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    title: 'Dashboard de Auditoria de Farmácias',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
```

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // PharmacyService, FilterService, ThemeService are providedIn: 'root'
    // and do NOT need to be listed here explicitly
  ],
};
```

```html
<!-- app.html -->
<router-outlet />
```

---

## Build Order (Suggested Phase Sequence)

This ordering ensures each phase is independently runnable and testable before the
next one starts. Infrastructure-first, then data, then services, then UI bottom-up.

| Phase | What to Build | Why This Order |
|-------|--------------|----------------|
| **1. Scaffold + Infrastructure** | `ng new`, PrimeNG install, `app.routes.ts`, `app.config.ts`, global SCSS, folder skeleton | Nothing works without this; unblocks all other phases |
| **2. Models + Mock Data** | `models/pharmacy.model.ts`, `models/filters.model.ts`, `core/constants.ts`, mock data array in `PharmacyService` | All services and components depend on these types |
| **3. Core Services** | `PharmacyService`, `FilterService` (signals + computed), `ThemeService` | Services define the reactive graph; components are consumers of it |
| **4. Shell + Routing** | `DashboardComponent` layout (header/main/drawer regions), `AppComponent` with `<router-outlet>`, dark mode CSS class wiring | Establishes the visual skeleton and proves routing + DI works |
| **5. Header Component** | `HeaderComponent` with theme toggle using `ThemeService` | Simple first real component; validates DI + signal pattern end-to-end |
| **6. FilterBar Component** | `FilterBarComponent` with all 6 filter controls (systems, statuses, CNPJ, association code, contract status, min lag) | Writes to `FilterService.filters` — must exist before data-reading components |
| **7. KPI Cards** | `KpiCardsComponent` consuming `filterService.filteredData()` | Pure read from computed signal; validates reactive data flow |
| **8. Charts Section** | `ChartsSectionComponent` with ngx-charts | Reads `filteredData()`; most complex data transformation in the UI |
| **9. Main Table** | `MainTableComponent` with PrimeNG Table, row selection → `filterService.selectPharmacy()` | Writes selected pharmacy; needed before drawer |
| **10. Detail Drawer** | `DetailDrawerComponent` reading `filterService.selectedPharmacy()` | Depends on row selection being wired in Phase 9 |

**Total result:** A complete 1:1 Angular migration of the React dashboard, with
cleaner state management (services+signals instead of prop drilling), modular
component structure, and no NgModules.

---

## Component Communication Summary

| React Pattern | Angular Equivalent | Notes |
|---------------|-------------------|-------|
| Prop drilling `theme: Theme` to every component | `ThemeService.isDark` signal, CSS variables | No prop needed; inject directly |
| `onFilterChange(filters)` callback prop | `filterService.filters.set(f)` in FilterBarComponent | Service call, no Output needed |
| `onSelectPharmacy(p)` callback prop | `filterService.selectedPharmacy.set(p)` | Service call, no Output needed |
| `onToggleDarkMode()` callback prop | `themeService.toggleTheme()` | Service call, no Output needed |
| `data: Pharmacy[]` prop to KPI/Charts/Table | `filterService.filteredData()` injected | No Input needed for shared data |
| `pharmacy: Pharmacy` prop to DetailDrawer | `filterService.selectedPharmacy()` injected | No Input needed for shared state |

**Rule of thumb:** Use `@Input()` / `input()` only for data that is *local* to a
parent-child relationship and not shared across siblings. Use services for anything
that crosses component boundaries.

---

## Sources

- Angular Signals guide — https://angular.dev/guide/signals (HIGH confidence)
- Angular Style Guide — https://angular.dev/style-guide (HIGH confidence)
- Angular CLI `ng new` reference — https://angular.dev/cli/new (HIGH confidence)
- Angular Routing — https://angular.dev/guide/routing/define-routes (HIGH confidence)
- Angular component inputs — https://angular.dev/guide/components/inputs (HIGH confidence)
- Angular versioning/release schedule — https://angular.dev/reference/releases (HIGH confidence)
- PrimeNG installation — https://primeng.org/installation (MEDIUM — page did not fully render; based on known PrimeNG 18+ patterns)
