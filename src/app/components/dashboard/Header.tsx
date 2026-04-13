import { Download, RefreshCw, Clock, Moon, Sun } from "lucide-react";
import { Theme } from "../../theme";

interface HeaderProps {
  theme: Theme;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({ theme, isDarkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-6 flex-shrink-0"
      style={{
        height: "64px",
        background: theme.bg.header,
        borderBottom: `1px solid ${theme.border.dark}`,
      }}
    >
      {/* Left: Title */}
      <div className="flex items-center gap-3">
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect
              x="2"
              y="10"
              width="3"
              height="8"
              rx="1"
              fill="white"
              fillOpacity="0.9"
            />
            <rect
              x="7"
              y="6"
              width="3"
              height="12"
              rx="1"
              fill="white"
              fillOpacity="0.9"
            />
            <rect x="12" y="2" width="3" height="16" rx="1" fill="white" />
            <rect
              x="17"
              y="7"
              width="1.5"
              height="1.5"
              rx="0.75"
              fill="white"
            />
          </svg>
        </div>
        <div>
          <h1
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Auditoria de Dados - Dashboard
          </h1>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <Clock size={13} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>
            Última atualização:{" "}
            <span style={{ color: "#ffffff" }}>13/04/2026 14:30</span>
          </span>
        </div>

        <button
          onClick={onToggleDarkMode}
          className="flex items-center justify-center rounded-lg transition-opacity hover:opacity-80"
          style={{
            width: 38,
            height: 38,
            background: "rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
          }}
          title={isDarkMode ? "Modo claro" : "Modo escuro"}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
          style={{
            background: "rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(255,255,255,0.2)",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          <Download size={15} />
          Exportar Excel
        </button>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
          style={{
            background: "#00A3C4",
            color: "#fff",
            border: "none",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={15} />
          Atualizar Dados
        </button>
      </div>
    </header>
  );
}
