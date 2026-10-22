const ICONS = {
  fiets: `<svg viewBox="0 0 70 42" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="28" r="10"/><circle cx="56" cy="28" r="10"/><path d="M14 28l12-15h18l12 15M26 13l8 15H14M34 28l10-15M44 13l-2-6h6M22 9h8"/></svg>`,
  ebike: `<svg viewBox="0 0 70 42" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="28" r="10"/><circle cx="56" cy="28" r="10"/><path d="M14 28l12-15h18l12 15M26 13l8 15H14M34 28l10-15M44 13l-2-6h6M22 9h8"/><path d="M33 15l-3 6h5l-3 6" stroke-width="2.4"/></svg>`,
  speed: `<svg viewBox="0 0 70 42" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="20" cy="28" r="10"/><circle cx="58" cy="28" r="10"/><path d="M20 28l11-15h16l11 15M31 13l7 15H20M38 28l9-15M47 13l-2-6h6M28 9h7"/><path d="M2 14h10M4 21h7M2 28h5" stroke-width="2.4"/></svg>`,
  bakfiets: `<svg viewBox="0 0 70 42" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="32" r="7"/><circle cx="58" cy="28" r="10"/><path d="M3 14h22l-3 12H6z"/><path d="M22 26l8 6h10l18-4M40 32l6-17h-6M46 15l3-7h5M36 11h8"/></svg>`,
  voet: `<svg viewBox="0 0 70 42" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="36" cy="6" r="4"/><path d="M35 12l-3 13-6 12M32 25l6 5 2 8M34 15l-7 7M34 15l7 5"/></svg>`,
  auto: `<svg viewBox="0 0 70 42" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 30H5v-8l4-3 9-2 7-8h20l9 8 7 2 2 3v8h-5M24 30h22"/><circle cx="17" cy="30" r="6"/><circle cx="53" cy="30" r="6"/><path d="M26 17h26M38 9v8"/></svg>`,
  longtail: `<svg viewBox="0 0 70 42" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="28" r="9"/><circle cx="59" cy="28" r="9"/><path d="M59 28L50 14H30M30 14l-8 14h14l14-14M30 14l-3-7M24 7h7M11 28l11-16M50 14h16M52 20v-6M62 20v-6"/><path d="M50 9h14" stroke-width="4"/></svg>`
};
const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

// De vragen staan in vragen.json, zodat ze aangepast en geroteerd kunnen worden zonder deze pagina te wijzigen.
let VEHICLES = {};
let SETTINGS = { modus: "vast", aantal: 10 };
let OUTROS = {};

async function loadQuestions() {
  const res = await fetch("vragen.json", { cache: "no-cache" });
  if (!res.ok) throw new Error("vragen.json: " + res.status);
  const data = await res.json();
  OUTROS = data.afsluiters || {};
  SETTINGS = { modus: data.modus === "willekeurig" ? "willekeurig" : "vast", aantal: data.aantal || 10 };
  for (const [id, v] of Object.entries(data.quizzen)) {
    VEHICLES[id] = {
      name: v.naam, sub: v.uitleg, tip: v.tip, mode: !v.fietstype,
      all: v.vragen.map(q => ({ actief: q.actief !== false, t: q.soort, q: q.vraag, a: q.antwoorden, c: q.juist, x: q.uitleg }))
    };
  }
}

