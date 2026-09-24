"use strict";
try {
  localStorage.setItem("pl_third", "demo"); sessionStorage.setItem("pl_third_session", "demo");
  document.getElementById("status").textContent = "Frame terceiro: gravações local/session concluídas.";
} catch (error) { document.getElementById("status").textContent = `Frame terceiro: armazenamento indisponível (${error.name}).`; }
