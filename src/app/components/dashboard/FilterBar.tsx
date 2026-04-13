import { useState } from "react";
import { ChevronDown, Search, X, SlidersHorizontal } from "lucide-react";
import { mockPharmacies, Status, System, ContractStatus } from "../../data/mockData";
import { Theme } from "../../theme";
import {
  ALL_SYSTEMS,
  ALL_STATUSES,
  ALL_CONTRACT_STATUSES,
  STATUS_LABELS_LONG,
} from "../../constants";

interface Filters {
  systems: System[];
  statuses: Status[];
  cnpjs: string[];
  associationCodes: string[];
  contractStatuses: ContractStatus[];
  minLag: number;
}

interface FilterBarProps {
  onApply: (filters: Filters) => void;
  theme: Theme;
}

const defaultFilters: Filters = {
  systems: [...ALL_SYSTEMS],
  statuses: [...ALL_STATUSES],
  cnpjs: [],
  associationCodes: [],
  contractStatuses: [...ALL_CONTRACT_STATUSES],
  minLag: 0,
};

function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  renderOption,
  theme,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  renderOption?: (v: string) => string;
  theme: Theme;
}) {
  const [open, setOpen] = useState(false);
  const allSelected = selected.length === options.length;

  const toggle = (v: string) => {
    if (selected.includes(v)) onChange(selected.filter((s) => s !== v));
    else onChange([...selected, v]);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: 8,
          background: theme.bg.card,
          border: `1px solid ${theme.border.dark}`,
          color: theme.text.secondary,
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          cursor: "pointer",
          minWidth: 140,
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            color: selected.length === options.length ? theme.text.secondary : theme.bg.header,
            fontWeight: selected.length < options.length ? 600 : 400,
          }}
        >
          {selected.length === 0
            ? label
            : selected.length === options.length
              ? `${label}: Todos`
              : `${label}: ${selected.length}`}
        </span>
        <ChevronDown
          size={13}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        />
      </button>
      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 10 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              marginTop: 4,
              borderRadius: 10,
              zIndex: 20,
              background: theme.bg.card,
              border: `1px solid ${theme.border.dark}`,
              minWidth: 200,
              boxShadow: "0 4px 20px rgba(14,61,110,0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                cursor: "pointer",
                color: theme.text.secondary,
                fontSize: 12,
              }}
              onClick={() => {
                if (allSelected) onChange([]);
                else onChange([...options]);
              }}
            >
              <input
                type="checkbox"
                checked={allSelected}
                readOnly
                style={{ accentColor: theme.bg.header }}
              />
              <span>Selecionar todos</span>
            </div>
            <div style={{ borderTop: `1px solid ${theme.border.main}`, margin: "2px 0" }} />
            {options.map((opt) => (
              <div
                key={opt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: 12,
                  color: theme.text.primary,
                }}
                className="hover:bg-slate-50"
                onClick={() => toggle(opt)}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  readOnly
                  style={{ accentColor: theme.bg.header }}
                />
                <span>{renderOption ? renderOption(opt) : opt}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CnpjSearchDropdown({
  selected,
  onChange,
  theme,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
  theme: Theme;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const allCnpjs = mockPharmacies.map((p) => ({
    cnpj: p.cnpj,
    name: p.name,
    number: p.storeNumber,
  }));
  const filtered = allCnpjs.filter(
    (p) =>
      p.cnpj.includes(query) ||
      p.name.toLowerCase().includes(query.toLowerCase()),
  );

  const toggle = (cnpj: string) => {
    if (selected.includes(cnpj)) onChange(selected.filter((c) => c !== cnpj));
    else onChange([...selected, cnpj]);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: 8,
          background: theme.bg.card,
          border: `1px solid ${theme.border.dark}`,
          color: selected.length > 0 ? theme.bg.header : theme.text.secondary,
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          cursor: "pointer",
          minWidth: 160,
          justifyContent: "space-between",
          fontWeight: selected.length > 0 ? 600 : 400,
        }}
      >
        <span>
          {selected.length === 0
            ? "CNPJ: Todos"
            : `CNPJ: ${selected.length} selecionado(s)`}
        </span>
        <ChevronDown
          size={13}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        />
      </button>
      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 10 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              marginTop: 4,
              borderRadius: 10,
              zIndex: 20,
              background: theme.bg.card,
              border: `1px solid ${theme.border.dark}`,
              width: "min(300px, 90vw)",
              boxShadow: "0 4px 20px rgba(14,61,110,0.12)",
            }}
          >
            <div style={{ padding: "8px 12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: theme.bg.alt,
                  border: `1px solid ${theme.border.main}`,
                  borderRadius: 6,
                  padding: "4px 8px",
                }}
              >
                <Search size={12} color={theme.text.tertiary} />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar CNPJ ou nome..."
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: theme.text.primary,
                    fontSize: 12,
                    width: "100%",
                    padding: "2px 0",
                  }}
                />
              </div>
            </div>
            <div style={{ maxHeight: 220, overflowY: "auto" }}>
              {filtered.map((p) => (
                <div
                  key={p.cnpj}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                  className="hover:bg-slate-50"
                  onClick={() => toggle(p.cnpj)}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(p.cnpj)}
                    readOnly
                    style={{ accentColor: theme.bg.header }}
                  />
                  <div>
                    <div style={{ color: theme.text.primary, fontSize: 12 }}>
                      {p.cnpj}
                    </div>
                    <div style={{ color: theme.text.tertiary, fontSize: 11 }}>
                      {p.name} #{p.number}
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    color: theme.text.tertiary,
                    fontSize: 12,
                  }}
                >
                  Nenhum resultado
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function FilterBar({ onApply, theme }: FilterBarProps) {
  const [systems, setSystems] = useState<System[]>([...ALL_SYSTEMS]);
  const [statuses, setStatuses] = useState<Status[]>([...ALL_STATUSES]);
  const [cnpjs, setCnpjs] = useState<string[]>([]);
  const [associationCodes, setAssociationCodes] = useState<string[]>([]);
  const [contractStatuses, setContractStatuses] = useState<ContractStatus[]>(
    [...ALL_CONTRACT_STATUSES]
  );
  const [minLag, setMinLag] = useState(0);

  const allAssociationCodes = [
    ...new Set(mockPharmacies.map((p) => p.associationCode)),
  ].sort();

  const handleApply = () =>
    onApply({ systems, statuses, cnpjs, associationCodes, contractStatuses, minLag });

  const handleClear = () => {
    setSystems([...ALL_SYSTEMS]);
    setStatuses([...ALL_STATUSES]);
    setCnpjs([]);
    setAssociationCodes([]);
    setContractStatuses([...ALL_CONTRACT_STATUSES]);
    setMinLag(0);
    onApply(defaultFilters);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        paddingTop: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: theme.text.secondary,
        }}
      >
        <SlidersHorizontal size={14} />
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: theme.text.secondary,
          }}
        >
          Filtros:
        </span>
      </div>

      <MultiSelectDropdown
        label="Sistema"
        options={ALL_SYSTEMS}
        selected={systems}
        onChange={(v) => setSystems(v as System[])}
        theme={theme}
      />

      <MultiSelectDropdown
        label="Associação"
        options={allAssociationCodes}
        selected={associationCodes}
        onChange={setAssociationCodes}
        theme={theme}
      />

      <MultiSelectDropdown
        label="Sit. Contrato"
        options={ALL_CONTRACT_STATUSES}
        selected={contractStatuses}
        onChange={(v) => setContractStatuses(v as ContractStatus[])}
        theme={theme}
      />

      <CnpjSearchDropdown selected={cnpjs} onChange={setCnpjs} theme={theme} />

      <MultiSelectDropdown
        label="Status"
        options={ALL_STATUSES}
        selected={statuses}
        onChange={(v) => setStatuses(v as Status[])}
        renderOption={(v) => STATUS_LABELS_LONG[v as Status]}
        theme={theme}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: theme.text.secondary,
          }}
        >
          Atraso mín.:
        </span>
        <input
          type="number"
          min={0}
          value={minLag}
          onChange={(e) =>
            setMinLag(Math.max(0, parseInt(e.target.value) || 0))
          }
          style={{
            background: theme.bg.card,
            border: `1px solid ${theme.border.dark}`,
            color: theme.text.primary,
            borderRadius: 8,
            padding: "5px 8px",
            width: 64,
            fontSize: 12,
            outline: "none",
          }}
        />
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: theme.text.tertiary,
          }}
        >
          dias
        </span>
      </div>

      <button
        onClick={handleApply}
        style={{
          padding: "6px 14px",
          borderRadius: 8,
          background: theme.bg.header,
          color: theme.text.inverse,
          border: "none",
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Aplicar
      </button>

      <button
        onClick={handleClear}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "6px 10px",
          borderRadius: 8,
          background: "transparent",
          color: theme.text.tertiary,
          border: "none",
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        <X size={12} />
        Limpar
      </button>
    </div>
  );
}

export type { Filters };
