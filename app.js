const form = document.querySelector("#bio-form");
const fields = ["name", "headline", "about", "projects", "interests", "accent"];
const status = document.querySelector("#status");

const getData = () => Object.fromEntries(fields.map((key) => [key, form.elements[key].value]));
const setStatus = (message) => { status.textContent = message; };

function updatePreview() {
  const data = getData();
  const name = data.name.trim() || "Sua identidade começa aqui.";
  document.querySelector("#preview-name").textContent = name;
  document.querySelector("#preview-headline").textContent = data.headline.trim() || "Sua descrição curta aparece neste espaço.";
  document.querySelector("#preview-about").textContent = data.about.trim() || "Escreva sua biografia no editor para começar a construir sua página.";
  document.querySelector("#preview-interests").textContent = data.interests.trim() || "Seus interesses em um só lugar.";
  document.querySelector("#preview-avatar").textContent = (data.name.trim()[0] || "B").toUpperCase();
  document.querySelector("#preview").style.setProperty("--card-accent", data.accent || "#9b8cff");
  const list = document.querySelector("#preview-projects");
  list.replaceChildren();
  const items = data.projects.split("\n").map((item) => item.trim()).filter(Boolean);
  (items.length ? items : ["Seus projetos vão aparecer aqui."]).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.append(li);
  });
}

form.addEventListener("input", updatePreview);

document.querySelector("#save-button").addEventListener("click", () => {
  try {
    localStorage.setItem("bioforge-draft", JSON.stringify(getData()));
    setStatus("Rascunho salvo somente neste navegador.");
  } catch {
    setStatus("Não foi possível salvar neste navegador. Você ainda pode exportar sua página.");
  }
});

function loadDraft() {
  try {
    const saved = localStorage.getItem("bioforge-draft");
    if (!saved) return;
    const data = JSON.parse(saved);
    fields.forEach((key) => { if (typeof data[key] === "string") form.elements[key].value = data[key]; });
    updatePreview();
    setStatus("Rascunho local carregado deste navegador.");
  } catch {
    setStatus("Não foi possível ler o rascunho local.");
  }
}

document.querySelector("#clear-button").addEventListener("click", () => {
  form.reset();
  updatePreview();
  setStatus("Editor limpo. O rascunho salvo localmente não foi apagado.");
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function buildExport(data) {
  const projects = data.projects.split("\n").map((item) => item.trim()).filter(Boolean);
  const projectMarkup = projects.length
    ? projects.map((item) => "<li>" + escapeHtml(item) + "</li>").join("")
    : "<li>Adicione seus projetos ao editar sua página.</li>";
  const name = data.name.trim() || "Minha biografia";
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Página biográfica de ${escapeHtml(name)}"><title>${escapeHtml(name)}</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:48px 20px;background:#111116;color:#f3f1f8;font:16px/1.7 system-ui,sans-serif}.page{max-width:760px;margin:auto}.avatar{width:64px;height:64px;border-radius:18px;background:${escapeHtml(data.accent)};display:grid;place-items:center;color:#111;font-size:25px;font-weight:800}.eyebrow{color:${escapeHtml(data.accent)};font-size:11px;letter-spacing:.18em;margin-top:35px}h1{font-size:clamp(38px,8vw,64px);line-height:1.05;letter-spacing:-.06em;margin:10px 0}h2{font-size:13px;letter-spacing:.13em;text-transform:uppercase;color:${escapeHtml(data.accent)}}.headline{color:#aaa7b5}.rule{height:1px;background:#34323e;margin:35px 0}section{margin:30px 0}li,p{overflow-wrap:anywhere}footer{border-top:1px solid #34323e;padding-top:18px;color:#898594;font-size:10px;letter-spacing:.15em;margin-top:50px}
</style></head><body><main class="page"><div class="avatar">${escapeHtml((name[0] || "B").toUpperCase())}</div><p class="eyebrow">BIOGRAPHY / PROFILE</p><h1>${escapeHtml(name)}</h1><p class="headline">${escapeHtml(data.headline)}</p><div class="rule"></div><section><h2>Sobre</h2><p>${escapeHtml(data.about).replace(/\n/g, "<br>")}</p></section><section><h2>Projetos & experiências</h2><ul>${projectMarkup}</ul></section><section><h2>Interesses</h2><p>${escapeHtml(data.interests)}</p></section><footer>CRIADO COM BIOFORGE</footer></main></body></html>`;
}

document.querySelector("#export-button").addEventListener("click", () => {
  const html = buildExport(getData());
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "minha-biografia.html";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("Página HTML exportada. O arquivo é independente do BioForge.");
});

loadDraft();
updatePreview();
