import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Status, TagValue } from "./data/mockData";
import { Theme } from "./theme";

// ─── Status metadata ─────────────────────────────────────────────────────────

export const STATUS_INFO: Record<
  Status,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    Icon: React.ComponentType<{ size?: number }>;
  }
> = {
  em_dia: {
    label: "OK",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    Icon: CheckCircle,
  },
  atraso_leve: {
    label: "Atrasado",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    Icon: Clock,
  },
  atraso_critico: {
    label: "Crítico",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    Icon: AlertTriangle,
  },
  sem_dados: {
    label: "Sem dados",
    color: "#64748B",
    bg: "#F8FAFC",
    border: "#CBD5E1",
    Icon: XCircle,
  },
};

/** Short display labels (used in KPI cards, table badges). */
export const STATUS_LABELS: Record<Status, string> = {
  em_dia: STATUS_INFO.em_dia.label,
  atraso_leve: STATUS_INFO.atraso_leve.label,
  atraso_critico: STATUS_INFO.atraso_critico.label,
  sem_dados: STATUS_INFO.sem_dados.label,
};

/** Long display labels with day-range suffix (used in filter dropdowns). */
export const STATUS_LABELS_LONG: Record<Status, string> = {
  em_dia: "OK",
  atraso_leve: "Atrasado (1-3 dias)",
  atraso_critico: "Crítico (4+ dias)",
  sem_dados: "Sem dados",
};

export const STATUS_SUBLABEL: Record<Status, string> = {
  em_dia: "0 dias de atraso",
  atraso_leve: "1 a 3 dias",
  atraso_critico: "4+ dias",
  sem_dados: "sem retorno de sincronização",
};

export function getStatusInfo(
  theme: Theme,
): Record<Status, { label: string; color: string; bg: string; border: string; Icon: React.ComponentType<{ size?: number }> }> {
  const isDark = theme.bg.main === "#0F1419"; // detect dark theme
  return {
    em_dia: {
      ...STATUS_INFO.em_dia,
      bg: isDark ? "rgba(5,150,105,0.12)" : STATUS_INFO.em_dia.bg,
      border: isDark ? "rgba(5,150,105,0.3)" : STATUS_INFO.em_dia.border,
    },
    atraso_leve: {
      ...STATUS_INFO.atraso_leve,
      bg: isDark ? "rgba(217,119,6,0.12)" : STATUS_INFO.atraso_leve.bg,
      border: isDark ? "rgba(217,119,6,0.3)" : STATUS_INFO.atraso_leve.border,
    },
    atraso_critico: {
      ...STATUS_INFO.atraso_critico,
      bg: isDark ? "rgba(220,38,38,0.12)" : STATUS_INFO.atraso_critico.bg,
      border: isDark ? "rgba(220,38,38,0.3)" : STATUS_INFO.atraso_critico.border,
    },
    sem_dados: {
      ...STATUS_INFO.sem_dados,
      bg: isDark ? "rgba(100,116,139,0.12)" : STATUS_INFO.sem_dados.bg,
      border: isDark ? "rgba(100,116,139,0.3)" : STATUS_INFO.sem_dados.border,
    },
  };
}

export function getStatusColors(theme: Theme): Record<Status, string> {
  return {
    em_dia: theme.status.success,
    atraso_leve: theme.status.warning,
    atraso_critico: theme.status.error,
    sem_dados: theme.status.neutral,
  };
}

// ─── Tag value color helper ──────────────────────────────────────────────────

export const TAG_VALUE_STYLES: Record<
  TagValue,
  { color: string; bg: string; border: string }
> = {
  OK:       { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  ATRASADO: { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  CRITICO:  { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
};

export function getTagValueStyles(
  theme: Theme,
): Record<TagValue, { color: string; bg: string; border: string }> {
  const isDark = theme.bg.main === "#0F1419";
  return {
    OK:       { color: "#059669", bg: isDark ? "rgba(5,150,105,0.12)"   : "#ECFDF5", border: isDark ? "rgba(5,150,105,0.3)"   : "#A7F3D0" },
    ATRASADO: { color: "#D97706", bg: isDark ? "rgba(217,119,6,0.12)"   : "#FFFBEB", border: isDark ? "rgba(217,119,6,0.3)"   : "#FDE68A" },
    CRITICO:  { color: "#DC2626", bg: isDark ? "rgba(220,38,38,0.12)"   : "#FEF2F2", border: isDark ? "rgba(220,38,38,0.3)"   : "#FECACA" },
  };
}

// ─── Tag status computation ──────────────────────────────────────────────────

/**
 * Computes OK / ATRASADO / CRITICO based on how many days ago `lastSaleDate` was.
 *   0–1 days ago → OK
 *   2–3 days ago → ATRASADO
 *   4+ days ago  → CRITICO
 */
export function computeTagStatus(lastSaleDate: string): TagValue {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const saleDate = new Date(lastSaleDate + "T00:00:00");
  const diffMs = today.getTime() - saleDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 3) return "CRITICO";
  if (diffDays > 1) return "ATRASADO";
  return "OK";
}

// ─── Default filter state ────────────────────────────────────────────────────

export const ALL_STATUSES: Status[] = [
  "em_dia",
  "atraso_leve",
  "atraso_critico",
  "sem_dados",
];
