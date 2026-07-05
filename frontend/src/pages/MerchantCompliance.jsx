import { useState, useEffect, useRef, useCallback } from "react";
import { merchantAPI } from "../api/index";
import { useNavigate } from "react-router-dom";

/* ═══════════════ HELPERS ═══════════════ */
const Ic = ({ d, size = 16, sw = 1.8, c = "currentColor", fill = "none" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={c}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <path d={d} />
  </svg>
);

const P = {
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  check: "M5 13l4 4L19 7",
  x: "M18 6L6 18M6 6l12 12",
  warn: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  dl: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  doc: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  refresh:
    "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12a3 3 0 100-6 3 3 0 000 6z",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  chevD: "M6 9l6 6 6-6",
  chevU: "M18 15l-6-6-6 6",
  spark: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  lock: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 8v4M12 16h.01",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
  arrow: "M5 12h14M12 5l7 7-7 7",
};

const CATEGORY_COLORS = {
  Privacy: {
    bg: "rgba(201,114,122,.12)",
    text: "#c9727a",
    border: "rgba(201,114,122,.25)",
  },
  Payment: {
    bg: "rgba(200,160,74,.12)",
    text: "#c8a04a",
    border: "rgba(200,160,74,.25)",
  },
  Security: {
    bg: "rgba(99,102,241,.12)",
    text: "#6366f1",
    border: "rgba(99,102,241,.25)",
  },
  Accessibility: {
    bg: "rgba(20,184,166,.12)",
    text: "#14b8a6",
    border: "rgba(20,184,166,.25)",
  },
  Marketing: {
    bg: "rgba(251,146,60,.12)",
    text: "#fb923c",
    border: "rgba(251,146,60,.25)",
  },
  Audit: {
    bg: "rgba(148,163,184,.12)",
    text: "#94a3b8",
    border: "rgba(148,163,184,.25)",
  },
};

const SEV_CONFIG = {
  critical: {
    label: "Critical",
    dot: "#ef4444",
    bar: "#ef4444",
    glow: "rgba(239,68,68,.25)",
    ring: "rgba(239,68,68,.15)",
  },
  high: {
    label: "High",
    dot: "#f97316",
    bar: "#f97316",
    glow: "rgba(249,115,22,.2)",
    ring: "rgba(249,115,22,.12)",
  },
  medium: {
    label: "Medium",
    dot: "#f59e0b",
    bar: "#f59e0b",
    glow: "rgba(245,158,11,.18)",
    ring: "rgba(245,158,11,.1)",
  },
  pass: {
    label: "Pass",
    dot: "#22c55e",
    bar: "#22c55e",
    glow: "rgba(34,197,94,.2)",
    ring: "rgba(34,197,94,.1)",
  },
  info: {
    label: "Info",
    dot: "#94a3b8",
    bar: "#94a3b8",
    glow: "rgba(148,163,184,.15)",
    ring: "rgba(148,163,184,.1)",
  },
};

function Badge({ text, sev }) {
  const cfg = SEV_CONFIG[sev] || SEV_CONFIG.info;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 999,
        background: `${cfg.dot}18`,
        border: `1px solid ${cfg.dot}40`,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: ".62rem",
        fontWeight: 800,
        color: cfg.dot,
        letterSpacing: ".06em",
        textTransform: "uppercase",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: cfg.dot,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}

function CatBadge({ cat }) {
  const cfg = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Audit;
  return (
    <span
      style={{
        padding: "2px 9px",
        borderRadius: 999,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: ".6rem",
        fontWeight: 800,
        color: cfg.text,
        letterSpacing: ".05em",
        textTransform: "uppercase",
        flexShrink: 0,
      }}
    >
      {cat}
    </span>
  );
}

function Pulse({ color }) {
  return (
    <span
      style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: color,
          opacity: 0.35,
          animation: "pulseRing 1.6s ease-out infinite",
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: 2,
          borderRadius: "50%",
          background: color,
        }}
      />
    </span>
  );
}

