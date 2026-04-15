# Features Research — Angular 19 Dashboard

**Domain:** Pharmacy audit dashboard — React 18 → Angular 19 migration  
**Researched:** 2026-04-15  
**Overall confidence:** HIGH (all major findings verified via official sources)

---

## Version Anchors (Verified)

| Package | Version | Angular Target | Source |
|---------|---------|---------------|--------|
| `primeng` | **19.1.x** | Angular 19 (`^19.0.0` peer dep) | GitHub tag `19.1.4/packages/primeng/package.json` |
| `primeng` latest | 21.1.6 | Angular 21 | npmjs.com (April 2026) |
| `@swimlane/ngx-charts` | latest | Angular 2+ | github.com/swimlane/ngx-charts |
| Angular | 19.x | — | angular.dev v19 docs |

> ⚠️ **Critical decision**: Use `primeng@19.x` (LTS track confirmed at `19.1.5-lts`), NOT `primeng@21`. The v21 package targets Angular 21 and will cause peer dependency conflicts with Angular 19.

---

## Feature → Angular/PrimeNG Mapping

### 1. Filter Bar — Multi-Select Dropdowns

| Aspect | React approach | Angular approach | PrimeNG component |
|--------|---------------|-----------------|-------------------|
| Multi-select (Sistema, Status, Contrato) | Custom `MultiSelectDropdown` with `useState` + portal overlay | `p-multiselect` with `[(ngModel)]` or reactive forms | **`p-multiselect`** from `primeng/multiselect` |
| CNPJ search dropdown | Custom `CnpjSearchDropdown` with local filter `useState` | `p-autocomplete` with `[multiple]="true"` and `[suggestions]` | **`p-autocomplete`** from `primeng/autocomplete` |
| Numeric min-lag input | Native `<input type="number">` | `p-inputnumber` with `[min]="0"` | **`p-inputnumber`** from `primeng/inputnumber` |
| Association code multi-select | Custom dropdown with checkbox list | `p-multiselect` with `[options]` array | **`p-multiselect`** |
| Apply/Clear buttons | Custom styled buttons | `p-button` | **`p-button`** from `primeng/button` |
| Filter container layout | Flex div with inline styles | Template with CSS or PrimeNG `p-toolbar` | Layout div or `p-toolbar` |

**Complexity:** Medium  
**Key difference:** The React code builds all dropdowns from scratch (279 lines just for `MultiSelectDropdown` + `CnpjSearchDropdown`). PrimeNG's `p-multiselect` replaces the entire custom dropdown implementation including the overlay portal, checkbox list, "select all" toggle, and keyboard navigation.

**Angular pattern:**
```typescript
// filter.service.ts
@Injectable({ providedIn: 'root' })
export class FilterService {
  private readonly _filters = signal<Filters>({
    systems: [...ALL_SYSTEMS],
    statuses: [...ALL_STATUSES],
    cnpjs: [],
    associationCodes: [],
    contractStatuses: [...ALL_CONTRACT_STATUSES],
    minLag: 0,
  });
  
  readonly filters = this._filters.asReadonly();
  
  apply(filters: Filters) { this._filters.set(filters); }
  reset() { this._filters.set(DEFAULT_FILTERS); }
}

// filter-bar.component.html
<p-multiselect 
  [(ngModel)]="pendingSystems"
  [options]="ALL_SYSTEMS"
  placeholder="Sistema: Todos"
  [showToggleAll]="true" />
  
<p-inputnumber 
  [(ngModel)]="minLag"
  [min]="0"
  placeholder="Atraso mín." />

<p-button label="Aplicar" (onClick)="onApply()" />
<p-button label="Limpar" [outlined]="true" (onClick)="onClear()" />
```

---

### 2. KPI Cards — Aggregated Computed Values

| Aspect | React approach | Angular approach |
|--------|---------------|-----------------|
| Status counts | `data.forEach(p => counts[p.status]++)` inside render | `computed(() => computeKPIs(this.filterService.filteredData()))` |
| Percentage per status | Inline calculation `Math.round((counts[s] / total) * 100)` | Same logic inside `computed()` |
| Reactivity | Re-runs on every render (data prop change) | Automatically re-runs only when `filteredData` signal changes |
| Mini donut chart | SVG drawn manually with trig math (80 lines) | Keep as custom SVG, or use `ngx-charts` `PieChartModule` |

