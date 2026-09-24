/* global browser */
(() => {
  "use strict";
  let pending;
  function countStorage(name) {
    try { return {status: "observed", count: window[name].length, unit: "keys"}; }
    catch (error) { return {status: "unavailable", count: null, reason: error.name}; }
  }
  async function countDatabases() {
    let timer;
    try {
      if (typeof window.indexedDB?.databases !== "function") return {status: "unsupported", count: null};
      const databases = await Promise.race([window.indexedDB.databases(), new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Timeout")), 2000);
      })]);
      return {status: "observed", count: databases.length, unit: "databases"};
    } catch (error) { return {status: "unavailable", count: null, reason: error.message || error.name}; }
    finally { clearTimeout(timer); }
  }
  async function collect() {
    if (pending) return pending;
    pending = (async () => {
      const message = {type: "storage-snapshot", timeOrigin: performance.timeOrigin,
        localStorage: countStorage("localStorage"), sessionStorage: countStorage("sessionStorage"),
        indexedDB: await countDatabases()};
      await browser.runtime.sendMessage(message).catch(() => {});
    })();
    try { await pending; } finally { pending = null; }
  }
  browser.runtime.onMessage.addListener(message => message?.type === "collect-storage" ? collect().then(() => true) : undefined);
  window.addEventListener("pageshow", () => { collect(); setTimeout(collect, 1000); setTimeout(collect, 5000); });
  window.addEventListener("storage", collect);
  document.addEventListener("DOMContentLoaded", collect, {once: true});
  collect();
})();
