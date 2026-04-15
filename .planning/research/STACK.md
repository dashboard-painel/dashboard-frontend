# Stack Research — Angular 19 Dashboard

**Project:** Dashboard Auditoria — Angular Migration  
**Researched:** 2026-04-15  
**Sources:** angular.dev (official), primeng.org v19 docs, github.com/swimlane/ngx-charts, npmjs.com  

---

## ⚠️ Critical Version Reality Check

> **The project plan says "PrimeNG 17/18" — this is WRONG.**  
> PrimeNG **mirrors Angular's major version number** exactly.  
> Angular 19 → **PrimeNG 19.x** (latest: 19.1.4, released 2025-07-20).  
> Angular 21 is current; PrimeNG 21.1.6 is current master.  
> Using PrimeNG 17 with Angular 19 will cause peer dependency conflicts.

> **Angular 19 status:** LTS — released 2024-11-19, active support ended 2025-05-28, LTS ends 2026-05-19.  
> Angular 21 is the current release. The project targets v19 intentionally (preserved decision), which is fine for an internal app.

---

## Recommended Stack

| Library | Version | Purpose | Confidence |
|---------|---------|---------|-----------|
| `@angular/core` (et al.) | `^19.2.x` | Framework core, standalone, Signals | **HIGH** — official docs |
| `@angular/cli` | `^19.2.x` | Scaffolding, build pipeline (esbuild+Vite) | **HIGH** — official docs |
| `primeng` | `^19.1.4` | UI component library (Table, Drawer, Select, etc.) | **HIGH** — verified pkg |
| `@primeng/themes` | `^19.1.4` | Design token presets (Aura, Material, Lara, Nora) | **HIGH** — PrimeNG v19 docs |
| `@swimlane/ngx-charts` | `^23.1.0` | SVG charts (bar, line, pie, gauge, number cards) | **HIGH** — verified pkg; explicit Angular 18/19/20 support |
| `rxjs` | `^7.8.1` | Async/reactive streams; required by Angular + PrimeNG | **HIGH** — peer dep |
| `typescript` | `>=5.5.0 <5.9.0` | Type safety; Angular 19.2.x range | **HIGH** — official compat table |
| `zone.js` | `~0.15.0` | Change detection (required unless using zoneless) | **HIGH** — Angular standard |

### Supporting Libraries (install as needed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@angular/cdk` | `^19.0.0` | Overlay, A11y utilities; PrimeNG peer dep | Required by PrimeNG |
| `@angular/animations` | `^19.0.0` | PrimeNG animation support | Always — PrimeNG needs it |
| `primeicons` | `^7.0.0` | Icon set used by PrimeNG components | Always with PrimeNG |

### Dev-only

| Library | Version | Purpose |
|---------|---------|---------|
| `@angular/cli` | `^19.2.x` | CLI tooling |
| `@angular-devkit/build-angular` | `^19.x` | Build system wrapper |

---

## Angular 19 Key Features for This Project

### 1. Signals (Stable — use this for all state)
Angular's reactive primitive for fine-grained reactivity. Replaces `BehaviorSubject` patterns for local + shared state.

```typescript
// In FilterService
readonly filters = signal<FilterState>({
  sistemas: [],
  status: 'all',
  cnpj: '',
  lag: 0
});

readonly filteredPharmacies = computed(() =>
  this.allPharmacies().filter(p => applyFilters(p, this.filters()))
);
```

- `signal()` — writable reactive state
- `computed()` — memoized derived state (lazy, cached until dependencies change)
- `effect()` — side effects for non-reactive APIs (e.g., localStorage, DOM)
- `linkedSignal()` — writable state derived from other signals (new in v19)
- Use `asReadonly()` to expose public read-only views from services
- `untracked()` — read signal without creating dependency in effects
- **Use signals everywhere; avoid BehaviorSubject for new code**

### 2. Standalone Components (Default since Angular 19)
No NgModule required. Every component, directive, and pipe is standalone by default when generated with CLI.

