// B&W SVG pattern textures for block faces.
// Each texture has 3 shade variants (top / side / dark) — differs in stroke weight / density
// to imply lighting without using color. Rendered as real React <pattern> JSX.

import { JSX } from "react";

export type TextureId =
  | "plain"
  | "dots"
  | "crosshatch"
  | "diagonal"
  | "horizontal"
  | "bricks"
  | "solid";

export type ShadeId = "top" | "side" | "dark";

export interface TextureDef {
  id: TextureId;
  label: string;
  glyph: string;
}

export const TEXTURES: TextureDef[] = [
  { id: "plain", label: "Plain", glyph: "□" },
  { id: "dots", label: "Dots", glyph: "⣿" },
  { id: "crosshatch", label: "Cross", glyph: "▦" },
  { id: "diagonal", label: "Diag", glyph: "▨" },
  { id: "horizontal", label: "Lines", glyph: "☰" },
  { id: "bricks", label: "Brick", glyph: "▥" },
  { id: "solid", label: "Solid", glyph: "■" },
];

export function patternId(tex: TextureId, shade: ShadeId): string {
  return `tex-${tex}-${shade}`;
}

export function fillRef(tex: TextureId, shade: ShadeId): string {
  return `url(#${patternId(tex, shade)})`;
}

interface ShadeCfg {
  sw: number; // stroke width
  density: number; // 1 = base, >1 denser (smaller spacing)
}

const SHADES: Record<ShadeId, ShadeCfg> = {
  top: { sw: 1.0, density: 1.0 },
  side: { sw: 1.4, density: 1.5 },
  dark: { sw: 1.8, density: 2.2 },
};

export function PatternDefs(): JSX.Element {
  const out: JSX.Element[] = [];
  for (const tex of TEXTURES) {
    for (const shade of ["top", "side", "dark"] as ShadeId[]) {
      out.push(
        <Pattern key={`${tex.id}-${shade}`} tex={tex.id} shade={shade} cfg={SHADES[shade]} />,
      );
    }
  }
  return <>{out}</>;
}

function Pattern({
  tex,
  shade,
  cfg,
}: {
  tex: TextureId;
  shade: ShadeId;
  cfg: ShadeCfg;
}): JSX.Element {
  const id = patternId(tex, shade);
  const { sw, density } = cfg;

  switch (tex) {
    case "plain":
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="8" height="8">
          <rect width="8" height="8" fill="#fff" />
        </pattern>
      );

    case "solid":
      // solid black; for top shade add faint white slashes so it reads as lit
      if (shade === "top") {
        return (
          <pattern id={id} patternUnits="userSpaceOnUse" width="6" height="6">
            <rect width="6" height="6" fill="#000" />
            <path d="M0,6 L6,0" stroke="#fff" strokeWidth="0.6" />
          </pattern>
        );
      }
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="4" height="4">
          <rect width="4" height="4" fill="#000" />
        </pattern>
      );

    case "dots": {
      const spacing = Math.max(3, 8 / density);
      const r = Math.min(spacing / 2 - 0.4, 1.3);
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width={spacing} height={spacing}>
          <rect width={spacing} height={spacing} fill="#fff" />
          <circle cx={spacing / 2} cy={spacing / 2} r={r} fill="#000" />
        </pattern>
      );
    }

    case "horizontal": {
      const spacing = Math.max(3, 6 / density);
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width={spacing} height={spacing}>
          <rect width={spacing} height={spacing} fill="#fff" />
          <line
            x1={0}
            y1={spacing / 2}
            x2={spacing}
            y2={spacing / 2}
            stroke="#000"
            strokeWidth={sw}
          />
        </pattern>
      );
    }

    case "diagonal": {
      const spacing = Math.max(3, 6 / density);
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width={spacing} height={spacing}>
          <rect width={spacing} height={spacing} fill="#fff" />
          <path d={`M0,${spacing} L${spacing},0`} stroke="#000" strokeWidth={sw} />
          <path d={`M${-1},${1} L${1},${-1}`} stroke="#000" strokeWidth={sw} />
          <path
            d={`M${spacing - 1},${spacing + 1} L${spacing + 1},${spacing - 1}`}
            stroke="#000"
            strokeWidth={sw}
          />
        </pattern>
      );
    }

    case "crosshatch": {
      const spacing = Math.max(3, 6 / density);
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width={spacing} height={spacing}>
          <rect width={spacing} height={spacing} fill="#fff" />
          <path d={`M0,${spacing} L${spacing},0`} stroke="#000" strokeWidth={sw} />
          <path d={`M0,0 L${spacing},${spacing}`} stroke="#000" strokeWidth={sw} />
        </pattern>
      );
    }

    case "bricks": {
      const bw = Math.max(6, 12 / density);
      const bh = Math.max(3, bw / 2);
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width={bw} height={bh * 2}>
          <rect width={bw} height={bh * 2} fill="#fff" />
          <path
            d={`M0,0 L${bw},0 M0,${bh} L${bw},${bh} M0,${bh * 2} L${bw},${bh * 2}`}
            stroke="#000"
            strokeWidth={sw * 0.8}
          />
          <path
            d={`M${bw / 2},0 L${bw / 2},${bh} M0,${bh} L0,${bh * 2} M${bw},${bh} L${bw},${bh * 2}`}
            stroke="#000"
            strokeWidth={sw * 0.8}
          />
        </pattern>
      );
    }
  }
}
