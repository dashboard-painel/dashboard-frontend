# Pitfalls Research — React→Angular Migration

**Project:** Dashboard Auditoria (Pharmacy Audit Dashboard)
**Researched:** 2026-04-15
**Overall confidence:** HIGH (verified against official angular.dev docs + ngx-charts official docs)

---

## Critical Pitfalls (will block the project if ignored)

These will cause the migration to fail, produce invisible bugs, or require full rewrites of entire sections.

---

### CRITICAL-1: Mutating Signal Values Instead of Replacing Them

**What goes wrong:**
Coming from React's `useState`, developers mutate signal values directly instead of calling `.set()` or `.update()`. Angular Signals use `Object.is()` (referential equality) by default — mutating an array or object in place means the signal never sees a change, Angular never re-renders, and the UI silently freezes.

**React pattern (do NOT port this):**
```typescript
// React — works fine
const [items, setItems] = useState([...]);
items.push(newItem); // then call setItems([...items])
```

**Angular wrong approach:**
```typescript
const items = signal<Pharmacy[]>([]);
items().push(newPharmacy); // SILENT BUG — Angular sees no change
```

**Correct Angular approach:**
```typescript
// Always replace the reference
items.update(current => [...current, newPharmacy]);
// Or for filtering:
filteredItems.set(allItems().filter(p => p.status === 'em_dia'));
```

**Why it happens:** React's model lets you call the setter with any value and it always triggers a re-render. Angular Signals compare old vs new reference — same reference = no update.

**Warning signs:** State updates don't reflect in the UI; table doesn't re-filter after signal update; KPI cards don't update.

**Phase to address:** Phase 1 (services setup) — establish Signal mutation discipline before writing any component.

---

### CRITICAL-2: Reading Signals Outside Reactive Contexts (Async Boundary Loss)

**What goes wrong:**
Signal reads after an `await` inside an `effect()` or `computed()` are **not tracked**. The reactive context is broken at the async boundary. Any signal read after `await` creates no dependency — changes to that signal will not re-run the effect.

**Wrong:**
```typescript
effect(async () => {
  const data = await fetchData();
  console.log(this.filterSignal()); // NOT tracked — filterSignal changes won't re-run this
});
```

**Correct:**
```typescript
effect(async () => {
  const filters = this.filterSignal(); // Read BEFORE await
  const data = await fetchData(filters);
  console.log(data);
});
```

**Why it happens:** Developers from React think of `useEffect` which doesn't have this constraint (it runs the full function on dep change). Angular's reactive context is synchronous only.

**Relevant to this project:** `FilterService` will use `computed()` for `filteredData`. If any async behavior (e.g., future API calls) is added later, this trap is guaranteed to hit.

**Phase to address:** Phase 1 when building FilterService; flag again in any future async migration.

---

### CRITICAL-3: Not Using `track` in `@for` Loops — Performance Collapse

**What goes wrong:**
Angular 17+ uses `@for` with a mandatory `track` expression. React's `.map()` with a `key` prop is optional (just a warning). In Angular, missing or wrong `track` causes the entire list to be destroyed and recreated on every change — catastrophic for the pharmacy table with 70 rows.

**Wrong:**
```html
<!-- NO track expression — will not compile or will destroy/recreate all DOM -->
@for (pharmacy of filteredPharmacies(); track pharmacy) {
  <tr>...</tr>
}
```

**Note:** Using the entire object as track key (`track pharmacy`) is allowed but means Angular can't map items to DOM nodes efficiently. For the pharmacy table, use the unique `id`:

**Correct:**
```html
@for (pharmacy of filteredPharmacies(); track pharmacy.id) {
  <tr>...</tr>
}
```

**Why it happens:** React developers are accustomed to `key` being optional/just-a-warning. In Angular, `@for` without `track` won't compile in strict templates.

**Warning signs:** Build errors about missing track, or visible re-render flash on every filter change.

**Phase to address:** Phase 3 (MainTable component) — enforce `track pharmacy.id` from the start.

---

### CRITICAL-4: Inline Styles for Theming — Won't Work with PrimeNG

