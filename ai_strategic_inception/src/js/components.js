/**
 * Helpers reutilizáveis para renderização dos componentes da demo.
 */

export function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function badgeClassForDecision(decision) {
  const normalized = String(decision || "").trim().toLowerCase();
  if (normalized === "avançar" || normalized === "avancar") return "badge-success";
  if (normalized === "ajustar") return "badge-warning";
  if (normalized.includes("preparar fundação") || normalized.includes("preparar fundacao"))
    return "badge-info";
  if (normalized === "pausar" || normalized === "descartar") return "badge-danger";
  return "badge-neutral";
}

export function riskChipClass(severity) {
  const s = String(severity || "").toLowerCase();
  if (s === "alto" || s === "alta") return "risk-chip risk-chip--high";
  return "risk-chip risk-chip--mid";
}

export function renderTagItems(items = []) {
  if (!items.length) {
    return '<p class="muted-label">Sem itens nesta dimensão para a demo.</p>';
  }
  return `<ul class="tag-list">${items
    .map((text) => `<li class="tag-chip">${escapeHtml(text)}</li>`)
    .join("")}</ul>`;
}

export function formatScore(score) {
  const n = Number(score);
  if (Number.isNaN(n)) return "0.0";
  return n.toFixed(1);
}

export function formatScoreRange(score, scaleMax) {
  return `${formatScore(score)} / ${scaleMax}`;
}

export function buildKpiCard({ label, value, note }) {
  return `
    <article class="kpi-card">
      <span class="kpi-label">${escapeHtml(label)}</span>
      <strong class="kpi-value metric-number">${escapeHtml(value)}</strong>
      <p class="kpi-note">${escapeHtml(note || "")}</p>
    </article>
  `.trim();
}

export function buildScoreCard({ label, score, scaleMax }) {
  const pct = Math.min(100, Math.max(0, (score / scaleMax) * 100));
  return `
    <article class="score-card">
      <div class="score-card__row">
        <span class="score-card__label">${escapeHtml(label)}</span>
        <span class="score-card__score metric-number">${formatScoreRange(score, scaleMax)}</span>
      </div>
      <div class="score-bar" aria-hidden="true">
        <div class="score-bar__fill" style="width:${pct.toFixed(1)}%"></div>
      </div>
    </article>
  `.trim();
}

export function buildAiFlowCard(flow) {
  const badge = badgeClassForDecision(flow.decision);
  return `
    <article class="ai-flow-card" data-flow-id="${escapeHtml(flow.id)}">
      <header class="ai-flow-card__header">
        <div>
          <span class="eyebrow">Onda de valor com IA</span>
          <h3 class="ai-flow-card__title">${escapeHtml(flow.name)}</h3>
          <p class="muted-label">${escapeHtml(flow.area)}</p>
        </div>
        <span class="badge ${badge}">${escapeHtml(flow.decision)}</span>
      </header>
      <div class="ai-flow-card__summary">
        <p class="flow-lede"><strong>Dor:</strong> ${escapeHtml(flow.pain)}</p>
        <p class="flow-lede"><strong>Hipótese de valor:</strong> ${escapeHtml(flow.valueHypothesis)}</p>
      </div>
      <dl class="ai-flow-meta">
        <div class="meta-block">
          <dt>Agentes previstos</dt>
          <dd>${renderTagItems(flow.agents)}</dd>
        </div>
        <div class="meta-block">
          <dt>Fluxos mapeados</dt>
          <dd>${renderTagItems(flow.mappedFlows)}</dd>
        </div>
        <div class="meta-block">
          <dt>Integrações</dt>
          <dd>${renderTagItems(flow.integrations)}</dd>
        </div>
        <div class="meta-block">
          <dt>Dados governados</dt>
          <dd>${renderTagItems(flow.governedData)}</dd>
        </div>
        <div class="meta-block">
          <dt>Arquitetura adequada ou consumida</dt>
          <dd>${renderTagItems(flow.architecture)}</dd>
        </div>
        <div class="meta-block">
          <dt>Avaliação combinada</dt>
          <dd>
            <ul class="tag-list">
              <li class="tag-chip">Risco: ${escapeHtml(flow.risk)}</li>
              <li class="tag-chip">Esforço: ${escapeHtml(flow.effort)}</li>
              <li class="tag-chip">Readiness: ${escapeHtml(flow.readiness)}</li>
            </ul>
          </dd>
        </div>
      </dl>
    </article>
  `.trim();
}

/* ── Radar chart (pure SVG) ── */