```typescript
@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, PrimeNG components...],
  templateUrl: './filter-bar.component.html'
})
export class FilterBarComponent { }
```

- `ng new` in Angular 19 generates standalone by default
- Import PrimeNG components directly in the component's `imports` array
- `ApplicationConfig` + `bootstrapApplication()` replaces `AppModule`

### 3. `@defer` (Stable — use for charts section)
Declarative lazy loading for component subtrees. Reduces initial bundle size.

```html
<!-- Defer the heavy charts section until browser is idle -->
@defer (on viewport) {
  <app-charts-section [data]="filteredData()" />
} @placeholder {
  <div class="charts-skeleton">Loading charts...</div>
} @loading (minimum 200ms) {
  <p-progressbar mode="indeterminate" />
}
```

- `on idle` — default; loads when browser is idle (good for KPI cards off-screen)
- `on viewport` — loads when element enters viewport (good for charts section)
- `on interaction` — loads on first user click (good for detail drawer)
- **Use `@defer` for the charts section and detail drawer to improve initial load**
- Components inside `@defer` must be standalone

### 4. New Template Control Flow (`@if`, `@for`, `@switch`)
Replaces `*ngIf`, `*ngFor`, `*ngSwitch`. Stable since Angular 17, default in v19.

```html
@if (selectedPharmacy()) {
  <app-detail-drawer [pharmacy]="selectedPharmacy()!" />
}

@for (kpi of kpiCards(); track kpi.id) {
  <app-kpi-card [data]="kpi" />
} @empty {
  <p>No data</p>
}
```

- `@for` requires `track` — use `track item.id` for arrays of objects
- No need to import `NgFor`, `NgIf` — built into the template syntax

### 5. `input()` / `output()` Signal-based API (Stable in v19)
New way to declare component inputs and outputs using functions instead of decorators.

```typescript
// Instead of @Input() / @Output()
readonly pharmacy = input.required<Pharmacy>();
readonly selected = output<Pharmacy | null>();
```

- `input()` — optional input with default
- `input.required()` — required input (type-safe, no undefined)
- `output()` — replaces `EventEmitter`
- Inputs created this way are signals — read with `this.pharmacy()`

### 6. `inject()` Function (Preferred pattern)
Use `inject()` instead of constructor injection for cleaner code.

```typescript
@Injectable({ providedIn: 'root' })
export class FilterService {
  private readonly pharmacyService = inject(PharmacyService);
  // ...
}
```

### 7. esbuild + Vite Build System (Default since Angular 17)
Angular 19 uses `@angular/build:application` builder by default:
- **esbuild** for production bundling (fast, ESM output)
- **Vite** for development server (hot module replacement for styles + templates)
- Automatic HMR for component templates and styles (no full page reload)
- Build output goes to `dist/<project>/browser/`

---

## PrimeNG Setup

### Version Alignment (CRITICAL)
```
Angular 19 → PrimeNG 19.x (latest: 19.1.4)
Angular 20 → PrimeNG 20.x  
Angular 21 → PrimeNG 21.x (current)
```

### Installation

```bash
# In /angular-app directory
npm install primeng @primeng/themes primeicons @angular/cdk @angular/animations
```

