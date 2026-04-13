import { Theme } from "../../theme";
import { X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Pharmacy,
  generateAuditHistory,
  generateDayData,
} from "../../data/mockData";
import {
  STATUS_INFO,
  SYSTEM_COLORS,
  CONTRACT_COLORS,
  formatDate,
  getLagColor,
  getStatusInfo,
} from "../../constants";

interface DetailDrawerProps {
  theme: Theme;
  pharmacy: Pharmacy;
  onClose: () => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div
      style={{
        background: "#1A2B3C",
        border: "1px solid #334155",
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
        color: "#E2E8F0",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6, color: "#fff" }}>
        {d.auditDate}
      </div>
      <div>
        Redshift:{" "}
        <span style={{ color: "#93C5FD" }}>{d.lastDateRedshift ?? "—"}</span>
      </div>
      <div>
        API: <span style={{ color: "#6EE7B7" }}>{d.lastDateApi ?? "—"}</span>
      </div>
      <div>
        Atraso:{" "}
        <span
          style={{
            color:
              getLagColor(d.daysLag) === "#059669"
                ? "#34D399"
                : getLagColor(d.daysLag),
            fontWeight: 700,
          }}
        >
          {d.daysLag === null
            ? "—"
            : d.daysLag === 0
              ? "0 dias"
              : `${d.daysLag} dias`}
        </span>
      </div>
    </div>
  );
};

