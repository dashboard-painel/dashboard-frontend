import { useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { Pharmacy, TagValue } from "../../data/mockData";
import { FilterBar, Filters } from "./FilterBar";
import { Theme } from "../../theme";
import {
  getStatusInfo,
  getTagValueStyles,
} from "../../constants";

interface MainTableProps {
  data: Pharmacy[];
  onSelectPharmacy: (p: Pharmacy) => void;
  onFilterChange: (f: Filters) => void;
  theme: Theme;
}

type SortKey = keyof Pharmacy;
type SortDir = "asc" | "desc";

function SortIcon({
  column,
  sortKey,
  sortDir,
  theme,
}: {
  column: string;
  sortKey: string;
  sortDir: SortDir;
  theme: Theme;
}) {
  if (column !== sortKey) return <ChevronsUpDown size={12} color={theme.border.dark} />;
  if (sortDir === "asc") return <ChevronUp size={12} color={theme.bg.header} />;
  return <ChevronDown size={12} color={theme.bg.header} />;
}

function formatDateBR(isoDate: string): string {
  // "2026-04-14" → "14/04/2026"
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function TagBadge({
  value,
  lastSaleDate,
  theme,
}: {
  value: TagValue;
  lastSaleDate: string;
  theme: Theme;
}) {
  const styles = getTagValueStyles(theme)[value];
  return (
    <span
      title={`Última venda: ${formatDateBR(lastSaleDate)}`}
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 100,
        background: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "Inter, sans-serif",
        whiteSpace: "nowrap",
        cursor: "help",
      }}
    >
      {value}
    </span>
  );
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function MainTable({
  data,
  onSelectPharmacy,
  onFilterChange,
  theme,
}: MainTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  };

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      // For layer columns (gold/silver/api), sort by their .status string
      const getVal = (p: Pharmacy, k: SortKey): string | number | null => {
        const raw = p[k];
        if (raw !== null && typeof raw === "object" && "status" in raw) {
          return (raw as { status: string }).status;
        }
        return raw as string | number | null;
      };
      const av = getVal(a, sortKey);
      const bv = getVal(b, sortKey);
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      let cmp = 0;
      if (typeof av === "string" && typeof bv === "string")
        cmp = av.localeCompare(bv);
      else if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, page * pageSize + pageSize);

  const columns: { key: SortKey; label: string }[] = [
    { key: "status", label: "Status" },
    { key: "cnpj", label: "CNPJ" },
    { key: "name", label: "Nome" },
    { key: "storeNumber", label: "Cod Farma (N Loja)" },
    { key: "associationCode", label: "Cod Assoc" },
    { key: "gold", label: "Gold" },
    { key: "silver", label: "Silver" },
    { key: "api", label: "API" },
  ];

  return (
    <div style={{ padding: "0 24px" }}>
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: theme.bg.card,
          border: `1px solid ${theme.border.main}`,
          boxShadow: "0 1px 4px rgba(14,61,110,0.07)",
        }}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: `1px solid ${theme.border.main}`,
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: theme.text.primary,
                  margin: 0,
                }}
              >
                Detalhamento por Farmácia
              </h2>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: theme.text.tertiary,
                  margin: 0,
                }}
              >
                {sorted.length} farmácia{sorted.length !== 1 ? "s" : ""}{" "}
                encontrada{sorted.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Page size */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              style={{
                background: theme.bg.alt,
                border: `1px solid ${theme.border.main}`,
                color: theme.text.secondary,
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 12,
                cursor: "pointer",
                outline: "none",
              }}
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s} por página
                </option>
              ))}
            </select>
          </div>

          {/* Filters inline */}
          <FilterBar onApply={onFilterChange} theme={theme} />
        </div>

        {/* Table — desktop */}
        <div className="table-desktop" style={{ overflowX: "auto" }}>
          {paged.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 0",
              }}
            >
              <CheckCircle size={36} color="#059669" />
              <p
                style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    color: theme.text.tertiary,
                    marginTop: 10,
                  }}
              >
                Nenhuma farmácia encontrada
              </p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                 <tr
                   style={{
                     background: theme.bg.alt,
                     borderBottom: `1px solid ${theme.border.main}`,
                   }}
                 >
                   {columns.map((col) => (
                     <th
                       key={col.key}
                       onClick={() => handleSort(col.key)}
                       style={{
                         color: theme.text.secondary,
                         fontSize: 11,
                         fontWeight: 700,
                         fontFamily: "Inter, sans-serif",
                         textTransform: "uppercase",
                         letterSpacing: "0.05em",
                         padding: "10px 14px",
                         cursor: "pointer",
                         userSelect: "none",
                         whiteSpace: "nowrap",
                         textAlign: "left",
                       }}
                     >
                       <div
                         style={{
                           display: "flex",
                           alignItems: "center",
                           gap: 4,
                         }}
                       >
                         {col.label}
                         <SortIcon
                           column={col.key}
                           sortKey={sortKey}
                           sortDir={sortDir}
                           theme={theme}
                         />
                       </div>
                     </th>
                   ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((pharmacy) => {
                  const info = getStatusInfo(theme)[pharmacy.status];
                  const isCritico = pharmacy.status === "atraso_critico";
                  const isLeve = pharmacy.status === "atraso_leve";

                  return (
                    <tr
                      key={pharmacy.id}
                      onClick={() => onSelectPharmacy(pharmacy)}
                      className="cursor-pointer transition-colors"
                      style={{
                        borderBottom: `1px solid ${theme.border.light}`,
                        borderLeft: isCritico
                          ? "3px solid #DC2626"
                          : isLeve
                            ? "3px solid #D97706"
                            : "3px solid transparent",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = theme.bg.hover)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Status */}
                      <td
                        style={{ padding: "11px 14px", whiteSpace: "nowrap" }}
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "3px 8px",
                            borderRadius: 100,
                            background: info.bg,
                            color: info.color,
                            border: `1px solid ${info.border}`,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          <info.Icon size={11} />
                          {info.label}
                        </div>
                      </td>

                      {/* CNPJ */}
                      <td
                        style={{
                          padding: "11px 14px",
                          color: theme.text.secondary,
                          fontFamily: "monospace",
                          fontSize: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {pharmacy.cnpj}
                      </td>

                      {/* Nome */}
                      <td
                        style={{
                          padding: "11px 14px",
                          fontFamily: "Inter, sans-serif",
                          fontSize: 13,
                          fontWeight: 600,
                          color: theme.text.primary,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {pharmacy.name}
                      </td>

                      {/* Cod Farma (N Loja) */}
                      <td
                        style={{
                          padding: "11px 14px",
                          fontFamily: "Inter, sans-serif",
                          fontSize: 12,
                          color: theme.text.tertiary,
                        }}
                      >
                        #{pharmacy.storeNumber}
                      </td>

                      {/* Cod Assoc */}
                      <td
                        style={{
                          padding: "11px 14px",
                          fontFamily: "monospace",
                          fontSize: 12,
                          color: theme.text.secondary,
                        }}
                      >
                        {pharmacy.associationCode}
                      </td>

                      {/* Gold */}
                      <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                        <TagBadge value={pharmacy.gold.status} lastSaleDate={pharmacy.gold.lastSaleDate} theme={theme} />
                      </td>

                      {/* Silver */}
                      <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                        <TagBadge value={pharmacy.silver.status} lastSaleDate={pharmacy.silver.lastSaleDate} theme={theme} />
                      </td>

                      {/* API */}
                      <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                        <TagBadge value={pharmacy.api.status} lastSaleDate={pharmacy.api.lastSaleDate} theme={theme} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Card list — mobile */}
        <div
          className="table-mobile"
          style={{
            flexDirection: "column",
            gap: 8,
            padding: "12px 16px",
          }}
        >
          {paged.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "32px 0",
              }}
            >
              <CheckCircle size={32} color="#059669" />
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: theme.text.tertiary, marginTop: 8 }}>
                Nenhuma farmácia encontrada
              </p>
            </div>
          ) : (
            paged.map((pharmacy) => {
              const info = getStatusInfo(theme)[pharmacy.status];
              const isCritico = pharmacy.status === "atraso_critico";
              const isLeve = pharmacy.status === "atraso_leve";
              return (
                <div
                  key={pharmacy.id}
                  onClick={() => onSelectPharmacy(pharmacy)}
                  style={{
                    background: theme.bg.card,
                    border: `1px solid ${theme.border.main}`,
                    borderLeft: isCritico
                      ? "3px solid #DC2626"
                      : isLeve
                        ? "3px solid #D97706"
                        : `3px solid ${theme.border.main}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {/* Row 1: status badge */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "3px 8px",
                        borderRadius: 100,
                        background: info.bg,
                        color: info.color,
                        border: `1px solid ${info.border}`,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      <info.Icon size={11} />
                      {info.label}
                    </div>
                    <span style={{ fontFamily: "monospace", fontSize: 11, color: theme.text.tertiary }}>
                      #{pharmacy.storeNumber}
                    </span>
                  </div>
                  {/* Row 2: name */}
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, color: theme.text.primary }}>
                    {pharmacy.name}
                  </div>
                  {/* Row 3: CNPJ + assoc */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 11, color: theme.text.secondary }}>{pharmacy.cnpj}</span>
                    <span style={{ fontFamily: "monospace", fontSize: 11, color: theme.text.tertiary }}>{pharmacy.associationCode}</span>
                  </div>
                  {/* Row 4: Gold / Silver / API tags */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: theme.text.tertiary }}>Gold:</span>
                      <TagBadge value={pharmacy.gold.status} lastSaleDate={pharmacy.gold.lastSaleDate} theme={theme} />
                      <span style={{ fontFamily: "monospace", fontSize: 10, color: theme.text.tertiary }}>{formatDateBR(pharmacy.gold.lastSaleDate)}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: theme.text.tertiary }}>Silver:</span>
                      <TagBadge value={pharmacy.silver.status} lastSaleDate={pharmacy.silver.lastSaleDate} theme={theme} />
                      <span style={{ fontFamily: "monospace", fontSize: 10, color: theme.text.tertiary }}>{formatDateBR(pharmacy.silver.lastSaleDate)}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: theme.text.tertiary }}>API:</span>
                      <TagBadge value={pharmacy.api.status} lastSaleDate={pharmacy.api.lastSaleDate} theme={theme} />
                      <span style={{ fontFamily: "monospace", fontSize: 10, color: theme.text.tertiary }}>{formatDateBR(pharmacy.api.lastSaleDate)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
              padding: "12px 20px",
              borderTop: `1px solid ${theme.border.main}`,
              background: theme.bg.alt,
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: theme.text.tertiary,
              }}
            >
              Mostrando {page * pageSize + 1}–
              {Math.min((page + 1) * pageSize, sorted.length)} de{" "}
              {sorted.length}
            </span>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                style={{
                    width: 30,
                    height: 30,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    background: theme.bg.card,
                    border: `1px solid ${theme.border.main}`,
                    color: page === 0 ? theme.border.dark : theme.text.secondary,
                    cursor: page === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  style={{
                      width: 30,
                      height: 30,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 6,
                      background: page === i ? theme.bg.header : theme.bg.card,
                      border: `1px solid ${page === i ? theme.bg.header : theme.border.main}`,
                      color: page === i ? "#fff" : theme.text.secondary,
                      fontFamily: "Inter, sans-serif",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                style={{
                    width: 30,
                    height: 30,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    background: theme.bg.card,
                    border: `1px solid ${theme.border.main}`,
                    color: page >= totalPages - 1 ? theme.border.dark : theme.text.secondary,
                    cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