### Provider Configuration (`app.config.ts`)

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark'  // CSS class toggled at <html> level
        }
      },
      ripple: true
    })
  ]
};
```

### Available Presets
- **Aura** — PrimeTek's own vision (recommended for new projects)
- **Material** — Google Material Design v2
- **Lara** — Bootstrap-inspired
- **Nora** — Enterprise/neutral styling

### Theming Architecture (Design Tokens — v19+)
PrimeNG v19 uses a 3-tier design token system (not old CSS file themes):
1. **Primitive tokens** — Color palettes (blue-50 to blue-950)
2. **Semantic tokens** — Contextual (primary.color, surface.700, etc.)
3. **Component tokens** — Per-component (button.background, table.header.background)

Customize via `definePreset()`:

```typescript
// mypreset.ts
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const DashboardPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      // ... map to any primitive color
      500: '{blue.500}',
      950: '{blue.950}'
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '{zinc.50}',
          900: '{zinc.900}',
          950: '{zinc.950}'
        }
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          900: '{slate.900}',
          950: '{slate.950}'
        }
      }
    }
  }
});
```

### Dark Mode Toggle (`ThemeService`)

```typescript
// theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(false);

  toggle() {
    this.isDark.update(v => !v);
    document.documentElement.classList.toggle('app-dark', this.isDark());
  }
}
```

The class `.app-dark` on `<html>` activates PrimeNG's dark color scheme automatically — no additional setup needed.

### Key PrimeNG Components for Dashboard

| Dashboard Feature | PrimeNG Component | Import Path |
|-------------------|-------------------|-------------|
| Main data table | `p-table` (p-dataTable) | `primeng/table` |
| Filter dropdowns | `p-select`, `p-multiselect` | `primeng/select`, `primeng/multiselect` |
| CNPJ text filter | `p-inputtext` + `p-iconfield` | `primeng/inputtext`, `primeng/iconfield` |
| Lag minimum slider | `p-slider` | `primeng/slider` |
| Detail drawer | `p-drawer` | `primeng/drawer` |
| KPI cards | `p-card` | `primeng/card` |
| Dark mode button | `p-togglebutton` or `p-button` | `primeng/togglebutton` |
| Header | `p-toolbar` | `primeng/toolbar` |
| Loading states | `p-skeleton`, `p-progressbar` | `primeng/skeleton` |
| Tags/badges | `p-tag`, `p-badge` | `primeng/tag` |

### Component Usage Pattern (Standalone)

```typescript
// filter-bar.component.ts
import { Component, inject } from '@angular/core';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { InputText } from 'primeng/inputtext';
import { FilterService } from '../services/filter.service';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [Select, MultiSelect, InputText],
  templateUrl: './filter-bar.component.html'
})
export class FilterBarComponent {
  readonly filterService = inject(FilterService);
}
```

---

## ngx-charts Setup

### Version
`@swimlane/ngx-charts@23.1.0` — explicitly supports Angular 18.x | 19.x | 20.x.

### Installation

```bash
npm install @swimlane/ngx-charts
```

### Peer Dependencies (auto-installed or already present)
- `@angular/cdk` — required (already installed for PrimeNG)
- `d3-*` packages — bundled as direct dependencies (not peer deps)

### Usage Pattern (Standalone Component)

```typescript
// charts-section.component.ts
import { Component, input, computed } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-charts-section',
  standalone: true,
  imports: [NgxChartsModule],
  template: `
    <ngx-charts-bar-vertical
      [results]="barChartData()"
      [xAxisLabel]="'Sistema'"
      [yAxisLabel]="'Total'"
      [showXAxisLabel]="true"
      [showYAxisLabel]="true"
      [scheme]="colorScheme"
    />
  `
})
export class ChartsSectionComponent {
  readonly pharmacies = input.required<Pharmacy[]>();
  readonly barChartData = computed(() => toBarChartData(this.pharmacies()));
  colorScheme = { domain: ['#3B82F6', '#10B981', '#F59E0B'] };
}
```

### Available Chart Types for Dashboard
| Use Case | Component |
|----------|-----------|
| Pharmacy counts by system | `ngx-charts-bar-vertical` or `ngx-charts-bar-horizontal` |
| Audit status distribution | `ngx-charts-pie-chart` or `ngx-charts-advanced-pie-chart` |
| Lag distribution | `ngx-charts-gauge` |
| KPI numbers | `ngx-charts-number-card` |
| Trend over time | `ngx-charts-line-chart` |

### Important Notes for ngx-charts

1. **Color scheme for dark mode**: ngx-charts does not auto-respond to PrimeNG's dark mode. You need to provide different color palettes via Signal-based scheme switching:

```typescript
readonly colorScheme = computed(() =>
  this.themeService.isDark()
    ? { domain: ['#60A5FA', '#34D399'] }  // dark palette
    : { domain: ['#3B82F6', '#10B981'] }  // light palette
);
```

2. **Responsive sizing**: Wrap charts in a container with `view="undefined"` to enable auto-sizing:
```html
<ngx-charts-bar-vertical
  [view]="undefined"
  [results]="data()"
  class="chart-container"
