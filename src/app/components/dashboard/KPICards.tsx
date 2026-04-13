import { Pharmacy, Status } from "../../data/mockData";
import { Theme } from "../../theme";
import {
  STATUS_LABELS,
  STATUS_SUBLABEL,
  getStatusColors,
  getStatusInfo,
} from "../../constants";

interface KPICardsProps {
  data: Pharmacy[];
  theme: Theme;
}

// ─── Mini Donut (SVG) ────────────────────────────────────────────────────────
function MiniDonut({
  counts,
  total,
  theme,
}: {
  counts: Record<Status, number>;
  total: number;
  theme: Theme;
}) {
  const size = 110;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 46;
  const innerR = 30;
  const gap = 0.05;
  let currentAngle = -Math.PI / 2;

  const statusColors = getStatusColors(theme);
  const statuses: Status[] = [
    "em_dia",
    "atraso_leve",
    "atraso_critico",
    "sem_dados",
  ];

  const paths = statuses
    .filter((s) => counts[s] > 0)
    .map((s, i) => {
      const fraction = counts[s] / total;
      const sliceAngle = fraction * Math.PI * 2 - gap;
      const startA = currentAngle + gap / 2;
      const endA = startA + sliceAngle;
      currentAngle += fraction * Math.PI * 2;

      const x1 = cx + outerR * Math.cos(startA);
      const y1 = cy + outerR * Math.sin(startA);
      const x2 = cx + outerR * Math.cos(endA);
      const y2 = cy + outerR * Math.sin(endA);
      const x3 = cx + innerR * Math.cos(endA);
      const y3 = cy + innerR * Math.sin(endA);
      const x4 = cx + innerR * Math.cos(startA);
      const y4 = cy + innerR * Math.sin(startA);
      const large = sliceAngle > Math.PI ? 1 : 0;

      const d = `M${x1},${y1} A${outerR},${outerR} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${innerR},${innerR} 0 ${large} 0 ${x4},${y4} Z`;
      return <path key={`slice-${i}`} d={d} fill={statusColors[s]} />;
    });

  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ display: "block" }}>
        {paths}
      </svg>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 20,
            fontWeight: 800,
            color: theme.text.primary,
            lineHeight: 1,
          }}
        >
          {total}
        </div>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 9,
            color: theme.text.tertiary,
            marginTop: 2,
          }}
        >
          CNPJs
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function KPICards({ data, theme }: KPICardsProps) {
  const counts: Record<Status, number> = {
    em_dia: 0,
    atraso_leve: 0,
    atraso_critico: 0,
    sem_dados: 0,
  };
  data.forEach((p) => counts[p.status]++);
  const total = data.length;

  const statusColors = getStatusColors(theme);
  const statusInfoThemed = getStatusInfo(theme);
  const statuses: Status[] = [
    "em_dia",
    "atraso_leve",
    "atraso_critico",
    "sem_dados",
  ];

  return (
    <div style={{ padding: "0 24px" }}>
      <div
        style={{
          background: theme.bg.card,
          border: `1px solid ${theme.border.main}`,
          borderRadius: 14,
          boxShadow: "0 1px 4px rgba(14,61,110,0.07)",
          padding: "18px 16px",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        {/* Donut + title — hidden on mobile via CSS */}
        <div
          className="kpi-donut"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <MiniDonut counts={counts} total={total} theme={theme} />
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              color: theme.text.tertiary,
              textAlign: "center",
              maxWidth: 100,
            }}
          >
            Distribuição por status
          </span>
        </div>

        {/* Divider — hidden on mobile via CSS */}
        <div
          className="kpi-divider"
          style={{
            width: 1,
            alignSelf: "stretch",
            background: theme.border.main,
            flexShrink: 0,
            minHeight: 80,
          }}
        />

        {/* 4 status cards */}
        <div
          className="kpi-grid"
          style={{
            flex: 1,
            minWidth: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 12,
          }}
        >
          {statuses.map((s) => {
            const pct = total > 0 ? Math.round((counts[s] / total) * 100) : 0;
            const color = statusColors[s];
            const { bg, border } = statusInfoThemed[s];

            return (
              <div
                key={s}
                style={{
                  background: bg,
                  border: `1px solid ${border}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {/* Top row: dot + label */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 11,
                      color: theme.text.tertiary,
                      fontWeight: 600,
                    }}
                  >
                    {STATUS_LABELS[s]}
                  </span>
                </div>

                {/* Big number */}
                <div
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 32,
                    fontWeight: 800,
                    color: color,
                    lineHeight: 1,
                  }}
                >
                  {counts[s]}
                </div>

                {/* Sub + pct */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 10,
                      color: theme.text.tertiary,
                    }}
                  >
                    {STATUS_SUBLABEL[s]}
                  </span>
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      color: color,
                      background: theme.bg.card,
                      border: `1px solid ${border}`,
                      borderRadius: 999,
                      padding: "1px 7px",
                    }}
                  >
                    {pct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: 4,
                    borderRadius: 999,
                    background: theme.bg.card,
                    overflow: "hidden",
                    border: `1px solid ${border}`,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      borderRadius: 999,
                      background: color,
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
