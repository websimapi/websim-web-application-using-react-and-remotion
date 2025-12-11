import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@websim/remotion/player";
import { BingoCardClip } from "./composition.jsx";
const exampleCard = [
  ["1", "18", "31", "48", "63"],
  ["2", "16", "30", "52", "66"],
  ["5", "20", "FREE", "57", "72"],
  ["12", "21", "39", "51", "68"],
  ["7", "24", "34", "46", "70"]
];
function HeaderSmall() {
  const letters = ["B", "I", "N", "G", "O"];
  return (
    // Render the letters in a matching grid so they align with the 5x5 numbers
    /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "repeat(5, 92px)", gap: 8, justifyContent: "center", marginBottom: 12 }, children: letters.map((L) => /* @__PURE__ */ jsxDEV(
      "div",
      {
        style: {
          width: 92,
          height: 92,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
          border: `4px solid #2b2b2b`,
          // header thicker outline to match composition
          fontSize: 48,
          fontWeight: 900,
          // bolder letters
          color: "#1b1b1b",
          fontFamily: "Arial, Helvetica, sans-serif"
        },
        children: L
      },
      L,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 22,
        columnNumber: 9
      },
      this
    )) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 20,
      columnNumber: 5
    }, this)
  );
}
function BingoCage({ size = 360 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [ejectBall, setEjectBall] = useState(null);
  const particlesRef = useRef([]);
  const spinStartRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const DPR = window.devicePixelRatio || 1;
    const W = size;
    const H = Math.round(size * 0.66);
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(DPR, DPR);
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(W, H) * 0.38;
    const makeBalls = () => {
      const balls = [];
      for (let i = 0; i < 16; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * (radius * 0.6);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        balls.push({
          id: i + 1,
          x,
          y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          radius: 18,
          color: `hsl(${Math.floor(Math.random() * 360)},70%,55%)`
        });
      }
      return balls;
    };
    particlesRef.current = makeBalls();
    const friction = 0.995;
    const bounce = 0.98;
    function step(t) {
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.fillStyle = "#cfcfcf";
      ctx.fillRect(cx - 90, H - 36, 180, 26);
      ctx.restore();
      ctx.save();
      ctx.translate(cx, cy);
      const spinElapsed = spinning ? (performance.now() - spinStartRef.current) / 1e3 : 0;
      const cageRotate = spinning ? spinElapsed * 6 % (Math.PI * 2) : 0;
      ctx.rotate(cageRotate * 0.08);
      ctx.translate(-cx, -cy);
      ctx.strokeStyle = "#777";
      ctx.lineWidth = 2;
      for (let i = -6; i <= 6; i++) {
        const w = i / 6 * radius;
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius, Math.abs(radius * Math.cos(i / 6 * (Math.PI / 2))), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      const tangentialStrength = spinning ? 0.3 : 0;
      particlesRef.current.forEach((p, idx) => {
        p.vx += (Math.random() - 0.5) * 0.12;
        p.vy += (Math.random() - 0.5) * 0.12;
        if (tangentialStrength) {
          const dx2 = p.x - cx;
          const dy2 = p.y - cy;
          const dist2 = Math.max(1, Math.sqrt(dx2 * dx2 + dy2 * dy2));
          const tx = -dy2 / dist2;
          const ty = dx2 / dist2;
          p.vx += tx * tangentialStrength;
          p.vy += ty * tangentialStrength;
        }
        p.x += p.vx;
        p.y += p.vy;
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const limit = radius - p.radius - 4;
        if (dist > limit) {
          const nx = dx / dist;
          const ny = dy / dist;
          p.x = cx + nx * limit;
          p.y = cy + ny * limit;
          const vn = p.vx * nx + p.vy * ny;
          p.vx -= (1 + bounce) * vn * nx;
          p.vy -= (1 + bounce) * vn * ny;
          p.vx *= friction;
          p.vy *= friction;
        }
        for (let j = idx + 1; j < particlesRef.current.length; j++) {
          const q = particlesRef.current[j];
          const dx2 = q.x - p.x;
          const dy2 = q.y - p.y;
          const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1e-3;
          const minDist = p.radius + q.radius;
          if (d2 < minDist) {
            const overlap = 0.5 * (minDist - d2);
            const nx2 = dx2 / d2;
            const ny2 = dy2 / d2;
            p.x -= overlap * nx2;
            p.y -= overlap * ny2;
            q.x += overlap * nx2;
            q.y += overlap * ny2;
            const dvx = q.vx - p.vx;
            const dvy = q.vy - p.vy;
            const impact = dvx * nx2 + dvy * ny2;
            if (impact > 0) {
              const impulse = impact * 0.9;
              p.vx += impulse * nx2;
              p.vy += impulse * ny2;
              q.vx -= impulse * nx2;
              q.vy -= impulse * ny2;
            }
          }
        }
      });
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.shadowColor = "rgba(0,0,0,0.18)";
        ctx.shadowBlur = 6;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#111";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(p.id), p.x, p.y);
        ctx.restore();
      });
      ctx.beginPath();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#666";
      ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.save();
      const chuteX = cx + radius + 8;
      const chuteY = cy + radius * 0.2;
      ctx.fillStyle = "#ddd";
      ctx.beginPath();
      ctx.roundRect ? (ctx.beginPath(), ctx.roundRect(chuteX, chuteY - 18, 60, 36, 8), ctx.fill()) : ctx.fillRect(chuteX, chuteY - 18, 60, 36);
      ctx.restore();
      if (ejectBall) {
        const { startTime, ball } = ejectBall;
        const elapsed = (performance.now() - startTime) / 1e3;
        const duration = 0.9;
        const tnorm = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - tnorm, 3);
        const sx = ball.x;
        const sy = ball.y;
        const tx = chuteX + 38;
        const ty = chuteY;
        const ex = sx + (tx - sx) * ease;
        const ey = sy + (ty - sy) * ease - ease * 12;
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = ball.color;
        ctx.arc(ex, ey, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (tnorm === 1) {
          setTimeout(() => setEjectBall(null), 500);
        }
      }
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [size, spinning, ejectBall]);
  const handleTap = () => {
    if (spinning) return;
    setSpinning(true);
    spinStartRef.current = performance.now();
    setTimeout(() => setSpinning(false), 1800);
    setTimeout(() => {
      const arr = particlesRef.current;
      if (!arr || !arr.length) return;
      const idx = Math.floor(Math.random() * arr.length);
      const chosen = arr[idx];
      const ballCopy = { ...chosen };
      particlesRef.current = arr.filter((_, i) => i !== idx);
      setEjectBall({ startTime: performance.now(), ball: ballCopy });
      setTimeout(() => {
        const newId = Math.floor(Math.random() * 75) + 1;
        const W = size;
        const H = Math.round(size * 0.66);
        const cx = W / 2;
        const cy = H / 2;
        const radius = Math.min(W, H) * 0.38;
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * (radius * 0.5);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const newBall = {
          id: newId,
          x,
          y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          radius: 18,
          color: `hsl(${Math.floor(Math.random() * 360)},70%,55%)`
        };
        particlesRef.current.push(newBall);
      }, 1200);
    }, 420);
  };
  return /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "center", marginBottom: 8 }, children: /* @__PURE__ */ jsxDEV(
    "div",
    {
      role: "button",
      onClick: handleTap,
      style: {
        width: size,
        height: Math.round(size * 0.66),
        borderRadius: 14,
        background: "#fafafa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
        cursor: "pointer",
        userSelect: "none"
      },
      "aria-label": "Bingo cage - tap to spin",
      children: /* @__PURE__ */ jsxDEV("canvas", { ref: canvasRef }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 343,
        columnNumber: 9
      }, this)
    },
    void 0,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 326,
      columnNumber: 7
    },
    this
  ) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 325,
    columnNumber: 5
  }, this);
}
function InteractiveApp() {
  const [actions, setActions] = useState([]);
  const [playerKey, setPlayerKey] = useState(0);
  const [isReplayMode, setIsReplayMode] = useState(false);
  const handleCellTap = (r, c) => {
    const t = Date.now();
    const next = [...actions, { r, c, t }];
    setActions(next);
  };
  const clearActions = () => {
    setActions([]);
    setIsReplayMode(false);
    setPlayerKey((k) => k + 1);
  };
  const matchForPlayer = useMemo(() => {
    if (!isReplayMode) return { card: exampleCard, highlights: [], durationInFrames: 150 };
    if (actions.length === 0) return { card: exampleCard, highlights: [], durationInFrames: 150 };
    const sorted = [...actions].sort((a, b) => a.t - b.t);
    const t0 = sorted[0].t;
    const actionsWithFrame = sorted.map((a, idx) => {
      const msOffset = a.t - t0;
      const frameFromTime = Math.round(msOffset / 1e3 * 30);
      const frame = Math.max(0, frameFromTime + idx * 6);
      return { r: a.r + 1, c: a.c, frame };
    });
    const maxFrame = actionsWithFrame.reduce((m, a) => Math.max(m, a.frame), 0);
    const durationInFrames = Math.max(150, maxFrame + 30);
    const lettersRow = ["B", "I", "N", "G", "O"];
    const cardWithHeader = [lettersRow, ...exampleCard];
    return { card: cardWithHeader, replayActions: actionsWithFrame, durationInFrames };
  }, [isReplayMode, actions]);
  return /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", height: "100%", gap: 12, alignItems: "center", padding: 12, boxSizing: "border-box", justifyContent: "center" }, children: [
    /* @__PURE__ */ jsxDEV("div", { style: { width: 360, boxSizing: "border-box", background: "#fff", borderRadius: 12, padding: 12 }, children: /* @__PURE__ */ jsxDEV("div", { style: {
      width: "100%",
      height: 640,
      marginTop: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#fafafa",
      borderRadius: 12,
      boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
      overflow: "hidden"
    }, children: /* @__PURE__ */ jsxDEV("div", { style: {
      width: 620,
      padding: 28,
      borderRadius: 20,
      background: "#fff",
      /* scale preview down so it matches composition render size inside the 360px panel */
      transform: "scale(0.55)",
      transformOrigin: "center center",
      // changed from "top center" to center the scaled board
      /* ensure the scaled content stays centered in its container */
      /* removed marginLeft/marginRight:auto to let flex centering handle alignment */
      boxSizing: "content-box"
    }, children: [
      /* @__PURE__ */ jsxDEV(BingoCage, { size: 520 }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 421,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV(HeaderSmall, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 424,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "repeat(5, 92px)", gap: 8, justifyContent: "center", marginTop: 6 }, children: exampleCard.map(
        (row, rIdx) => row.map((cell, cIdx) => {
          const isFree = typeof cell === "string" && cell.toLowerCase().includes("free");
          const tapped = actions.some((a) => a.r === rIdx && a.c === cIdx);
          return /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => handleCellTap(rIdx, cIdx),
              style: {
                width: 92,
                height: 92,
                borderRadius: 12,
                border: "3px solid #2b2b2b",
                // match composition thicker outline for cells
                background: isFree ? "#efefef" : "#fff",
                fontWeight: 700,
                fontSize: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                color: "#111",
                fontFamily: "Arial, Helvetica, sans-serif"
              },
              children: [
                tapped && /* @__PURE__ */ jsxDEV("div", { style: {
                  position: "absolute",
                  width: 74,
                  height: 74,
                  borderRadius: 999,
                  background: "#ff6b6b",
                  opacity: 0.95,
                  zIndex: 0
                } }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 454,
                  columnNumber: 25
                }, this),
                /* @__PURE__ */ jsxDEV("div", { style: { zIndex: 1, fontSize: 20 }, children: isFree ? "FREE" : cell }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 464,
                  columnNumber: 23
                }, this)
              ]
            },
            `${rIdx}-${cIdx}`,
            true,
            {
              fileName: "<stdin>",
              lineNumber: 432,
              columnNumber: 21
            },
            this
          );
        })
      ) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 425,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 408,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 396,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 394,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { width: 360, height: 640, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxDEV("div", { style: { width: "100%", height: "100%", boxSizing: "border-box", borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 36px rgba(0,0,0,0.12)" }, children: /* @__PURE__ */ jsxDEV(
      Player,
      {
        component: BingoCardClip,
        durationInFrames: matchForPlayer.durationInFrames || 150,
        fps: 30,
        compositionWidth: 1080,
        compositionHeight: 1920,
        loop: true,
        controls: true,
        inputProps: { match: matchForPlayer },
        autoplay: true,
        style: { width: "100%", height: "100%" }
      },
      playerKey + (isReplayMode ? "-replay" : ""),
      false,
      {
        fileName: "<stdin>",
        lineNumber: 479,
        columnNumber: 11
      },
      this
    ) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 478,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 477,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { width: 360, boxSizing: "border-box", padding: 12, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => {
              setIsReplayMode(true);
              setPlayerKey((k) => k + 1);
            },
            style: { padding: "8px 12px", borderRadius: 8, background: "#1b9fff", color: "#fff", border: "none", fontSize: 14 },
            children: "Render Replay"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 498,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: clearActions,
            style: { padding: "8px 12px", borderRadius: 8, background: "#eee", border: "none", fontSize: 14 },
            children: "Clear"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 504,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 497,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { width: "100%", fontSize: 12 }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { fontWeight: 700, marginBottom: 6 }, children: "Recorded actions JSON" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 513,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("pre", { style: { whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#f7f7f7", padding: 8, borderRadius: 6, maxHeight: 420, overflow: "auto" }, children: JSON.stringify(actions, null, 2) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 514,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 512,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 496,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 392,
    columnNumber: 5
  }, this);
}
createRoot(document.getElementById("app")).render(/* @__PURE__ */ jsxDEV(InteractiveApp, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 523,
  columnNumber: 51
}));
