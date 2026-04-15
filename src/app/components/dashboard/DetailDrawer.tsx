import { Theme } from "../../theme";
import { X } from "lucide-react";
import { Pharmacy } from "../../data/mockData";
import {
  getStatusInfo,
  getTagValueStyles,
} from "../../constants";

interface DetailDrawerProps {
  theme: Theme;
  pharmacy: Pharmacy;
  onClose: () => void;
}

export function DetailDrawer({ pharmacy, onClose, theme }: DetailDrawerProps) {
  const info = getStatusInfo(theme)[pharmacy.status];
  const tagStyles = getTagValueStyles(theme);

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

  const tagColumns: { label: string; key: "gold" | "silver" | "api" }[] = [
    { label: "Gold", key: "gold" },
    { label: "Silver", key: "silver" },
    { label: "API", key: "api" },
  ];

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
          width: "min(560px, 100vw)",
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
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 12,
              }}
            >
              {[
                { label: "CNPJ", value: pharmacy.cnpj },
                { label: "Nome", value: pharmacy.name },
                { label: "Cod Farma (N Loja)", value: `#${pharmacy.storeNumber}` },
                { label: "Cod Assoc", value: pharmacy.associationCode },
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
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: theme.text.primary,
                      fontWeight: 500,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}

              {/* Status field */}
              <div>
                <div
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 11,
                    color: theme.text.tertiary,
                    marginBottom: 3,
                  }}
                >
                  Status
                </div>
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
                </div>
              </div>
            </div>
          </div>

          {/* Integration Tags */}
          <div style={sectionCard}>
            <h3 style={sectionLabel}>Status de Integração</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
              }}
            >
              {tagColumns.map(({ label, key }) => {
                const layer = pharmacy[key];
                const ts = tagStyles[layer.status];
                return (
                  <div
                    key={key}
                    style={{
                      background: ts.bg,
                      border: `1px solid ${ts.border}`,
                      borderRadius: 10,
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 11,
                        fontWeight: 700,
                        color: theme.text.tertiary,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 15,
                        fontWeight: 800,
                        color: ts.color,
                        padding: "4px 14px",
                        borderRadius: 100,
                        background: ts.bg,
                        border: `1px solid ${ts.border}`,
                      }}
                    >
                      {layer.status}
                    </span>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 11,
                        color: theme.text.tertiary,
                        marginTop: 2,
                      }}
                    >
                      Última venda:{" "}
                      {(() => {
                        const [year, month, day] = layer.lastSaleDate.split("-");
                        return `${day}/${month}/${year}`;
                      })()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