export function buildRadarChart(dimensions, scaleMax) {
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 150;
  const levels = 5;
  const n = dimensions.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  function px(angle, r) {
    return cx + r * Math.cos(angle);
  }
  function py(angle, r) {
    return cy + r * Math.sin(angle);
  }

  let gridLines = "";
  for (let lvl = 1; lvl <= levels; lvl++) {
    const r = (radius / levels) * lvl;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = startAngle + i * angleStep;
      pts.push(`${px(a, r).toFixed(1)},${py(a, r).toFixed(1)}`);
    }
    gridLines += `<polygon points="${pts.join(" ")}" class="radar-grid"/>`;
  }

  let axes = "";
  for (let i = 0; i < n; i++) {
    const a = startAngle + i * angleStep;
    axes += `<line x1="${cx}" y1="${cy}" x2="${px(a, radius).toFixed(1)}" y2="${py(a, radius).toFixed(1)}" class="radar-axis"/>`;
  }

  const dataPoints = [];
  for (let i = 0; i < n; i++) {
    const a = startAngle + i * angleStep;
    const r = (dimensions[i].score / scaleMax) * radius;
    dataPoints.push(`${px(a, r).toFixed(1)},${py(a, r).toFixed(1)}`);
  }
  const dataPolygon = `<polygon points="${dataPoints.join(" ")}" class="radar-data"/>`;

  let dots = "";
  for (let i = 0; i < n; i++) {
    const a = startAngle + i * angleStep;
    const r = (dimensions[i].score / scaleMax) * radius;
    dots += `<circle cx="${px(a, r).toFixed(1)}" cy="${py(a, r).toFixed(1)}" r="5" class="radar-dot"/>`;
  }

  const labelOffset = 18;
  let labels = "";
  for (let i = 0; i < n; i++) {
    const a = startAngle + i * angleStep;
    const lx = px(a, radius + labelOffset);
    const ly = py(a, radius + labelOffset);
    let anchor = "middle";
    if (Math.cos(a) > 0.3) anchor = "start";
    else if (Math.cos(a) < -0.3) anchor = "end";
    const dy = Math.abs(Math.sin(a)) < 0.3 ? (Math.sin(a) < 0 ? "-0.2em" : "1.1em") : "0.35em";
    const shortName = dimensions[i].shortLabel || dimensions[i].label;
    labels += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dy="${dy}" class="radar-label">${escapeHtml(shortName)}</text>`;
    labels += `<text x="${lx.toFixed(1)}" y="${(ly + 14).toFixed(1)}" text-anchor="${anchor}" dy="${dy}" class="radar-score">${formatScore(dimensions[i].score)} / ${scaleMax}</text>`;
  }

  let levelLabels = "";
  for (let lvl = 1; lvl <= levels; lvl++) {
    const r = (radius / levels) * lvl;
    levelLabels += `<text x="${(cx + 3).toFixed(1)}" y="${(cy - r + 3).toFixed(1)}" class="radar-level-label">${lvl}</text>`;
  }

  return `<svg viewBox="0 0 ${size} ${size}" class="radar-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Radar de maturidade AS IS">${gridLines}${axes}${dataPolygon}${dots}${levelLabels}${labels}</svg>`;
}

export function buildRadarLegend(dimensions, scaleMax) {
  const rows = dimensions
    .map(
      (d) =>
        `<tr>
          <td class="radar-legend__short">${escapeHtml(d.shortLabel || d.label)}</td>
          <td>${escapeHtml(d.label)}</td>
          <td class="radar-legend__score metric-number">${formatScore(d.score)} / ${scaleMax}</td>
        </tr>`,
    )
    .join("");
  return `<table class="radar-legend"><tbody>${rows}</tbody></table>`;
}

/* ── Gap card ── */

export function buildGapCard(gap, scaleMax) {
  const pct = Math.min(100, Math.max(0, (gap.score / scaleMax) * 100));
  const decisionBadge = badgeClassForDecision(gap.decision);
  const gapChips = gap.gaps
    .map((g) => `<li class="tag-chip">${escapeHtml(g)}</li>`)
    .join("");

  return `
    <article class="gap-card surface-panel">
      <header class="gap-card__header">
        <div>
          <h3 class="gap-card__title">${escapeHtml(gap.label)}</h3>
          <span class="score-card__score metric-number">${formatScore(gap.score)} / ${scaleMax}</span>
        </div>
        <span class="badge ${decisionBadge}">${escapeHtml(gap.decision)}</span>
      </header>
      <div class="score-bar" aria-hidden="true">
        <div class="score-bar__fill" style="width:${pct.toFixed(1)}%"></div>
      </div>
      <dl class="gap-card__body">
        <div class="gap-card__row">
          <dt>Leitura executiva</dt>
          <dd>${escapeHtml(gap.reading)}</dd>
        </div>
        <div class="gap-card__row">
          <dt>Gaps identificados</dt>
          <dd><ul class="tag-list">${gapChips}</ul></dd>
        </div>
        <div class="gap-card__row">
          <dt>Impacto nas ondas de valor</dt>
          <dd>${escapeHtml(gap.aiFlowImpact)}</dd>
        </div>
      </dl>
    </article>
  `.trim();
}

/* ── Stack comparison AS IS vs AI-Ready (Arquitetura Alvo – BLOCO 2) ── */

function buildIndicators(indicators, modifier) {
  const cls = modifier ? `cmp-ind cmp-ind--${modifier}` : "cmp-ind";
  return indicators
    .map(
      (i) =>
        `<div class="${cls}"><span class="cmp-ind__k">${escapeHtml(i.label)}</span><span class="cmp-ind__v">${escapeHtml(i.value)}</span></div>`,
    )
    .join("");
}

function buildStackLayers(layers, modifier) {
  return layers
    .map(
      (l, i) =>
        `<div class="stk-layer stk-layer--${modifier}"><span class="stk-layer__num">${i + 1}</span><span class="stk-layer__name">${escapeHtml(l)}</span></div>`,
    )
    .join("");
}

export function buildComparison(comp) {
  const sub = comp.connectorSubtitle
    ? `<p class="cmp-arrow__sub">${escapeHtml(comp.connectorSubtitle)}</p>`
    : "";
  return `
    <div class="cmp-grid">
      <div class="cmp-col cmp-col--asis">
        <span class="cmp-col__badge badge badge-neutral">AS IS</span>
        <h3 class="cmp-col__title">${escapeHtml(comp.asIs.label)}</h3>
        <p class="cmp-col__sub">${escapeHtml(comp.asIs.subtitle)}</p>
        <div class="stk-layers">${buildStackLayers(comp.asIs.layers, "asis")}</div>
        <div class="cmp-col__inds">${buildIndicators(comp.asIs.indicators, "asis")}</div>
      </div>
      <div class="cmp-arrow">
        <div class="cmp-arrow__track"><div class="cmp-arrow__line"></div></div>
        <span class="cmp-arrow__label">${escapeHtml(comp.connectorLabel)}</span>
        ${sub}
      </div>
      <div class="cmp-col cmp-col--tobe">
        <span class="cmp-col__badge badge badge-success">AI-READY / TO BE</span>
        <h3 class="cmp-col__title">${escapeHtml(comp.toBe.label)}</h3>
        <p class="cmp-col__sub">${escapeHtml(comp.toBe.subtitle)}</p>
        <div class="stk-layers">${buildStackLayers(comp.toBe.layers, "tobe")}</div>
        <div class="cmp-col__inds">${buildIndicators(comp.toBe.indicators, "tobe")}</div>
      </div>
    </div>
  `.trim();
}

/* ── Architecture diagram builder (visual flow – BLOCO 4) ── */

function buildNode(layer) {
  const chips = layer.chips.map((c) => `<span class="ad-chip">${escapeHtml(c)}</span>`).join("");
  const cls = layer.hero ? "ad-node ad-node--hero" : "ad-node";
  return `<div class="${cls}">
    <div class="ad-node__header">
      <span class="ad-node__num">${layer.number}</span>
      <div class="ad-node__titles">
        <strong class="ad-node__name">${escapeHtml(layer.name)}</strong>
        <span class="ad-node__phrase">${escapeHtml(layer.phrase)}</span>
      </div>
    </div>
    <div class="ad-node__chips">${chips}</div>
  </div>`;
}

export function buildArchDiagram(diagram) {
  const crossChips = diagram.crossLayer.chips
    .map((c) => `<span class="ad-chip">${escapeHtml(c)}</span>`)
    .join("");

  const conn = '<div class="ad-conn" aria-hidden="true"></div>';
  const elements = [];
  let inZone = false;

  diagram.layers.forEach((layer, idx) => {
    const isHero = !!layer.hero;
    const nextIsHero = !!diagram.layers[idx + 1]?.hero;
    const isLast = idx === diagram.layers.length - 1;

    if (isHero && !inZone) {
      elements.push('<div class="ad-zone"><span class="ad-zone__label">Zona crítica de habilitação dos AI Flows</span>');
      inZone = true;
    }

    elements.push(buildNode(layer));

    if (!isLast) {
      if (inZone && !nextIsHero) {
        elements.push("</div>");
        inZone = false;
      }
      elements.push(conn);
    } else if (inZone) {
      elements.push("</div>");
      inZone = false;
    }
  });

  return `
    <div class="ad-flow">${elements.join("")}</div>
    <div class="ad-cross">
      <div class="ad-cross__label">Camada transversal</div>
      <div class="ad-cross__inner">
        <div class="ad-cross__body">
          <span class="ad-cross__phrase">${escapeHtml(diagram.crossLayer.phrase)}</span>
          <div class="ad-cross__chips">${crossChips}</div>
        </div>
      </div>
    </div>
  `.trim();
}

/* ── Heatmap builder (Arquitetura Alvo – BLOCO 5) ── */

const HEATMAP_TEXT = {
  none: "Sem uso",
  consome: "Consome",
  prepara: "Prepara",
  ajusta: "Ajusta",
  habilita: "Habilita",
  critico: "Crítico",
};

export function buildHeatmap(heatmap) {
  const legendItems = heatmap.legend
    .map((l) => `<span class="hm-legend__item hm-cell--${l.state}">${escapeHtml(l.label)}</span>`)
    .join("");

  const headerCells = heatmap.columns
    .map((c) => `<th class="hm-th">${escapeHtml(c)}</th>`)
    .join("");

  const rows = heatmap.flows
    .map((f) => {
      const badge = badgeClassForDecision(f.decision);
      const cells = f.cells
        .map((state) => `<td class="hm-td"><span class="hm-cell hm-cell--${state}">${HEATMAP_TEXT[state] || "—"}</span></td>`)
        .join("");
      return `<tr><td class="hm-flow">${escapeHtml(f.name)}</td>${cells}<td class="hm-decision"><span class="badge ${badge}">${escapeHtml(f.decision)}</span></td></tr>`;
    })
    .join("");

  const insights = (heatmap.insights || [])
    .map((t) => `<li>${escapeHtml(t)}</li>`)
    .join("");

  const insightsBlock = insights
    ? `<div class="hm-insights"><h4 class="hm-insights__title">Leitura do monitoramento</h4><ul class="hm-insights__list">${insights}</ul></div>`
    : "";

  return `
    <div class="hm-panel">
      <div class="hm-legend"><span class="hm-legend__label">Legenda</span>${legendItems}</div>
      <div class="matrix-wrapper">
        <table class="hm-table">
          <thead><tr><th class="hm-th hm-th--flow">AI Flow</th>${headerCells}<th class="hm-th hm-th--dec">Decisão</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${insightsBlock}
    </div>
  `.trim();
}

/* ── Compact flow card (Consome / Ajusta / Habilita) ── */

export function buildFlowCompactCard(card) {
  const badge = badgeClassForDecision(card.decision);
  const consome = card.consome.map((c) => `<span class="tag-chip">${escapeHtml(c)}</span>`).join("");
  const ajusta = card.ajusta.map((a) => `<span class="tag-chip tag-chip--gap">${escapeHtml(a)}</span>`).join("");
  const habilita = card.habilita.map((h) => `<span class="tag-chip tag-chip--habilita">${escapeHtml(h)}</span>`).join("");

  return `
    <article class="arch-fcard surface-panel">
      <header class="arch-fcard__header">
        <h3 class="arch-fcard__title">${escapeHtml(card.name)}</h3>
        <span class="badge ${badge}">${escapeHtml(card.decision)}</span>
      </header>
      <dl class="arch-fcard__body">
        <div class="arch-fcard__row">
          <dt><span class="arch-fcard__action arch-fcard__action--consome">Consome</span></dt>
          <dd>${consome}</dd>
        </div>
        <div class="arch-fcard__row">
          <dt><span class="arch-fcard__action arch-fcard__action--ajusta">Ajusta</span></dt>
          <dd>${ajusta}</dd>
        </div>
        <div class="arch-fcard__row">
          <dt><span class="arch-fcard__action arch-fcard__action--habilita">Habilita</span></dt>
          <dd>${habilita}</dd>
        </div>
      </dl>
    </article>
  `.trim();
}

/* ── Consumption matrix with label badges ── */

function actionBadgeClass(action) {
  const a = String(action || "").toLowerCase();
  if (a === "consome") return "matrix-badge matrix-badge--consome";
  if (a === "habilita") return "matrix-badge matrix-badge--habilita";
  if (a === "adequa" || a === "ajusta") return "matrix-badge matrix-badge--adequa";
  if (a === "crítico" || a === "critico") return "matrix-badge matrix-badge--critico";
  if (a === "prepara") return "matrix-badge matrix-badge--prepara";
  return "matrix-badge";
}

export function buildConsumptionMatrix(layerShortNames, flows) {
  const headerCells = layerShortNames
    .map((n) => `<th class="matrix-header-cell">${escapeHtml(n)}</th>`)
    .join("");

  const rows = flows
    .map((f) => {
      const actions = f.layerActions || f.actions || [];
      const cells = actions
        .map(
          (action) =>
            `<td class="matrix-cell"><span class="${actionBadgeClass(action)}">${escapeHtml(action)}</span></td>`,
        )
        .join("");
      const decBadge = badgeClassForDecision(f.decision);
      return `<tr><td class="matrix-flow-name">${escapeHtml(f.name)}</td>${cells}<td><span class="badge ${decBadge}">${escapeHtml(f.decision)}</span></td></tr>`;
    })
    .join("");

  return `
    <div class="matrix-wrapper">
      <table class="consumption-matrix">
        <thead>
          <tr>
            <th class="matrix-header-cell matrix-header-cell--flow">AI Flow</th>
            ${headerCells}
            <th class="matrix-header-cell">Decisão</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `.trim();
}

/* ── Output preview cards (Snapshot) ── */

const OUTPUT_ICON_SVG = {
  compass: `<svg viewBox="0 0 48 48" class="output-icon__svg"><circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="2"/><polygon points="24,10 28,24 24,38 20,24" fill="currentColor" opacity="0.25" stroke="currentColor" stroke-width="1.2"/><circle cx="24" cy="24" r="3" fill="currentColor"/></svg>`,
  radar: `<svg viewBox="0 0 48 48" class="output-icon__svg"><polygon points="24,6 42,18 38,38 10,38 6,18" fill="none" stroke="currentColor" stroke-width="2"/><polygon points="24,14 34,21 32,32 16,32 14,21" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><circle cx="24" cy="24" r="2" fill="currentColor"/></svg>`,
  layers: `<svg viewBox="0 0 48 48" class="output-icon__svg"><rect x="8" y="8" width="32" height="6" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/><rect x="8" y="18" width="32" height="6" rx="2" fill="currentColor" opacity="0.22" stroke="currentColor" stroke-width="1.5"/><rect x="8" y="28" width="32" height="6" rx="2" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="1.5"/><rect x="8" y="38" width="32" height="6" rx="2" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/></svg>`,
  waves: `<svg viewBox="0 0 48 48" class="output-icon__svg"><path d="M4 24 Q12 14 20 24 T36 24 T48 24" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 32 Q12 22 20 32 T36 32 T48 32" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><path d="M4 16 Q12 6 20 16 T36 16 T48 16" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/></svg>`,
  detail: `<svg viewBox="0 0 48 48" class="output-icon__svg"><rect x="10" y="6" width="28" height="36" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><line x1="16" y1="14" x2="32" y2="14" stroke="currentColor" stroke-width="1.5"/><line x1="16" y1="20" x2="28" y2="20" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><line x1="16" y1="26" x2="30" y2="26" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><circle cx="34" cy="34" r="8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="40" y1="40" x2="44" y2="44" stroke="currentColor" stroke-width="2.5"/></svg>`,
  timeline: `<svg viewBox="0 0 48 48" class="output-icon__svg"><line x1="8" y1="24" x2="40" y2="24" stroke="currentColor" stroke-width="2"/><circle cx="14" cy="24" r="3" fill="currentColor"/><circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.6"/><circle cx="34" cy="24" r="3" fill="currentColor" opacity="0.3"/></svg>`,
  chart: `<svg viewBox="0 0 48 48" class="output-icon__svg"><rect x="8" y="28" width="6" height="14" rx="1" fill="currentColor" opacity="0.2"/><rect x="17" y="20" width="6" height="22" rx="1" fill="currentColor" opacity="0.35"/><rect x="26" y="12" width="6" height="30" rx="1" fill="currentColor" opacity="0.5"/><rect x="35" y="22" width="6" height="20" rx="1" fill="currentColor" opacity="0.3"/></svg>`,
};

