import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Status, System, ContractStatus } from "./data/mockData";
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

// ─── System / Contract color maps ────────────────────────────────────────────

export const SYSTEM_COLORS: Record<
  System,
  { color: string; bg: string; border: string }
> = {
  Trier: { color: "#1D6FA4", bg: "#EFF6FF", border: "#BFDBFE" },
  "Alpha 7": { color: "#0D7C66", bg: "#ECFDF5", border: "#A7F3D0" },
  Eden: { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  Legado: { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
};

export const CONTRACT_COLORS: Record<
  ContractStatus,
  { color: string; bg: string; border: string }
> = {
  Ativo: { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  Suspenso: { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  Inativo: { color: "#64748B", bg: "#F8FAFC", border: "#CBD5E1" },
};

// ─── Utility functions ────────────────────────────────────────────────────────

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function getLagColor(lag: number | null): string {
  if (lag === null) return "#64748B";
  if (lag === 0) return "#059669";
  if (lag <= 3) return "#D97706";
  return "#DC2626";
}

// ─── Default filter state ────────────────────────────────────────────────────

export const ALL_SYSTEMS: System[] = ["Trier", "Alpha 7", "Eden", "Legado"];
export const ALL_STATUSES: Status[] = [
  "em_dia",
  "atraso_leve",
  "atraso_critico",
  "sem_dados",
];
export const ALL_CONTRACT_STATUSES: ContractStatus[] = [
  "Ativo",
  "Suspenso",
  "Inativo",
];