**Complexity:** Low  
**Key difference:** Replace React's `useMemo` on prop with Angular `computed()` signal in a service. The KPI calculations are pure math — identical logic, different wrapper.

**Angular Signals pattern:**
```typescript
// dashboard.service.ts
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly pharmacyService = inject(PharmacyService);
  private readonly filterService = inject(FilterService);
  
  // filteredData recomputes automatically when filters signal changes
  readonly filteredData = computed(() => {
    const pharmacies = this.pharmacyService.pharmacies(); // signal
    const filters = this.filterService.filters();         // signal
    return pharmacies.filter(p => applyFilters(p, filters));
  });
  
  // KPI counters — cascade-computed from filteredData
  readonly kpiCounts = computed(() => {
    const data = this.filteredData();
    return data.reduce(
      (acc, p) => { acc[p.status]++; return acc; },
      { em_dia: 0, atraso_leve: 0, atraso_critico: 0, sem_dados: 0 }
    );
  });
  
  readonly kpiTotal = computed(() => this.filteredData().length);
  
  readonly kpiPercentages = computed(() => {
    const counts = this.kpiCounts();
    const total = this.kpiTotal();
    return Object.fromEntries(
      Object.entries(counts).map(([k, v]) => [k, total > 0 ? Math.round((v / total) * 100) : 0])
    );
  });
}
```

**Template consumption:**
```typescript
// kpi-cards.component.ts
@Component({ ... changeDetection: ChangeDetectionStrategy.OnPush })
export class KpiCardsComponent {
  protected readonly dash = inject(DashboardService);
  // Use: this.dash.kpiCounts(), this.dash.kpiTotal(), this.dash.kpiPercentages()
}
```

> **Note on MiniDonut:** The React custom SVG donut is 70 lines of trig math. Recommendation: **port the SVG directly** — it's pure SVG with no library dependency. Alternatively, use ngx-charts `PieChartModule` with `[legend]="false"` and custom sizing, but porting the SVG is simpler and avoids the ngx-charts wrapper overhead for a tiny decorative graphic.

---

### 3. Charts Section — Bar + Gauge Charts

| Aspect | React approach | Angular approach | ngx-charts component |
|--------|---------------|-----------------|---------------------|
| Horizontal bar chart (top 10 lag) | 180-line custom SVG bar chart with hover state | `ngx-horizontal-bar-chart` | **`HorizontalBarChartModule`** |
| Gauge (coverage %) | 180-line custom SVG semi-circle gauge with needle | `ngx-gauge-chart` or keep custom SVG | **`GaugeChartModule`** or custom SVG |
| Data format | `{ name, cnpj, lag }[]` | `{ name: string, value: number }[]` | Transform in service |
| Custom colors | `getLagColor(lag)` per bar | `customColors` input function | Verified in ngx-charts docs |
| Responsive | `flex: 1 1 300px` | `[view]="undefined"` fills parent | Confirmed: omit `view` for auto-size |

**ngx-charts HorizontalBarChart data format:**
```typescript
// Verified from ngx-charts official docs
barChartData = computed(() => 
  this.dash.filteredData()
    .filter(p => p.daysLag !== null)
    .sort((a, b) => (b.daysLag ?? 0) - (a.daysLag ?? 0))
    .slice(0, 10)
    .map(p => ({ name: `${p.name} #${p.storeNumber}`, value: p.daysLag ?? 0 }))
);

customColors = (name: string) => getLagColor(...);
```

**Template:**
```html
<ngx-charts-bar-horizontal
  [results]="barChartData()"
  [xAxis]="true"
  [yAxis]="true"
  [showGridLines]="false"
  [customColors]="customColors"
  [animations]="false"
  [showDataLabel]="true">