export function buildOutputPreviewCard(preview) {
  const indicator = preview.indicator || preview.insight || "";
  const description = preview.description || preview.decision || "";
  const linkAttr = preview.link ? `onclick="location.hash='${escapeHtml(preview.link.replace('#', ''))}'" role="link" tabindex="0"` : "";
  const linkClass = preview.link ? " output-card--linked" : "";
  const iconSvg = (preview.icon && OUTPUT_ICON_SVG[preview.icon]) || "";
  return `
    <article class="output-card${linkClass}" ${linkAttr}>
      ${iconSvg ? `<div class="output-card__icon">${iconSvg}</div>` : ""}
      <h3 class="output-card__name">${escapeHtml(preview.name)}</h3>
      <p class="output-card__insight">${escapeHtml(indicator)}</p>
      <p class="output-card__decision">${escapeHtml(description)}</p>
    </article>
  `.trim();
}

export function buildJourneyLine(steps) {
  const items = steps
    .map((step, i) => {
      const label = typeof step === "string" ? step : step.label;
      const desc = typeof step === "object" && step.desc ? `<span class="journey-step__desc">${escapeHtml(step.desc)}</span>` : "";
      const arrow = i < steps.length - 1 ? '<span class="journey-arrow" aria-hidden="true">→</span>' : "";
      return `<span class="journey-step">${escapeHtml(label)}${desc}</span>${arrow}`;
    })
    .join("");
  return `<div class="journey-line">${items}</div>`;
}

