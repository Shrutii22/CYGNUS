import { useEffect, useRef } from "react";

/**
 * CYGNUS Orb: a living ring that twists into a ribbon torus.
 *  idle      → thin, wobbly, glowing ring
 *  listening → ring opens into a twisted, flowing knot
 *  thinking  → tighter, faster core while a reply is prepared
 *  speaking  → rhythmic pulse while a reply is shown
 *  on click  → a pulse swells the ring and shockwaves expand outward
 * The drawing is scaled to stay inside the canvas. The voice label
 * lives outside this control.
 */

const STRANDS = 46;
const POINTS = 140;
const CHUNK = 7;
const TAU = Math.PI * 2;

export default function Orb({ state = "idle", onClick }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(state);
  const pulseRef = useRef(0);
  const shocksRef = useRef([]);
  const listening = state === "listening";

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const handleClick = (e) => {
    pulseRef.current = 1;
    shocksRef.current.push({ born: performance.now() });
    onClick?.(e);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf;
    let size = 0;
    let boxW = 0;
    let boxH = 0;
    let dpr = 1;
    let energy = 0;
    let spin = 0;
    let last = performance.now();

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      boxW = r.width;
      boxH = r.height;
      size = Math.min(r.width, r.height) || r.width;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const xs = new Float32Array(POINTS);
    const ys = new Float32Array(POINTS);
    const zs = new Float32Array(POINTS);

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const speedScale = reduce ? 0.15 : 1;

      const mode = stateRef.current;
      const pulse = pulseRef.current;
      pulseRef.current *= Math.pow(0.04, dt); // decays over ~1s

      let target = 0;
      let spinRate = 0.55;
      if (mode === "listening") {
        target = 1;
        spinRate = 2.05;
      } else if (mode === "thinking") {
        target = 0.58;
        spinRate = 3.15;
      } else if (mode === "speaking") {
        const wave = 0.5 + 0.5 * Math.sin(now * 0.007);
        target = 0.26 + 0.34 * wave;
        spinRate = 1.2 + 0.85 * wave;
      }

      energy += (target - energy) * Math.min(1, dt * 2.4);
      const e = Math.min(1, energy);

      spin += dt * speedScale * (spinRate + pulse * 3.2);
      const t = spin;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const cx = boxW / 2;
      const cy = boxH / 2;
      // Largest torus + perspective must stay inside the canvas.
      const wobPreview = 0.038 + 0.028 * e + 0.025 * pulse;
      const tubePreview = 0.055 + 0.12 * e + 0.03 * pulse;
      const radial =
        1 + wobPreview * 1.6 + 0.08 * pulse + tubePreview * 1.28;
      const zFactor = tubePreview * 1.28;
      const persp = 5.2 / Math.max(2.2, 5.2 - zFactor);
      const fit = Math.min(1, (size * 0.46) / (size * 0.302 * radial * persp + 2));
      const R0 = size * 0.292 * fit * (1 + 0.035 * pulse + 0.012 * Math.sin(t * 2));
      const tube = R0 * (0.055 + 0.12 * e + 0.03 * pulse);
      const wob = 0.038 + 0.028 * e + 0.025 * pulse;
      const tilt = 0.28 + 0.75 * Math.min(e, 1) + 0.1 * Math.sin(t * 0.5);
      const yaw = 0.45 * Math.sin(t * 0.35) * Math.min(e + 0.2, 1);
      const cA = Math.cos(tilt), sA = Math.sin(tilt);
      const cB = Math.cos(yaw), sB = Math.sin(yaw);
      const focal = R0 * 5.2;
      const twists = 2 + Math.round(e * 1.4);

      ctx.globalCompositeOperation = "source-over";
      const atmosphere = ctx.createRadialGradient(cx, cy, R0 * 0.15, cx, cy, R0 * 1.58);
      atmosphere.addColorStop(0, `rgba(186, 224, 255, ${0.42 + 0.28 * e})`);
      atmosphere.addColorStop(0.28, `rgba(48, 132, 255, ${0.28 + 0.22 * e})`);
      atmosphere.addColorStop(0.62, `rgba(22, 78, 190, ${0.12 + 0.08 * e})`);
      atmosphere.addColorStop(1, "rgba(8, 20, 48, 0)");
      ctx.fillStyle = atmosphere;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(size * 0.46, R0 * 1.58), 0, TAU);
      ctx.fill();

      for (let ring = 0; ring < 2; ring++) {
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          Math.min(size * 0.44, R0 * (1.18 + ring * 0.16)),
          R0 * (0.38 + ring * 0.07),
          t * (ring ? -0.32 : 0.2) + ring * 0.8,
          0,
          TAU
        );
        ctx.strokeStyle = `hsla(208, 100%, ${ring ? 78 : 88}%, ${0.28 + 0.22 * e})`;
        ctx.lineWidth = ring ? 1 : 1.35;
        ctx.stroke();
      }

      const core = ctx.createRadialGradient(cx - R0 * 0.08, cy - R0 * 0.1, 0, cx, cy, R0 * 0.52);
      core.addColorStop(0, "rgba(244, 252, 255, 0.95)");
      core.addColorStop(0.22, `rgba(120, 196, 255, ${0.75 + 0.15 * e})`);
      core.addColorStop(0.55, "rgba(28, 104, 230, 0.28)");
      core.addColorStop(1, "rgba(8, 24, 60, 0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, R0 * 0.52, 0, TAU);
      ctx.fill();

      ctx.globalCompositeOperation = "lighter";

      for (let k = 0; k < STRANDS; k++) {
        const phase = (k / STRANDS) * TAU;
        const jitter = 0.65 + 0.35 * (((k * 37) % 11) / 11);
        const sparkle = k % 7 === 0;

        for (let i = 0; i < POINTS; i++) {
          const u = (i / POINTS) * TAU;
          const R =
            R0 *
            (1 +
              wob * Math.sin(2 * u + t * 0.9) +
              wob * 0.6 * Math.sin(5 * u - t * 1.4) +
              pulse * 0.1 * Math.sin(7 * u - t * 9));
          const r = tube * jitter * (1 + 0.28 * Math.sin(3 * u + t * 1.1 + k * 0.1));
          const th = twists * u + phase + t * 0.8;
          const rad = R + r * Math.cos(th);
          const x = rad * Math.cos(u);
          const y = rad * Math.sin(u);
          const z = r * Math.sin(th);

          const y1 = y * cA - z * sA;
          const z1 = y * sA + z * cA;
          const x2 = x * cB + z1 * sB;
          const z2 = -x * sB + z1 * cB;
          const p = focal / (focal - z2);
          xs[i] = cx + x2 * p;
          ys[i] = cy + y1 * p;
          zs[i] = z2;
        }

        for (let s = 0; s < POINTS; s += CHUNK) {
          let zAvg = 0;
          ctx.beginPath();
          ctx.moveTo(xs[s], ys[s]);
          for (let j = 1; j <= CHUNK; j++) {
            const idx = (s + j) % POINTS;
            ctx.lineTo(xs[idx], ys[idx]);
            zAvg += zs[idx];
          }
          const d = Math.max(-1, Math.min(1, zAvg / CHUNK / (R0 * 0.6)));
          const hue = 208 + 14 * d + (k % 5) * 3;
          const light = sparkle ? 86 : 52 + 22 * d;
          const alpha = (0.16 + 0.34 * (d * 0.5 + 0.5)) * (0.75 + 0.5 * e) + (sparkle ? 0.18 : 0);
          ctx.strokeStyle = `hsla(${hue}, 100%, ${light}%, ${Math.min(alpha, 0.95)})`;
          ctx.lineWidth = (sparkle ? 1.5 : 0.9) + 0.5 * e;
          ctx.stroke();
        }
      }

      // Click shockwaves
      const shocks = shocksRef.current;
      for (let i = shocks.length - 1; i >= 0; i--) {
        const age = (now - shocks[i].born) / 1100;
        if (age >= 1) {
          shocks.splice(i, 1);
          continue;
        }
        const ease = 1 - Math.pow(1 - age, 3);
        const limit = size * 0.455;
        for (const [scale, a] of [[1, 0.8], [0.82, 0.4]]) {
          ctx.beginPath();
          ctx.arc(cx, cy, Math.min(limit, R0 * (1.12 + 0.48 * ease * scale)), 0, TAU);
          ctx.strokeStyle = `hsla(212, 100%, 72%, ${a * (1 - age)})`;
          ctx.lineWidth = 2.2 * (1 - age) + 0.4;
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <button
      type="button"
      className={`orb-control orb-${state}`}
      onClick={handleClick}
      aria-label={listening ? "Stop listening" : "Activate CYGNUS voice assistant"}
      aria-pressed={listening}
      title={listening ? "Stop listening" : "Talk to CYGNUS"}
    >
      <span className="orb-glow" aria-hidden="true" />
      <canvas ref={canvasRef} aria-hidden="true" />
    </button>
  );
}