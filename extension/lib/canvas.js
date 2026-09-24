/* Modelo puro compartilhado com os testes; não lê pixels nem texto do canvas. */
(() => {
  "use strict";
  const P = globalThis.PrivacyLens ||= {};
  P.createCanvasTracker = ({windowMs = 5000, maxCanvases = 100, maxEvents = 20000, maxSamples = 40} = {}) => {
    const canvases = new Map(), samples = [];
    let drawingCalls = 0, readbackCalls = 0, failedReadbacks = 0;
    let events = 0, droppedEvents = 0, droppedSamples = 0;
    return {
      record(event) {
        if (events >= maxEvents || (!canvases.has(event.canvasId) && canvases.size >= maxCanvases)) {
          droppedEvents++; return;
        }
        events++;
        let canvas = canvases.get(event.canvasId);
        if (!canvas) {
          canvas = {id: event.canvasId, drawCount: 0, readCount: 0, failedReadCount: 0,
            lastDrawAt: null, lastDrawMethod: null, drawMethods: new Set(), readMethods: new Set(), indicator: false};
          canvases.set(event.canvasId, canvas);
        }
        if (event.kind === "draw") {
          drawingCalls++; canvas.drawCount++;
          canvas.lastDrawAt = event.at; canvas.lastDrawMethod = event.method;
          canvas.drawMethods.add(event.method); return;
        }
        if (event.kind !== "read") return;
        readbackCalls++; canvas.readCount++; canvas.readMethods.add(event.method);
        if (event.outcome === "threw") { failedReadbacks++; canvas.failedReadCount++; }
        const elapsed = canvas.lastDrawAt === null ? null : event.at - canvas.lastDrawAt;
        const correlated = ["returned", "requested"].includes(event.outcome) && event.width > 0 && event.height > 0 &&
          elapsed !== null && elapsed >= 0 && elapsed <= windowMs;
        canvas.indicator ||= correlated;
        if (samples.length < maxSamples) samples.push({canvasId: canvas.id, method: event.method,
          outcome: event.outcome, errorName: event.errorName || null, at: event.at,
          width: event.width, height: event.height, precedingDraw: canvas.lastDrawMethod,
          drawToReadMs: elapsed, correlated});
        else droppedSamples++;
      },
      snapshot() {
        const entries = [...canvases.values()].map(c => ({...c, drawMethods:[...c.drawMethods],readMethods:[...c.readMethods]}));
        const indicatorCanvases = entries.filter(c => c.indicator).length;
        const classification = indicatorCanvases ? "indicator" : readbackCalls ? "readback-only" : drawingCalls ? "draw-only" : "not-observed";
        return {ruleVersion:"canvas-sequence-v1", windowMs, classification, used:canvases.size > 0,
          canvasCount:canvases.size, drawingCalls, readbackCalls, failedReadbacks, indicatorCanvases,
          canvases:entries, samples:samples.map(e => ({...e})), droppedEvents, droppedSamples};
      }
    };
  };
  P.summarizeCanvas = frames => {
    const totals = {drawingCalls:0,readbackCalls:0,failedReadbacks:0,canvasCount:0,indicatorCanvases:0};
    for (const f of frames) for (const key of Object.keys(totals)) totals[key] += f.observation[key];
    const anyInstalled = frames.some(f => f.instrumentation.installed.length > 0);
    return {...totals, frames,
      classification: totals.indicatorCanvases ? "indicator" : totals.readbackCalls ? "readback-only" :
        totals.drawingCalls ? "draw-only" : anyInstalled ? "not-observed" : "unavailable",
      partial: !frames.length || frames.some(f => f.instrumentation.failed.length || f.instrumentation.replaced.length || (f.instrumentation.unsupported?.length || 0) ||
        f.observation.droppedEvents || f.observation.droppedSamples),
      ruleVersion:"canvas-sequence-v1", windowMs:5000,
      meaning:"Desenho seguido de leitura/exportação no mesmo canvas em até 5 s é um indício heurístico, não prova de rastreamento."};
  };
})();