export function DetailDrawer({ pharmacy, onClose, theme }: DetailDrawerProps) {
  const info = getStatusInfo(theme)[pharmacy.status];
  const chartData = generateAuditHistory(pharmacy);
  const dayData = generateDayData(pharmacy);

  const sectionCard: React.CSSProperties = {
    background: theme.bg.card,
    border: `1px solid ${theme.border.main}`,
    borderRadius: 12,
    padding: 16,
  };

  const sectionLabel: React.CSSProperties = {
    fontFamily: "Inter, sans-serif",
    fontSize: 11,
    fontWeight: 700,
    color: theme.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: "0 0 12px 0",
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "rgba(14,61,110,0.25)",
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
          width: "min(680px, 100vw)",
          background: theme.bg.main,
          borderLeft: `1px solid ${theme.border.dark}`,
          boxShadow: "-8px 0 40px rgba(14,61,110,0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: `1px solid ${theme.border.dark}`,
            background: theme.bg.header,
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                margin: 0,
              }}
            >
              {pharmacy.name} #{pharmacy.storeNumber}
            </h2>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.6)",
                margin: 0,
              }}
            >
              {pharmacy.cnpj}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.8)",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Resumo */}
          <div style={sectionCard}>
            <h3 style={sectionLabel}>Resumo</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {[
                { label: "CNPJ", value: pharmacy.cnpj },
                { label: "Nome", value: pharmacy.name },
                { label: "Número", value: `#${pharmacy.storeNumber}` },
                { label: "Cód. Associação", value: pharmacy.associationCode },
                {
                  label: "Sistema",
                  value: pharmacy.system,
                  color: SYSTEM_COLORS[pharmacy.system].color,
                },
                {
                  label: "Sit. Contrato",
                  value: pharmacy.contractStatus,
                  color: CONTRACT_COLORS[pharmacy.contractStatus].color,
                },
                {
                  label: "Status",
                  custom: (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "3px 10px",
                        borderRadius: 100,
                        background: info.bg,
                        color: info.color,
                        border: `1px solid ${info.border}`,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <info.Icon size={13} />
                      {info.label}
                      {pharmacy.daysLag !== null &&
                        pharmacy.daysLag > 0 &&
                        ` (${pharmacy.daysLag} dias)`}
                    </div>
                  ),
                },
                {
                  label: "Dias Atraso",
                  value:
                    pharmacy.daysLag === null
                      ? "—"
                      : pharmacy.daysLag === 0
                        ? "0 dias"
                        : `+${pharmacy.daysLag} dias`,
                  color: getLagColor(pharmacy.daysLag),
                  bold: true,
                },
                {
                  label: "Última Data Redshift",
                  value: formatDate(pharmacy.lastDateRedshift),
                },
                {
                  label: "Última Data API",
                  value: formatDate(pharmacy.lastDateApi),
                },
              ].map((item, idx) => (
                <div key={idx}>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 11,
                      color: theme.text.tertiary,
                      marginBottom: 3,
                    }}
                  >
                    {item.label}
                  </div>
                  {(item as any).custom ? (
                    (item as any).custom
                  ) : (
                    <div
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 13,
                        color: (item as any).color ?? theme.text.primary,
                        fontWeight: (item as any).bold ? 700 : 500,
                      }}
                    >
                      {item.value}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div style={sectionCard}>
            <h3 style={sectionLabel}>Evolução do Atraso ao Longo do Tempo</h3>
            {pharmacy.status === "sem_dados" ? (
              <div
                style={{
                  height: 160,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: theme.bg.alt,
                  borderRadius: 8,
                  color: theme.text.tertiary,
                  fontSize: 13,
                  border: `1px solid ${theme.border.main}`,
                }}
              >
                Sem dados históricos disponíveis
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border.main} />
                  <XAxis
                    dataKey="auditDate"
                    tick={{
                      fill: theme.text.tertiary,
                      fontSize: 10,
                      fontFamily: "Inter, sans-serif",
                    }}
                    axisLine={{ stroke: theme.border.main }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: theme.text.tertiary,
                      fontSize: 10,
                      fontFamily: "Inter, sans-serif",
                    }}
                    axisLine={{ stroke: theme.border.main }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={0}
                    stroke="#059669"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                  />
                  <ReferenceLine
                    y={3}
                    stroke="#D97706"
                    strokeDasharray="3 3"
                    strokeOpacity={0.4}
                  />
                  <ReferenceLine
                    y={4}
                    stroke="#DC2626"
                    strokeDasharray="3 3"
                    strokeOpacity={0.4}
                  />
                  <Line
                    type="monotone"
                    dataKey="daysLag"
                    stroke={theme.bg.header}
                    strokeWidth={2}
                    dot={{ r: 3, fill: theme.bg.header, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: theme.bg.header }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Day table */}
          {dayData.length > 0 && (
            <div style={{ ...sectionCard, padding: 0, overflow: "hidden" }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${theme.border.main}`,
                  background: theme.bg.alt,
                }}
              >
                <h3 style={{ ...sectionLabel, margin: 0 }}>
                  Cobertura por Data (dat_emissao)
                </h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        background: theme.bg.alt,
                        borderBottom: `1px solid ${theme.border.main}`,
                      }}
                    >
                      {[
                        "Data",
                        "Reg. Redshift",
                        "Reg. API",
                        "Diferença",
                        "Presente em",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            color: theme.text.secondary,
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "Inter, sans-serif",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            padding: "8px 12px",
                            textAlign: "left",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dayData.map((row, idx) => {
                      const isSoloRedshift =
                        row.presentIn === "Somente Redshift";
                      return (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: `1px solid ${theme.border.light}`,
                            background: isSoloRedshift
                              ? "#FEF2F2"
                              : "transparent",
                          }}
                        >
                          <td
                            style={{
                              padding: "8px 12px",
                              fontFamily: "Inter, sans-serif",
                              fontSize: 12,
                              color: theme.text.secondary,
                            }}
                          >
                            {row.date}
                          </td>
                          <td
                            style={{
                              padding: "8px 12px",
                              fontFamily: "Inter, sans-serif",
                              fontSize: 12,
                              color: theme.text.primary,
                            }}
                          >
                            {row.recordsRedshift.toLocaleString("pt-BR")}
                          </td>
                          <td
                            style={{
                              padding: "8px 12px",
                              fontFamily: "Inter, sans-serif",
                              fontSize: 12,
                              color: theme.text.primary,
                            }}
                          >
                            {row.recordsApi === 0
                              ? "—"
                              : row.recordsApi.toLocaleString("pt-BR")}
                          </td>
                          <td
                            style={{
                              padding: "8px 12px",
                              fontFamily: "Inter, sans-serif",
                              fontSize: 12,
                              color: row.difference > 0 ? "#D97706" : "#059669",
                              fontWeight: 600,
                            }}
                          >
                            {row.recordsApi === 0
                              ? "—"
                              : row.difference > 0
                                ? `+${row.difference}`
                                : row.difference}
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <span
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: 11,
                                color: isSoloRedshift ? "#DC2626" : "#059669",
                                background: isSoloRedshift
                                  ? "#FEE2E2"
                                  : "#ECFDF5",
                                border: `1px solid ${isSoloRedshift ? "#FECACA" : "#A7F3D0"}`,
                                padding: "2px 8px",
                                borderRadius: 100,
                                fontWeight: 600,
                              }}
                            >
                              {row.presentIn}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