</ngx-charts-bar-horizontal>
```

**Gauge recommendation:** The React gauge is a highly custom semi-circle SVG with a needle (not a standard chart). **Port the SVG directly** into an Angular component template — same approach works identically. ngx-charts `GaugeChartModule` renders a different style (radial dial, not semi-circle) and would look different. Keep the custom SVG for 1:1 fidelity.

**Complexity:** Medium  
**Ngx-charts note (MEDIUM confidence):** ngx-charts has 729 open GitHub issues and last release history suggests infrequent maintenance. It works for Angular 19 (it's Angular-native SVG), but the custom SVG charts may be easier to maintain than ngx-charts for these two specific chart types.

---

### 4. Data Table with Row Selection

| Aspect | React approach | Angular approach | PrimeNG component |
|--------|---------------|-----------------|-------------------|
| Sortable columns | Custom `useMemo` sort + `SortIcon` component | `[pSortableColumn]` directive | **`TableModule`** from `primeng/table` |
| Pagination | Manual `page`, `pageSize` state | `[paginator]="true"` attribute | Built into `p-table` |
| Row selection | `onClick → onSelectPharmacy(pharmacy)` | `selectionMode="single"` + `(onRowSelect)` | `p-table` selection API |
| Page size selector | Native `<select>` | `[rowsPerPageOptions]="[10,25,50]"` | Built into `p-table` paginator |
| Status badge cell | Custom inline `<div>` with `info.bg`, `info.color` | `<p-tag>` or custom cell template | **`p-tag`** from `primeng/tag` |
| System/contract badges | Custom `<span>` with `SYSTEM_COLORS` | `<p-badge>` or `<p-tag>` with `[style]` | **`p-tag`** |
| Colored left border (critical rows) | `borderLeft: isCritico ? '3px solid #DC2626' : ...` | `[ngClass]` or `[style]` on `<tr>` via `rowStyleClass` | `[rowStyleClass]` input on `p-table` |
| Mobile card layout | CSS class toggle `table-desktop/table-mobile` | `@media` query + `@if` blocks | Same CSS approach |
| Filter bar inside table | `FilterBar` component rendered in table header | Separate `app-filter-bar` component in table header section | Same composition pattern |

**Complexity:** Low-Medium  
**Key simplification:** PrimeNG Table handles sorting, pagination, and selection — what took ~300 lines of React manual implementation becomes ~50 lines of declarative Angular template.

**PrimeNG Table pattern:**
```typescript
// main-table.component.ts
@Component({ ... changeDetection: ChangeDetectionStrategy.OnPush })
export class MainTableComponent {
  protected readonly dash = inject(DashboardService);
  selectedPharmacy = signal<Pharmacy | null>(null);
  
  onRowSelect(event: TableRowSelectEvent) {
    this.selectedPharmacy.set(event.data);
  }
}
```

```html
<!-- main-table.component.html -->
<p-table
  [value]="dash.filteredData()"
  [paginator]="true"
  [rows]="10"
  [rowsPerPageOptions]="[10, 25, 50]"
  selectionMode="single"
  [(selection)]="selectedPharmacy"
  (onRowSelect)="onRowSelect($event)"
  [sortMode]="'single'"
  [defaultSortOrder]="-1"
  [rowStyleClass]="getRowStyleClass">
  
  <ng-template pTemplate="header">
    <tr>
      <th pSortableColumn="status">Status <p-sortIcon field="status" /></th>
      <th pSortableColumn="cnpj">CNPJ <p-sortIcon field="cnpj" /></th>
      <th pSortableColumn="daysLag">Dias Atraso <p-sortIcon field="daysLag" /></th>
      <!-- ... more columns -->
    </tr>
  </ng-template>
  
  <ng-template pTemplate="body" let-pharmacy>
    <tr [pSelectableRow]="pharmacy">
      <td>
        <p-tag [value]="STATUS_LABELS[pharmacy.status]" 
               [style]="getStatusStyle(pharmacy.status)" />
      </td>
      <td class="font-mono">{{ pharmacy.cnpj }}</td>
      <!-- ... -->
    </tr>
  </ng-template>
