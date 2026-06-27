import { useState, useRef, useEffect } from "react";

const GRID_SIZE = 20;
const CANVAS = 420;
const ORIGIN = CANVAS / 2;

function toCanvas(x, y) {
  return [ORIGIN + x * GRID_SIZE, ORIGIN - y * GRID_SIZE];
}

function drawArrow(ctx, x1, y1, x2, y2, color, width = 2.5) {
  const [cx1, cy1] = toCanvas(x1, y1);
  const [cx2, cy2] = toCanvas(x2, y2);
  const angle = Math.atan2(cy2 - cy1, cx2 - cx1);
  const headLen = 13;

  ctx.beginPath();
  ctx.moveTo(cx1, cy1);
  ctx.lineTo(cx2, cy2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx2, cy2);
  ctx.lineTo(cx2 - headLen * Math.cos(angle - 0.4), cy2 - headLen * Math.sin(angle - 0.4));
  ctx.lineTo(cx2 - headLen * Math.cos(angle + 0.4), cy2 - headLen * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function mag(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

function cosAngle(a, b) {
  const m = mag(a) * mag(b);
  if (m === 0) return 0;
  return dot(a, b) / m;
}

function angleDeg(a, b) {
  return (Math.acos(Math.max(-1, Math.min(1, cosAngle(a, b)))) * 180) / Math.PI;
}

const TABS = ["Addition", "Dot Product", "Modulus", "Cosine Sim"];

export default function VectorVisualizer() {
  const canvasRef = useRef(null);
  const [tab, setTab] = useState("Addition");
  const [r, setR] = useState({ x: 3, y: 2 });
  const [s, setS] = useState({ x: -1, y: 2 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS, CANVAS);

    // Background
    ctx.fillStyle = "#0f1117";
    ctx.fillRect(0, 0, CANVAS, CANVAS);

    // Grid
    ctx.strokeStyle = "#1e2130";
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS; x += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS); ctx.stroke();
    }
    for (let y = 0; y <= CANVAS; y += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#2a2f45";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, ORIGIN); ctx.lineTo(CANVAS, ORIGIN); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ORIGIN, 0); ctx.lineTo(ORIGIN, CANVAS); ctx.stroke();

    // Axis labels
    ctx.fillStyle = "#3a4060";
    ctx.font = "11px monospace";
    ctx.fillText("i →", CANVAS - 28, ORIGIN - 6);
    ctx.fillText("j", ORIGIN + 6, 14);
    ctx.fillText("↑", ORIGIN + 4, 24);

    // Tick labels
    ctx.fillStyle = "#2e3450";
    ctx.font = "9px monospace";
    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      const [cx] = toCanvas(i, 0);
      const [, cy] = toCanvas(0, i);
      if (Math.abs(i) <= 9) {
        ctx.fillText(i, cx - 4, ORIGIN + 14);
        ctx.fillText(i, ORIGIN + 4, cy + 3);
      }
    }

    if (tab === "Addition") {
      const sum = { x: r.x + s.x, y: r.y + s.y };
      // Draw s starting from tip of r (triangle method)
      drawArrow(ctx, 0, 0, r.x, r.y, "#7c6af7", 2.5);
      drawArrow(ctx, r.x, r.y, r.x + s.x, r.y + s.y, "#38bdf8", 2.5);
      drawArrow(ctx, 0, 0, sum.x, sum.y, "#f97316", 3);

      // Labels
      const [rx2, ry2] = toCanvas(r.x / 2, r.y / 2);
      const [sx2, sy2] = toCanvas(r.x + s.x / 2, r.y + s.y / 2);
      const [sumx, sumy] = toCanvas(sum.x / 2, sum.y / 2);
      ctx.font = "bold 13px monospace";
      ctx.fillStyle = "#7c6af7"; ctx.fillText("r", rx2 - 14, ry2);
      ctx.fillStyle = "#38bdf8"; ctx.fillText("s", sx2 - 14, sy2);
      ctx.fillStyle = "#f97316"; ctx.fillText("r+s", sumx + 6, sumy);

    } else if (tab === "Dot Product") {
      drawArrow(ctx, 0, 0, r.x, r.y, "#7c6af7", 2.5);
      drawArrow(ctx, 0, 0, s.x, s.y, "#38bdf8", 2.5);

      // Projection line
      const d = dot(r, s);
      const ms = mag(s);
      if (ms > 0) {
        const proj = { x: (d / (ms * ms)) * s.x, y: (d / (ms * ms)) * s.y };
        const [px, py] = toCanvas(proj.x, proj.y);
        const [rx2, ry2] = toCanvas(r.x, r.y);
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "#7c6af755";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(rx2, ry2); ctx.lineTo(px, py); ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#f97316";
        ctx.fill();
      }

      const [rx2, ry2] = toCanvas(r.x / 2, r.y / 2);
      const [sx2, sy2] = toCanvas(s.x / 2, s.y / 2);
      ctx.font = "bold 13px monospace";
      ctx.fillStyle = "#7c6af7"; ctx.fillText("r", rx2 - 14, ry2);
      ctx.fillStyle = "#38bdf8"; ctx.fillText("s", sx2 + 6, sy2);

    } else if (tab === "Modulus") {
      drawArrow(ctx, 0, 0, r.x, r.y, "#7c6af7", 2.5);
      // Right angle triangle
      const [ox, oy] = toCanvas(0, 0);
      const [rx2, ry2] = toCanvas(r.x, r.y);
      const [cx, cy] = toCanvas(r.x, 0);
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = "#38bdf855";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(cx, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(rx2, ry2); ctx.stroke();
      ctx.setLineDash([]);

      // Right angle mark
      const sq = 6;
      ctx.strokeStyle = "#38bdf8aa";
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - sq, cy - sq, sq, sq);

      const [mx, my] = toCanvas(r.x / 2, r.y / 2);
      ctx.font = "bold 13px monospace";
      ctx.fillStyle = "#7c6af7"; ctx.fillText("r", mx + 6, my - 4);
      ctx.fillStyle = "#38bdf8aa";
      ctx.font = "11px monospace";
      ctx.fillText(`|r| = √(${r.x}²+${r.y}²)`, ORIGIN - CANVAS / 2 + 10, CANVAS - 12);

    } else if (tab === "Cosine Sim") {
      drawArrow(ctx, 0, 0, r.x, r.y, "#7c6af7", 2.5);
      drawArrow(ctx, 0, 0, s.x, s.y, "#38bdf8", 2.5);

      // Arc for angle
      const a1 = Math.atan2(-r.y, r.x);
      const a2 = Math.atan2(-s.y, s.x);
      ctx.beginPath();
      ctx.arc(ORIGIN, ORIGIN, 28, Math.min(a1, a2), Math.max(a1, a2));
      ctx.strokeStyle = "#f9731666";
      ctx.lineWidth = 2;
      ctx.stroke();

      const midAngle = (a1 + a2) / 2;
      const [lx, ly] = [ORIGIN + 40 * Math.cos(midAngle), ORIGIN + 40 * Math.sin(midAngle)];
      ctx.fillStyle = "#f97316";
      ctx.font = "bold 11px monospace";
      ctx.fillText("θ", lx - 4, ly + 4);

      const [rx2, ry2] = toCanvas(r.x / 2, r.y / 2);
      const [sx2, sy2] = toCanvas(s.x / 2, s.y / 2);
      ctx.font = "bold 13px monospace";
      ctx.fillStyle = "#7c6af7"; ctx.fillText("r", rx2 + 6, ry2);
      ctx.fillStyle = "#38bdf8"; ctx.fillText("s", sx2 - 16, sy2);
    }
  }, [r, s, tab]);

  const dotVal = dot(r, s);
  const magR = mag(r).toFixed(3);
  const magS = mag(s).toFixed(3);
  const cos = cosAngle(r, s).toFixed(3);
  const angle = angleDeg(r, s).toFixed(1);
  const sum = { x: r.x + s.x, y: r.y + s.y };

  const Slider = ({ label, val, onChange, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <span style={{ color, fontFamily: "monospace", fontSize: 13, width: 80 }}>{label}: <b>{val}</b></span>
      <input type="range" min={-9} max={9} value={val} onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: color }} />
    </div>
  );

  const statBox = (label, val, sub) => (
    <div style={{
      background: "#13161f", borderRadius: 8, padding: "10px 14px",
      border: "1px solid #1e2130", flex: 1, minWidth: 90
    }}>
      <div style={{ color: "#4a5080", fontSize: 10, fontFamily: "monospace", marginBottom: 3 }}>{label}</div>
      <div style={{ color: "#e2e8ff", fontSize: 18, fontFamily: "monospace", fontWeight: "bold" }}>{val}</div>
      {sub && <div style={{ color: "#4a5080", fontSize: 10, fontFamily: "monospace", marginTop: 2 }}>{sub}</div>}
    </div>
  );

  const tabInfo = {
    "Addition": {
      formula: `r + s = [${r.x}+${s.x}, ${r.y}+${s.y}] = [${sum.x}, ${sum.y}]`,
      insight: "Orange arrow = combined displacement of r and s placed end-to-end.",
      stats: [
        statBox("r + s (x)", sum.x),
        statBox("r + s (y)", sum.y),
        statBox("|r+s|", mag(sum).toFixed(2)),
      ]
    },
    "Dot Product": {
      formula: `r · s = (${r.x}×${s.x}) + (${r.y}×${s.y}) = ${dotVal}`,
      insight: dotVal > 0 ? "Positive → vectors lean same way." : dotVal < 0 ? "Negative → vectors lean opposite ways." : "Zero → vectors are perpendicular!",
      stats: [
        statBox("r · s", dotVal),
        statBox("Sign", dotVal > 0 ? "➕" : dotVal < 0 ? "➖" : "0"),
        statBox("Angle", `${angle}°`),
      ]
    },
    "Modulus": {
      formula: `|r| = √(${r.x}²+${r.y}²) = √${r.x * r.x + r.y * r.y} ≈ ${magR}`,
      insight: "Modulus = length of vector using Pythagoras. The dashed lines show the right triangle.",
      stats: [
        statBox("|r|", magR),
        statBox("|s|", magS),
        statBox("r²+s²", (r.x * r.x + r.y * r.y)),
      ]
    },
    "Cosine Sim": {
      formula: `cosθ = (r·s)/(|r||s|) = ${dotVal}/(${magR}×${magS}) = ${cos}`,
      insight: cos > 0.8 ? "Very similar direction! High cosine → would be retrieved in RAG." : cos > 0.3 ? "Somewhat similar direction." : cos > -0.3 ? "Almost perpendicular — barely related." : "Opposite directions — negative similarity.",
      stats: [
        statBox("cos θ", cos),
        statBox("θ", `${angle}°`),
        statBox("Sim", Number(cos) > 0.7 ? "🔥 High" : Number(cos) > 0.3 ? "😐 Med" : "❄️ Low"),
      ]
    }
  };

  const info = tabInfo[tab];

  return (
    <div style={{
      background: "#0a0c12", minHeight: "100vh", display: "flex",
      flexDirection: "column", alignItems: "center", padding: "24px 16px",
      fontFamily: "system-ui, sans-serif", color: "#c8d0f0"
    }}>
      <div style={{ marginBottom: 4, fontSize: 11, color: "#3a4060", letterSpacing: 3, textTransform: "uppercase" }}>
        Linear Algebra
      </div>
      <h1 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700, color: "#e2e8ff", letterSpacing: -0.5 }}>
        Vector Visualizer
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "#13161f", borderRadius: 10, padding: 4 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer",
            fontFamily: "monospace", fontSize: 12, fontWeight: 600,
            background: tab === t ? "#7c6af7" : "transparent",
            color: tab === t ? "#fff" : "#4a5080",
            transition: "all 0.15s"
          }}>{t}</button>
        ))}
      </div>

      {/* Canvas */}
      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #1e2130", marginBottom: 18 }}>
        <canvas ref={canvasRef} width={CANVAS} height={CANVAS} style={{ display: "block" }} />
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, width: "100%", maxWidth: 440 }}>
        {info.stats}
      </div>

      {/* Formula */}
      <div style={{
        background: "#13161f", borderRadius: 8, padding: "10px 16px",
        border: "1px solid #1e2130", width: "100%", maxWidth: 440, marginBottom: 10
      }}>
        <div style={{ color: "#4a5080", fontSize: 10, fontFamily: "monospace", marginBottom: 4 }}>FORMULA</div>
        <div style={{ color: "#7c6af7", fontFamily: "monospace", fontSize: 12 }}>{info.formula}</div>
      </div>

      {/* Insight */}
      <div style={{
        background: "#0f1520", borderRadius: 8, padding: "10px 16px",
        border: "1px solid #1a2535", width: "100%", maxWidth: 440, marginBottom: 18
      }}>
        <div style={{ color: "#4a8080", fontSize: 10, fontFamily: "monospace", marginBottom: 4 }}>💡 INSIGHT</div>
        <div style={{ color: "#7ab8b8", fontSize: 13 }}>{info.insight}</div>
      </div>

      {/* Sliders */}
      <div style={{
        background: "#13161f", borderRadius: 10, padding: "14px 18px",
        border: "1px solid #1e2130", width: "100%", maxWidth: 440
      }}>
        <div style={{ color: "#4a5080", fontSize: 10, fontFamily: "monospace", marginBottom: 10 }}>VECTOR CONTROLS</div>
        <Slider label="r.x" val={r.x} onChange={v => setR(p => ({ ...p, x: v }))} color="#7c6af7" />
        <Slider label="r.y" val={r.y} onChange={v => setR(p => ({ ...p, y: v }))} color="#7c6af7" />
        <div style={{ borderTop: "1px solid #1e2130", margin: "10px 0" }} />
        <Slider label="s.x" val={s.x} onChange={v => setS(p => ({ ...p, x: v }))} color="#38bdf8" />
        <Slider label="s.y" val={s.y} onChange={v => setS(p => ({ ...p, y: v }))} color="#38bdf8" />
      </div>

      <div style={{ marginTop: 14, fontSize: 11, color: "#2a3050", fontFamily: "monospace" }}>
        drag sliders → watch vectors update live
      </div>
    </div>
  );
}