/>
```

3. **Data format**: ngx-charts expects `{ name: string, value: number }[]` — create a `computed()` signal that transforms your Pharmacy data.

4. **729 open GitHub issues** (as of April 2026): The library is mature but not actively maintained. For a 1:1 migration, it is the correct choice. If new features are needed post-migration, consider `ng2-charts` (Chart.js wrapper) as an alternative.

---

## Build & Tooling

### Angular CLI — Subfolder Setup

Since the Angular app lives in `/angular-app` as a subfolder of the existing React project:

```bash
# From the project root (Dashboard Auditoria/)
ng new angular-app --standalone --routing=false --style=scss --skip-git
cd angular-app
```

**Key flags:**
- `--standalone` — standalone components (default in v19, but explicit is clear)
- `--routing=false` — single-page dashboard, no router needed
- `--style=scss` — SCSS for theming support
- `--skip-git` — repo already exists at parent level

### Default Build System (Angular 19)
Angular 19 uses the `application` builder by default, powered by **esbuild + Vite**:

```json
// angular.json (auto-generated in v19)
{
  "architect": {
    "build": {
      "builder": "@angular/build:application",
      "options": {
        "browser": "src/main.ts",
        "outputPath": "dist/angular-app"
      }
    }
  }
}
```

**No webpack**. No manual Vite config needed. esbuild handles production bundling; Vite handles the dev server.

### Development Commands
```bash
ng serve          # Dev server at http://localhost:4200 (HMR enabled)
ng build          # Production build to dist/angular-app/browser/
ng build --watch  # Watch mode
```

### TypeScript Configuration
Angular 19 requires TypeScript `>=5.5.0 <5.9.0`.

```json
// tsconfig.json (generated by CLI)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"],
    "useDefineForClassFields": false,
    "experimentalDecorators": true,
    "strict": true,
    "strictPropertyInitialization": false,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "skipLibCheck": true,
    "esModuleInterop": true,        // Required for esbuild compatibility
    "moduleResolution": "bundler",  // Required for Angular 19 + esbuild
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["./src/*"]            // Optional: path alias
    }
  }
}
```

**Critical settings:**
- `"moduleResolution": "bundler"` — required for the new Angular build system
- `"esModuleInterop": true` — required by esbuild for ESM compliance (auto-set by `ng new`)
- `"strict": true` — recommended; Angular CLI sets this by default

### SCSS Setup for PrimeNG
PrimeNG v19 uses CSS variables (design tokens), not SCSS variables. However SCSS is still useful for component styles.

```scss
// src/styles.scss
@import 'primeicons/primeicons.css';

