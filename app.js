{
const CFG = window.CONFIG || {};
const ORDER = ["Technical","Rondo","Possession Game","Position Game","Situation Game","Game","Finishing"];
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const fold = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const grid = $("grid"), chips = $("chips"), q = $("q"), lb = $("lb");
let EX = [], cat = "";

if (CFG.club) { $("clubName").textContent = CFG.club; $("footClub").textContent = CFG.club; }

// CSV parser that handles quotes, commas and line breaks inside cells.
function parseCSV(text) {
  const rows = []; let row = [], cell = "", i = 0, inQ = false;
  while (i < text.length) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else inQ = false; }
      else cell += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
    i++;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function toExercises(rows) {
  const head = rows.shift().map(h => fold(h.trim()));
  const col = name => head.findIndex(h => h.startsWith(name));
  const col2 = (a, b) => { const k = col(a); return k >= 0 ? k : col(b); };
  const c = { name: col2("ejercicio", "exercise"), cat: col2("categoria", "category"), img: col2("imagen", "image"), desc: col2("descripcion", "description"), vid: col("video"), vis: col("visible") };
  return rows.map((r, i) => ({
    i,
    name: (r[c.name] || "").trim(),
    cat: (r[c.cat] || "").trim() || "Other",
    img: (r[c.img] || "").trim(),
    desc: (r[c.desc] || "").trim(),
    vid: (r[c.vid] || "").trim(),
    visible: c.vis < 0 || fold((r[c.vis] || "yes").trim()) !== "no"
  })).filter(e => e.name && e.visible);
}

const imgSrc = e => !e.img ? "" : /^https:\/\//i.test(e.img) ? e.img : encodeURI(e.img);

// Turns a YouTube or Google Drive link into an embeddable player.
function embed(url) {
  if (!/^https:\/\//i.test(url)) return null;
  let m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  if (m) return { type: "iframe", src: "https://www.youtube-nocookie.com/embed/" + m[1] };
  m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/i);
  if (m) return { type: "iframe", src: "https://drive.google.com/file/d/" + m[1] + "/preview" };
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return { type: "video", src: url };
  return { type: "link", src: url };
}

function cats() {
  const present = [...new Set(EX.map(e => e.cat))];
  return ORDER.filter(c => present.includes(c)).concat(present.filter(c => !ORDER.includes(c)));
}

function renderChips() {
  const counts = {}; EX.forEach(e => counts[e.cat] = (counts[e.cat] || 0) + 1);
  chips.innerHTML = [["", "All", EX.length]].concat(cats().map(c => [c, c, counts[c]]))
    .map(([v, l, n]) => `<button type="button" class="chip" data-cat="${esc(v)}" aria-pressed="${v === cat}">${esc(l)}<small>${n}</small></button>`).join("");
}

function render() {
  const t = fold(q.value.trim());
  const list = EX.filter(e => (!cat || e.cat === cat) && (!t || fold(e.name + " " + e.cat + " " + e.desc).includes(t)));
  $("count").textContent = list.length + (list.length === 1 ? " exercise" : " exercises");
  $("empty").hidden = list.length > 0;
  $("empty").textContent = "No exercises match your search.";
  grid.innerHTML = list.map(e => `<article class="card">
    <button type="button" class="thumb" data-view="${e.i}" aria-label="View ${esc(e.name)}">${imgSrc(e) ? `<img src="${esc(imgSrc(e))}" alt="${esc(e.name)}" loading="lazy">` : ""}</button>
    <div class="info"><h3 class="ttl">${esc(e.name)}</h3>
      <div class="tags"><span class="cat">${esc(e.cat)}</span>${e.vid ? '<span class="badge">▶ Video</span>' : ""}</div>
      <div class="acts"><button type="button" class="btn ghost" data-view="${e.i}">View</button>${imgSrc(e) ? `<a class="btn" href="${esc(imgSrc(e))}" download="${esc(e.img.split("/").pop())}">Download</a>` : ""}</div>
    </div></article>`).join("");
}

function openLb(e) {
  $("lbTtl").textContent = e.name; $("lbCat").textContent = e.cat;
  const src = imgSrc(e);
  $("lbImg").src = src; $("lbImg").alt = e.name; $("lbImg").hidden = !src;
  const dl = $("lbDl"); dl.hidden = !src; dl.href = src; dl.setAttribute("download", e.img.split("/").pop());
  $("lbDesc").innerHTML = e.desc ? `<p class="desc">${esc(e.desc)}</p>` : `<p class="muted">No description yet for this exercise.</p>`;
  const v = e.vid ? embed(e.vid) : null;
  let h = `<p class="muted">No video yet for this exercise.</p>`;
  if (v && v.type === "iframe") h = `<div class="video"><iframe src="${esc(v.src)}" title="Video: ${esc(e.name)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div><p class="vlink"><a href="${esc(e.vid)}" target="_blank" rel="noopener">Open video in a new tab ↗</a></p>`;
  else if (v && v.type === "video") h = `<div class="video"><video controls preload="metadata" playsinline src="${esc(v.src)}"></video></div>`;
  else if (v) h = `<a class="btn" href="${esc(v.src)}" target="_blank" rel="noopener">Watch video ↗</a>`;
  $("lbVid").innerHTML = h;
  lb.classList.add("open"); lb.scrollTop = 0; document.body.style.overflow = "hidden"; $("lbClose").focus();
  history.replaceState(null, "", "#" + encodeURIComponent(e.img.replace(/\.[a-z]+$/i, "") || e.i));
}
function closeLb() {
  lb.classList.remove("open"); $("lbVid").innerHTML = ""; document.body.style.overflow = "";
  history.replaceState(null, "", location.pathname + location.search);
}

chips.addEventListener("click", ev => { const b = ev.target.closest(".chip"); if (!b) return; cat = b.dataset.cat; renderChips(); render(); });
q.addEventListener("input", render);
grid.addEventListener("click", ev => { const v = ev.target.closest("[data-view]"); if (v) openLb(EX[+v.dataset.view]); });
$("lbClose").addEventListener("click", closeLb);
lb.addEventListener("click", ev => { if (ev.target === lb) closeLb(); });
document.addEventListener("keydown", ev => { if (ev.key === "Escape" && lb.classList.contains("open")) closeLb(); });

function load() {
  const url = "https://docs.google.com/spreadsheets/d/" + encodeURIComponent(CFG.sheetId) +
    "/gviz/tq?tqx=out:csv&sheet=" + encodeURIComponent(CFG.sheetName || "Ejercicios") + "&t=" + Date.now();
  fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); }).then(text => {
    if (/^\s*</.test(text)) throw new Error("private");
    EX = toExercises(parseCSV(text));
    EX.forEach((e, i) => e.i = i);
    $("nEx").textContent = EX.length; $("nCat").textContent = cats().length; $("nVid").textContent = EX.filter(e => e.vid).length;
    renderChips(); render();
    const h = decodeURIComponent(location.hash.slice(1));
    const hit = h && EX.find(e => e.img.replace(/\.[a-z]+$/i, "") === h);
    if (hit) openLb(hit);
  }).catch(() => {
    $("count").textContent = "";
    $("empty").hidden = false;
    $("empty").textContent = "Couldn't load the library. Check your connection and reload the page.";
  });
}
load();
}
