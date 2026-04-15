import { Theme } from "../../theme";
import { Pharmacy, Status } from "../../data/mockData";

interface ChartsSectionProps {
  data: Pharmacy[];
  theme: Theme;
}

// ─── Gauge Chart (SVG semi-circle) ──────────────────────────────────────────
function GaugeChart({
  value,
  total,
  theme,
}: {
  value: number;
  total: number;
  theme: Theme;
}) {
  const pct = total === 0 ? 0 : value / total;
  const pctDisplay = total === 0 ? 0 : Math.round((value / total) * 100);

  const W = 240;
  const H = 148;
  const cx = W / 2; // 120
  const cy = H - 20; // 128 — center near the bottom edge
  const R = 110;
  const strokeW = 14;

  // Gauge color
  const gaugeColor =
    pct >= 0.9 ? "#059669" : pct >= 0.7 ? "#D97706" : "#DC2626";

  // Background arc: top semi-circle from left (180°) to right (0°)
  const bgPath = `M ${cx - R},${cy} A ${R},${R} 0 0 1 ${cx + R},${cy}`;

  // Fill arc: from left point to the current pct angle
  const fillAngle = Math.PI * (1 - pct);
  const fex = cx + R * Math.cos(fillAngle);
  const fey = cy - R * Math.sin(fillAngle);
  const valuePath =
    pct === 0 ? null : `M ${cx - R},${cy} A ${R},${R} 0 0 1 ${fex},${fey}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative", width: "100%", maxWidth: W }}>
        <svg
          width="100%"
          height="auto"
          viewBox={`0 0 ${W} ${H}`}
          style={{
            display: "block",
            overflow: "visible",
          }}
        >
          {/* 0% / 100% labels */}
          <text
            x={cx - R - 2}
            y={cy + 26}
            textAnchor="middle"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              fill: theme.text.tertiary,
            }}
          >
            0%
          </text>
          <text
            x={cx + R + 4}
            y={cy + 26}
            textAnchor="middle"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              fill: theme.text.tertiary,
            }}
          >
            100%
          </text>

          {/* Background arc */}
          <path
            d={bgPath}
            fill="none"
            stroke={theme.border.main}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />

          {/* Value arc */}
          {valuePath && (
            <path
              d={valuePath}
              fill="none"
              stroke={gaugeColor}
              strokeWidth={strokeW}
              strokeLinecap="round"
            />
          )}

          {/* Center text */}
          <text
            x={cx}
            y={cy - 36}
            textAnchor="middle"
            dominantBaseline="auto"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 26,
              fontWeight: 800,
              fill: gaugeColor,
            }}
          >
            {pctDisplay}%
          </text>
          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            dominantBaseline="auto"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              fill: theme.text.tertiary,
            }}
          >
            {value} de {total} CNPJs
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 16,
          width: "100%",
        }}
      >
        {[
          { label: "≥90% Ótimo", color: "#059669" },
          { label: "70–89% Alerta", color: "#D97706" },
          { label: "<70% Crítico", color: "#DC2626" },
        ].map((l) => (
          <div key={l.label} style={{ flex: 1, marginBottom: 4 }}>
            <div
              style={{
                width: "100%",
                height: 8,
                background: l.color,
              }}
            />
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 10,
                color: theme.text.tertiary,
              }}
            >
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function ChartsSection({ data, theme }: ChartsSectionProps) {
  const cardStyle: React.CSSProperties = {
    background: theme.bg.card,
    border: `1px solid ${theme.border.main}`,
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(14,61,110,0.07)",
    padding: 20,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: "Inter, sans-serif",
    fontSize: 13,
    fontWeight: 700,
    color: theme.text.primary,
    margin: "0 0 2px 0",
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: "Inter, sans-serif",
    fontSize: 11,
    color: theme.text.tertiary,
    margin: "0 0 14px 0",
  };

  const total = data.length;

  // Gauge: covered = not sem_dados
  const counts: Record<Status, number> = {
    em_dia: 0,
    atraso_leve: 0,
    atraso_critico: 0,
    sem_dados: 0,
  };
  data.forEach((p) => counts[p.status]++);
  const covered = total - counts.sem_dados;

  return (
    <div style={{ padding: "0 24px" }}>
      {/* Gauge card — comentado temporariamente */}
      {/* <div
        style={{
          ...cardStyle,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: 400,
        }}
      >
        <div style={{ width: "100%" }}>
          <h3 style={titleStyle}>Cobertura de Farmácias</h3>
          <p style={subtitleStyle}>Farmácias com dados disponíveis</p>
        </div>
        <GaugeChart value={covered} total={total} theme={theme} />
        <div
          style={{
            marginTop: 12,
            width: "100%",
            background: theme.bg.alt,
            border: `1px solid ${theme.border.main}`,
            borderRadius: 8,
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: theme.text.secondary,
            }}
          >
            Farmácias sem retorno:
          </span>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: "#DC2626",
            }}
          >
            {counts.sem_dados} CNPJ{counts.sem_dados !== 1 ? "s" : ""}
          </span>
        </div>
      </div> */}
    </div>
  );
}