**What goes wrong:**
The React original implements theming via a `Theme` TypeScript object prop-drilled through every component (`theme.bg.main`, `theme.text.primary`, etc.) applied as inline `style` objects. Replicating this pattern in Angular will:
1. Conflict with PrimeNG's own CSS variable system
2. Override PrimeNG component styles inconsistently (PrimeNG uses its own `--p-*` CSS variables)
3. Create the same dual-system fragility that exists in the React codebase (already documented in CONCERNS.md)
4. Not work with Angular's view encapsulation — inline styles bypass it entirely

**Correct Angular approach:**
Use CSS custom properties (CSS variables) + a class toggle on `document.documentElement`:
```typescript
// ThemeService
setDarkMode(isDark: boolean) {
  document.documentElement.classList.toggle('dark-theme', isDark);
}
```
```css
/* global styles.css */
:root { --dashboard-bg: #ffffff; --dashboard-text: #1a1a1a; }
:root.dark-theme { --dashboard-bg: #0F1419; --dashboard-text: #e1e1e1; }
```

PrimeNG dark mode is controlled separately via its `PrimeNGConfig` or by adding the `dark` class — must be coordinated with custom theme variables.

**Warning signs:** PrimeNG Table rows appear light-themed even when dashboard is dark; custom card backgrounds don't switch; `::ng-deep` proliferates trying to override PrimeNG.

**Phase to address:** Phase 1 (ThemeService) — this architectural decision must be made before building any component.

---

### CRITICAL-5: Forgetting to Import Dependencies in Standalone Components

**What goes wrong:**
Angular 19 uses standalone components by default. Every component must explicitly import every Angular directive, pipe, and library module it uses. Coming from React where imports are just JS imports that "just work," developers forget to add items to the `imports: []` array of the `@Component` decorator.

**Common forgotten imports for this project:**
```typescript
@Component({
  standalone: true,
  imports: [
    CommonModule,        // or NgIf, NgFor (not needed with @if/@for control flow)
    FormsModule,         // for [(ngModel)]
    ReactiveFormsModule, // for FormControl / FormGroup
    TableModule,         // PrimeNG
    DropdownModule,      // PrimeNG
    NgxChartsModule,     // ngx-charts
    RouterModule,        // if router-outlet or routerLink used
  ]
})
```

**Error you will see:**
```
NG8001: 'p-table' is not a known element
NG8002: Can't bind to 'columns' since it isn't a known property of 'p-table'
```

**Why it happens:** React components can use anything imported at the JS module level. Angular components live in a separate module/DI/template compiler world.

**Warning signs:** Build errors `is not a known element`, inputs and outputs silently ignored, directives not recognized.

**Phase to address:** Every phase — establish the pattern in Phase 1 scaffold and never skip it.

---

### CRITICAL-6: ngx-charts Data Format ≠ Recharts Data Format

**What goes wrong:**
Recharts and ngx-charts use fundamentally different data shapes. Porting chart data from the React app will fail silently — ngx-charts renders nothing or renders wrong data without errors.

**Recharts (React source) — typical pie chart:**
```typescript
// Recharts format
[{ name: 'em_dia', value: 45 }, { name: 'atraso_leve', value: 12 }]
```

**ngx-charts required format (single series):**
```typescript
// ngx-charts requires `name` + `value`
[{ name: 'Em Dia', value: 45 }, { name: 'Atraso Leve', value: 12 }]
// Looks similar but...
```

**ngx-charts multi-series (line, grouped bar):**
```typescript
// ngx-charts multi-series — COMPLETELY DIFFERENT
[
  {
    name: 'Trier',
    series: [
      { name: '2026-04-01', value: 15 },
      { name: '2026-04-02', value: 18 }
    ]
  },
  {
    name: 'Alpha 7',
    series: [
      { name: '2026-04-01', value: 8 },
      { name: '2026-04-02', value: 11 }
    ]
  }
]
```

**Recharts line chart (for comparison):**
```typescript
// Recharts uses flat array of objects with multiple keys per entry
[{ date: '2026-04-01', Trier: 15, Alpha7: 8 }]
```