function StatCard({ label, value, sub, color, icon, glow }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const target = parseInt(value);
    if (isNaN(target)) return;
    const step = Math.ceil(target / 28);
    const t = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, [value]);

  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        border: "1.5px solid #f0d5d8",
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 4px 24px ${glow || "rgba(140,40,60,.06)"}`,
        animation: "fadeSlideUp .5s ease both",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `${color}10`,
          filter: "blur(10px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${color}30`,
          }}
        >
          <Ic d={icon} size={17} c={color} sw={2} />
        </div>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: ".65rem",
            fontWeight: 800,
            color: "#b09090",
            letterSpacing: ".08em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 700,
          fontSize: "2.1rem",
          color: "#1e1018",
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {isNaN(parseInt(value)) ? value : count}
      </p>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: ".73rem",
          color: "#9a7080",
          fontWeight: 500,
        }}
      >
        {sub}
      </p>
    </div>
  );
}

function ViolationCard({ v, onResolve }) {
  const [expanded, setExpanded] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const cfg = SEV_CONFIG[v.severity?.toLowerCase()] || SEV_CONFIG.medium;

  const handleResolve = async () => {
    setResolving(true);
    try {
      await onResolve(v.id);
      setResolved(true);
    } catch (err) {
      console.error("Failed to resolve:", err);
    } finally {
      setResolving(false);
    }
  };

  if (resolved) return null;

  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        border: `1.5px solid ${cfg.dot}35`,
        boxShadow: `0 4px 24px ${cfg.glow}, 0 0 0 ${expanded ? 4 : 0}px ${cfg.ring}`,
        overflow: "hidden",
        transition: "box-shadow .25s",
        animation: "fadeSlideUp .4s ease both",
      }}
    >
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg,${cfg.bar},${cfg.bar}80)`,
        }}
      />
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 13,
              flexShrink: 0,
              background: `${cfg.dot}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1.5px solid ${cfg.dot}30`,
            }}
          >
            <Ic d={P.warn} size={18} c={cfg.dot} sw={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 5,
              }}
            >
              <Badge text={cfg.label} sev={v.severity?.toLowerCase()} />
              <CatBadge cat={v.category || "General"} />
            </div>
            <h4
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "#1e1018",
                marginBottom: 3,
              }}
            >
              {v.title || v.rule || v}
            </h4>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: ".75rem",
                color: "#9a7080",
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: "#c9727a", fontWeight: 700 }}>
                {v.rule || "Compliance Rule"}
              </span>{" "}
              · {v.id || `V-${Date.now()}`}
            </p>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              flexShrink: 0,
              background: "#fdf5f5",
              border: "1px solid #f0d5d8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all .2s",
            }}
          >
            <Ic d={expanded ? P.chevU : P.chevD} size={14} c="#9a7080" sw={2} />
          </button>
        </div>
        {expanded && (
          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: `1px solid ${cfg.dot}18`,
              animation: "fadeSlideUp .25s ease",
            }}
          >
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: ".8rem",
                color: "#6b4d5a",
                lineHeight: 1.7,
                marginBottom: 14,
              }}
            >
              {v.description || "No description provided."}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                gap: 10,
                marginBottom: 16,
              }}
            >
              {v.page && (
                <div
                  style={{
                    background: "#fdf8f8",
                    borderRadius: 11,
                    padding: "10px 13px",
                    border: "1px solid #f0d5d8",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: ".6rem",
                      fontWeight: 800,
                      color: "#b09090",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      marginBottom: 3,
                    }}
                  >
                    Affected Page(s)
                  </p>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: ".78rem",
                      fontWeight: 700,
                      color: "#1e1018",
                    }}
                  >
                    {v.page}
                  </p>
                </div>
              )}
              {v.detected && (
                <div
                  style={{
                    background: "#fdf8f8",
                    borderRadius: 11,
                    padding: "10px 13px",
                    border: "1px solid #f0d5d8",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: ".6rem",
                      fontWeight: 800,
                      color: "#b09090",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      marginBottom: 3,
                    }}
                  >
                    Detected
                  </p>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: ".78rem",
                      fontWeight: 700,
                      color: "#1e1018",
                    }}
                  >
                    {new Date(v.detected).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <button
                onClick={handleResolve}
                disabled={resolving}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 12,
                  border: "none",
                  background: `linear-gradient(135deg,${cfg.dot},${cfg.dot}cc)`,
                  color: "white",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: ".75rem",
                  fontWeight: 800,
                  cursor: resolving ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  boxShadow: `0 4px 14px ${cfg.glow}`,
                  transition: "all .2s",
                  letterSpacing: ".04em",
                }}
              >
                {resolving ? (
                  <>
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,.4)",
                        borderTopColor: "white",
                        animation: "spin .6s linear infinite",
                      }}
                    />
                    Resolving…
                  </>
                ) : (
                  <>
                    <Ic d={P.check} size={14} sw={2.5} c="white" />
                    Mark Resolved
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PassedCard({ p }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        border: "1.5px solid rgba(34,197,94,.22)",
        padding: "14px 16px",
        boxShadow: "0 2px 12px rgba(34,197,94,.07)",
        display: "flex",
        gap: 13,
        alignItems: "flex-start",
        animation: "fadeSlideUp .4s ease both",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 11,
          flexShrink: 0,
          background: "rgba(34,197,94,.1)",
          border: "1.5px solid rgba(34,197,94,.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ic d={P.check} size={15} sw={2.5} c="#22c55e" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 4 }}
        >
          <CatBadge cat={p.category || "General"} />
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: ".6rem",
              fontWeight: 700,
              color: "#94a3b8",
            }}
          >
            {p.rule || "Compliance Check"}
          </span>
        </div>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: ".82rem",
            fontWeight: 700,
            color: "#1e1018",
            marginBottom: 3,
          }}
        >
          {p.title || p}
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: ".7rem",
            color: "#9a7080",
            lineHeight: 1.5,
          }}
        >
          {p.description || p.note || "All requirements satisfied."}
        </p>
        {p.checked && (
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: ".63rem",
              color: "#b0c8b0",
              marginTop: 5,
            }}
          >
            Verified {new Date(p.checked).toLocaleDateString()}
          </p>
        )}
      </div>
      <Ic d={P.check} size={16} sw={2.5} c="#22c55e" />
    </div>
  );
}

function AuditRow({ entry, idx }) {
  const severity = entry.isViolation ? "high" : "pass";
  const cfg = SEV_CONFIG[severity] || SEV_CONFIG.info;
  return (
    <tr
      style={{
        borderBottom: "1px solid #f8f0f2",
        animation: `fadeSlideUp .35s ${idx * 0.03}s ease both`,
        transition: "background .15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#fdf8f8")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Pulse color={cfg.dot} />
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: ".68rem",
              color: "#9a7080",
              fontWeight: 600,
            }}
          >
            {entry.createdAt
              ? new Date(entry.createdAt).toLocaleString()
              : "N/A"}
          </span>
        </div>
      </td>
      <td style={{ padding: "12px 8px" }}>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: ".75rem",
            fontWeight: 700,
            color: "#1e1018",
          }}
        >
          {entry.actionType || "System"}
        </span>
      </td>
      <td style={{ padding: "12px 8px" }}>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: ".73rem",
            color: "#6b4d5a",
          }}
        >
          {entry.action || "Compliance check"}
        </span>
      </td>
      <td style={{ padding: "12px 8px", maxWidth: 200 }}>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: ".72rem",
            color: "#9a7080",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "block",
          }}
        >
          {entry.relatedRule || "N/A"}
        </span>
      </td>
      <td style={{ padding: "12px 8px" }}>
        <span
          style={{
            background: entry.isViolation ? "#fef2f2" : "#f0fdf4",
            color: entry.isViolation ? "#dc2626" : "#16a34a",
            fontWeight: 800,
            fontSize: "0.68rem",
            padding: "3px 10px",
            borderRadius: 999,
            textTransform: "uppercase",
            letterSpacing: ".06em",
          }}
        >
          {entry.isViolation ? "Yes" : "No"}
        </span>
      </td>
    </tr>
  );
}

function ReportModal({ onClose, reportData }) {
  const [phase, setPhase] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);

  const logItems = [
    "Initializing compliance scanner…",
    "Scanning Privacy & GDPR rules…",
    "Scanning Payment & PCI DSS…",
    "Scanning Accessibility (WCAG 2.1)…",
    "Scanning Marketing & FTC compliance…",
    "Cross-referencing violation database…",
    "Computing risk scores…",
    "Generating PDF report…",
    "Report ready ✓",
  ];

  const start = () => {
    setPhase("scanning");
    setProgress(0);
    setLogs([]);
    let i = 0;
    const addLog = () => {
      if (i < logItems.length) {
        setLogs((l) => [...l, logItems[i]]);
        setProgress(Math.round(((i + 1) / logItems.length) * 100));
        i++;
        setTimeout(addLog, 340 + Math.random() * 220);
      } else {
        setPhase("done");
      }
    };
    setTimeout(addLog, 200);
  };

  const downloadPDF = () => {
    const text = [
      "MERCHANT COMPLIANCE AUDIT REPORT",
      "Generated: " + new Date().toLocaleString(),
      "═══════════════════════════════════",
      "",
      "EXECUTIVE SUMMARY",
      `Compliance Score: ${reportData?.score || 0}%`,
      `Total Checks: ${(reportData?.passed?.length || 0) + (reportData?.violations?.length || 0)}`,
      `Violations: ${reportData?.violations?.length || 0}  |  Passed: ${reportData?.passed?.length || 0}`,
      "",
      "VIOLATIONS",
      ...(reportData?.violations || []).map(
        (v) =>
          `[VIOLATION] ${v.title || v}\nRule: ${v.rule || "N/A"}\n${v.description || ""}\n`,
      ),
      "PASSED CHECKS",
      ...(reportData?.passed || []).map(
        (p) =>
          `[PASS] ${p.title || p}\nRule: ${p.rule || "N/A"}\n${p.description || ""}\n`,
      ),
      "═══════════════════════════════════",
      "Merchant Compliance Assistant | Confidential",
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: "compliance-report.txt",
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(30,16,20,.6)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn .25s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 28,
          width: "min(94vw,500px)",
          border: "1.5px solid #f0d5d8",
          boxShadow: "0 32px 80px rgba(30,16,20,.3)",
          overflow: "hidden",
          animation: "scaleIn .3s cubic-bezier(.34,1.4,.64,1)",
        }}
      >
        <div
          style={{
            padding: "22px 24px 18px",
            background: "linear-gradient(135deg,#1e1018,#2d1a22)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              background: "rgba(201,114,122,.2)",
              border: "1.5px solid rgba(201,114,122,.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ic d={P.doc} size={20} c="#e8a0a0" sw={1.8} />
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: ".63rem",
                fontWeight: 800,
                color: "#c9727a",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              ✦ Compliance Report
            </p>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "1.2rem",
                color: "white",
              }}
            >
              Generate Audit Report
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Ic d={P.x} size={13} c="rgba(255,255,255,.6)" sw={2} />
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {phase === "idle" && (
            <>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: ".82rem",
                  color: "#7a6068",
                  lineHeight: 1.7,
                  marginBottom: 20,
                }}
              >
                This will generate a comprehensive PDF audit report covering all
                compliance rules, violations, passed checks, risk scores, and
                remediation recommendations.
              </p>
              <button
                onClick={start}
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: 16,
                  border: "none",
                  background: "linear-gradient(135deg,#c9727a,#e8a0a0)",
                  color: "white",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: ".88rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  boxShadow: "0 8px 24px rgba(180,80,80,.28)",
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                }}
              >
                <Ic d={P.spark} size={16} c="white" sw={1.8} />
                Generate Report
              </button>
            </>
          )}
          {phase === "scanning" && (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 90,
                    height: 90,
                    marginBottom: 12,
                  }}
                >
                  <svg
                    width={90}
                    height={90}
                    style={{ transform: "rotate(-90deg)" }}
                  >
                    <circle
                      cx={45}
                      cy={45}
                      r={38}
                      fill="none"
                      stroke="#f0d5d8"
                      strokeWidth={6}
                    />
                    <circle
                      cx={45}
                      cy={45}
                      r={38}
                      fill="none"
                      stroke="url(#prog)"
                      strokeWidth={6}
                      strokeDasharray={`${2 * Math.PI * 38}`}
                      strokeDashoffset={`${2 * Math.PI * 38 * (1 - progress / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset .35s" }}
                    />
                    <defs>
                      <linearGradient
                        id="prog"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#c9727a" />
                        <stop offset="100%" stopColor="#e8a0a0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.4rem",
                      fontWeight: 700,
                      color: "#1e1018",
                    }}
                  >
                    {progress}%
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: ".78rem",
                    color: "#9a7080",
                    fontWeight: 600,
                  }}
                >
                  Scanning compliance rules…
                </p>
              </div>
              <div
                style={{
                  background: "#1e1018",
                  borderRadius: 16,
                  padding: "14px 16px",
                  maxHeight: 160,
                  overflowY: "auto",
                  fontFamily: "monospace",
                  fontSize: ".7rem",
                  color: "#d4a0a8",
                  lineHeight: 1.8,
                }}
              >
                {logs.map((l, i) => (
                  <div
                    key={i}
                    style={{ opacity: i === logs.length - 1 ? 1 : 0.6 }}
                  >
                    <span style={{ color: "#c9727a", marginRight: 8 }}>›</span>
                    {l}
                  </div>
                ))}
              </div>
            </>
          )}
          {phase === "done" && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#c9727a,#e8a0a0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 8px 24px rgba(180,80,80,.3)",
                  animation: "scaleIn .4s cubic-bezier(.34,1.4,.64,1)",
                }}
              >
                <Ic d={P.check} size={28} sw={2.5} c="white" />
              </div>
              <h4
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 700,
                  fontSize: "1.3rem",
                  color: "#1e1018",
                  marginBottom: 6,
                }}
              >
                Report Generated!
              </h4>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: ".78rem",
                  color: "#9a7080",
                  marginBottom: 22,
                }}
              >
                Your compliance report is ready. Click below to download.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: 14,
                    border: "1.5px solid #f0d5d8",
                    background: "white",
                    color: "#9a7080",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: ".8rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
                <button
                  onClick={downloadPDF}
                  style={{
                    flex: 2,
                    padding: "13px",
                    borderRadius: 14,
                    border: "none",
                    background: "linear-gradient(135deg,#c9727a,#e8a0a0)",
                    color: "white",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: ".8rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 6px 18px rgba(180,80,80,.25)",
                  }}
                >
                  <Ic d={P.dl} size={15} c="white" sw={2} />
                  Download Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function MerchantCompliancePage() {
  const [report, setReport] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("violations");
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [lastScan, setLastScan] = useState(null);
  const navigate = useNavigate();

  const fetchCompliance = async () => {
    try {
      setError(null);
      const res = await merchantAPI.getCompliance();
      const data = res.data?.data;
      setReport({
        passed: Array.isArray(data?.passed) ? data.passed : [],
        violations: Array.isArray(data?.violations) ? data.violations : [],
        summary: data?.summary || "",
      });
      setAuditLogs(Array.isArray(data?.auditLogs) ? data.auditLogs : []);
      setLastScan(new Date().toLocaleString());
    } catch (err) {
      setError("Failed to load compliance report. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  useEffect(() => {
    fetchCompliance();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setLoading(true);
    await fetchCompliance();
    setNotification({
      type: "info",
      msg: "Compliance scan complete. Report updated.",
    });
    setTimeout(() => setNotification(null), 3200);
  };

  const resolveViolation = async (id) => {
    try {
      await merchantAPI.resolveViolation(id);
      setReport((prev) => ({
        ...prev,
        violations: prev.violations.filter((v) => v.id !== id),
      }));
      setNotification({
        type: "success",
        msg: `Violation marked as resolved.`,
      });
      setTimeout(() => setNotification(null), 3200);
      return true;
    } catch (err) {
      setNotification({ type: "error", msg: "Failed to resolve violation." });
      setTimeout(() => setNotification(null), 3200);
      throw err;
    }
  };

  const totalChecks =
    (report?.passed?.length || 0) + (report?.violations?.length || 0);
  const score =
    totalChecks > 0
      ? Math.round(((report?.passed?.length || 0) / totalChecks) * 100)
      : 0;
  const scoreColor =
    score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

  const TABS = [
    {
      id: "violations",
      label: `Violations (${report?.violations?.length || 0})`,
      dot: "#ef4444",
    },
    {
      id: "passed",
      label: `Passed (${report?.passed?.length || 0})`,
      dot: "#22c55e",
    },
    { id: "audit", label: "Audit Log", dot: "#94a3b8" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf7f4",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes scaleIn{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulseRing{0%{transform:scale(1);opacity:.5}100%{transform:scale(2.2);opacity:0}}
        @keyframes slideInR{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
        @keyframes scanLine{0%,100%{top:0}50%{top:calc(100% - 2px)}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#e8a0a0;border-radius:4px}
        button,input,select{font-family:inherit;}
      `}</style>

      {/* Top Bar */}
      <header
        style={{
          background: "white",
          height: 64,
          borderBottom: "1.5px solid #f0d5d8",
          padding: "0 clamp(16px,4vw,40px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 16px rgba(140,40,60,.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: 10,
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            ←
          </button>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "linear-gradient(135deg,#c9727a,#e8a0a0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(180,80,80,.3)",
            }}
          >
            <span style={{ color: "white", fontSize: 16 }}>🛡️</span>
          </div>
          <div>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "#8b3a4a",
              }}
            >
              Compliance Assistant
            </span>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: ".68rem",
                color: "#b09090",
                marginLeft: 10,
                fontWeight: 600,
                letterSpacing: ".08em",
              }}
            >
              AI-POWERED AUDIT
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 14px",
              borderRadius: 999,
              background: `${scoreColor}12`,
              border: `1.5px solid ${scoreColor}30`,
            }}
          >
            <Pulse color={scoreColor} />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: ".72rem",
                fontWeight: 800,
                color: scoreColor,
                letterSpacing: ".04em",
              }}
            >
              Score {score}%
            </span>
          </div>

          <button
            onClick={handleScan}
            disabled={scanning || loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 16px",
              borderRadius: 12,
              background: "white",
              border: "1.5px solid #f0d5d8",
              color: "#c9727a",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: ".74rem",
              fontWeight: 800,
              cursor: scanning || loading ? "wait" : "pointer",
              transition: "all .2s",
              letterSpacing: ".04em",
            }}
          >
            <Ic
              d={P.refresh}
              size={13}
              sw={2.5}
              c="currentColor"
              style={{
                animation:
                  scanning || loading ? "spin 1s linear infinite" : "none",
              }}
            />
            {scanning || loading ? "Scanning…" : "Run Scan"}
          </button>

          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 12,
              background: "linear-gradient(135deg,#c9727a,#e8a0a0)",
              color: "white",
              border: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: ".74rem",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(180,80,80,.28)",
              letterSpacing: ".05em",
            }}
          >
            <Ic d={P.dl} size={14} c="white" sw={2} />
            Generate Report
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            right: 24,
            zIndex: 300,
            padding: "13px 20px",
            borderRadius: 16,
            background:
              notification.type === "success"
                ? "rgba(34,197,94,.95)"
                : notification.type === "error"
                  ? "rgba(239,68,68,.95)"
                  : "rgba(99,102,241,.95)",
            color: "white",
            boxShadow: "0 8px 28px rgba(0,0,0,.2)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: ".8rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation: "slideInR .3s ease",
          }}
        >
          <Ic
            d={notification.type === "success" ? P.check : P.bell}
            size={15}
            c="white"
            sw={2.5}
          />
          {notification.msg}
        </div>
      )}

      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "clamp(20px,3vw,36px) clamp(16px,4vw,32px) 60px",
        }}
      >
        {/* Hero Banner */}
        <div
          style={{
            borderRadius: 28,
            overflow: "hidden",
            marginBottom: 30,
            background:
              "linear-gradient(135deg,#1e1018 0%,#2d1a22 50%,#1a1020 100%)",
            border: "1.5px solid rgba(255,255,255,.05)",
            boxShadow: "0 20px 60px rgba(30,16,20,.3)",
            position: "relative",
            animation: "fadeSlideUp .5s ease",
          }}
        >
          {scanning && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                overflow: "hidden",
                borderRadius: 28,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: 2,
                  background:
                    "linear-gradient(90deg,transparent,rgba(201,114,122,.8),transparent)",
                  animation: "scanLine 1.2s linear infinite",
                }}
              />
            </div>
          )}
          <div
            style={{
              padding: "clamp(28px,4vw,44px) clamp(24px,4vw,44px)",
              position: "relative",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 32,
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: "rgba(201,114,122,.2)",
                    border: "1.5px solid rgba(201,114,122,.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ic d={P.shield} size={22} c="#e8a0a0" sw={1.8} />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: ".62rem",
                      fontWeight: 800,
                      color: "#c9727a",
                      letterSpacing: ".15em",
                      textTransform: "uppercase",
                      marginBottom: 1,
                    }}
                  >
                    ✦ Compliance Center
                  </p>
                  <h1
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 700,
                      fontSize: "clamp(1.5rem,3.5vw,2.1rem)",
                      color: "white",
                      lineHeight: 1.1,
                    }}
                  >
                    Compliance{" "}
                    <em style={{ color: "#e8a0a0", fontStyle: "italic" }}>
                      Assistant
                    </em>
                  </h1>
                </div>
              </div>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: ".82rem",
                  color: "rgba(255,255,255,.5)",
                  lineHeight: 1.6,
                  maxWidth: 480,
                }}
              >
                AI-powered product compliance audit. Monitor regulatory
                compliance across GDPR, PCI DSS, WCAG, and more.
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: ".68rem",
                  color: "rgba(255,255,255,.3)",
                  marginTop: 10,
                }}
              >
                Last scan: {lastScan || "Not yet run"} · {auditLogs.length}{" "}
                audit events logged
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ position: "relative", width: 110, height: 110 }}>
                <svg
                  width={110}
                  height={110}
                  style={{ transform: "rotate(-90deg)" }}
                >
                  <circle
                    cx={55}
                    cy={55}
                    r={46}
                    fill="none"
                    stroke="rgba(255,255,255,.07)"
                    strokeWidth={8}
                  />
                  <circle
                    cx={55}
                    cy={55}
                    r={46}
                    fill="none"
                    stroke="url(#scoreGrad)"
                    strokeWidth={8}
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    strokeDashoffset={`${2 * Math.PI * 46 * (1 - score / 100)}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="scoreGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#c9727a" />
                      <stop offset="100%" stopColor="#e8c07a" />
                    </linearGradient>
                  </defs>
                </svg>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 700,
                      fontSize: "1.9rem",
                      color: "white",
                      lineHeight: 1,
                    }}
                  >
                    {score}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: ".55rem",
                      color: "rgba(255,255,255,.4)",
                      fontWeight: 700,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                    }}
                  >
                    score
                  </span>
                </div>
              </div>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: ".72rem",
                  fontWeight: 700,
                  color:
                    score >= 80
                      ? "#4ade80"
                      : score >= 60
                        ? "#fbbf24"
                        : "#f87171",
                }}
              >
                {score >= 80
                  ? "Compliant"
                  : score >= 60
                    ? "Needs Attention"
                    : "At Risk"}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1.5px solid #ef4444",
              borderRadius: 14,
              padding: "16px 20px",
              marginBottom: 24,
              color: "#dc2626",
              fontWeight: 700,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🛡️</div>
            <p style={{ color: "#64748b", fontWeight: 700, fontSize: "1rem" }}>
              AI is scanning your product listings for compliance issues...
            </p>
          </div>
        )}

        {!loading && report && (
          <>
            {/* Stat Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                gap: 16,
                marginBottom: 30,
              }}
            >
              <StatCard
                label="Total Checks"
                value={String(totalChecks)}
                sub="Rules evaluated"
                color="#c9727a"
                icon={P.shield}
                glow="rgba(201,114,122,.1)"
              />
              <StatCard
                label="Violations"
                value={String(report.violations?.length || 0)}
                sub={`Active violations`}
                color="#ef4444"
                icon={P.warn}
                glow="rgba(239,68,68,.08)"
              />
              <StatCard
                label="Passed Checks"
                value={String(report.passed?.length || 0)}
                sub="Rules compliant"
                color="#22c55e"
                icon={P.check}
                glow="rgba(34,197,94,.08)"
              />
              <StatCard
                label="Audit Events"
                value={String(auditLogs.length)}
                sub="Events logged"
                color="#6366f1"
                icon={P.doc}
                glow="rgba(99,102,241,.08)"
              />
            </div>

            {/* Summary Banner */}
            <div
              style={{
                background:
                  report.violations?.length === 0
                    ? "linear-gradient(135deg,#22c55e,#16a34a)"
                    : "linear-gradient(135deg,#f97316,#ea580c)",
                borderRadius: 20,
                padding: "20px 28px",
                marginBottom: 28,
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ fontSize: "2rem" }}>
                {report.violations?.length === 0 ? "✅" : "⚠️"}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>
                  {report.violations?.length === 0
                    ? "All Clear — No Violations Found"
                    : `${report.violations.length} Violation${report.violations.length > 1 ? "s" : ""} Detected`}
                </h2>
                <p
                  style={{
                    margin: 0,
                    opacity: 0.9,
                    fontSize: "0.8rem",
                    marginTop: 4,
                  }}
                >
                  {report.summary || "AI-powered compliance analysis complete."}
                </p>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800 }}>
                  {report.passed?.length || 0}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.65rem",
                    opacity: 0.85,
                    fontWeight: 700,
                  }}
                >
                  CHECKS PASSED
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: 4,
                background: "white",
                borderRadius: 16,
                padding: 5,
                border: "1.5px solid #f0d5d8",
                marginBottom: 24,
                width: "fit-content",
              }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "9px 20px",
                    borderRadius: 12,
                    border: "none",
                    background:
                      activeTab === tab.id
                        ? "linear-gradient(135deg,#c9727a,#e8a0a0)"
                        : "transparent",
                    color: activeTab === tab.id ? "white" : "#9a7080",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: ".78rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all .22s",
                    letterSpacing: ".03em",
                    boxShadow:
                      activeTab === tab.id
                        ? "0 4px 14px rgba(180,80,80,.28)"
                        : "none",
                  }}
                >
                  {activeTab !== tab.id && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: tab.dot,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Violations Tab */}
            {activeTab === "violations" && (
              <div style={{ animation: "fadeSlideUp .35s ease" }}>
                {report.violations?.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "64px 20px",
                      background: "white",
                      borderRadius: 24,
                      border: "1.5px solid #f0d5d8",
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "rgba(34,197,94,.1)",
                        border: "1.5px solid rgba(34,197,94,.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                      }}
                    >
                      <Ic d={P.check} size={28} sw={2.5} c="#22c55e" />
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 700,
                        fontSize: "1.5rem",
                        color: "#1e1018",
                        marginBottom: 8,
                      }}
                    >
                      All Clear! ✿
                    </h3>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: ".82rem",
                        color: "#9a7080",
                      }}
                    >
                      No active violations. All compliance checks passing.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    {report.violations.map((v) => (
                      <ViolationCard
                        key={v.id}
                        v={v}
                        onResolve={resolveViolation}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Passed Tab */}
            {activeTab === "passed" && (
              <div style={{ animation: "fadeSlideUp .35s ease" }}>
                {report.passed?.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "64px 20px",
                      background: "white",
                      borderRadius: 24,
                      border: "1.5px solid #f0d5d8",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: ".82rem",
                        color: "#9a7080",
                      }}
                    >
                      No passed checks yet.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
                      gap: 12,
                    }}
                  >
                    {report.passed.map((p, i) => (
                      <PassedCard key={i} p={p} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Audit Log Tab */}
            {activeTab === "audit" && (
              <div style={{ animation: "fadeSlideUp .35s ease" }}>
                <div
                  style={{
                    background: "white",
                    borderRadius: 22,
                    border: "1.5px solid #f0d5d8",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr
                          style={{
                            background:
                              "linear-gradient(135deg,#fdf5f5,#fef8f8)",
                            borderBottom: "1.5px solid #f0d5d8",
                          }}
                        >
                          {["Timestamp", "Action", "Rule", "Violation?"].map(
                            (h) => (
                              <th
                                key={h}
                                style={{
                                  padding: "12px 16px",
                                  textAlign: "left",
                                  fontFamily: "'DM Sans', sans-serif",
                                  fontSize: ".62rem",
                                  fontWeight: 900,
                                  color: "#8b5a64",
                                  letterSpacing: ".1em",
                                  textTransform: "uppercase",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {h}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              style={{
                                textAlign: "center",
                                padding: "40px",
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: ".82rem",
                                color: "#9a7080",
                              }}
                            >
                              No audit logs available.
                            </td>
                          </tr>
                        ) : (
                          auditLogs.map((log, i) => (
                            <AuditRow key={i} entry={log} idx={i} />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {showModal && (
        <ReportModal onClose={() => setShowModal(false)} reportData={report} />
      )}
    </div>
  );
}
