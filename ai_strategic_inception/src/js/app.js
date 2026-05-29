import {
  buildArchDiagram,
  buildAttentionColumns,
  buildBacklogCards,
  buildBacklogFunnel,
  buildComparison,
  buildFlowCanvas,
  buildFlowExecutive,
  buildFlowJourney,
  buildScorecard,
  buildDecisionColumns,
  buildGapCard,
  buildHeatmap,
  buildKpiCard,
  buildPriorityMatrix,
  buildQuestionBlock,
  buildRadarChart,
  buildRadarLegend,
  buildScoreCard,
  buildSprintRoadmap,
  buildTargetCard,
  buildValueCaseCards,
  buildValueIndicators,
  buildWaveRoadmap,
  buildWaveTimeline,
  buildRoadmapHorizons,
  buildPremisesPanel,
  buildDashboardKpis,
  buildDashScorecard,
  buildEvolutionCharts,
  buildDimensionCards,
  buildDashAlerts,
  buildDashDecisions,
  buildSnapJourney,
  buildDecisionTracks,
  buildSnapAttention,
  escapeHtml,
  formatScore,
  riskChipClass,
} from "./components.js";

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${url} (${response.status})`);
  }
  return response.json();
}

function averageScores(dimensions = []) {
  if (!dimensions.length) return null;
  const sum = dimensions.reduce((acc, item) => acc + Number(item.score), 0);
  return sum / dimensions.length;
}

/* ── Page routing ── */

const PAGES = ["executive-snapshot", "pre-inception", "maturity-diagnosis", "target-architecture", "ai-flow-backlog", "ai-flow-detail", "roadmap-value-case", "metrics-dashboard"];
const DEFAULT_PAGE = "executive-snapshot";

function getActivePage() {
  const hash = location.hash.replace("#", "");
  return PAGES.includes(hash) ? hash : DEFAULT_PAGE;
}

function showPage(pageId) {
  document.querySelectorAll("[data-page-content]").forEach((el) => {
    el.hidden = el.dataset.pageContent !== pageId;
  });
  document.querySelectorAll(".nav__link[data-page]").forEach((link) => {
    if (link.dataset.page === pageId) {
      link.classList.add("nav__link--current");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("nav__link--current");
      link.removeAttribute("aria-current");
    }
  });
  window.scrollTo({ top: 0 });
}

function initRouting() {
  showPage(getActivePage());
  window.addEventListener("hashchange", () => showPage(getActivePage()));
}

/* ── Executive Snapshot renderer ── */

function renderExecutivePage({ client, maturity, metrics }) {
  const setText = (slot, value) => {
    const el = document.querySelector(`[data-slot="${slot}"]`);
    if (el) el.textContent = value || "";
  };

  const errorBanner = document.getElementById("app-error");
  if (errorBanner) { errorBanner.hidden = true; errorBanner.innerHTML = ""; }

  const footerClient = document.querySelector('[data-slot="footer-client"]');
  if (footerClient) footerClient.textContent = `${client.clientName} · ${client.sector}`;
  setText("footer-version", client.demoVersion);
  setText("footer-policy", client.dataPolicy);
  setText("client-chip", client.clientName);

  setText("snap-eyebrow", metrics.snapshotEyebrow);
  setText("snap-headline", metrics.snapshotHeadline);
  setText("snapshot-lead", metrics.snapshotLead);

  setText("snap-journey-title", metrics.journeyTitle);
  setText("snap-journey-lead", metrics.journeyLead);

  const journeyRoot = document.getElementById("snapshot-journey");
  if (journeyRoot && metrics.journeyCards) {
    journeyRoot.innerHTML = buildSnapJourney(metrics.journeyCards);
  }

  const kpisRoot = document.getElementById("kpi-grid");
  if (kpisRoot && metrics.kpis) {
    kpisRoot.innerHTML = metrics.kpis
      .map((item) => buildKpiCard({ label: item.label, value: item.value, note: item.note }))
      .join("");
  }

  setText("decision-headline", metrics.recommendedDecision.title);
  setText("decision-lead", metrics.recommendedDecision.lead);
  setText("decision-insight", metrics.recommendedDecision.insight);

  const tracksRoot = document.getElementById("snap-decision-tracks");
  if (tracksRoot && metrics.recommendedDecision.tracks) {
    tracksRoot.innerHTML = buildDecisionTracks(metrics.recommendedDecision.tracks);
  }

  const attRoot = document.getElementById("snap-attention");
  if (attRoot && metrics.attentionCards) {
    attRoot.innerHTML = buildSnapAttention(metrics.attentionCards);
  }

  setText("snap-closing-title", metrics.closingTitle);
  setText("snap-closing-lead", metrics.closingLead);
  setText("snap-closing-microcopy", metrics.closingMicrocopy || "");

  const closingBullets = document.getElementById("snap-closing-bullets");
  if (closingBullets && metrics.closingBullets) {
    closingBullets.innerHTML = metrics.closingBullets
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join("");
  }
}

/* ── Pre-Inception Qualification renderer ── */

function renderPreInceptionPage(data) {
  const setText = (slot, value) => {
    const el = document.querySelector(`[data-slot="${slot}"]`);
    if (el) el.textContent = value || "";
  };

  setText("piq-eyebrow", data.eyebrow);
  setText("piq-headline", data.headline);
  setText("piq-lead", data.lead);
  setText("piq-disclaimer", data.disclaimer);
  setText("piq-usage-title", data.usageTitle);
  setText("piq-closing", data.closingNote);

  const blockMap = {};
  data.blocks.forEach((b) => { blockMap[b.id] = b; });

  const timelineRoot = document.getElementById("piq-timeline");
  if (timelineRoot && data.moments) {
    timelineRoot.innerHTML = data.moments
      .map((moment) => {
        const momentBlocks = moment.blocks
          .map((bid) => blockMap[bid])
          .filter(Boolean)
          .map((block) => buildQuestionBlock(block))
          .join("");
        return `
          <div class="piq-moment">
            <div class="piq-moment__header">
              <span class="piq-moment__num">${moment.number}</span>
              <h3 class="piq-moment__label">${escapeHtml(moment.label)}</h3>
            </div>
            <div class="piq-moment__blocks">${momentBlocks}</div>
          </div>`;
      })
      .join("");
  }

  const usageList = document.getElementById("piq-usage-list");
  if (usageList) {
    usageList.innerHTML = data.usageItems
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }
}

/* ── Maturity Diagnosis renderer ── */

function renderMaturityDiagnosisPage(maturity) {
  const setText = (slot, value) => {
    const el = document.querySelector(`[data-slot="${slot}"]`);
    if (el) el.textContent = value || "";
  };

  const scaleMax = maturity.scaleMax || 5;

  const radarRoot = document.getElementById("matdiag-radar");
  if (radarRoot) {
    radarRoot.innerHTML =
      buildRadarChart(maturity.dimensions, scaleMax) +
      buildRadarLegend(maturity.dimensions, scaleMax);
  }

  const scaleRoot = document.getElementById("matdiag-scale");
  if (scaleRoot && maturity.scaleDescriptions) {
    scaleRoot.innerHTML = maturity.scaleDescriptions
      .map(
        (s) => `
        <div class="matdiag-scale-item">
          <dt><span class="matdiag-scale-level">${s.level}</span> ${escapeHtml(s.name)}</dt>
          <dd>${escapeHtml(s.description)}</dd>
        </div>`,
      )
      .join("");
  }

  const overall =
    typeof maturity.overallAverage === "number"
      ? maturity.overallAverage
      : averageScores(maturity.dimensions);

  if (overall !== null && !Number.isNaN(overall)) {
    setText("matdiag-overall", `${formatScore(overall)} / ${scaleMax}`);
  }

  const targetCardsRoot = document.getElementById("matdiag-target-cards");
  if (targetCardsRoot) {
    targetCardsRoot.innerHTML = maturity.dimensions
      .filter((d) => d.target != null)
      .map((d) => buildTargetCard(d, scaleMax))
      .join("");
  }

  const gapsRoot = document.getElementById("matdiag-gaps");
  if (gapsRoot && maturity.gapMap) {
    gapsRoot.innerHTML = maturity.gapMap
      .map((gap) => buildGapCard(gap, scaleMax))
      .join("");
  }
}

/* ── Target Architecture renderer ── */

function renderTargetArchitecturePage(arch) {
  const setText = (slot, value) => {
    const el = document.querySelector(`[data-slot="${slot}"]`);
    if (el) el.textContent = value || "";
  };

  setText("arch-eyebrow", arch.eyebrow);
  setText("arch-headline", arch.headline);
  setText("arch-lead", arch.lead);
  setText("arch-disclaimer", arch.disclaimer);
  setText("arch-comparison-title", arch.comparisonTitle || "");

  const compRoot = document.getElementById("arch-comparison");
  if (compRoot && arch.comparison) {
    compRoot.innerHTML = buildComparison(arch.comparison);
  }

  setText("arch-waves-headline", arch.wavesHeadline);
  setText("arch-waves-lead", arch.wavesLead || "");
  setText("arch-waves-note", arch.wavesNote || "");

  const waveRoadmapRoot = document.getElementById("arch-wave-roadmap");
  if (waveRoadmapRoot && arch.waveRoadmap) {
    waveRoadmapRoot.innerHTML = buildWaveRoadmap(arch.waveRoadmap, arch.waveConnectors, arch.waveTracks);
  }

  setText("arch-diagram-headline", arch.diagram.headline);
  setText("arch-diagram-lead", arch.diagram.lead);

  const diagramRoot = document.getElementById("arch-diagram");
  if (diagramRoot) {
    diagramRoot.innerHTML = buildArchDiagram(arch.diagram);
  }

  setText("arch-heatmap-headline", arch.heatmap.headline);
  setText("arch-heatmap-lead", arch.heatmap.lead || "");

  const heatmapRoot = document.getElementById("arch-heatmap");
  if (heatmapRoot && arch.heatmap) {
    heatmapRoot.innerHTML = buildHeatmap(arch.heatmap);
  }

  setText("arch-closing-headline", arch.closing.headline);
  setText("arch-closing-lead", arch.closing.lead);
  setText("arch-closing-microcopy", arch.closing.microcopy);

  const bulletsRoot = document.getElementById("arch-closing-bullets");
  if (bulletsRoot && arch.closing.bullets) {
    bulletsRoot.innerHTML = arch.closing.bullets
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join("");
  }
}

/* ── AI Flow Backlog renderer ── */

function renderBacklogPage(data) {
  const setText = (slot, value) => {
    const el = document.querySelector(`[data-slot="${slot}"]`);
    if (el) el.textContent = value || "";
  };

  setText("backlog-eyebrow", data.eyebrow);
  setText("backlog-headline", data.headline);
  setText("backlog-lead", data.lead);
  setText("backlog-disclaimer", data.disclaimer);
  setText("backlog-funnel-title", data.funnelTitle);
  setText("backlog-funnel-lead", data.funnelLead || "");
  setText("backlog-funnel-insight", data.funnelInsight || "");

  const funnelRoot = document.getElementById("backlog-funnel");
  if (funnelRoot && data.funnel) {
    funnelRoot.innerHTML = buildBacklogFunnel(data.funnel);
  }

  setText("backlog-criteria-title", data.criteriaTitle);
  setText("backlog-criteria-lead", data.criteriaLead);

  const criteriaRoot = document.getElementById("backlog-criteria");
  if (criteriaRoot && data.criteriaGroups) {
    criteriaRoot.innerHTML = buildScorecard({
      panelTitle: data.criteriaPanelTitle || "",
      groups: data.criteriaGroups,
      note: data.criteriaNote || "",
      microcopy: data.criteriaMicrocopy || "",
    });
  }

  setText("backlog-matrix-title", data.matrixTitle);
  setText("backlog-matrix-lead", data.matrixLead);

  const matrixRoot = document.getElementById("backlog-matrix");
  if (matrixRoot && data.matrix) {
    matrixRoot.innerHTML = buildPriorityMatrix(data.matrix);
  }

  setText("backlog-cards-title", data.backlogTitle);
  setText("backlog-cards-lead", data.backlogLead);

  const cardsRoot = document.getElementById("backlog-cards");
  if (cardsRoot && data.backlog) {
    cardsRoot.innerHTML = buildBacklogCards(data.backlog);
  }

  setText("backlog-decision-title", data.decisionTitle);
  setText("backlog-decision-lead", data.decisionLead);

  const decRoot = document.getElementById("backlog-decision-cols");
  if (decRoot && data.decisionColumns) {
    decRoot.innerHTML = buildDecisionColumns(data.decisionColumns);
  }

  setText("backlog-closing-title", data.closingTitle);
  setText("backlog-closing-lead", data.closingLead);
  setText("backlog-closing-microcopy", data.closingMicrocopy);

  const bulletsRoot = document.getElementById("backlog-closing-bullets");
  if (bulletsRoot && data.closingBullets) {
    bulletsRoot.innerHTML = data.closingBullets
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join("");
  }
}

/* ── AI Flow Detail renderer ── */

function renderFlowDetailPage(data) {
  const setText = (slot, value) => {
    const el = document.querySelector(`[data-slot="${slot}"]`);
    if (el) el.textContent = value || "";
  };

  setText("fd-eyebrow", data.eyebrow);
  setText("fd-headline", data.headline);
  setText("fd-lead", data.lead);
  setText("fd-disclaimer", data.disclaimer);

  const execRoot = document.getElementById("fd-executive");
  if (execRoot) {
    execRoot.innerHTML = buildFlowExecutive({
      name: data.flowName,
      subtitle: data.flowSubtitle,
      executive: data.executive,
      microcopy: data.flowMicrocopy,
    });
  }

  setText("fd-canvas-title", data.canvasTitle);
  setText("fd-canvas-lead", data.canvasLead);

  const canvasRoot = document.getElementById("fd-canvas");
  if (canvasRoot && data.canvas) {
    canvasRoot.innerHTML = buildFlowCanvas(data.canvas, data.canvasAreas);
  }

  setText("fd-journey-title", data.journeyTitle);
  setText("fd-journey-lead", data.journeyLead || "");

  const journeyRoot = document.getElementById("fd-journey");
  if (journeyRoot && data.journey) {
    journeyRoot.innerHTML = buildFlowJourney(data.journey);
  }

  setText("fd-sprint-title", data.sprintTitle);
  setText("fd-sprint-lead", data.sprintLead);
  setText("fd-sprint-insight", data.sprintInsight || "");

  const sprintRoot = document.getElementById("fd-sprint");
  if (sprintRoot && data.sprintPhases) {
    sprintRoot.innerHTML = buildSprintRoadmap(data.sprintTracks, data.sprintPhases);
  }

  setText("fd-attention-title", data.attentionTitle);

  const attRoot = document.getElementById("fd-attention");
  if (attRoot && data.attentionColumns) {
    attRoot.innerHTML = buildAttentionColumns(data.attentionColumns);
  }

  setText("fd-closing-title", data.closingTitle);
  setText("fd-closing-lead", data.closingLead);

  const bulletsRoot = document.getElementById("fd-closing-bullets");
  if (bulletsRoot && data.closingBullets) {
    bulletsRoot.innerHTML = data.closingBullets
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join("");
  }
}

/* ── Roadmap & Value Case page ── */

function renderRoadmapValueCasePage(data) {
  const setText = (slot, value) => {
    const el = document.querySelector(`[data-slot="${slot}"]`);
    if (el) el.textContent = value || "";
  };

  setText("rvc-eyebrow", data.eyebrow);
  setText("rvc-headline", data.headline);
  setText("rvc-lead", data.lead);
  setText("rvc-disclaimer", data.disclaimer);

  setText("rvc-horizons-title", data.horizonsTitle);
  setText("rvc-horizons-lead", data.horizonsLead);
  setText("rvc-horizons-insight", data.horizonsInsight || "");
  const horizonsRoot = document.getElementById("rvc-horizons");
  if (horizonsRoot && data.horizons) {
    horizonsRoot.innerHTML = buildRoadmapHorizons(data.horizons);
  }

  setText("rvc-waves-title", data.wavesTitle);
  setText("rvc-waves-lead", data.wavesLead);
  setText("rvc-waves-insight", data.wavesInsight || "");
  const wavesRoot = document.getElementById("rvc-waves");
  if (wavesRoot && data.waves) {
    wavesRoot.innerHTML = buildWaveTimeline(data.waves);
  }

  setText("rvc-vcase-title", data.valueCaseTitle);
  setText("rvc-vcase-lead", data.valueCaseLead);
  const vcaseRoot = document.getElementById("rvc-vcase");
  if (vcaseRoot && data.valueCases) {
    vcaseRoot.innerHTML = buildValueCaseCards(data.valueCases, data.valueCaseDisclaimer);
  }

  setText("rvc-premises-title", data.premisesTitle);
  setText("rvc-premises-lead", data.premisesLead);
  const premisesRoot = document.getElementById("rvc-premises");
  if (premisesRoot && data.premiseGroups) {
    premisesRoot.innerHTML = buildPremisesPanel(data.premiseGroups);
  }

  setText("rvc-indicators-title", data.indicatorsTitle);
  setText("rvc-indicators-lead", data.indicatorsLead);
  const indicatorsRoot = document.getElementById("rvc-indicators");
  if (indicatorsRoot && data.indicators) {
    indicatorsRoot.innerHTML = buildValueIndicators(data.indicators);
  }

  setText("rvc-closing-title", data.closingTitle);
  setText("rvc-closing-lead", data.closingLead);
  setText("rvc-closing-microcopy", data.closingMicrocopy || "");

  const closingBullets = document.getElementById("rvc-closing-bullets");
  if (closingBullets && data.closingBullets) {
    closingBullets.innerHTML = data.closingBullets
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join("");
  }
}

/* ── Metrics Dashboard page ── */

function renderMetricsDashboardPage(data) {
  const setText = (slot, value) => {
    const el = document.querySelector(`[data-slot="${slot}"]`);
    if (el) el.textContent = value || "";
  };

  setText("md-eyebrow", data.eyebrow);
  setText("md-headline", data.headline);
  setText("md-lead", data.lead);
  setText("md-disclaimer", data.disclaimer);

  setText("md-kpis-title", data.kpisTitle);
  setText("md-kpis-lead", data.kpisLead);
  const kpisRoot = document.getElementById("md-kpis");
  if (kpisRoot && data.kpis) {
    kpisRoot.innerHTML = buildDashboardKpis(data.kpis);
  }

  setText("md-sc-title", data.scorecardTitle);
  setText("md-sc-lead", data.scorecardLead);
  const scRoot = document.getElementById("md-scorecard");
  if (scRoot && data.scorecardRows) {
    scRoot.innerHTML = buildDashScorecard(data.scorecardCols, data.scorecardRows);
  }

  setText("md-evo-title", data.evolutionTitle);
  setText("md-evo-lead", data.evolutionLead);
  const evoRoot = document.getElementById("md-evolution");
  if (evoRoot && data.evolutionCharts) {
    evoRoot.innerHTML = buildEvolutionCharts(data.evolutionCharts);
  }

  setText("md-dim-title", data.dimensionsTitle);
  setText("md-dim-lead", data.dimensionsLead);
  const dimRoot = document.getElementById("md-dimensions");
  if (dimRoot && data.dimensions) {
    dimRoot.innerHTML = buildDimensionCards(data.dimensions);
  }

  setText("md-alerts-title", data.alertsTitle);
  setText("md-alerts-lead", data.alertsLead);
  const alertsRoot = document.getElementById("md-alerts");
  if (alertsRoot && data.alerts) {
    alertsRoot.innerHTML = buildDashAlerts(data.alerts);
  }

  setText("md-dec-title", data.decisionsTitle);
  setText("md-dec-lead", data.decisionsLead);
  const decRoot = document.getElementById("md-decisions");
  if (decRoot && data.decisionCols) {
    decRoot.innerHTML = buildDashDecisions(data.decisionCols);
  }

  setText("md-closing-title", data.closingTitle);
  setText("md-closing-lead", data.closingLead);
  setText("md-closing-microcopy", data.closingMicrocopy || "");
  const closingBullets = document.getElementById("md-closing-bullets");
  if (closingBullets && data.closingBullets) {
    closingBullets.innerHTML = data.closingBullets
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join("");
  }
}

/* ── Bootstrap ── */

function showFatalError(message) {
  const banner = document.getElementById("app-error");
  if (!banner) {
    console.error(message);
    return;
  }
  banner.hidden = false;
  banner.innerHTML = `
    <strong>Não foi possível carregar a demonstração.</strong>
    <p>${escapeHtml(message)} Confirme que você está servindo os arquivos por HTTP local.</p>
  `;
}

async function bootstrap() {
  try {
    const [client, maturity, flows, metrics, preInception, targetArch, backlog, flowDetail, roadmapVC, metricsDash] = await Promise.all([
      fetchJson("src/data/mock-client.json"),
      fetchJson("src/data/maturity-model.json"),
      fetchJson("src/data/ai-flows.json"),
      fetchJson("src/data/metrics.json"),
      fetchJson("src/data/pre-inception-questions.json"),
      fetchJson("src/data/target-architecture.json"),
      fetchJson("src/data/ai-flow-backlog.json"),
      fetchJson("src/data/ai-flow-detail.json"),
      fetchJson("src/data/roadmap-value-case.json"),
      fetchJson("src/data/metrics-dashboard.json"),
    ]);
    renderExecutivePage({ client, maturity, metrics });
    renderPreInceptionPage(preInception);
    renderMaturityDiagnosisPage(maturity);
    renderTargetArchitecturePage(targetArch);
    renderBacklogPage(backlog);
    renderFlowDetailPage(flowDetail);
    renderRoadmapValueCasePage(roadmapVC);
    renderMetricsDashboardPage(metricsDash);
    initRouting();
  } catch (error) {
    console.error(error);
    showFatalError(error.message || String(error));
  }
}

document.addEventListener("DOMContentLoaded", bootstrap);
