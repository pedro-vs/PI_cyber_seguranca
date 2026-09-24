/* global browser, exportFunction, PrivacyLens */
(() => {
  "use strict";
  const tracker = PrivacyLens.createCanvasTracker();
  const identity = new WeakMap(), hooks = [], failed = [], unsupported = [];
  let nextId = 1, timer = null, sequence = 0;
  const page = window.wrappedJSObject;
  const timeOrigin = performance.timeOrigin;
  const reflectApply = Reflect.apply;
  const now = () => performance.now();
  const descriptors = Object.getOwnPropertyDescriptor;
  const define = Object.defineProperty;

  function observe(canvas, method, kind, outcome, error) {
    // Tudo dentro do try: uma falha de telemetria não pode mudar retorno/exceção da API.
    try {
      if (!canvas || typeof canvas !== "object") return;
      let id = identity.get(canvas);
      if (!id) { id = nextId++; identity.set(canvas, id); }
      tracker.record({canvasId:id, method, kind, outcome, at:now(),
        width:Number(canvas.width) || 0, height:Number(canvas.height) || 0,
        errorName:error ? String(error.name || "Error").slice(0,64) : null});
      if (timer === null) timer = setTimeout(send, 250);
    } catch { /* Observação deve falhar sem interromper o site. */ }
  }

  function hook(prototypeName, method, kind, canvasFor) {
    const label = `${prototypeName}.${method}`;
    try {
      const prototype = page?.[prototypeName]?.prototype;
      const descriptor = prototype && descriptors(prototype, method);
      if (!descriptor || typeof descriptor.value !== "function") { unsupported.push(label); return; }
      const original = descriptor.value;
      const wrapper = function(...args) {
        let result;
        try { result = reflectApply(original, this, args); }
        catch (error) {
          if (kind === "read") {
            try { observe(canvasFor(this), label, kind, "threw", error); } catch { /* Preserve erro original. */ }
          }
          throw error;
        }
        try { observe(canvasFor(this), label, kind, method === "toBlob" ? "requested" : "returned"); }
        catch { /* Preserve resultado original. */ }
        return result;
      };
      // Mantém aridade/nome e flags do descritor; identidade e toString são observavelmente diferentes.
      define(wrapper, "name", {value:original.name, configurable:true});
      define(wrapper, "length", {value:original.length, configurable:true});
      const bridge = exportFunction(wrapper, window);
      const exported = bridge.wrappedJSObject || bridge;
      define(exported, "name", {value:original.name, configurable:true});
      define(exported, "length", {value:original.length, configurable:true});
      define(prototype, method, {...descriptor, value:exported});
      hooks.push({prototype, method, label, exported});
    } catch (error) { failed.push({method:label, error:String(error.name || "Error")}); }
  }

  async function send() {
    clearTimeout(timer); timer = null;
    const replaced = hooks.filter(h => {
      try { return descriptors(h.prototype,h.method)?.value !== h.exported; } catch { return true; }
    }).map(h => h.label);
    await browser.runtime.sendMessage({type:"canvas-snapshot", timeOrigin, sequence:++sequence,
      observation:tracker.snapshot(), instrumentation:{strategy:"Firefox wrappedJSObject + exportFunction",
        installed:hooks.map(h => h.label), failed, unsupported, replaced}}).catch(() => {});
  }

  if (!page || typeof exportFunction !== "function") failed.push({method:"instrumentation",error:"Firefox bridge unavailable"});
  else {
    for (const method of ["fillRect","strokeRect","fillText","strokeText","drawImage","putImageData","fill","stroke"])
      hook("CanvasRenderingContext2D", method, "draw", context => context.canvas);
    hook("CanvasRenderingContext2D", "getImageData", "read", context => context.canvas);
    hook("HTMLCanvasElement", "toDataURL", "read", canvas => canvas);
    hook("HTMLCanvasElement", "toBlob", "read", canvas => canvas);
  }
  browser.runtime.onMessage.addListener(message => message?.type === "collect-canvas" ? send().then(() => true) : undefined);
  window.addEventListener("pageshow", send);
  document.addEventListener("DOMContentLoaded", send, {once:true});
  send();
})();
