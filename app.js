(() => {
"use strict";
const $=id=>document.getElementById(id), board=$("artboard"), layers=$("layers"), viewport=$("viewport"), toast=$("toast");
const STORE="bioforge-document-v1";
let doc={width:760,height:980,bg:"#111218",elements:[
{id:"eyebrow",type:"text",name:"Eyebrow",text:"PERSONAL PROFILE / 001",x:64,y:65,w:420,h:25,color:"#a78bfa",bg:"transparent",size:12,weight:700,align:"left",opacity:100,radius:0,rotation:0},
{id:"heading",type:"text",name:"Título principal",text:"Sua história.\nSeu espaço.",x:64,y:165,w:610,h:180,color:"#f5f3fa",bg:"transparent",size:68,weight:700,align:"left",opacity:100,radius:0,rotation:0},
{id:"subheading",type:"text",name:"Descrição",text:"Uma página pessoal feita do seu jeito.",x:68,y:365,w:560,h:65,color:"#aaa8b8",bg:"transparent",size:20,weight:400,align:"left",opacity:100,radius:0,rotation:0},
{id:"line",type:"shape",name:"Divisor",text:"",x:68,y:485,w:620,h:2,color:"#a78bfa",bg:"#494354",size:16,weight:400,align:"left",opacity:75,radius:0,rotation:0},
{id:"about",type:"text",name:"Sobre",text:"SOBRE MIM\n\nConte sua história, apresente seus projetos e mostre o que faz você ser você.",x:68,y:530,w:590,h:150,color:"#e9e7f0",bg:"transparent",size:19,weight:400,align:"left",opacity:100,radius:0,rotation:0},
{id:"footer",type:"text",name:"Rodapé",text:"FEITO COM BIOFORGE  ✳",x:68,y:890,w:400,h:30,color:"#858492",bg:"transparent",size:11,weight:600,align:"left",opacity:100,radius:0,rotation:0}
]};
let selected=null,zoom=0.72,grid=8,showGrid=true,snap=true,history=[],future=[],drag=null,toastTimer,activeTool="select",pan=null;
const clone=o=>JSON.parse(JSON.stringify(o));
function notify(message){toast.textContent=message;toast.classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("visible"),1800)}
function snapshot(){history.push(JSON.stringify(doc));if(history.length>80)history.shift();future=[]}
function find(id){return doc.elements.find(e=>e.id===id)}
function roundGrid(v){return snap?v%grid<grid/2?v-v%grid:v+(grid-v%grid):v}
function escape(s){return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function render(){
 board.style.width=doc.width+"px";board.style.height=doc.height+"px";board.style.background=doc.bg;
 board.classList.toggle("show-grid",showGrid);board.style.backgroundSize=grid+"px "+grid+"px";
 board.replaceChildren();
 doc.elements.forEach(el=>{
  const node=document.createElement("div");node.className="design-element "+el.type+(el.id===selected?" selected":"");node.dataset.id=el.id;
  Object.assign(node.style,{left:el.x+"px",top:el.y+"px",width:el.w+"px",height:el.h+"px",color:el.color,background:el.type==="shape"?el.bg:"transparent",fontSize:el.size+"px",fontWeight:el.weight,textAlign:el.align,opacity:el.opacity/100,borderRadius:el.radius+"px",transform:"rotate("+el.rotation+"deg)"});
  if(el.type==="text"){node.textContent=el.text;node.style.whiteSpace="pre-wrap";node.addEventListener("dblclick",ev=>{ev.stopPropagation();snapshot();node.contentEditable="true";node.focus();document.getSelection()?.selectAllChildren(node)});node.addEventListener("blur",()=>{if(node.isContentEditable){el.text=node.textContent;node.contentEditable="false";render()}});node.addEventListener("keydown",ev=>{if(ev.key==="Escape"){node.blur()}if(ev.key==="Enter"&&!ev.shiftKey){ev.preventDefault();node.blur()}})}
  node.addEventListener("pointerdown",ev=>startDrag(ev,el.id));
  if(el.id===selected){["nw","ne","sw","se"].forEach(pos=>{const h=document.createElement("i");h.className="handle "+pos;h.dataset.handle=pos;h.addEventListener("pointerdown",ev=>startResize(ev,el.id,pos));node.append(h)})}
  board.append(node);
 });
 renderLayers();renderInspector();updateZoom();
}
function renderLayers(){
 layers.replaceChildren();
 [...doc.elements].reverse().forEach(el=>{const row=document.createElement("div");row.className="layer-row"+(el.id===selected?" selected":"");row.innerHTML='<span class="layer-icon">'+(el.type==="shape"?"◧":"T")+'</span><span class="layer-name"></span><button class="layer-action" title="Selecionar camada">⋯</button>';row.querySelector(".layer-name").textContent=el.name;row.addEventListener("click",()=>select(el.id));layers.append(row)});
}
function select(id){selected=id;render()}
function renderInspector(){
 const el=find(selected),page=!el;$("page-inspector").hidden=!page;$("element-inspector").hidden=page;$("selection-type").textContent=page?"PÁGINA":el.type.toUpperCase();
 if(page){$("page-width").value=doc.width;$("page-bg").value=doc.bg;return}
 ["x","y","w","h","color","bg","opacity","radius","rotation"].forEach(k=>{const input=$("prop-"+k);if(input)input.value=el[k]});
 $("opacity-value").textContent=el.opacity+"%";$("prop-text").value=el.text;$("prop-size").value=el.size;$("prop-weight").value=String(el.weight);$("prop-align").value=el.align;$("text-props").hidden=el.type!=="text";
}
function updateZoom(){const wrap=$("stage-wrap");wrap.style.width=doc.width*zoom+"px";wrap.style.height=doc.height*zoom+"px";board.style.transform="scale("+zoom+")";$("zoom-label").textContent=Math.round(zoom*100)+"%"}
function point(ev){const r=board.getBoundingClientRect();return{x:(ev.clientX-r.left)/zoom,y:(ev.clientY-r.top)/zoom}}
function startDrag(ev,id){if(ev.target.isContentEditable||ev.target.dataset.handle)return;ev.preventDefault();select(id);const p=point(ev),el=find(id);snapshot();drag={kind:"move",id,start:p,x:el.x,y:el.y};window.addEventListener("pointermove",movePointer);window.addEventListener("pointerup",endPointer,{once:true})}
function startResize(ev,id,handle){ev.preventDefault();ev.stopPropagation();select(id);const p=point(ev),el=find(id);snapshot();drag={kind:"resize",id,handle,start:p,x:el.x,y:el.y,w:el.w,h:el.h};window.addEventListener("pointermove",movePointer);window.addEventListener("pointerup",endPointer,{once:true})}
function movePointer(ev){if(!drag)return;const p=point(ev),dx=p.x-drag.start.x,dy=p.y-drag.start.y,el=find(drag.id);if(!el)return;
 if(drag.kind==="move"){el.x=Math.max(0,roundGrid(drag.x+dx));el.y=Math.max(0,roundGrid(drag.y+dy))}
 else{let {x,y,w,h}=drag;const west=drag.handle.includes("w"),north=drag.handle.includes("n");if(west){x=roundGrid(drag.x+dx);w=drag.w-(x-drag.x)}else w=roundGrid(drag.w+dx);if(north){y=roundGrid(drag.y+dy);h=drag.h-(y-drag.y)}else h=roundGrid(drag.h+dy);if(w>=12&&h>=12){el.x=x;el.y=y;el.w=w;el.h=h}}
 render(); }
function endPointer(){drag=null;window.removeEventListener("pointermove",movePointer)}
function add(type,text,name){snapshot();const id="el-"+Math.random().toString(36).slice(2,9);doc.elements.push({id,type,name,text,x:roundGrid(90),y:roundGrid(130+doc.elements.length*28),w:type==="shape"?180:360,h:type==="shape"?110:90,color:"#f5f3fa",bg:"#a78bfa",size: type==="text"?28:16,weight:600,align:"left",opacity:100,radius:type==="shape"?8:0,rotation:0});select(id)}
function bind(id,key,convert=v=>v){$(id).addEventListener("change",ev=>{const el=find(selected);if(!el)return;snapshot();el[key]=convert(ev.target.value);render()})}
["x","y","w","h","color","bg","opacity","radius","rotation","size","weight","align"].forEach(k=>bind("prop-"+k,k,v=>["x","y","w","h","opacity","radius","rotation","size","weight"].includes(k)?Number(v):v));
$("prop-text").addEventListener("focus",()=>{if(find(selected))snapshot()});$("prop-text").addEventListener("input",ev=>{const el=find(selected);if(!el)return;el.text=ev.target.value;const node=board.querySelector('[data-id="'+selected+'"]');if(node)node.textContent=el.text});
$("prop-text").addEventListener("change",()=>{snapshot();render()});
$("page-width").addEventListener("change",ev=>{snapshot();doc.width=Math.max(320,Math.min(1200,Number(ev.target.value)||760));render()});
$("page-bg").addEventListener("input",ev=>{doc.bg=ev.target.value;board.style.background=doc.bg});
$("page-bg").addEventListener("change",snapshot);
$("add-text").onclick=()=>add("text","Novo texto","Texto");$("add-heading").onclick=()=>add("text","Novo título","Título");$("add-paragraph").onclick=()=>add("text","Escreva seu conteúdo aqui...","Parágrafo");$("add-shape").onclick=()=>add("shape","","Forma");
$("delete").onclick=()=>{if(!selected)return;snapshot();doc.elements=doc.elements.filter(e=>e.id!==selected);selected=null;render()};
$("duplicate").onclick=()=>{const el=find(selected);if(!el)return;snapshot();const copy=clone(el);copy.id="el-"+Math.random().toString(36).slice(2,9);copy.name+=" cópia";copy.x+=grid*2;copy.y+=grid*2;doc.elements.push(copy);select(copy.id)};
$("center-page").onclick=()=>{snapshot();doc.elements.forEach(el=>el.x=Math.round((doc.width-el.w)/2));render();notify("Elementos centralizados horizontalmente")};
$("grid-toggle").onchange=ev=>{showGrid=ev.target.checked;render()};$("snap-toggle").onchange=ev=>snap=ev.target.checked;$("grid-size").onchange=ev=>{grid=Number(ev.target.value);render()};
$("zoom-in").onclick=()=>{zoom=Math.min(1.5,zoom+.1);updateZoom()};$("zoom-out").onclick=()=>{zoom=Math.max(.25,zoom-.1);updateZoom()};$("fit").onclick=()=>{zoom=Math.min(1,(viewport.clientWidth-70)/doc.width,(viewport.clientHeight-70)/doc.height);updateZoom()};
$("undo").onclick=undo;$("redo").onclick=redo;
function undo(){if(!history.length)return;future.push(JSON.stringify(doc));doc=JSON.parse(history.pop());selected=null;render();notify("Ação desfeita")}
function redo(){if(!future.length)return;history.push(JSON.stringify(doc));doc=JSON.parse(future.pop());selected=null;render();notify("Ação refeita")}
window.addEventListener("keydown",ev=>{if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==="z"){ev.preventDefault();ev.shiftKey?redo():undo()}if((ev.key==="Delete"||ev.key==="Backspace")&&selected&&!["INPUT","TEXTAREA"].includes(document.activeElement.tagName)&&!document.activeElement.isContentEditable){$("delete").click()}if(ev.key==="Escape"){selected=null;render()}});
board.addEventListener("pointerdown",ev=>{if(activeTool==="hand"){ev.preventDefault();pan={x:ev.clientX,y:ev.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};window.addEventListener("pointermove",panMove);window.addEventListener("pointerup",()=>{pan=null;window.removeEventListener("pointermove",panMove)},{once:true});return}if(ev.target===board){selected=null;render()}});function panMove(ev){if(!pan)return;viewport.scrollLeft=pan.left-(ev.clientX-pan.x);viewport.scrollTop=pan.top-(ev.clientY-pan.y)}$("select-tool").onclick=()=>{activeTool="select";$("select-tool").classList.add("active");$("hand-tool").classList.remove("active")};$("hand-tool").onclick=()=>{activeTool="hand";$("hand-tool").classList.add("active");$("select-tool").classList.remove("active")};
$("save").onclick=()=>{try{localStorage.setItem(STORE,JSON.stringify(doc));$("doc-status").textContent="Salvo localmente";notify("Documento salvo neste dispositivo")}catch{notify("Não foi possível salvar no navegador")}};
$("reset-doc").onclick=()=>{if(!confirm("Restaurar a composição inicial? Isso substitui o documento atual."))return;snapshot();doc={width:760,height:980,bg:"#111218",elements:[]};selected=null;render();notify("Documento reiniciado")};
function exportHtml(){const elements=doc.elements.map(el=>{const style='left:'+el.x+'px;top:'+el.y+'px;width:'+el.w+'px;height:'+el.h+'px;color:'+el.color+';background:'+(el.type==="shape"?el.bg:"transparent")+';font-size:'+el.size+'px;font-weight:'+el.weight+';text-align:'+el.align+';opacity:'+(el.opacity/100)+';border-radius:'+el.radius+'px;transform:rotate('+el.rotation+'deg)';return '<div class="'+el.type+'" style="'+style+'">'+(el.type==="text"?escape(el.text).replace(/\n/g,"<br>"):"")+"</div>"}).join("\n");const css='*{box-sizing:border-box}body{margin:0;padding:40px 12px;background:#e9e9ee;font-family:system-ui,sans-serif}.page{position:relative;width:'+doc.width+'px;height:'+doc.height+'px;max-width:100%;margin:auto;background:'+doc.bg+';overflow:hidden}.text,.shape{position:absolute;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.25}.shape{background:var(--shape-bg)}@media(max-width:'+doc.width+'px){.page{transform-origin:top center;transform:scale(calc(100vw / '+doc.width+'));margin-bottom:calc(('+doc.height+'px * (100vw / '+doc.width+') - '+doc.height+'px))}}';const html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Minha página — BioForge</title><style>'+css+'</style></head><body><main class="page">'+elements+'</main></body></html>';const url=URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="bioforge-page.html";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify("HTML independente exportado")}
$("export").onclick=exportHtml;
function load(){try{const saved=localStorage.getItem(STORE);if(saved){const parsed=JSON.parse(saved);if(parsed&&Array.isArray(parsed.elements)&&Number.isFinite(parsed.width))doc=parsed}}catch{}}
load();render();$("fit").click();
})();