**Critical rule:** The `name` field in ngx-charts must be a string (not a number, not a Date object). Passing a Date or number causes silent rendering failure.

**Phase to address:** Phase 4 (ChartsSection) — build ngx-charts data transformers from scratch, do not port Recharts data structures.

---

## Common Mistakes (frequent, recoverable)

These won't block the project but will cost hours of debugging.

---

### COMMON-1: Using `effect()` to Sync Signal State to Another Signal

**What goes wrong:**
Developers coming from React's `useEffect` pattern of syncing state reach for `effect()` to propagate signal changes. This is an Angular anti-pattern and causes `ExpressionChangedAfterItHasBeenChecked` errors and infinite loops.

**Wrong:**
```typescript
// Anti-pattern: using effect to derive state
effect(() => {
  this.filteredData.set(
    this.pharmacies().filter(p => this.filters().systems.includes(p.system))
  );
});
```

**Correct:**
```typescript
// Use computed() for derived state — lazy, memoized, no side effects
readonly filteredData = computed(() =>
  this.pharmacies().filter(p => this.filters().systems.includes(p.system))
);
```

**Rule:** `computed()` for derived state. `effect()` only for side effects to non-reactive APIs (localStorage, DOM canvas, third-party libs).

---

### COMMON-2: Calling Signals in Templates Without Parentheses

**What goes wrong:**
Developers forget that signals are getter functions — they must be called with `()` in templates. Without the call, Angular renders the signal object itself (e.g., `[object Object]`).

**Wrong template:**
```html
<p>{{ filteredData.length }}</p>           <!-- renders "[object Object]" -->
<p>{{ selectedPharmacy?.name }}</p>        <!-- selectedPharmacy is a signal, not a value -->
```

**Correct template:**
```html
<p>{{ filteredData().length }}</p>
<p>{{ selectedPharmacy()?.name }}</p>
```

**Also applies to `@if` and `@for`:**
```html
@if (selectedPharmacy()) {           <!-- correct: calls the signal -->
  <app-detail-drawer [pharmacy]="selectedPharmacy()!" />
}
```

---

### COMMON-3: Prop Drilling Replicated as Input Drilling

**What goes wrong:**
The React app prop-drills `theme` through every component. When porting, developers replicate this as `@Input() theme` on every Angular component — recreating the same fragility Angular's DI is designed to solve.

**Wrong (direct port of React prop drilling):**
```typescript
// App component passes theme to Header
<app-header [theme]="theme()" />

// Header passes theme to FilterBar
<app-filter-bar [theme]="theme" />
```

**Correct Angular approach:**
```typescript
// ThemeService injected wherever needed — no prop drilling
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(false);
  toggle() { this.isDark.update(v => !v); }
}

// Any component injects it directly
@Component({...})
export class KpiCardsComponent {
  private theme = inject(ThemeService);
  protected isDark = this.theme.isDark; // use directly in template
}
```

---

### COMMON-4: OnPush Change Detection with Mutable Objects

**What goes wrong:**
Using `ChangeDetectionStrategy.OnPush` (the right choice for performance) but passing mutable objects as inputs and mutating them in place. OnPush only re-renders when input *references* change. Mutating `pharmacy.status = 'new'` on a passed object won't trigger re-render.

**Safe pattern for this project:**
Since data comes from `computed()` signals derived from mock data, this is safe — computed signals always return new object references when their dependencies change (assuming no in-place mutations upstream).

**Watch out for:** Any component that accepts an `@Input()` of type `Pharmacy[]` and the caller mutates the array instead of replacing it.

---

### COMMON-5: Template Syntax Confusion — JSX vs Angular Templates

**What goes wrong:**
Muscle memory from JSX causes subtle template bugs that TypeScript won't always catch.

