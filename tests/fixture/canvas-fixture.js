"use strict";
// Script servido pela origem da página; nenhuma API da extensão é utilizada.
(async () => {
  const scenario=location.pathname.split("/").pop();
  const canvas=document.getElementById("canvas"),ctx=canvas.getContext("2d");
  const out={scenario,draws:0,dataURL:false,imageData:false,blob:false,error:null};
  const draw=() => {
    ctx.fillStyle="#116699";ctx.fillRect(0,0,320,100);
    ctx.fillStyle="#ffffff";ctx.font="22px sans-serif";ctx.fillText("Privacy Lens • Canvas",12,55);
    out.draws=2;
  };
  const labels={negative:"Caso negativo · desenho normal",positive:"Caso positivo · desenho + extração",
    "read-only":"Controle · exportação sem desenho",errors:"Controle · leitura com exceção",frame:"Controle · canvas em frame terceiro"};
  document.title=labels[scenario] || "Canvas";
  document.getElementById("title").textContent=labels[scenario] || "Canvas";
  if(scenario==="frame") {
    canvas.remove();
    const frame=document.createElement("iframe");frame.src="http://127.0.0.1:__PORT__/canvas/positive";frame.title="Canvas terceiro";
    document.getElementById("scenario").after(frame);
    await new Promise(resolve=>frame.onload=resolve);
  } else if(scenario==="negative") draw();
  else if(scenario==="positive") {
    draw();
    const pixels=ctx.getImageData(0,0,1,1);out.imageData=pixels instanceof ImageData;out.pixel=[...pixels.data];
    const data=canvas.toDataURL("image/png");out.dataURL=data.startsWith("data:image/png;base64,");
    // Retido apenas na fixture de teste para comparação nativa vs. instrumentada.
    out.nativeOutput=data;
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));
    out.blob=blob instanceof Blob;out.blobType=blob?.type;out.blobSize=blob?.size;
  } else if(scenario==="read-only") out.dataURL=canvas.toDataURL().startsWith("data:image/png;base64,");
  else if(scenario==="errors") {
    draw();
    try {ctx.getImageData(0,0,0,1);}catch(error){out.error=error.name;}
  }
  // Dados do teste expostos somente pela fixture, não pelo detector.
  window.fixtureResult=out;
  const visible={...out};delete visible.nativeOutput;
  document.getElementById("result").textContent=JSON.stringify(visible,null,2);
  document.getElementById("expected").textContent=({negative:"Esperado: Canvas utilizado; indicador não detectado.",
    positive:"Esperado: indicador detectado; 2 desenhos + 3 leituras/exportações no mesmo canvas.",
    "read-only":"Esperado: leitura/exportação observada; sem sequência compatível.",
    errors:"Esperado: 1 leitura com exceção IndexSizeError; indicador não detectado.",
    frame:"Esperado: indicador no frame 127.0.0.1; nenhum desenho no frame principal."})[scenario];
  document.getElementById("status").textContent="PRONTO";
})().catch(error=>{document.getElementById("status").textContent=`FALHA: ${error.name}: ${error.message}`;});