</p-table>
```

---

### 5. Side Drawer / Detail Panel

| Aspect | React approach | Angular approach | PrimeNG component |
|--------|---------------|-----------------|-------------------|
| Overlay backdrop | Custom `position: fixed, inset: 0` div | Built-in modal mask | **`p-drawer`** from `primeng/drawer` |
| Slide-in panel | Custom `position: fixed, right: 0, top: 0, bottom: 0` div | `position="right"` attribute | `p-drawer` with `position="right"` |
| Close on backdrop click | Manual `onClick={onClose}` on overlay div | Built-in via `[modal]="true"` | `p-drawer` (confirmed active in v21 CHANGELOG with fix for outside click) |
| Width | `width: min(680px, 100vw)` | `[style]="{ width: 'min(680px, 100vw)' }"` | Style input on `p-drawer` |
| Trigger | `selectedPharmacy && <DetailDrawer ...>` | `[visible]="selectedPharmacy() !== null"` signal | `p-drawer` `[(visible)]` binding |
| Line chart inside drawer | Recharts `<LineChart>` | `ngx-charts-line-chart` | **`LineChartModule`** from ngx-charts |
| Day data table | Custom `<table>` | `p-table` or custom `<table>` | Either works |

**Complexity:** Low  
**Key simplification:** `p-drawer` replaces 50+ lines of manual overlay/drawer CSS positioning. Angular `[(visible)]` binding paired with a `signal()` replaces conditional rendering.

**Important PrimeNG v19 component name:** In PrimeNG 17, this was `p-sidebar`. It was **renamed to `p-drawer`** in PrimeNG 18+. Use `p-drawer` and import `DrawerModule` from `primeng/drawer`.

**Angular pattern:**
```typescript
// app.component.ts
selectedPharmacy = signal<Pharmacy | null>(null);
drawerVisible = computed(() => this.selectedPharmacy() !== null);

onRowSelect(pharmacy: Pharmacy) {
  this.selectedPharmacy.set(pharmacy);
}
closeDrawer() {
  this.selectedPharmacy.set(null);
}
```

```html
<!-- app.component.html -->
<p-drawer 
  [(visible)]="drawerVisible" 
  position="right"
  [style]="{ width: 'min(680px, 100vw)' }"
  [modal]="true"
  (onHide)="closeDrawer()">
  
  @if (selectedPharmacy()) {
    <app-detail-drawer [pharmacy]="selectedPharmacy()!" />
  }
</p-drawer>
```

> **Note:** `drawerVisible` is a `computed()` (read-only). For two-way binding `[(visible)]`, use a `WritableSignal<boolean>` instead and update it from `onRowSelect`/`closeDrawer` methods.

---

### 6. Dark/Light Mode Toggle

| Aspect | React approach | Angular approach |
|--------|---------------|-----------------|
| State | `useState(false)` in `App.tsx` | `signal(false)` in `ThemeService` |
| Theme object | `isDarkMode ? darkTheme : lightTheme` — typed `Theme` object | CSS custom properties + `document.documentElement.classList.toggle('dark-mode')` |
| Prop drilling | `theme: Theme` passed to every component | **No prop drilling** — components read CSS variables directly |
| PrimeNG theming | N/A | PrimeNG v19 uses design tokens via `PrimeNGConfig` + CSS variables |
| Toggle in header | `<Moon>` / `<Sun>` icon button | `p-button` with Lucide or PrimeIcons |

**Angular best practice — use CSS variables, not prop drilling:**

```typescript
// theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(false);
  
  toggle() {
    this.isDark.update(v => !v);
    document.documentElement.classList.toggle('dark-mode', this.isDark());
  }
}
```

```css
/* styles.css */
:root {
  --bg-main: #F0F4F8;
  --bg-card: #FFFFFF;
  --bg-header: #0E3D6E;
  --text-primary: #1A2B3C;
  --text-secondary: #4A5568;
  --text-tertiary: #718096;
  --border-main: #E2E8F0;
  /* ... */
}

:root.dark-mode {
  --bg-main: #0F172A;
  --bg-card: #1E293B;
  --bg-header: #1E3A5F;
  --text-primary: #E2E8F0;
  --text-secondary: #94A3B8;
  --text-tertiary: #64748B;
  --border-main: #334155;
  /* ... */
}
```

**This eliminates the entire `theme: Theme` prop-drilling chain** — the React app's most pervasive architectural smell. Every Angular component just uses CSS variables naturally via styles.

**PrimeNG dark mode (confirmed HIGH confidence):** PrimeNG v19 supports dark mode via its design token system. To apply dark mode to PrimeNG components themselves, toggle the `p-dark` class on the `<html>` element: `document.documentElement.classList.toggle('p-dark', isDark)`.

---

### 7. Reactive Filter State — Angular Signals Service Pattern

**This is the most architecturally important feature of the migration.**

The React app has all state in `App.tsx` with `useState` + `useMemo`, with data flowing down as props to every component. Angular replaces this with injectable services + signals — no prop drilling.

**Complete filter state pattern:**

```typescript
// filter.service.ts
export interface Filters {
  systems: System[];
  statuses: Status[];
  cnpjs: string[];
  associationCodes: string[];
  contractStatuses: ContractStatus[];
  minLag: number;
}

