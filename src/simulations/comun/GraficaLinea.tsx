export interface Serie {
  nombre: string;
  color: string;
  /** Puntos [x, y] ordenados por x. */
  puntos: readonly (readonly [number, number])[];
  discontinua?: boolean;
}

export interface Marca {
  x: number;
  etiqueta: string;
}

interface Props {
  titulo: string;
  series: readonly Serie[];
  x: readonly [number, number];
  y: readonly [number, number];
  etiquetaX: string;
  etiquetaY: string;
  /** Posición del cursor de tiempo (línea vertical) o punto actual para gráficas X–Y. */
  cursorX?: number;
  punto?: readonly [number, number];
  marcas?: readonly Marca[];
  /** Bandas sombreadas [desde, hasta] con texto (p. ej. fases). */
  bandas?: readonly { desde: number; hasta: number; etiqueta: string; color: string }[];
  ticksY?: readonly number[];
  alto?: number;
  /** Ancho de diseño del SVG: menor en columnas estrechas para que el texto no se vea diminuto. */
  ancho?: number;
  descripcion: string;
}

const M = { izq: 44, der: 10, sup: 18, inf: 28 };

/** Gráfica de líneas en SVG, escalable y con cursor; pensada para curvas fisiológicas. */
export default function GraficaLinea({
  titulo,
  series,
  x,
  y,
  etiquetaX,
  etiquetaY,
  cursorX,
  punto,
  marcas = [],
  bandas = [],
  ticksY,
  alto = 180,
  ancho = 600,
  descripcion,
}: Props) {
  const w = ancho - M.izq - M.der;
  const h = alto - M.sup - M.inf;
  const sx = (v: number) => M.izq + ((v - x[0]) / (x[1] - x[0])) * w;
  const sy = (v: number) => M.sup + h - ((v - y[0]) / (y[1] - y[0])) * h;
  const ticks = ticksY ?? [y[0], (y[0] + y[1]) / 2, y[1]];

  return (
    <figure className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
      <figcaption className="px-1 text-xs font-semibold text-slate-300">{titulo}</figcaption>
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="h-auto w-full" role="img" aria-label={descripcion}>
        {bandas.map((b) => (
          <g key={`${b.desde}-${b.etiqueta}`}>
            <rect x={sx(b.desde)} y={M.sup} width={Math.max(0, sx(b.hasta) - sx(b.desde))} height={h} fill={b.color} />
            <text x={(sx(b.desde) + sx(b.hasta)) / 2} y={M.sup - 5} textAnchor="middle" className="fill-slate-500 text-[9px]">
              {b.etiqueta}
            </text>
          </g>
        ))}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.izq} x2={M.izq + w} y1={sy(t)} y2={sy(t)} className="stroke-slate-800" />
            <text x={M.izq - 4} y={sy(t) + 3} textAnchor="end" className="fill-slate-500 text-[10px]">
              {t}
            </text>
          </g>
        ))}
        <line x1={M.izq} x2={M.izq} y1={M.sup} y2={M.sup + h} className="stroke-slate-600" />
        <line x1={M.izq} x2={M.izq + w} y1={M.sup + h} y2={M.sup + h} className="stroke-slate-600" />
        <text x={M.izq + w / 2} y={alto - 4} textAnchor="middle" className="fill-slate-500 text-[10px]">
          {etiquetaX}
        </text>
        <text x={10} y={M.sup + h / 2} textAnchor="middle" transform={`rotate(-90 10 ${M.sup + h / 2})`} className="fill-slate-500 text-[10px]">
          {etiquetaY}
        </text>
        {marcas.map((m) => (
          <g key={`${m.x}-${m.etiqueta}`}>
            <line x1={sx(m.x)} x2={sx(m.x)} y1={M.sup} y2={M.sup + h} className="stroke-slate-600" strokeDasharray="2 3" />
            <text x={sx(m.x) + 2} y={M.sup + 9} className="fill-slate-400 text-[9px]">
              {m.etiqueta}
            </text>
          </g>
        ))}
        {series.map((s) => (
          <polyline
            key={s.nombre}
            points={s.puntos.map(([a, b]) => `${sx(a).toFixed(1)},${sy(b).toFixed(1)}`).join(' ')}
            fill="none"
            stroke={s.color}
            strokeWidth={1.8}
            strokeDasharray={s.discontinua ? '4 3' : undefined}
            strokeLinejoin="round"
          />
        ))}
        {cursorX !== undefined && <line x1={sx(cursorX)} x2={sx(cursorX)} y1={M.sup} y2={M.sup + h} stroke="#f8fafc" strokeWidth={1} opacity={0.7} />}
        {punto && <circle cx={sx(punto[0])} cy={sy(punto[1])} r={4.5} fill="#f8fafc" stroke="#0f172a" strokeWidth={1.5} />}
      </svg>
      {series.length > 1 && (
        <ul className="flex flex-wrap gap-3 px-1 text-[11px] text-slate-400">
          {series.map((s) => (
            <li key={s.nombre} className="flex items-center gap-1">
              <span aria-hidden className="inline-block h-0.5 w-4" style={{ backgroundColor: s.color }} />
              {s.nombre}
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