/* ── Snapshot: decision tracks ── */

const TRACK_ICON_SVG = {
  advance: `<svg viewBox="0 0 48 48" class="output-icon__svg"><circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 24h14M26 18l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  foundation: `<svg viewBox="0 0 48 48" class="output-icon__svg"><rect x="8" y="32" width="32" height="6" rx="2" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.5"/><rect x="12" y="22" width="24" height="6" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/><rect x="16" y="12" width="16" height="6" rx="2" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1.5"/></svg>`,
  refine: `<svg viewBox="0 0 48 48" class="output-icon__svg"><circle cx="22" cy="22" r="12" fill="none" stroke="currentColor" stroke-width="2"/><line x1="31" y1="31" x2="40" y2="40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="18" y1="22" x2="26" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="22" y1="18" x2="22" y2="26" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

const TRACK_BADGE_CLASS = {
  "Prioridade executiva": "badge-advance",
  "Fundação para escala": "badge-foundation",
  "Refino necessário": "badge-adjust",
};

export function buildDecisionTracks(tracks) {
  return tracks
    .map((t) => {
      const iconSvg = TRACK_ICON_SVG[t.icon] || "";
      const badgeCls = TRACK_BADGE_CLASS[t.badge] || "badge-neutral";
      const flowChips = t.flows
        .map((f) => `<span class="sdt-chip">${escapeHtml(f)}</span>`)
        .join("");
      return `<article class="sdt-card">
        <div class="sdt-card__icon">${iconSvg}</div>
        <h3 class="sdt-card__title">${escapeHtml(t.title)}</h3>
        <span class="badge ${badgeCls}">${escapeHtml(t.badge)}</span>
        <div class="sdt-card__flows">${flowChips}</div>
        <p class="sdt-card__text">${escapeHtml(t.text)}</p>
        <p class="sdt-card__next"><strong>Próximo movimento:</strong> ${escapeHtml(t.next)}</p>
      </article>`;
    })
    .join("");
}

/* ── Snapshot: consolidated journey ── */

export function buildSnapJourney(cards) {
  return cards
    .map((c, i) => {
      const iconSvg = OUTPUT_ICON_SVG[c.icon] || OUTPUT_ICON_SVG.chart;
      const linkAttr = c.link ? `onclick="location.hash='${escapeHtml(c.link.replace('#', ''))}'" role="link" tabindex="0"` : "";
      const linkCls = c.link ? " sj-card--linked" : "";
      const arrow = i < cards.length - 1
        ? '<span class="sj-arrow" aria-hidden="true">→</span>'
        : "";
      return `<article class="sj-card${linkCls}" ${linkAttr}>
        <div class="sj-card__icon">${iconSvg}</div>
        <h3 class="sj-card__name">${escapeHtml(c.label)}</h3>
        <p class="sj-card__output"><strong>Output:</strong> ${escapeHtml(c.output)}</p>
        <p class="sj-card__decision"><strong>Decisão:</strong> ${escapeHtml(c.decision)}</p>
      </article>${arrow}`;
    })
    .join("");
}

/* ── Snapshot: attention cards ── */

export function buildSnapAttention(cards) {
  const html = cards
    .map((c) => `
    <article class="snap-att__card">
      <h3 class="snap-att__label">${escapeHtml(c.label)}</h3>
      <p class="snap-att__text">${escapeHtml(c.text)}</p>
    </article>`)
    .join("");
  return html;
}

/* ── Target readiness cards (Diagnóstico) ── */

export function buildTargetCard(dim, scaleMax) {
  const gap = (dim.target - dim.score).toFixed(1);
  const gapPct = Math.min(100, Math.max(0, ((dim.target - dim.score) / scaleMax) * 100));
  const asIsPct = Math.min(100, Math.max(0, (dim.score / scaleMax) * 100));
  const targetPct = Math.min(100, Math.max(0, (dim.target / scaleMax) * 100));
  return `
    <article class="target-card">
      <h3 class="target-card__label">${escapeHtml(dim.label)}</h3>
      <div class="target-card__scores">
        <div class="target-card__metric">
          <span class="target-card__tag">AS IS</span>
          <span class="target-card__value metric-number">${formatScore(dim.score)}</span>
        </div>
        <div class="target-card__metric">
          <span class="target-card__tag target-card__tag--target">Target</span>
          <span class="target-card__value metric-number">${formatScore(dim.target)}</span>
        </div>
        <div class="target-card__metric">
          <span class="target-card__tag target-card__tag--gap">Gap</span>
          <span class="target-card__value target-card__value--gap metric-number">${gap}</span>
        </div>
      </div>
      <div class="target-card__bar" aria-hidden="true">
        <div class="target-card__bar-fill" style="width:${asIsPct.toFixed(1)}%"></div>
        <div class="target-card__bar-target" style="left:${targetPct.toFixed(1)}%"></div>
      </div>
    </article>
  `.trim();
}

/* ── Wave roadmap timeline (Arquitetura Alvo – BLOCO 4) ── */

export function buildWaveRoadmap(waves, connectors, trackNames) {
  const tracks = trackNames || [];

  const headerCells = waves
    .map((w, i) => {
      const badge = badgeClassForDecision(w.decision);
      return `<th class="wr-th wr-th--wave">
        <span class="wr-th__num">${w.number}</span>
        <span class="wr-th__name">${escapeHtml(w.name)}</span>
        <span class="badge ${badge} wr-th__badge">${escapeHtml(w.decision)}</span>
      </th>`;
    })
    .join("");

  const rows = tracks
    .map((trackName, tIdx) => {
      const cells = waves
        .map((w) => {
          const items = (w.tracks && w.tracks[tIdx]) || [];
          const chips = items.map((c) => `<span class="tag-chip">${escapeHtml(c)}</span>`).join("");
          return `<td class="wr-td"><div class="wr-td__chips">${chips}</div></td>`;
        })
        .join("");
      return `<tr><td class="wr-track"><span class="wr-track__name">${escapeHtml(trackName)}</span></td>${cells}</tr>`;
    })
    .join("");

  const connLabels = (connectors || [])
    .map((c) => `<span class="wr-conn-label">${escapeHtml(c)}</span>`)
    .join("");
  const connRow = connLabels ? `<div class="wr-connectors">${connLabels}</div>` : "";

  return `
    ${connRow}
    <div class="matrix-wrapper">
      <table class="wr-table">
        <thead><tr><th class="wr-th wr-th--track"></th>${headerCells}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `.trim();
}

/* ── Monitoring matrix (Arquitetura Alvo – BLOCO 5) ── */

export function buildMonitoringMatrix(flows) {
  const rows = flows
    .map((f) => {
      const badge = badgeClassForDecision(f.decision);
      return `<tr>
        <td class="mm-name">${escapeHtml(f.name)}</td>
        <td class="mm-cell"><span class="matrix-badge matrix-badge--consome">Consome</span> ${escapeHtml(f.consome)}</td>
        <td class="mm-cell"><span class="matrix-badge matrix-badge--adequa">Ajusta</span> ${escapeHtml(f.ajusta)}</td>
        <td class="mm-cell"><span class="matrix-badge matrix-badge--habilita">Habilita</span> ${escapeHtml(f.habilita)}</td>
        <td class="mm-cell mm-cell--dep">${escapeHtml(f.dependencia)}</td>
        <td class="mm-cell"><span class="badge ${badge}">${escapeHtml(f.decision)}</span></td>
      </tr>`;
    })
    .join("");

  return `
    <div class="matrix-wrapper">
      <table class="mm-table">
        <thead><tr>
          <th class="mm-th">Onda</th>
          <th class="mm-th">Consome</th>
          <th class="mm-th">Ajusta</th>
          <th class="mm-th">Habilita</th>
          <th class="mm-th">Dependência crítica</th>
          <th class="mm-th">Decisão</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `.trim();
}

/* ── Backlog pipeline (AI Flow Backlog – BLOCO 1) ── */

export function buildBacklogFunnel(steps) {
  const items = steps
    .map((s, i) => {
      const isLast = i === steps.length - 1;
      const outputHtml = s.output
        ? `<span class="bl-pipe__output">${escapeHtml(s.output)}</span>`
        : "";
      const arrow = !isLast
        ? '<div class="bl-pipe__arrow" aria-hidden="true"><span class="bl-pipe__arrow-line"></span></div>'
        : "";
      return `
      <div class="bl-pipe__card">
        <span class="bl-pipe__value">${s.value}</span>
        <h3 class="bl-pipe__label">${escapeHtml(s.label)}</h3>
        <p class="bl-pipe__desc">${escapeHtml(s.description)}</p>
        ${outputHtml}
      </div>${arrow}`;
    })
    .join("");
  return `<div class="bl-pipeline">${items}</div>`;
}

/* ── Scorecard panel (AI Flow Backlog – BLOCO 2) ── */

export function buildScorecard({ panelTitle, groups, note, microcopy }) {
  const maxWeight = 25;

  const groupsHtml = groups
    .map((g) => {
      const rows = g.items
        .map(
          (item) => {
            const barPct = Math.min(100, (item.weight / maxWeight) * 100);
            return `
          <div class="bl-sc__row">
            <span class="bl-sc__weight">${item.weight}%</span>
            <div class="bl-sc__bar-track">
              <div class="bl-sc__bar-fill" style="width:${barPct.toFixed(0)}%"></div>
            </div>
            <div class="bl-sc__info">
              <strong class="bl-sc__name">${escapeHtml(item.name)}</strong>
              <p class="bl-sc__desc">${escapeHtml(item.description)}</p>
            </div>
          </div>`;
          },
        )
        .join("");
      return `
      <div class="bl-sc__group">
        <h4 class="bl-sc__group-label">${escapeHtml(g.group)}</h4>
        ${rows}
      </div>`;
    })
    .join("");

  const noteHtml = note
    ? `<p class="bl-sc__note">${escapeHtml(note)}</p>`
    : "";
  const microHtml = microcopy
    ? `<p class="bl-sc__microcopy">${escapeHtml(microcopy)}</p>`
    : "";

  return `
    <div class="bl-scorecard">
      <div class="bl-sc__header">
        <span class="bl-sc__panel-title">${escapeHtml(panelTitle)}</span>
        <span class="bl-sc__total">Total: 100%</span>
      </div>
      <div class="bl-sc__body">${groupsHtml}</div>
      <div class="bl-sc__footer">${noteHtml}${microHtml}</div>
    </div>
  `.trim();
}

/* ── Priority matrix 2x2 (AI Flow Backlog – BLOCO 3) ── */

const QUADRANT_META = {
  advance: { badge: "badge-success", icon: "▲" },
  prepare: { badge: "badge-info", icon: "◆" },
  adjust: { badge: "badge-warning", icon: "●" },
  monitor: { badge: "badge-neutral", icon: "○" },
};

export function buildPriorityMatrix(matrix) {
  const orderedIds = ["prepare", "advance", "monitor", "adjust"];
  const cells = orderedIds
    .map((id) => {
      const q = matrix.quadrants.find((qu) => qu.id === id);
      if (!q) return "";
      const meta = QUADRANT_META[id] || QUADRANT_META.monitor;
      const chips = q.items
        .map((item) => `<span class="bl-matrix__chip badge ${meta.badge}">${escapeHtml(item)}</span>`)
        .join("");
      return `
      <div class="bl-matrix__cell bl-matrix__cell--${id}">
        <h4 class="bl-matrix__cell-title">${escapeHtml(q.label)}</h4>
        <p class="bl-matrix__cell-desc">${escapeHtml(q.description)}</p>
        <div class="bl-matrix__chips">${chips}</div>
      </div>`;
    })
    .join("");

  return `
    <div class="bl-matrix">
      <div class="bl-matrix__y-axis">
        <span class="bl-matrix__axis-label">${escapeHtml(matrix.axisY)}</span>
        <span class="bl-matrix__axis-arrow">Alto ↑</span>
      </div>
      <div class="bl-matrix__grid">${cells}</div>
      <div class="bl-matrix__x-axis">
        <span class="bl-matrix__axis-arrow">Baixa</span>
        <span class="bl-matrix__axis-label">${escapeHtml(matrix.axisX)}</span>
        <span class="bl-matrix__axis-arrow">Alta →</span>
      </div>
    </div>
  `.trim();
}

/* ── Backlog ranked cards (AI Flow Backlog – BLOCO 4) ── */

export function buildBacklogCards(flows) {
  return flows
    .map((f) => {
      const badge = badgeClassForDecision(f.decision);
      const enablers = f.enablers
        .map((e) => `<span class="tag-chip">${escapeHtml(e)}</span>`)
        .join("");
      const deps = f.dependencies
        .map((d) => `<span class="tag-chip tag-chip--gap">${escapeHtml(d)}</span>`)
        .join("");
      return `
      <article class="bl-card surface-panel">
        <header class="bl-card__header">
          <span class="bl-card__rank">${f.rank}</span>
          <div class="bl-card__titles">
            <h3 class="bl-card__name">${escapeHtml(f.name)}</h3>
            <span class="bl-card__area">${escapeHtml(f.area)}</span>
          </div>
          <span class="badge ${badge}">${escapeHtml(f.decision)}</span>
        </header>
        <p class="bl-card__hypothesis">${escapeHtml(f.hypothesis)}</p>
        <dl class="bl-card__meta">
          <div class="bl-card__row">
            <dt>Habilitadores</dt>
            <dd><div class="tag-list">${enablers}</div></dd>
          </div>
          <div class="bl-card__row">
            <dt>Dependências críticas</dt>
            <dd><div class="tag-list">${deps}</div></dd>
          </div>
        </dl>
        <div class="bl-card__footer">
          <span class="bl-card__tag">Risco: <strong>${escapeHtml(f.risk)}</strong></span>
          <span class="bl-card__tag">Readiness: <strong>${escapeHtml(f.readiness)}</strong></span>
        </div>
      </article>`;
    })
    .join("");
}

/* ── Decision columns (AI Flow Backlog – BLOCO 5) ── */

export function buildDecisionColumns(columns) {
  return `<div class="bl-dec-grid">${columns
    .map((col) => {
      const badge = badgeClassForDecision(col.decision);
      const items = col.items
        .map((item) => `<li class="bl-dec__item">${escapeHtml(item)}</li>`)
        .join("");
      return `
      <div class="bl-dec-col">
        <div class="bl-dec-col__header">
          <span class="badge ${badge}">${escapeHtml(col.label)}</span>
        </div>
        <ul class="bl-dec__items">${items}</ul>
        <dl class="bl-dec__details">
          <dt>Objetivo</dt><dd>${escapeHtml(col.objective)}</dd>
          <dt>Critério</dt><dd>${escapeHtml(col.criterion)}</dd>
          <dt>Próximo passo</dt><dd>${escapeHtml(col.nextStep)}</dd>
        </dl>
      </div>`;
    })
    .join("")}</div>`;
}

export function buildQuestionBlock(block) {
  const questionsHtml = block.questions
    .map(
      (q) => `
      <li class="piq-question">
        <span class="piq-question__text">${escapeHtml(q.text)}</span>
        ${q.type ? `<span class="piq-question__type">${escapeHtml(q.type)}</span>` : ""}
      </li>`,
    )
    .join("");

  const domainTag = block.domainBadge
    ? `<span class="badge badge-info piq-domain-badge">${escapeHtml(block.domainBadge)}</span>`
    : "";
  return `
    <article class="piq-block surface-panel" id="${escapeHtml(block.id)}">
      <header class="piq-block__header">
        <span class="piq-block__number">${escapeHtml(String(block.number))}</span>
        <div>
          <h3 class="piq-block__title">${escapeHtml(block.title)}</h3>
          <div class="piq-block__badges">
            <span class="badge badge-neutral">${escapeHtml(block.badge)}</span>
            ${domainTag}
          </div>
        </div>
      </header>
      <p class="piq-block__objective">${escapeHtml(block.objective)}</p>
      <ol class="piq-question-list">${questionsHtml}</ol>
    </article>
  `.trim();
}

/* ── AI Flow Detail – Executive card (BLOCO 1) ── */

export function buildFlowExecutive({ name, subtitle, executive, microcopy }) {
  const decBadge = badgeClassForDecision(executive.decision);
  return `
    <div class="fd-exec">
      <header class="fd-exec__header">
        <div>
          <span class="eyebrow">Onda de valor com IA</span>
          <h2 class="fd-exec__name" id="fd-exec-heading">${escapeHtml(name)}</h2>
          <p class="fd-exec__subtitle">${escapeHtml(subtitle)}</p>
        </div>
      </header>
      <div class="fd-exec__badges">
        <span class="badge ${decBadge}">${escapeHtml(executive.decision)}</span>
        <span class="badge badge-info">Readiness ${escapeHtml(executive.readiness)}</span>
        <span class="badge badge-warning">Risco ${escapeHtml(executive.risk)}</span>
        <span class="badge badge-neutral">${escapeHtml(executive.horizon)}</span>
      </div>
      <dl class="fd-exec__meta">
        <div class="fd-exec__row"><dt>Frente de valor</dt><dd>${escapeHtml(executive.area)}</dd></div>
        <div class="fd-exec__row"><dt>Valor esperado</dt><dd>${escapeHtml(executive.expectedValue)}</dd></div>
      </dl>
      <p class="fd-exec__microcopy">${escapeHtml(microcopy)}</p>
    </div>
  `.trim();
}

/* ── AI Flow Detail – Canvas blocks (BLOCO 2) ── */

const CANVAS_ICONS = {
  pain: "!",
  hypothesis: "✦",
  personas: "☺",
  agents: "◈",
  flows: "▸",
  data: "◫",
  apis: "⇄",
  architecture: "△",
  guardrails: "⛨",
  metrics: "◎",
};

function buildCanvasCard(b) {
  const icon = CANVAS_ICONS[b.id] || "●";
  const isSingle = b.items.length === 1 && b.items[0].length > 60;
  const content = isSingle
    ? `<p class="fd-cv__text">${escapeHtml(b.items[0])}</p>`
    : `<ul class="fd-cv__list">${b.items.map((it) => `<li>${escapeHtml(it)}</li>`).join("")}</ul>`;
  return `
    <div class="fd-cv__card fd-cv__card--${b.id}">
      <div class="fd-cv__card-head">
        <span class="fd-cv__icon">${icon}</span>
        <h4 class="fd-cv__label">${escapeHtml(b.label)}</h4>
      </div>
      ${content}
    </div>`;
}

export function buildFlowCanvas(blocks, areas) {
  if (!areas || !areas.length) {
    const cards = blocks.map((b) => buildCanvasCard(b)).join("");
    return `<div class="fd-canvas-grid">${cards}</div>`;
  }

  const blockMap = {};
  blocks.forEach((b) => { blockMap[b.id] = b; });

  const zonesHtml = areas
    .map((area, idx) => {
      const cards = area.blocks
        .map((id) => blockMap[id])
        .filter(Boolean)
        .map((b) => buildCanvasCard(b))
        .join("");
      const isLast = idx === areas.length - 1;
      const arrow = !isLast
        ? '<div class="fd-cv__connector" aria-hidden="true"><span class="fd-cv__conn-line"></span></div>'
        : "";
      return `
      <div class="fd-cv__zone fd-cv__zone--${area.color}">
        <h3 class="fd-cv__zone-title">${escapeHtml(area.label)}</h3>
        <div class="fd-cv__zone-cards">${cards}</div>
      </div>${arrow}`;
    })
    .join("");

  return `<div class="fd-canvas-layout">${zonesHtml}</div>`;
}

/* ── AI Flow Detail – Operational journey (BLOCO 3) ── */

export function buildFlowJourney(steps) {
  const cards = steps
    .map((s) => `
      <div class="fd-jy__step">
        <div class="fd-jy__head">
          <span class="fd-jy__num">${s.step}</span>
          <h4 class="fd-jy__label">${escapeHtml(s.label)}</h4>
        </div>
        <dl class="fd-jy__grid">
          <div class="fd-jy__cell">
            <dt>Ação</dt><dd>${escapeHtml(s.action)}</dd>
          </div>
          <div class="fd-jy__cell">
            <dt>Agente</dt><dd>${escapeHtml(s.agent)}</dd>
          </div>
          <div class="fd-jy__cell">
            <dt>Dado / Integração</dt><dd>${escapeHtml(s.data)}</dd>
          </div>
          <div class="fd-jy__cell">
            <dt>Controle</dt><dd>${escapeHtml(s.control)}</dd>
          </div>
        </dl>
      </div>`)
    .join("");
  return `<div class="fd-journey-flow">${cards}</div>`;
}

/* ── AI Flow Detail – Sprint roadmap (BLOCO 4) ── */

export function buildSprintRoadmap(tracks, phases) {
  const timeline = phases
    .map(
      (p, i) => `
      <div class="fd-sp__marker">
        <span class="fd-sp__day">${escapeHtml(p.label)}</span>
        <span class="fd-sp__marker-title">${escapeHtml(p.title)}</span>
        ${p.objective ? `<span class="fd-sp__marker-obj">${escapeHtml(p.objective)}</span>` : ""}
      </div>${i < phases.length - 1 ? '<div class="fd-sp__tl-conn" aria-hidden="true"></div>' : ""}`,
    )
    .join("");

  const rows = tracks
    .map((trackName, tIdx) => {
      const cells = phases
        .map((p) => {
          const items = (p.tasks && p.tasks[tIdx]) || [];
          const bullets = items
            .map((c) => `<li class="fd-sp__item">${escapeHtml(c)}</li>`)
            .join("");
          return `<td class="fd-sp__td"><ul class="fd-sp__items">${bullets}</ul></td>`;
        })
        .join("");
      return `<tr><td class="fd-sp__track"><span class="fd-sp__track-name">${escapeHtml(trackName)}</span></td>${cells}</tr>`;
    })
    .join("");

  const phaseHeaders = phases
    .map(
      (p) =>
        `<th class="fd-sp__th fd-sp__th--phase"><span class="fd-sp__th-day">${escapeHtml(p.label)}</span></th>`,
    )
    .join("");

  return `
    <div class="fd-sp__timeline">${timeline}</div>
    <div class="fd-sp__scroll">
      <table class="fd-sp__table">
        <thead><tr><th class="fd-sp__th fd-sp__th--track"></th>${phaseHeaders}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `.trim();
}

/* ── AI Flow Detail – Attention columns (BLOCO 5) ── */

export function buildAttentionColumns(columns) {
  return `<div class="fd-att-grid">${columns
    .map((col) => {
      const typeClass = col.type ? `fd-att-col--${col.type}` : "";
      const items = col.items
        .map((item) => `<li class="fd-att__item">${escapeHtml(item)}</li>`)
        .join("");
      return `
      <div class="fd-att-col ${typeClass}">
        <h3 class="fd-att-col__title">${escapeHtml(col.label)}</h3>
        <ul class="fd-att__list">${items}</ul>
      </div>`;
    })
    .join("")}</div>`;
}

/* ══════════════════════════════════════════════════════
   Roadmap & Value Case
   ══════════════════════════════════════════════════════ */

const DECISION_MAP = {
  Avançar: "badge-success",
  "Preparar fundação": "badge-info",
  "Ajustar escopo": "badge-warning",
  Pausar: "badge-danger",
};

function decisionBadge(label) {
  const cls = DECISION_MAP[label] || "badge-neutral";
  return `<span class="badge ${cls}">${escapeHtml(label)}</span>`;
}

/* ── BLOCO 1: Horizons ── */

export function buildRoadmapHorizons(horizons) {
  const markers = horizons
    .map((h, i) => {
      const isLast = i === horizons.length - 1;
      const seg = !isLast ? '<span class="rv-tl__seg" aria-hidden="true"></span>' : "";
      return `<span class="rv-tl__marker"><span class="rv-tl__dot"></span><span class="rv-tl__period">${escapeHtml(h.period)}</span></span>${seg}`;
    })
    .join("");

  const cards = horizons
    .map((h) => {
      const uniqueDecisions = [...new Set(h.decisions || [])];
      const decBadges = uniqueDecisions.map((d) => decisionBadge(d)).join(" ");

      const chips = h.flows
        .map((f) => `<span class="rv-hz__chip">${escapeHtml(f)}</span>`)
        .join("");

      const depHtml = h.dependency
        ? `<div class="rv-hz__dep"><span class="rv-hz__dep-label">Dependência principal</span><span class="rv-hz__dep-text">${escapeHtml(h.dependency)}</span></div>`
        : "";

      return `
      <article class="rv-hz__card">
        <header class="rv-hz__head">
          <span class="rv-hz__label">${escapeHtml(h.label)}</span>
          <span class="rv-hz__period">${escapeHtml(h.period)}</span>
        </header>
        <h3 class="rv-hz__focus">${escapeHtml(h.focus)}</h3>
        <div class="rv-hz__decisions">${decBadges}</div>
        <div class="rv-hz__chips">${chips}</div>
        <p class="rv-hz__obj">${escapeHtml(h.objective)}</p>
        ${depHtml}
      </article>`;
    })
    .join("");

  return `
    <div class="rv-timeline" aria-hidden="true">${markers}</div>
    <div class="rv-horizons">${cards}</div>
  `.trim();
}

/* ── BLOCO 2: Waves with accumulated capabilities ── */

export function buildWaveTimeline(waves) {
  const headerCells = waves
    .map(
      (w, i) => `
      <th class="rv-sw__hd">
        <span class="rv-sw__num">${i + 1}</span>
        <span class="rv-sw__name">${escapeHtml(w.name)}</span>
        ${decisionBadge(w.decision)}
      </th>`,
    )
    .join("");

  const TRACKS = [
    { key: "capabilities", label: "Capacidades acumuladas", cls: "cap" },
    { key: "dependencies", label: "Dependências críticas", cls: "dep" },
    { key: "unlocked", label: "Capacidade liberada", cls: "unlk" },
    { key: "execDecision", label: "Decisão executiva", cls: "exec" },
  ];

  const rows = TRACKS.map((t) => {
    const cells = waves
      .map((w) => {
        const val = w[t.key];
        if (Array.isArray(val)) {
          const chips = val
            .map((v) => `<span class="rv-sw__chip rv-sw__chip--${t.cls}">${escapeHtml(v)}</span>`)
            .join("");
          return `<td class="rv-sw__td">${chips}</td>`;
        }
        return `<td class="rv-sw__td"><span class="rv-sw__chip rv-sw__chip--${t.cls}">${escapeHtml(val || "")}</span></td>`;
      })
      .join("");
    return `<tr><td class="rv-sw__track rv-sw__track--${t.cls}">${escapeHtml(t.label)}</td>${cells}</tr>`;
  }).join("");

  return `
    <div class="rv-sw__scroll">
      <table class="rv-sw__table">
        <thead><tr><th class="rv-sw__corner"></th>${headerCells}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`.trim();
}

/* ── BLOCO 3: Value Case cards ── */

export function buildValueCaseCards(cases, disclaimer) {
  const cards = cases
    .map((c) => {
      const metricsHtml =
        c.demoMetrics && c.demoMetrics.length
          ? `<div class="rv-vc__metrics">
              <h4 class="rv-vc__metrics-title">Métricas demonstrativas</h4>
              <div class="rv-vc__metrics-grid">${c.demoMetrics
                .map(
                  (m) => `
                <div class="rv-vc__metric">
                  <span class="rv-vc__metric-label">${escapeHtml(m.label)}</span>
                  <div class="rv-vc__metric-vals">
                    <span class="rv-vc__metric-bl"><strong>${escapeHtml(m.baseline)}</strong> baseline</span>
                    <span class="rv-vc__metric-arrow" aria-hidden="true">&rarr;</span>
                    <span class="rv-vc__metric-tg"><strong>${escapeHtml(m.target)}</strong> meta</span>
                  </div>
                </div>`,
                )
                .join("")}
              </div>
            </div>`
          : "";

      return `
    <article class="rv-vc__card">
      <header class="rv-vc__head">
        <h3 class="rv-vc__name">${escapeHtml(c.name)}</h3>
        ${decisionBadge(c.decision)}
      </header>
      <div class="rv-vc__top">
        <div class="rv-vc__kpi">
          <span class="rv-vc__kpi-label">Valor esperado</span>
          <span class="rv-vc__kpi-value">${escapeHtml(c.expectedValue)}</span>
        </div>
        <div class="rv-vc__kpi">
          <span class="rv-vc__kpi-label">Horizonte</span>
          <span class="rv-vc__kpi-value rv-vc__kpi-value--muted">${escapeHtml(c.horizon)}</span>
        </div>
      </div>
      <dl class="rv-vc__details">
        <div class="rv-vc__detail">
          <dt>Alavanca de valor</dt>
          <dd>${escapeHtml(c.lever)}</dd>
        </div>
        <div class="rv-vc__detail">
          <dt>Premissas críticas</dt>
          <dd>${escapeHtml(c.premises)}</dd>
        </div>
      </dl>
      ${metricsHtml}
    </article>`;
    })
    .join("");

  const disclaimerHtml = disclaimer
    ? `<p class="rv-vc__disclaimer">${escapeHtml(disclaimer)}</p>`
    : "";

  return `<div class="rv-vcases">${cards}</div>${disclaimerHtml}`;
}

/* ── BLOCO 4: Premises groups ── */

export function buildPremisesPanel(groups) {
  const cols = groups
    .map((g) => {
      const items = g.items
        .map((it) => `<li class="rv-pm__item">${escapeHtml(it)}</li>`)
        .join("");
      return `
      <div class="rv-pm__group">
        <h3 class="rv-pm__label">${escapeHtml(g.label)}</h3>
        <ul class="rv-pm__list">${items}</ul>
      </div>`;
    })
    .join("");
  return `<div class="rv-premises">${cols}</div>`;
}

/* ── BLOCO 5: Value indicators ── */

export function buildValueIndicators(indicators) {
  const cards = indicators
    .map((ind) => `
    <article class="rv-ind__card">
      <span class="rv-ind__label">${escapeHtml(ind.label)}</span>
      <strong class="rv-ind__value">${escapeHtml(ind.value)}</strong>
      <p class="rv-ind__note">${escapeHtml(ind.note)}</p>
    </article>`)
    .join("");
  return `<div class="rv-indicators">${cards}</div>`;
}

/* ══════════════════════════════════════════════════════
   Metrics Dashboard
   ══════════════════════════════════════════════════════ */

/* ── BLOCO 1: Dashboard KPIs ── */

export function buildDashboardKpis(kpis) {
  const cards = kpis
    .map((k) => `
    <article class="md-kpi">
      <span class="md-kpi__label">${escapeHtml(k.label)}</span>
      <strong class="md-kpi__value">${escapeHtml(k.value)}</strong>
      <p class="md-kpi__note">${escapeHtml(k.note)}</p>
    </article>`)
    .join("");
  return `<div class="md-kpis-grid">${cards}</div>`;
}

/* ── BLOCO 2: Scorecard heatmap ── */

const CELL_CLASS_MAP = {
  Alto: "md-cell--high",
  Alta: "md-cell--high",
  "Médio-alto": "md-cell--mid-high",
  "Média-alta": "md-cell--mid-high",
  Médio: "md-cell--mid",
  Média: "md-cell--mid",
  "Baixa-média": "md-cell--mid-low",
  Baixa: "md-cell--low",
  "Médio-alto": "md-cell--mid-high",
  Crítico: "md-cell--critical",
  "Em evolução": "md-cell--evolving",
  "Alto indireto": "md-cell--high",
  "Alto potencial": "md-cell--high",
};

const SC_DECISION_MAP = {
  "Escalar controlado": "badge-success",
  Avançar: "badge-success",
  "Preparar fundação": "badge-info",
  "Ajustar escopo": "badge-warning",
};

export function buildDashScorecard(cols, rows) {
  const ths = cols
    .map((c) => `<th class="md-sc__th">${escapeHtml(c)}</th>`)
    .join("");

  const trs = rows
    .map((r) => {
      const cells = r.cells
        .map((val, ci) => {
          const isDecision = ci === r.cells.length - 1;
          if (isDecision) {
            const cls = SC_DECISION_MAP[val] || "badge-neutral";
            return `<td class="md-sc__td"><span class="badge ${cls}">${escapeHtml(val)}</span></td>`;
          }
          const cls = CELL_CLASS_MAP[val] || "";
          return `<td class="md-sc__td ${cls}">${escapeHtml(val)}</td>`;
        })
        .join("");
      return `<tr><td class="md-sc__name">${escapeHtml(r.name)}</td>${cells}</tr>`;
    })
    .join("");

  return `
    <div class="md-sc__scroll">
      <table class="md-sc__table">
        <thead><tr><th class="md-sc__th md-sc__th--name">AI Flow</th>${ths}</tr></thead>
        <tbody>${trs}</tbody>
      </table>
    </div>`.trim();
}

/* ── BLOCO 3: Evolution bar charts ── */

export function buildEvolutionCharts(charts) {
  const panels = charts
    .map((ch) => {
      const bars = ch.bars
        .map((b) => {
          const pct = Math.min(100, (b.value / ch.max) * 100);
          return `
          <div class="md-bar">
            <span class="md-bar__label">${escapeHtml(b.label)}</span>
            <div class="md-bar__track">
              <div class="md-bar__fill" style="width:${pct.toFixed(0)}%"></div>
            </div>
            <span class="md-bar__val">${escapeHtml(b.display)}</span>
          </div>`;
        })
        .join("");
      return `
      <div class="md-evo__panel">
        <h3 class="md-evo__title">${escapeHtml(ch.title)}</h3>
        ${bars}
      </div>`;
    })
    .join("");
  return `<div class="md-evo-grid">${panels}</div>`;
}

/* ── BLOCO 4: Dimensions ── */

export function buildDimensionCards(dims) {
  const cards = dims
    .map((d) => {
      const items = d.items
        .map((it) => `<li class="md-dim__item">${escapeHtml(it)}</li>`)
        .join("");
      return `
      <div class="md-dim__card">
        <h3 class="md-dim__label">${escapeHtml(d.label)}</h3>
        <ul class="md-dim__list">${items}</ul>
      </div>`;
    })
    .join("");
  return `<div class="md-dim-grid">${cards}</div>`;
}

/* ── BLOCO 5: Alerts ── */

const SEVERITY_MAP = { Alta: "badge-danger", Média: "badge-warning", Baixa: "badge-info" };

export function buildDashAlerts(alerts) {
  const cards = alerts
    .map((a) => {
      const cls = SEVERITY_MAP[a.severity] || "badge-neutral";
      return `
      <article class="md-alert">
        <div class="md-alert__head">
          <h3 class="md-alert__title">${escapeHtml(a.title)}</h3>
          <span class="badge ${cls}">${escapeHtml(a.severity)}</span>
        </div>
        <p class="md-alert__desc">${escapeHtml(a.description)}</p>
      </article>`;
    })
    .join("");
  return `<div class="md-alerts-grid">${cards}</div>`;
}

/* ── BLOCO 6: Decision columns ── */

export function buildDashDecisions(cols) {
  const panels = cols
    .map((c) => {
      const chips = c.flows
        .map((f) => `<span class="md-dec__chip">${escapeHtml(f)}</span>`)
        .join("");
      return `
      <div class="md-dec__col">
        <h3 class="md-dec__label">${escapeHtml(c.label)}</h3>
        <div class="md-dec__flows">${chips}</div>
        <p class="md-dec__next"><strong>Próximo passo:</strong> ${escapeHtml(c.next)}</p>
      </div>`;
    })
    .join("");
  return `<div class="md-dec-grid">${panels}</div>`;
}