const DEFAULT_FILTERS: Filters = {
  systems: [...ALL_SYSTEMS],
  statuses: [...ALL_STATUSES],
  cnpjs: [],
  associationCodes: [],
  contractStatuses: [...ALL_CONTRACT_STATUSES],
  minLag: 0,
};

@Injectable({ providedIn: 'root' })
export class FilterService {
  private readonly _filters = signal<Filters>(DEFAULT_FILTERS);
  readonly filters = this._filters.asReadonly();
  
  apply(filters: Filters): void { this._filters.set({ ...filters }); }
  reset(): void { this._filters.set(DEFAULT_FILTERS); }
}

// pharmacy.service.ts
@Injectable({ providedIn: 'root' })
export class PharmacyService {
  readonly pharmacies = signal<Pharmacy[]>(mockPharmacies);
}

// dashboard.service.ts
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly pharmacy = inject(PharmacyService);
  private readonly filter = inject(FilterService);
  
  // The central derived state — replaces App.tsx's useMemo
  readonly filteredData = computed(() => {
    const all = this.pharmacy.pharmacies();
    const f = this.filter.filters();
    
    return all.filter(p => {
      if (!f.systems.includes(p.system)) return false;
      if (!f.statuses.includes(p.status)) return false;
      if (f.cnpjs.length > 0 && !f.cnpjs.includes(p.cnpj)) return false;
      if (f.associationCodes.length > 0 && !f.associationCodes.includes(p.associationCode)) return false;
      if (!f.contractStatuses.includes(p.contractStatus)) return false;
      if (f.minLag > 0) {
        if (p.daysLag === null || p.daysLag < f.minLag) return false;
      }
      return true;
    });
  });
  
  // KPI computeds cascade from filteredData
  readonly kpiCounts = computed(() => {
    const data = this.filteredData();
    const counts = { em_dia: 0, atraso_leve: 0, atraso_critico: 0, sem_dados: 0 };
    data.forEach(p => counts[p.status]++);
    return counts;
  });
  
  readonly kpiTotal = computed(() => this.filteredData().length);
  readonly coverage = computed(() => this.kpiTotal() - this.kpiCounts().sem_dados);
  
  // Chart data — top 10 most delayed
  readonly topDelayedChartData = computed(() =>
    this.filteredData()
      .filter(p => p.daysLag !== null)
      .sort((a, b) => (b.daysLag ?? 0) - (a.daysLag ?? 0))
      .slice(0, 10)
      .map(p => ({ name: `${p.name} #${p.storeNumber}`, value: p.daysLag ?? 0 }))
  );
}
```

**Selected pharmacy state:**
```typescript
// selection.service.ts (or co-located in DashboardService)
@Injectable({ providedIn: 'root' })
export class SelectionService {
  readonly selectedPharmacy = signal<Pharmacy | null>(null);
  
  select(pharmacy: Pharmacy): void { this.selectedPharmacy.set(pharmacy); }
  clear(): void { this.selectedPharmacy.set(null); }
}
```

**FilterBar local pending state pattern** (mirrors React's "apply on button click" pattern):
```typescript
// filter-bar.component.ts
export class FilterBarComponent {
  private readonly filterService = inject(FilterService);
  
  // Local pending state — not committed until "Aplicar" is clicked
  pendingSystems = signal<System[]>([...ALL_SYSTEMS]);
  pendingStatuses = signal<Status[]>([...ALL_STATUSES]);
  pendingCnpjs = signal<string[]>([]);
  pendingAssociations = signal<string[]>([]);
  pendingContractStatuses = signal<ContractStatus[]>([...ALL_CONTRACT_STATUSES]);
  pendingMinLag = signal<number>(0);
  
  apply() {
    this.filterService.apply({
      systems: this.pendingSystems(),
      statuses: this.pendingStatuses(),
      cnpjs: this.pendingCnpjs(),
      associationCodes: this.pendingAssociations(),
      contractStatuses: this.pendingContractStatuses(),
      minLag: this.pendingMinLag(),
    });
  }
  
  reset() {
    this.pendingSystems.set([...ALL_SYSTEMS]);
    // ... reset all pending signals
    this.filterService.reset();
  }
}
```

---

## Angular Signals Patterns for Dashboard State

### Signal Dependency Graph

```
PharmacyService.pharmacies (signal)
        ↓
