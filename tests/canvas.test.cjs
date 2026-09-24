"use strict";
const {test} = require("node:test"), assert = require("node:assert/strict");
require("../extension/lib/canvas.js");
const P = globalThis.PrivacyLens;
const draw = (canvasId=1,at=100) => ({canvasId,at,kind:"draw",method:"CanvasRenderingContext2D.fillText",outcome:"returned",width:200,height:60});
const read = (canvasId=1,at=200,method="HTMLCanvasElement.toDataURL",outcome="returned") => ({canvasId,at,kind:"read",method,outcome,width:200,height:60});
test("canvas ausente não vira uso ou fingerprinting", () => {
  const s=P.createCanvasTracker().snapshot(); assert.equal(s.used,false); assert.equal(s.classification,"not-observed");
});
test("somente desenho é negativo", () => {
  const t=P.createCanvasTracker(); t.record(draw()); t.record(draw(1,300));
  assert.equal(t.snapshot().classification,"draw-only"); assert.equal(t.snapshot().indicatorCanvases,0);
});
test("leitura sem desenho é nível separado, não indicador", () => {
  const t=P.createCanvasTracker();t.record(read());assert.equal(t.snapshot().classification,"readback-only");
});
for(const method of ["HTMLCanvasElement.toDataURL","HTMLCanvasElement.toBlob","CanvasRenderingContext2D.getImageData"]) {
  test(`desenho + ${method} no mesmo canvas produz indício`, () => {
    const t=P.createCanvasTracker();t.record(draw());t.record(read(1,200,method,method.endsWith("toBlob")?"requested":"returned"));
    assert.equal(t.snapshot().classification,"indicator");assert.equal(t.snapshot().samples[0].precedingDraw,"CanvasRenderingContext2D.fillText");
  });
}
test("desenho e leitura em canvases diferentes não se correlacionam", () => {
  const t=P.createCanvasTracker();t.record(draw(1));t.record(read(2));assert.equal(t.snapshot().indicatorCanvases,0);
});
test("janela de 5 segundos tem fronteira explícita", () => {
  const a=P.createCanvasTracker(),b=P.createCanvasTracker();a.record(draw(1,0));b.record(draw(1,0));
  a.record(read(1,5000));b.record(read(1,5001));assert.equal(a.snapshot().indicatorCanvases,1);assert.equal(b.snapshot().indicatorCanvases,0);
});
test("exceção de leitura não é extração confirmada", () => {
  const t=P.createCanvasTracker();t.record(draw());t.record({...read(1,200,undefined,"threw"),errorName:"SecurityError"});
  assert.equal(t.snapshot().indicatorCanvases,0);assert.equal(t.snapshot().failedReadbacks,1);
});
test("canvas zero não produz indício", () => {
  const t=P.createCanvasTracker();t.record(draw());t.record({...read(),width:0});assert.equal(t.snapshot().indicatorCanvases,0);
});
test("limites informam perda sem criar falso positivo", () => {
  const t=P.createCanvasTracker({maxEvents:1});t.record(draw());t.record(read());
  assert.equal(t.snapshot().droppedEvents,1);assert.equal(t.snapshot().indicatorCanvases,0);
});
test("amostras limitadas, contagem continua", () => {
  const t=P.createCanvasTracker({maxSamples:1});t.record(draw());t.record(read());t.record(read(1,201));
  assert.equal(t.snapshot().readbackCalls,2);assert.equal(t.snapshot().samples.length,1);assert.equal(t.snapshot().droppedSamples,1);
});
test("IDs iguais em frames diferentes não se correlacionam", () => {
  const a=P.createCanvasTracker(),b=P.createCanvasTracker();a.record(draw());b.record(read());
  const wrap=t=>({observation:t.snapshot(),instrumentation:{installed:["method"],failed:[],replaced:[]}});
  const s=P.summarizeCanvas([wrap(a),wrap(b)]);assert.equal(s.indicatorCanvases,0);assert.equal(s.canvasCount,2);
});
test("sem coleta é indisponível; perda de hooks torna cobertura parcial", () => {
  assert.equal(P.summarizeCanvas([]).classification,"unavailable");
  const s=P.summarizeCanvas([{observation:P.createCanvasTracker().snapshot(),instrumentation:{installed:["method"],failed:[],replaced:["method"]}}]);
  assert.equal(s.partial,true);
  assert.equal(P.summarizeCanvas([{observation:P.createCanvasTracker().snapshot(),instrumentation:{installed:["method"],failed:[],replaced:[],unsupported:["missing"]}}]).partial,true);
});
test("eventos não retêm texto, pixels, dataURL ou argumentos", () => {
  const t=P.createCanvasTracker();t.record(draw());t.record({...read(),text:"SEGREDO",pixels:[1,2,3],dataURL:"data:secret",args:["segredo"]});
  const json=JSON.stringify(t.snapshot());assert.equal(/SEGREDO|data:secret|pixels|args/.test(json),false);
});
