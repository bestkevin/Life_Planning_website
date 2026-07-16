import { useId } from "react";
import { HOLLAND_TYPE_ORDER, hollandTypes } from "../data/hollandContent.js";

/** Pointy-top hexagon: vertices clockwise from top. */
const CX = 100;
const CY = 100;
const R = 86;

function hexVertex(index) {
    const angle = (Math.PI / 180) * (60 * index - 90);
    return {
        x: CX + R * Math.cos(angle),
        y: CY + R * Math.sin(angle),
    };
}

/** V0 top, V1 TR, V2 BR, V3 bottom, V4 BL, V5 TL */
const VERTICES = Array.from({ length: 6 }, (_, i) => hexVertex(i));

/**
 * Sector for type at position `index` in HOLLAND_TYPE_ORDER (I,A,S,E,C,R).
 * Wedge centered on each vertex: from prev vertex through current to next —
 * implemented as triangle center → vertex[i] → vertex[i+1] shifted so
 * I sits in the top wedge (V5→V0→center via using i starting at 5).
 */
function sectorPath(typeIndex) {
    const start = (typeIndex + 5) % 6;
    const end = (start + 1) % 6;
    const a = VERTICES[start];
    const b = VERTICES[end];
    return `M ${CX} ${CY} L ${a.x} ${a.y} L ${b.x} ${b.y} Z`;
}

function labelPoint(typeIndex) {
    const start = (typeIndex + 5) % 6;
    const end = (start + 1) % 6;
    const a = VERTICES[start];
    const b = VERTICES[end];
    return {
        x: (CX + a.x + b.x) / 3,
        y: (CY + a.y + b.y) / 3,
    };
}

const FILL = [
    "rgba(120, 88, 48, 0.55)",
    "rgba(150, 110, 58, 0.52)",
    "rgba(100, 74, 40, 0.55)",
    "rgba(140, 102, 52, 0.52)",
    "rgba(110, 80, 44, 0.55)",
    "rgba(130, 96, 50, 0.52)",
];

/**
 * Clickable Holland hexagon with simplified Chinese sector labels.
 */
export default function HollandHexagon({
    onSelect,
    interactive = true,
    className = "",
    size = 220,
}) {
    const glowId = useId().replace(/:/g, "");

    return (
        <svg
            className={`holland-hexagon ${interactive ? "holland-hexagon--interactive" : ""} ${className}`.trim()}
            width={size}
            height={size}
            viewBox="0 0 200 200"
            role={interactive ? "group" : "img"}
            aria-label="霍兰德六边形兴趣模型"
        >
            <defs>
                <radialGradient id={glowId} cx="50%" cy="45%" r="65%">
                    <stop offset="0%" stopColor="rgba(247, 232, 168, 0.22)" />
                    <stop offset="100%" stopColor="rgba(40, 28, 16, 0.05)" />
                </radialGradient>
            </defs>

            <polygon
                points={VERTICES.map((v) => `${v.x},${v.y}`).join(" ")}
                fill={`url(#${glowId})`}
                stroke="rgba(210, 170, 96, 0.65)"
                strokeWidth="1.6"
            />

            {HOLLAND_TYPE_ORDER.map((code, index) => {
                const type = hollandTypes[code];
                const label = labelPoint(index);
                return (
                    <g key={code}>
                        <path
                            d={sectorPath(index)}
                            fill={FILL[index]}
                            stroke="rgba(210, 170, 96, 0.45)"
                            strokeWidth="1"
                            className="holland-hexagon-sector"
                            role={interactive ? "button" : undefined}
                            tabIndex={interactive ? 0 : undefined}
                            aria-label={`${type.name} ${code}`}
                            onClick={
                                interactive && onSelect
                                    ? () => onSelect(code)
                                    : undefined
                            }
                            onKeyDown={
                                interactive && onSelect
                                    ? (event) => {
                                          if (event.key === "Enter" || event.key === " ") {
                                              event.preventDefault();
                                              onSelect(code);
                                          }
                                      }
                                    : undefined
                            }
                        />
                        <text
                            x={label.x}
                            y={label.y - 4}
                            textAnchor="middle"
                            className="holland-hexagon-label"
                            pointerEvents="none"
                        >
                            {type.name}
                        </text>
                        <text
                            x={label.x}
                            y={label.y + 10}
                            textAnchor="middle"
                            className="holland-hexagon-code"
                            pointerEvents="none"
                        >
                            {code}
                        </text>
                    </g>
                );
            })}

            <circle
                cx={CX}
                cy={CY}
                r="18"
                fill="rgba(28, 20, 12, 0.72)"
                stroke="rgba(210, 170, 96, 0.55)"
                strokeWidth="1.2"
            />
            <text
                x={CX}
                y={CY + 4}
                textAnchor="middle"
                className="holland-hexagon-center"
                pointerEvents="none"
            >
                RIASEC
            </text>
        </svg>
    );
}