FilterService.filters (signal)
        ↓
DashboardService.filteredData (computed)
    ↙         ↓          ↘
kpiCounts  topDelayedChartData  coverage
    ↓
kpiPercentages
```

### Key Signal Rules for This Dashboard

1. **`signal()` for mutable state** — filters, selectedPharmacy, isDarkMode, pendingFilter values in FilterBar
2. **`computed()` for derived state** — filteredData, kpiCounts, percentages, chartData, drawerVisible
3. **`asReadonly()`** — expose public API of services without allowing external mutation
4. **`ChangeDetectionStrategy.OnPush`** — use on ALL dashboard components; signals automatically mark OnPush components for re-render
5. **No `effect()` needed** — pure data transformation in this dashboard; effects are only for side effects (e.g., localStorage persistence if added later)

### Anti-pattern to avoid: `effect()` for derived data
```typescript
// ❌ WRONG — Don't use effect() to compute derived values
effect(() => {
  this.kpiCounts = computeCounts(this.filteredData()); // imperative mutation
});

// ✅ CORRECT — Use computed() for derived values
readonly kpiCounts = computed(() => computeCounts(this.filteredData()));
```

---

## Table Stakes Features (must work or users notice)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| All 6 filter types working together | Core functionality — filters drive everything | Medium | p-multiselect × 3, p-autocomplete for CNPJ, p-inputnumber for lag |
| Apply/Clear filter cycle | Without "clear", users get stuck on filtered views | Low | Reset all signal state |
| Sortable table columns | 70 pharmacies — users need to sort by lag, status, name | Low | `pSortableColumn` directive handles this |
| Pagination (10/25/50) | 70 rows visible at once is too many | Low | Built into PrimeNG `p-table` |
| Row click → drawer opens | Primary navigation pattern | Low | `(onRowSelect)` + `p-drawer` |
| Dark/light mode persists across filter changes | If theme resets on filter change, it's jarring | Low | ThemeService is independent signal |
| KPI cards update on filter change | Core reactivity proof — users expect instant feedback | Medium | `computed()` chain from `filteredData` |
| Status badges visible in table rows | Color-coded status is the primary data signal | Low | `p-tag` with `[style]` or custom cell template |
| Drawer closes on overlay click | Standard UX expectation | Low | `p-drawer [modal]="true"` (confirmed in PrimeNG changelog) |

---

## Differentiators (nice to have, improve on React original)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Instant filter application (no "Aplicar" button) | React requires explicit apply — Angular can filter reactively as dropdowns change | Low | Change FilterBar to update service directly on each dropdown change; skip pending state pattern |
| Filter state badge on header | Show active filter count in header | Low | `computed()` counting non-default filter values |
| Animated drawer open/close | React drawer has no animation — PrimeNG has built-in | Low | PrimeNG `p-drawer` has animation by default |
| Table row hover highlight via PrimeNG | React uses manual `onMouseEnter/Leave` with inline style mutation — fragile | Low | PrimeNG handles hover via CSS classes |
| Keyboard navigation in dropdowns | React custom dropdowns have no keyboard support | Low | p-multiselect has full keyboard/a11y support |
| Responsive PrimeNG table | React uses CSS class toggle + separate mobile card layout (~100 lines) | Medium | PrimeNG Table can be configured to stack on mobile |

---

## Anti-Features (deliberately skip)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| NgRx or other state library | Massive overkill for 3 signals + derived data | Services + Signals (already decided) |
| Angular Router with multiple routes | The original is single-page, no routes needed | Single `AppComponent` as root — no routing |
| NgModules for feature organization | Deprecated in favor of standalone components | All components standalone with `imports: [...]` |
| Recharts / Chart.js / D3 direct | Breaks "one framework touches DOM" principle in Angular | ngx-charts (Angular-native SVG) or custom SVG |
| RxJS Observables for filter state | Adds complexity without benefit vs. Signals for this scope | Angular Signals only |
| SSR / Angular Universal | Out of scope explicitly in PROJECT.md | SPA only |
| `async pipe` for derived data | Unnecessary when Signals handle reactivity synchronously | Signals + `computed()` |
| PrimeNG NgModule imports (legacy) | Removed in newer PrimeNG versions; prefer standalone imports | Import each component individually: `import { MultiSelectModule } from 'primeng/multiselect'` |
| Theme object prop-drilling (React pattern) | Every Angular component would need a `[theme]` input — defeats DI | CSS custom properties toggled by ThemeService |

---

## Implementation Notes by Component

### `PharmacyService`
```typescript
// Wraps mockData as a signal-based service
// No API calls — just exposes mockPharmacies as a signal
readonly pharmacies = signal<Pharmacy[]>(mockPharmacies);
```

### `FilterBarComponent`
- Import: `MultiSelectModule`, `InputNumberModule`, `ButtonModule`, `FormsModule`
- Local `signal()` per filter field (pending state, not committed to service until "Aplicar")
- Emits via `FilterService.apply()` — no `@Output()` needed

### `KpiCardsComponent`
- Import: nothing extra — pure template + `DashboardService` injection
- Keep the custom SVG donut chart (port directly, ~60 lines)
- Use `ChangeDetectionStrategy.OnPush` — signals handle invalidation automatically
- Progress bars and percentage badges: pure CSS, no PrimeNG component needed

### `ChartsSectionComponent`
- Import: `NgxChartsModule` from `@swimlane/ngx-charts`
- HorizontalBarChart: use `ngx-charts-bar-horizontal` with `customColors` function
- GaugeChart: **keep as custom SVG** — ngx-charts gauge looks different; port the React SVG directly
- Both charts use `filteredData()` from `DashboardService`

### `MainTableComponent`
- Import: `TableModule`, `TagModule`, `ButtonModule` from primeng
- Also import `FilterBarComponent` (standalone) for inline composition
- `pSortableColumn` replaces custom sort icons and `useMemo` sort logic
- Status badge cell: custom `<ng-template>` with color mapping from constants

### `DetailDrawerComponent`
- Import: `DrawerModule` from `primeng/drawer`
- Line chart in drawer: use `ngx-charts-line-chart` (replaces Recharts `<LineChart>`)
- Day data table: use `p-table` or plain HTML `<table>` — plain is fine for this secondary table
- `generateAuditHistory()` and `generateDayData()` — port directly from mockData.ts (pure functions, no changes needed)

### `HeaderComponent`
- Import: `ButtonModule` from primeng (for dark mode toggle button)
- Dark mode toggle: calls `ThemeService.toggle()`
- "Exportar Excel" and "Atualizar Dados" buttons: visual only (no functionality in scope)

---

## Installation Summary

```bash
# Core Angular project in /angular-app
ng new angular-app --standalone --style=scss

