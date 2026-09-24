"use strict";
(async () => {
  document.cookie = "pl_session_js=demo; Path=/; SameSite=Lax";
  document.cookie = "pl_persistent_js=demo; Max-Age=86400; Path=/; SameSite=Lax";
  localStorage.setItem("pl_a", "demo"); localStorage.setItem("pl_b", "demo");
  sessionStorage.setItem("pl_session", "demo");
  await new Promise((resolve,reject) => {
    const request = indexedDB.open("pl_fixture",1);
    request.onupgradeneeded = () => request.result.createObjectStore("items");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db=request.result, tx=db.transaction("items","readwrite");
      tx.objectStore("items").put("demo",1);
      tx.oncomplete=() => {db.close();resolve();}; tx.onerror=() => {db.close();reject(tx.error);};
    };
  });
  await fetch("http://127.0.0.1:__PORT__/api");
  document.getElementById("status").textContent = "PRONTO\nEsperado em perfil limpo:\n5 cookies próprios: 3 de sessão + 2 persistentes (1 HttpOnly).\n3 tentativas Set-Cookie HTTP.\nFrame principal: localStorage 2 chaves; sessionStorage 1 chave; IndexedDB 1 banco.\nRede: localhost primeira parte; 127.0.0.1 terceira parte.\nFrame terceiro: 1 chave local + 1 de sessão, ou indisponível conforme a proteção do Firefox.";
})().catch(error => {document.getElementById("status").textContent = `FALHA DA FIXTURE: ${error.message}`;});