function shuffled(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function pickQuestions(v) {
  if (SETTINGS.modus === "willekeurig") return shuffled(v.all).slice(0, SETTINGS.aantal);
  const active = v.all.filter(q => q.actief);
  return (active.length ? active : v.all).slice(0, SETTINGS.aantal);
}

const app = document.getElementById("app");
const backBtn = document.getElementById("backBtn");
let state = null;

function esc(s) { return String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

let screen = "home";

function vehicleCard(id, extra = "") {
  const v = VEHICLES[id] || MODES[id];
  return `
          <button class="vehicle ${extra}" data-id="${id}">
            <span class="ico" aria-hidden="true">${ICONS[id === "fietsen" ? "fiets" : id]}</span>
            <span class="meta"><span class="name">${esc(v.name)}</span><span class="sub">${esc(v.sub)}</span></span>
            <span class="go" aria-hidden="true">${ARROW}</span>
          </button>`;
}
const MODES = { fietsen: { name: "Met de fiets", sub: "Fiets, e-bike, speed pedelec, bakfiets of longtail" } };
const BIKES = ["fiets", "ebike", "speed", "bakfiets", "longtail"];

function renderHome() {
  state = null;
  screen = "home";
  backBtn.hidden = true;
  app.innerHTML = `
    <section class="screen">
      <div class="hero">
        <div class="eyebrow">Mobiliteitsactie</div>
        <h1>Hoe <span class="hl">verkeersfit</span> ben jij?</h1>
        <p class="lede">Hoe kom jij naar het werk? Kies hieronder en test in tien vragen hoe goed je de wegcode en de risico's onderweg kent.</p>
      </div>
      <div class="lane-rule" aria-hidden="true"></div>
      <p class="pick-label">Hoe kom jij naar het werk?</p>
      <div class="vehicles modes">
        ${vehicleCard("voet", "mode m-voet")}
        ${vehicleCard("fietsen", "mode m-fiets")}
        ${vehicleCard("auto", "mode m-auto")}
      </div>
      <p class="foot">Gebaseerd op de Belgische wegcode. Meer info op <a href="https://www.wegcode.be" target="_blank" rel="noopener">wegcode.be</a>.</p>
    </section>`;
  app.querySelectorAll(".vehicle").forEach(b => b.addEventListener("click", () => b.dataset.id === "fietsen" ? showBikes() : start(b.dataset.id)));
  renderInstall();
}

function renderBikes() {
  state = null;
  screen = "bikes";
  backBtn.hidden = false;
  app.innerHTML = `
    <section class="screen">
      <div class="hero">
        <div class="eyebrow">Met de fiets</div>
        <h1>Hoe <span class="hl">fietsfit</span> ben jij?</h1>
        <p class="lede">Kies waarmee je naar hier fietst en test in tien vragen hoe goed je de regels en trucjes voor jouw fiets kent.</p>
      </div>
      <div class="lane-rule" aria-hidden="true"></div>
      <p class="pick-label">Waarmee rijd jij?</p>
      <div class="vehicles">
        ${BIKES.map(id => vehicleCard(id)).join("")}
      </div>
      <p class="foot">Gebaseerd op de Belgische wegcode. Meer info op <a href="https://www.wegcode.be" target="_blank" rel="noopener">wegcode.be</a>.</p>
    </section>`;
  app.querySelectorAll(".vehicle").forEach(b => b.addEventListener("click", () => start(b.dataset.id)));
  renderInstall();
}

function showBikes() {
  try { history.replaceState(null, "", "#fietsen"); } catch (e) {}
  iosHint.hidden = true;
  renderBikes();
  window.scrollTo({ top: 0 });
}

function start(id) {
  state = { id, i: 0, score: 0, answers: [], qs: pickQuestions(VEHICLES[id]) };
  screen = "quiz";
  try { history.replaceState(null, "", "#" + id); } catch (e) {}
  backBtn.hidden = false;
  renderInstall();
  iosHint.hidden = true;
  renderQuestion();
  window.scrollTo({ top: 0 });
}

function renderQuestion() {
  const v = VEHICLES[state.id];
  const item = state.qs[state.i];
  const total = state.qs.length;
  // antwoorden in willekeurige volgorde, zodat het juiste antwoord niet altijd op dezelfde plek staat
  state.order = item.a.map((_, k) => k).sort(() => Math.random() - 0.5);
  app.innerHTML = `
    <section class="screen">
      <div class="qhead">
        <span class="ico" aria-hidden="true">${ICONS[state.id]}</span>
        <div><div class="t">${esc(v.name)}</div><div class="c">Vraag ${state.i + 1} van ${total}</div></div>
      </div>
      <div class="progress" aria-hidden="true">${state.qs.map((_, k) => `<span class="${k < state.i ? "done" : k === state.i ? "now" : ""}"></span>`).join("")}</div>
      <span class="tag ${item.t === "wegcode" || item.t === "veiligheid" ? item.t : "fiets"}">${item.t === "wegcode" ? "Wegcode" : item.t === "veiligheid" ? "Verkeersveiligheid" : "Jouw " + esc(v.name.toLowerCase())}</span>
      <h2 class="question">${esc(item.q)}</h2>
      <div class="answers">
        ${state.order.map((k, pos) => `<button class="answer" data-k="${k}"><span class="k">${"ABC"[pos]}</span><span>${esc(item.a[k])}</span></button>`).join("")}
      </div>
      <div id="after"></div>
    </section>`;
  app.querySelectorAll(".answer").forEach(b => b.addEventListener("click", () => choose(+b.dataset.k)));
}

function choose(k) {
  const v = VEHICLES[state.id];
  const item = state.qs[state.i];
  const ok = k === item.c;
  if (ok) state.score++;
  state.answers.push(ok);
  app.querySelectorAll(".answer").forEach(b => {
    const idx = +b.dataset.k;
    b.disabled = true;
    if (idx === item.c) b.classList.add("right");
    else if (idx === k) b.classList.add("wrong");
    else b.classList.add("dim");
  });
  const last = state.i === state.qs.length - 1;
  const after = document.getElementById("after");
  after.innerHTML = `
    <div class="explain" role="status"><strong>${ok ? "Juist!" : "Niet helemaal"}</strong><p>${esc(item.x)}</p></div>
    <button class="cta" id="next">${last ? "Bekijk je score" : "Volgende vraag"} ${ARROW}</button>`;
  const next = document.getElementById("next");
  next.addEventListener("click", () => { if (last) renderResult(); else { state.i++; renderQuestion(); } });
  next.focus({ preventScroll: true });
  after.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
}

function renderResult() {
  const v = VEHICLES[state.id];
  const total = state.qs.length, s = state.score;
  const bike = !v.mode;
  const verdict = s === total ? (bike ? "Fietsfit met glans" : "Verkeersfit met glans") : s >= total - 3 ? "Goed op weg" : (bike ? "Nog wat bijtrappen" : "Nog wat oefenen");
  app.innerHTML = `
    <section class="screen result">
      <div class="eyebrow">${esc(v.name)} · jouw score</div>
      <div class="score"><span class="n">${s}</span><span class="of">/ ${total}</span></div>
      <p class="verdict">${verdict}</p>
      <div class="lane-rule" aria-hidden="true"></div>
      <div class="tipbox"><div class="eyebrow">Tip voor onderweg</div><p>${esc(v.tip)}</p></div>
      ${outroHtml(state.id)}
      <div class="review">${state.qs.map((it, k) => `<div><span class="mark ${state.answers[k] ? "y" : "n"}">${state.answers[k] ? "✓" : "✕"}</span><span><b>${esc(it.q)}</b><br>${esc(it.a[it.c])}</span></div>`).join("")}</div>
      <button class="cta" id="again">${bike ? "Probeer een andere fiets" : "Kies een ander vervoermiddel"} ${ARROW}</button>
      <button class="cta alt" id="share">Kopieer link naar deze quiz ${ARROW}</button>
      <div class="copied" id="copied" role="status"></div>
    </section>`;
  window.scrollTo({ top: 0 });
  document.getElementById("again").addEventListener("click", bike ? showBikes : goHome);
  document.getElementById("share").addEventListener("click", () => {
    const url = location.href.split("#")[0] + "#" + state.id;
    const msg = document.getElementById("copied");
    navigator.clipboard.writeText(url).then(() => { msg.textContent = "Link gekopieerd."; }).catch(() => { msg.textContent = url; });
  });
}

function outroHtml(id) {
  const o = OUTROS[id === "voet" || id === "auto" ? id : "fiets"];
  if (!o) return "";
  return `<div class="outro"><div class="eyebrow">Veilig op weg in het donker</div><p>${esc(o.tekst)}</p><ul>${(o.tips || []).map(t => `<li>${esc(t)}</li>`).join("")}</ul></div>`;
}

function goHome() {
  try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  renderHome();
  window.scrollTo({ top: 0 });
}
backBtn.addEventListener("click", () => (screen === "quiz" && !VEHICLES[state.id].mode) ? showBikes() : goHome());

// Installeren als app
let installPrompt = null;
const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
// De installatieknop verschijnt alleen op smartphones en tablets, niet in een browser op de computer.
const isMobile = (navigator.userAgentData && navigator.userAgentData.mobile) || isIOS || /android|mobile/i.test(navigator.userAgent);
const installBtn = document.getElementById("installBtn");
const iosHint = document.getElementById("iosHint");
function renderInstall() {
  installBtn.hidden = standalone || !isMobile || state !== null || !(installPrompt || isIOS);
}
installBtn.addEventListener("click", async () => {
  if (installPrompt) {
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    renderInstall();
  } else {
    iosHint.hidden = !iosHint.hidden;
  }
});
document.getElementById("iosClose").addEventListener("click", () => { iosHint.hidden = true; });
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installPrompt = e; renderInstall(); });
window.addEventListener("appinstalled", () => { installPrompt = null; renderInstall(); });
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

const initial = (location.hash || "").slice(1);
app.innerHTML = `<p class="lede" style="padding-block: 40px">Vragen laden…</p>`;
loadQuestions()
  .then(() => { if (Object.prototype.hasOwnProperty.call(VEHICLES, initial)) start(initial); else if (initial === "fietsen") renderBikes(); else renderHome(); })
  .catch(() => { app.innerHTML = `<p class="lede" style="padding-block: 40px">De vragen konden niet geladen worden. Controleer je internetverbinding en vernieuw de pagina.</p>`; });