# PrimeNG for Angular 19 — use v19.x, NOT v21
npm install primeng@19

# PrimeNG icons
npm install primeicons

# ngx-charts for Angular charts
npm install @swimlane/ngx-charts

# Lucide icons (optional — PrimeIcons covers most; keep Lucide for exact icon parity)
npm install lucide-angular
```

**angular.json — add PrimeNG styles:**
```json
"styles": [
  "src/styles.scss",
  "node_modules/primeng/resources/themes/lara-light-blue/theme.css",
  "node_modules/primeng/resources/primeng.min.css",
  "node_modules/primeicons/primeicons.css"
]
```

**⚠️ Version warning (HIGH confidence):** Installing `primeng` without a version tag will get `v21.x` which requires Angular 21. Always pin: `npm install primeng@19`.

---

## Sources

| Source | URL | Confidence |
|--------|-----|-----------|
| Angular Signals official docs | https://angular.dev/guide/signals | HIGH |
| Angular 19 version | https://angular.dev (v21 docs) | HIGH |
| PrimeNG v19.1.4 package.json (Angular 19 peer deps) | https://raw.githubusercontent.com/primefaces/primeng/refs/tags/19.1.4/packages/primeng/package.json | HIGH |
| PrimeNG latest version (21.1.6) | https://www.npmjs.com/package/primeng | HIGH |
| PrimeNG CHANGELOG — Drawer component exists and is maintained | https://github.com/primefaces/primeng/blob/master/CHANGELOG.md | HIGH |
| ngx-charts feature list, data formats | https://swimlane.gitbook.io/ngx-charts/llms-full.txt | HIGH |
| ngx-charts GitHub (4.4k stars, active) | https://github.com/swimlane/ngx-charts | MEDIUM |
| React source — App.tsx, FilterBar.tsx, KPICards.tsx, etc. | Local project files | HIGH |