| React JSX | Angular Template | Common Mistake |
|-----------|-----------------|----------------|
| `className="foo"` | `class="foo"` | Using `className` in template |
| `onClick={handler}` | `(click)="handler()"` | Using `onClick=` |
| `{condition && <El />}` | `@if (condition) { <el /> }` | Using `&&` for conditional rendering |
| `style={{ color: 'red' }}` | `[style.color]="'red'"` or `[ngStyle]` | Double-brace style object |
| `htmlFor="id"` | `for="id"` | Using `htmlFor` attribute |
| `{items.map(i => <li key={i.id}>)}` | `@for (i of items; track i.id) {}` | Using `.map()` in template |
| `{children}` | `<ng-content />` | No direct children equivalent |
| `defaultValue` | `value` | Form input default value |

---

### COMMON-6: Using `ngDoCheck` Like a `useEffect` with No Deps

**What goes wrong:**
`ngDoCheck` is called on every change detection cycle — it's not equivalent to `useEffect`. Using it for "run when X changes" logic causes massive performance issues.

**Correct equivalent:**
- For "run once on mount" → `ngOnInit()`
- For "run when input changes" → `ngOnChanges()` or signal-based `input()`
- For "run when signal changes" → `effect()` or `computed()`
- For "run when DOM is ready" → `ngAfterViewInit()`

---

### COMMON-7: Forgetting to Unsubscribe from Observables

**What goes wrong:**
If any RxJS is introduced (e.g., `FormControl.valueChanges`, Router events), forgetting to unsubscribe causes memory leaks. React developers aren't accustomed to manual cleanup for state subscriptions.

**Safe patterns:**
```typescript
// Option 1: takeUntilDestroyed (Angular 16+, easiest)
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

this.filterControl.valueChanges
  .pipe(takeUntilDestroyed())
  .subscribe(value => this.filterSignal.set(value));

// Option 2: AsyncPipe in template (auto-unsubscribes)
// Option 3: toSignal() converts Observable to Signal — no manual cleanup needed
```

For this project: minimize RxJS, use Signals natively. Use `toSignal()` if any Observable must be consumed.

---

## PrimeNG-Specific Gotchas

**Confidence:** MEDIUM (PrimeNG docs site not scrapable; based on PrimeNG v4+ architecture + Angular view encapsulation docs which are HIGH confidence)

---

### PRIMENG-1: View Encapsulation Blocks PrimeNG Style Overrides

**What goes wrong:**
PrimeNG renders many internal elements (e.g., dropdown panel, table rows) outside your component's shadow DOM emulation scope. When you try to style them with your component's CSS, Angular's emulated encapsulation adds a unique attribute (`_ngcontent-xxx`) that PrimeNG's internal elements don't have — your styles are ignored.

**Wrong:**
```css
/* component.css — will NOT work for p-dropdown panel */
.p-dropdown-panel { background: var(--dashboard-bg); }
```