// PrimeNG v19 does NOT need a theme CSS import —
// themes are injected via providePrimeNG() in app.config.ts
// Just import the icons.
```

---

## What NOT to Use (and why)

| Don't Use | Why | Use Instead |
|-----------|-----|-------------|
| **NgModules** | Legacy pattern; standalone is the Angular 19 default | Standalone components with direct imports |
| **BehaviorSubject** for state | Verbose; Signals are cleaner and Angular-native | `signal()`, `computed()` |
| **`*ngIf` / `*ngFor`** | Deprecated template directives | `@if`, `@for`, `@switch` |
| **`@Input()` / `@Output()` decorators** | Old pattern; signal-based API is cleaner in v19 | `input()`, `output()` |
| **NgRx / Akita / NGXS** | Overkill for a single-page dashboard | Services + Signals (already decided) |
| **PrimeNG 17.x or 18.x with Angular 19** | Hard peer dep conflict; won't install cleanly | PrimeNG 19.x |
| **Old PrimeNG CSS theme files** (`lara-dark.css`, etc.) | Replaced entirely in v19 by design token system | `definePreset()` + `providePrimeNG()` |
| **`::ng-deep`** | Anti-pattern; breaks style encapsulation | PrimeNG's `[dt]` scoped token prop |
| **Angular Material** | Redundant with PrimeNG; different design language | PrimeNG only |
| **Chart.js / Recharts** | React library; not Angular-native | ngx-charts (already decided) |
| **Zone.js-free (zoneless) mode** | Still experimental in v19; adds complexity | Default zone.js mode |
| **Server-Side Rendering (SSR)** | Not needed for this internal dashboard | CSR only (already decided) |
| **Tailwind CSS alongside PrimeNG** | Increases complexity; PrimeNG's design token system covers all styling needs | PrimeNG theming only |

---

## Confidence Notes

| Area | Confidence | Source | Notes |
|------|-----------|--------|-------|
| Angular 19 version + features | **HIGH** | angular.dev official docs | Verified: v19.2.x, TypeScript ≥5.5 <5.9 |
| PrimeNG version alignment | **HIGH** | GitHub packages/primeng/package.json | PrimeNG 19.1.4 confirmed for Angular 19 |
| PrimeNG theming (design tokens) | **HIGH** | v19.primeng.org/theming | Full documentation verified |
| ngx-charts Angular 19 compatibility | **HIGH** | npmjs.com + GitHub package.json | v23.1.0 explicitly lists `"@angular/core": "18.x \|\| 19.x \|\| 20.x"` |
| esbuild/Vite as default build | **HIGH** | angular.dev/tools/cli/build-system-migration | Default since v17, confirmed default in v19 |
| TypeScript 5.5–5.8 range | **HIGH** | angular.dev/reference/versions | Exact range from official compat table |
| Signal APIs (input/output/linkedSignal) | **HIGH** | angular.dev/guide/signals | Stable in v19 |
| `@defer` blocks | **HIGH** | angular.dev/guide/templates/defer | Stable in v17+, fully documented |
| Angular 19 LTS status | **HIGH** | angular.dev/reference/releases | LTS ends 2026-05-19 — still valid today |
| ngx-charts dark mode behavior | **MEDIUM** | GitHub docs + known patterns | No auto dark mode; manual color scheme switching required |
| ngx-charts maintenance status | **MEDIUM** | GitHub issues count (729) | Active but not thriving; fine for migration scope |

---

## Key Decisions Implied by Research

1. **Use PrimeNG 19.x, NOT 17/18** — the plan's version numbers are wrong. PrimeNG versioning mirrors Angular.

2. **Use PrimeNG's design token theming** — no CSS file imports. Configure everything via `providePrimeNG()` in `app.config.ts`.

3. **Dark mode via CSS class toggle** — add `.app-dark` to `<html>`, both PrimeNG and custom CSS respond to it via `darkModeSelector: '.app-dark'`.

4. **ngx-charts dark mode is manual** — `ThemeService.isDark()` signal must feed chart color schemes explicitly.

5. **`ng new angular-app --skip-git`** — scaffolds inside the React project without creating nested git repo.

6. **Single `app.config.ts`** bootstraps everything — no `AppModule`. Angular 19 standalone-first architecture.

7. **Angular 19 is LTS until May 2026** — valid for this project scope. If the app will be maintained beyond May 2026, plan an upgrade to Angular 20+.

---

*Sources:*
- *https://angular.dev/reference/versions — Angular 19 compatibility table*
- *https://angular.dev/reference/releases — LTS schedule*
- *https://angular.dev/guide/signals — Signals documentation*
- *https://angular.dev/guide/templates/defer — Defer documentation*
- *https://angular.dev/tools/cli/build-system-migration — esbuild/Vite build system*
- *https://v19.primeng.org/theming — PrimeNG v19 theming documentation*
- *https://raw.githubusercontent.com/primefaces/primeng/19.1.4/packages/primeng/package.json — PrimeNG 19.1.4 peer deps*
- *https://raw.githubusercontent.com/swimlane/ngx-charts/master/projects/swimlane/ngx-charts/package.json — ngx-charts 23.1.0 peer deps*
