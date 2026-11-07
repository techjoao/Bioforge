const form=document.querySelector("#bio-form");
const fields=["name","headline","location","about","projects","interests","website","github","instagram","linkedin","template","font","accent","surface"];
const status=document.querySelector("#status");
let avatarData="";
const $=id=>document.getElementById(id);
const readData=()=>{const data=Object.fromEntries(fields.map(key=>[key,form.elements[key].value]));data.showFooter=form.elements.showFooter.checked;data.avatar=avatarData;return data};
const setStatus=message=>{status.textContent=message};
const safeUrl=value=>{try{const url=new URL(value);return ["http:","https:"].includes(url.protocol)?url.href:""}catch{return ""}};
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
function updatePreview(){
 const d=readData(),name=d.name.trim()||"Sua próxima página começa aqui.";
 $("preview-name").textContent=name;
 $("preview-headline").textContent=d.headline.trim()||"Sua descrição curta vai aparecer aqui.";
 $("preview-about").textContent=d.about.trim()||"Conte sua história no editor. A prévia vai acompanhar cada mudança.";
 $("preview-interests").textContent=d.interests.trim()||"O que move sua curiosidade?";
 $("preview-location").textContent=d.location.trim();
 $("preview-avatar").replaceChildren();
 if(avatarData){const img=document.createElement("img");img.src=avatarData;img.alt="";$("preview-avatar").append(img)}else $("preview-avatar").textContent=(d.name.trim()[0]||"B").toUpperCase();
 $("avatar-thumb").replaceChildren();
 if(avatarData){const img=document.createElement("img");img.src=avatarData;img.alt="";$("avatar-thumb").append(img)}else $("avatar-thumb").textContent=(d.name.trim()[0]||"B").toUpperCase();
 const list=$("preview-projects");list.replaceChildren();
 const projects=d.projects.split("\n").map(v=>v.trim()).filter(Boolean);
 (projects.length?projects:["Seus projetos vão aparecer aqui."]).forEach(item=>{const li=document.createElement("li");li.textContent=item;list.append(li)});
 const links=[["Site",d.website],["GitHub",d.github],["Instagram",d.instagram],["LinkedIn",d.linkedin]].filter(([,url])=>safeUrl(url));
 const linkBox=$("preview-links");linkBox.replaceChildren();
 links.forEach(([label,url])=>{const a=document.createElement("a");a.textContent=label;a.href=safeUrl(url);a.target="_blank";a.rel="noopener noreferrer";linkBox.append(a)});
 $("social-section").hidden=links.length===0;
 $("preview-footer").hidden=!d.showFooter;
 const preview=$("preview");
 preview.className="bio-page template-"+d.template+" surface-"+d.surface+" font-"+d.font;
 preview.style.setProperty("--accent",d.accent);
 $("accent-value").textContent=d.accent.toUpperCase();
}
form.addEventListener("input",updatePreview);
form.addEventListener("change",updatePreview);
$("avatar-file").addEventListener("change",event=>{
 const file=event.target.files&&event.target.files[0];if(!file)return;
 if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setStatus("Use uma imagem JPG, PNG ou WebP.");event.target.value="";return}
 if(file.size>2*1024*1024){setStatus("A imagem precisa ter até 2 MB.");event.target.value="";return}
 const reader=new FileReader();reader.onload=()=>{avatarData=String(reader.result||"");updatePreview();setStatus("Foto carregada localmente.")};reader.onerror=()=>setStatus("Não foi possível ler essa imagem.");reader.readAsDataURL(file);
});
$("remove-avatar").addEventListener("click",()=>{avatarData="";$("avatar-file").value="";updatePreview();setStatus("Foto removida da prévia.")});
$("save-button").addEventListener("click",()=>{
 try{localStorage.setItem("bioforge-studio-draft",JSON.stringify(readData()));setStatus("Rascunho salvo neste navegador.")}
 catch{setStatus("Não foi possível salvar. Tente exportar o HTML.") }
});
function loadDraft(){
 try{const raw=localStorage.getItem("bioforge-studio-draft");if(!raw)return;const d=JSON.parse(raw);fields.forEach(key=>{if(typeof d[key]==="string")form.elements[key].value=d[key]});form.elements.showFooter.checked=d.showFooter!==false;avatarData=typeof d.avatar==="string"?d.avatar:"";updatePreview();setStatus("Rascunho local restaurado.")}
 catch{setStatus("O rascunho salvo não pôde ser carregado.")}
}
$("clear-button").addEventListener("click",()=>{form.reset();avatarData="";$("avatar-file").value="";updatePreview();setStatus("Formulário limpo. Seu rascunho salvo continua guardado.")});
function buildExport(d){
 const name=d.name.trim()||"Minha biografia";
 const projects=d.projects.split("\n").map(v=>v.trim()).filter(Boolean);
 const items=projects.length?projects.map(v=>"<li>"+escapeHtml(v)+"</li>").join(""):"<li>Adicione seus projetos ao editar sua página.</li>";
 const socials=[["Site",d.website],["GitHub",d.github],["Instagram",d.instagram],["LinkedIn",d.linkedin]].filter(([,v])=>safeUrl(v)).map(([label,url])=>'<a href="'+escapeHtml(safeUrl(url))+'" target="_blank" rel="noopener noreferrer">'+label+"</a>").join("");
 const avatar=d.avatar?'<img src="'+d.avatar+'" alt="">':escapeHtml((name[0]||"B").toUpperCase());
 const cssText='*{box-sizing:border-box}body{margin:0;padding:35px 18px;background:var(--outer);color:var(--text);font:16px/1.7 '+(d.font==="mono"?"ui-monospace,monospace":d.font==="serif"?"Georgia,serif":"system-ui,sans-serif")+'}.page{--accent:'+escapeHtml(d.accent)+';--outer:'+(d.surface==="light"?"#e9e7ef":d.surface==="midnight"?"#091321":"#0c0d12")+';--card:'+(d.surface==="light"?"#f7f6fa":d.surface==="midnight"?"#101b2c":"#14151d")+';--text:'+(d.surface==="light"?"#24222c":"#f0eff6")+';--muted:'+(d.surface==="light"?"#716e7c":"#a09eae")+';--line:'+(d.surface==="light"?"#d8d5df":"#333440")+';max-width:780px;margin:auto;padding:clamp(25px,6vw,65px);background:var(--card);border:1px solid var(--line);border-radius:'+(d.template==="editorial"?"2px":"12px")+'}.top{font-size:9px;letter-spacing:.17em;color:var(--muted);border-bottom:1px solid var(--line);padding-bottom:14px}.avatar{width:68px;height:68px;border-radius:'+(d.template==="editorial"?"50%":"18px")+';background:var(--accent);color:#111;display:grid;place-items:center;overflow:hidden;font-size:25px;font-weight:800;margin:42px 0 22px}.avatar img{width:100%;height:100%;object-fit:cover}.kicker,h2{color:var(--accent)}.kicker{font-size:9px;letter-spacing:.2em;font-weight:800}h1{font-size:clamp(38px,8vw,64px);line-height:1.03;letter-spacing:-.06em;margin:10px 0}.headline,.location{color:var(--muted)}.rule{height:1px;background:var(--line);margin:30px 0}section{display:grid;grid-template-columns:150px 1fr;gap:20px;margin:30px 0}h2{font-size:10px;letter-spacing:.13em;text-transform:uppercase;margin:0}p,li{font-size:13px;line-height:1.8;overflow-wrap:anywhere}.links{display:flex;flex-wrap:wrap;gap:8px}.links a{color:var(--text);border:1px solid var(--line);padding:6px 10px;border-radius:6px;font-size:11px;text-decoration:none}footer{border-top:1px solid var(--line);padding-top:16px;margin-top:45px;color:var(--muted);font-size:9px;letter-spacing:.15em}@media(max-width:560px){section{grid-template-columns:1fr;gap:8px}}';
 const page='<main class="page"><div class="top">PERSONAL PROFILE</div><div class="avatar">'+avatar+'</div><p class="kicker">HELLO, I\'M</p><h1>'+escapeHtml(name)+'</h1><p class="headline">'+escapeHtml(d.headline)+'</p>'+(d.location.trim()?'<p class="location">'+escapeHtml(d.location)+'</p>':"")+'<div class="rule"></div><section><h2>Sobre</h2><p>'+escapeHtml(d.about).replace(/\n/g,"<br>")+'</p></section><section><h2>Projetos selecionados</h2><ul>'+items+'</ul></section><section><h2>Interesses</h2><p>'+escapeHtml(d.interests)+'</p></section>'+(socials?'<section><h2>Encontre-me</h2><div class="links">'+socials+"</div></section>":"")+(d.showFooter?'<footer>BUILT WITH BIOFORGE ✳</footer>':"")+"</main>";
 return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Página pessoal de '+escapeHtml(name)+'"><title>'+escapeHtml(name)+'</title><style>'+cssText+'</style></head><body>'+page+"</body></html>";
}
$("export-button").addEventListener("click",()=>{
 try{const blob=new Blob([buildExport(readData())],{type:"text/html;charset=utf-8"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="minha-biografia.html";document.body.append(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus("HTML independente exportado. Pronto para publicar onde quiser.")}
 catch{setStatus("Não foi possível exportar. Tente novamente.")}
});
$("device-button").addEventListener("click",()=>{const preview=$("preview");preview.classList.toggle("narrow");$("device-button").setAttribute("aria-label",preview.classList.contains("narrow")?"Mostrar prévia larga":"Mostrar prévia estreita");$("preview-device").textContent=preview.classList.contains("narrow")?"MOBILE":"DESKTOP"});
loadDraft();updatePreview();