**Correct approaches (in order of preference):**
1. Use PrimeNG's design tokens / CSS variable system (`--p-dropdown-background`)
2. Use `::ng-deep` sparingly (Angular discourages new use, but it's the escape hatch)
3. Put overrides in global `styles.css` where encapsulation doesn't apply
4. Use `ViewEncapsulation.None` on the specific component (use sparingly)

---

### PRIMENG-2: Dark Mode Requires Coordinating Two Separate Systems

**What goes wrong:**
PrimeNG v4 uses its own design token system (`@primeng/themes`) with CSS variables like `--p-surface-0`, `--p-primary-color`. Your custom dashboard variables (`--dashboard-bg`) are a separate system. Dark mode toggle must update **both** systems simultaneously.

**Pitfall:** Toggling a `.dark` class on `<html>` updates PrimeNG's dark tokens only if PrimeNG is configured for it. Your custom variables are not automatically updated.

**Required setup (pseudocode — verify with current PrimeNG docs):**
```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(false);

  toggle() {
    const next = !this.isDark();
    this.isDark.set(next);
    // Update PrimeNG theme
    document.documentElement.classList.toggle('p-dark', next);
    // Update custom dashboard variables
    document.documentElement.classList.toggle('dark-theme', next);
  }
}
```

**Warning:** If PrimeNG Table is used inside an `OnPush` component, the CSS class change on `documentElement` may not trigger Angular's CD — but CSS variables take effect immediately in the browser regardless. However, any *signal-based* dark mode values in templates won't update until CD runs.

---

### PRIMENG-3: PrimeNG Table `p-tableCheckbox` and Row Selection Mode

**What goes wrong:**
The React MainTable has row selection implemented as custom click handlers. PrimeNG's `p-table` has built-in `selectionMode="single"` but it requires specific column configuration and outputs. Naively adding click handlers on `<tr>` inside PrimeNG's table overrides PrimeNG's own selection system.

**Correct pattern:**
```html
<p-table
  [value]="filteredPharmacies()"
  selectionMode="single"
  [(selection)]="selectedPharmacy"
  (onRowSelect)="onPharmacySelect($event)"
  dataKey="id">
```

---

### PRIMENG-4: PrimeNG Modules Must Be Imported per Component (Standalone)

**What goes wrong:**
In non-standalone (NgModule) world, you import `TableModule` once in `AppModule` and it's available everywhere. With standalone components (Angular 19 default), every component that uses `<p-table>` must import `TableModule` in its own `imports: []`.

**Required imports per component using PrimeNG:**
```typescript
@Component({
  standalone: true,
  imports: [
    TableModule,       // <p-table>
    ButtonModule,      // <p-button>
    DropdownModule,    // <p-dropdown>
    MultiSelectModule, // <p-multiselect>
    InputTextModule,   // <p-inputtext>
    DrawerModule,      // <p-drawer> (was Sidebar in older PrimeNG)
    CardModule,        // <p-card>
  ]
})
```

---

## ngx-charts-Specific Gotchas

**Confidence:** HIGH (verified against official ngx-charts Gitbook documentation)

---

### NGXCHARTS-1: The `name` Field Must Always Be a String

**What goes wrong:**
`ngx-charts` uses `name` as a display label and as a DOM key internally. Passing a `number`, `Date`, or `null` as the `name` field in chart data causes:
- Silent rendering failure (empty chart)
- Console errors about tracking duplicate keys
- Legend items showing `[object Object]`

**Wrong:**
```typescript
// date as name
{ name: new Date('2026-04-13'), value: 15 }  // BROKEN

// number as name
{ name: 1, value: 15 }  // BROKEN
```

**Correct:**
```typescript
{ name: '13/04/2026', value: 15 }  // OK
{ name: 'Semana 15', value: 15 }   // OK
```

---

### NGXCHARTS-2: Responsive Container Requires `[view]="undefined"` or Parent Flex Container

**What goes wrong:**
Recharts uses `<ResponsiveContainer width="100%" height={300}>`. ngx-charts handles responsiveness differently. If you set `[view]="[600, 300]"` (fixed pixels), charts won't be responsive. If you set nothing, charts may render at 0×0.

**Correct responsive setup:**
```html
<!-- Leave [view] unset for auto-sizing — parent must have defined dimensions -->
<ngx-charts-bar-vertical
  [results]="chartData()"
  [scheme]="colorScheme">
</ngx-charts-bar-vertical>
```
The parent container must have explicit `width` and `height` (flex or fixed). ngx-charts measures the parent's dimensions.

**Or use explicit dimensions:** `[view]="[chartWidth, 300]"` where `chartWidth` is calculated from `HostListener('window:resize')`.

---

### NGXCHARTS-3: Immutable Data Requirement — ngx-charts Does Not Detect Mutations

**What goes wrong:**
ngx-charts uses object identity checks to detect data changes. If you mutate the chart data array in place (push, splice, item mutation), the chart will not update — you must replace the entire array reference.

**Wrong:**
```typescript
this.chartData.push({ name: 'New Item', value: 5 }); // No re-render
```

**Correct:**
```typescript
// Always assign a new array
this.chartData = [...this.chartData, { name: 'New Item', value: 5 }];
// With Signals:
this.chartData.update(data => [...data, { name: 'New Item', value: 5 }]);
```

**Synergy note:** Using Angular Signals for chart data naturally enforces this — Signals' `.update()` always creates a new array, which satisfies ngx-charts' change detection requirement.

---

### NGXCHARTS-4: `BrowserAnimationsModule` Required — Missing Provider Error

**What goes wrong:**
ngx-charts uses Angular animations internally. Without `BrowserAnimationsModule` (or `provideAnimationsAsync()` in standalone setup), the app throws a runtime error and charts render incorrectly or not at all.

**For standalone Angular 19:**
```typescript
// app.config.ts
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(), // REQUIRED for ngx-charts
  ]
};
```

---

### NGXCHARTS-5: Color Scheme Format Differs from Recharts Fill Colors

**What goes wrong:**
In Recharts, you specify colors per-cell directly on the JSX element (`<Cell fill="#8884d8" />`). In ngx-charts, colors are specified as a scheme object or through `customColors` function.

**ngx-charts color scheme:**
```typescript
colorScheme = {
  domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5']
};
```
```html
<ngx-charts-pie-chart [scheme]="colorScheme" ...>
```

**For custom per-item colors (matching the React status colors):**
```typescript
customColors = (value: string) => {
  const map: Record<string, string> = {
    'Em Dia': '#22c55e',
    'Atraso Leve': '#f59e0b',
    'Atraso Crítico': '#ef4444',
    'Sem Dados': '#6b7280',
  };
  return map[value] ?? '#888';
};
```
```html
<ngx-charts-pie-chart [customColors]="customColors" ...>
```

---

## Angular Signals vs React Hooks — Key Differences

**Confidence:** HIGH (verified against official angular.dev/guide/signals)

| Concept | React | Angular Signals | Key Trap |
|---------|-------|----------------|----------|
| **State value** | `const [val, setVal] = useState(0)` | `val = signal(0)` | Signal is a function — always call `val()` to read |
| **Read state** | `val` | `val()` | Forgetting `()` renders `[object Signal]` |
| **Set state** | `setVal(newValue)` | `val.set(newValue)` | Direct assignment `val = newValue` has no effect |
| **Update from prev** | `setVal(v => v + 1)` | `val.update(v => v + 1)` | — |
| **Derived state** | `useMemo(() => ..., [dep])` | `computed(() => ...)` | computed auto-tracks deps — no dependency array needed |
| **Side effects** | `useEffect(() => {}, [dep])` | `effect(() => {})` | effect auto-tracks — but DON'T use for state→state sync |
| **Object mutation** | Calling setter re-renders regardless | Requires new reference (Object.is) | Push/mutate in place = no update |
| **Async in effect** | `useEffect(async () => { await; read state; })` | Signal reads after `await` are NOT tracked | Must read signals BEFORE await |
| **Cleanup** | Return function from useEffect | `effect((onCleanup) => { onCleanup(() => ...) })` | Different API |
| **Two-way binding** | Controlled: `value={val} onChange={handler}` | `model()` input or `[(ngModel)]` | banana-in-a-box syntax: `[(value)]="signal"` |
| **Context/global state** | `useContext(MyContext)` | `inject(MyService)` | No context provider tree — DI handles it |
| **Prop drilling** | Pass props down manually | `inject()` at any depth | Services are THE solution — no prop drilling needed |
| **Re-render trigger** | Any state/prop change rerenders component | CD runs on: Zone.js events, Signal changes, manual `markForCheck()` | Default CD is more conservative than React |

### Critical behavioral difference: When effects run

- **React `useEffect`**: Runs **after** render is committed to DOM (like `componentDidMount`/`componentDidUpdate`)
- **Angular `effect()`**: Runs **during** change detection, **before** DOM is updated
- **Angular `afterRenderEffect()`**: Runs **after** Angular updates the DOM — use this for chart library integration

For ngx-charts integration, `afterRenderEffect()` is the correct equivalent of React's `useEffect` with DOM-read logic.

---

## Angular DI vs React Context/Prop Passing — Translation Guide

| React Pattern | Angular Equivalent | Notes |
|--------------|-------------------|-------|
| `useState` in App.tsx shared to children | `@Injectable({ providedIn: 'root' }) Service with signal` | Singleton, no tree required |
| `useContext(ThemeContext)` | `inject(ThemeService)` | Works in any component — no provider wrapping needed |
| `<Context.Provider value={...}>` | Not needed for root services | For scoped: `providers: [MyService]` in `@Component` |
| Prop drilling `theme` through 6 components | `inject(ThemeService)` in the one component that needs it | **No prop drilling** |
| `const [selectedPharmacy, setSelected] = useState(null)` in App | `selectedPharmacy = signal<Pharmacy \| null>(null)` in `PharmacyStateService` | Service exposes signal, components inject it |
| Filter state in App.tsx + FilterBar.tsx divergence (known bug in React app) | Single `FilterService` with one source of truth | Angular services solve the "two places" problem |

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|---------------|------------|
| Phase 1: Scaffold | `app.config.ts` setup | Missing `provideAnimationsAsync()` for ngx-charts | Add it to providers from day one even before charts are built |
| Phase 1: Services | `ThemeService` | Replicating prop-drilled `Theme` object as service value | Use CSS variables + class toggle, NOT a TypeScript theme object in signals |
| Phase 1: Services | `FilterService` | Using `effect()` to compute filtered data | Use `computed()` — it's exactly what React's `useMemo` maps to |
| Phase 2: Header | Dark mode toggle | Only toggling service signal but not updating `document.documentElement` class | `ThemeService.toggle()` must write to DOM, not just update signal |
| Phase 3: FilterBar | Multi-select filter state | Mutating filter arrays in place | Always `.update(f => ({ ...f, systems: [...] }))` — never push to array |
| Phase 3: FilterBar | Two filter state sources | Replicating React's "pending vs applied" split | Keep one source of truth in `FilterService`; PrimeNG's `p-multiselect` supports immediate binding |
| Phase 4: MainTable | Row selection | Custom `(click)` on `<tr>` fighting PrimeNG Table's selection | Use PrimeNG's `selectionMode` + `(onRowSelect)` output |
| Phase 4: MainTable | Large row re-renders | Missing `track pharmacy.id` in `@for` | Mandatory — use `track pharmacy.id` |
| Phase 5: Charts | Data format | Porting Recharts data shape directly | Transform data in `computed()` per ngx-charts format spec |
| Phase 5: Charts | Responsive sizing | Fixed `[view]` pixel dimensions | Use container-based sizing; parent must have explicit dimensions |
| Phase 5: Charts | Status colors | No built-in color per status in ngx-charts | Implement `customColors` function mapping status → hex |
| Phase 5: Charts | Third-party Zone.js pollution | ngx-charts may trigger unnecessary CD cycles via D3 events | Use `NgZone.runOutsideAngular()` for chart initialization if profiler shows pollution |
| All phases | Standalone imports | Forgetting to import PrimeNG/ngx-charts modules per component | Create a `shared-imports.ts` barrel exporting common imports |
| All phases | CSS encapsulation | PrimeNG panel/overlay styles not applying | Override in `styles.css` globally, not in component CSS |

---

## Sources

- [Angular Signals Guide](https://angular.dev/guide/signals) — HIGH confidence
- [Angular Effects Guide](https://angular.dev/guide/signals/effect) — HIGH confidence
- [Angular Change Detection — Skipping Subtrees](https://angular.dev/best-practices/skipping-subtrees) — HIGH confidence
- [Angular Zone Pollution](https://angular.dev/best-practices/zone-pollution) — HIGH confidence
- [Angular Slow Computations](https://angular.dev/best-practices/slow-computations) — HIGH confidence
- [Angular DI Overview](https://angular.dev/guide/di) — HIGH confidence
- [Angular Hierarchical DI](https://angular.dev/guide/di/hierarchical-dependency-injection) — HIGH confidence
- [Angular Component Inputs](https://angular.dev/guide/components/inputs) — HIGH confidence
- [Angular Styling / View Encapsulation](https://angular.dev/guide/components/styling) — HIGH confidence
- [Angular Control Flow (@for, @if)](https://angular.dev/guide/templates/control-flow) — HIGH confidence
- [ngx-charts Full Documentation](https://swimlane.gitbook.io/ngx-charts/llms-full.txt) — HIGH confidence
- CONCERNS.md — project-specific analysis (codebase audit)
- PROJECT.md — project scope and decisions
- App.tsx — direct analysis of React patterns in use
