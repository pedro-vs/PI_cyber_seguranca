/* Observação de descritores, sem wrappers novos e sem ler argumentos/valores. */
(() => {
  "use strict";
  const P = PrivacyLens, page = window.wrappedJSObject, timeOrigin = performance.timeOrigin;
  const descriptor = Object.getOwnPropertyDescriptor, prototypeOf = Object.getPrototypeOf;
  function property(object, key) {
    for (let depth=0; object && depth<6; depth++, object=prototypeOf(object)) {
      const value = descriptor(object, key);if (value) return value;
    }
  }
  const tracker = P.createIntegrityObserver(api => {
    if (!page) throw Error("bridge-unavailable");
    const [owner, name] = api.split(".");
    const object = owner === "Window" ? page : property(property(page,owner)?.value,"prototype")?.value;
    return object ? property(object,name) : undefined;
  }, () => timeOrigin + performance.now());
  let sequence = 0, timer;
  const send = async () => {
    tracker.scan();
    await browser.runtime.sendMessage({type:"security-snapshot", timeOrigin, sequence:++sequence,
      observation:tracker.snapshot()}).catch(() => {});
  };
  // Executado pelo arquivo seguinte à instrumentação canvas: exclui somente suas mudanças de bootstrap.
  P.finishSecurityBootstrap = () => {
    tracker.finishBootstrap();send();
    timer = setInterval(() => {send();if(performance.now() >= 30000) clearInterval(timer);},1000);
  };
  browser.runtime.onMessage.addListener(m => m?.type === "collect-security" ? send().then(() => true) : undefined);
  document.addEventListener("DOMContentLoaded",send,{once:true});
  window.addEventListener("pageshow",send);
  window.addEventListener("pagehide",() => {clearInterval(timer);send();});
})();
