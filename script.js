const PRODUCTS = [
  { id: 1, name: "Sencha Asamushi", cat: "Zielona", origin: "Shizuoka, Japonia", harvest: "2026-05", price: 54, caffeine: true, pop: 98, color: "#7FA36B", badge: "Bestseller", notes: "trawa, edamame, słodki finisz", brew: "70°C, 1 min" },
  { id: 2, name: "Gyokuro Okabe", cat: "Zielona", origin: "Shizuoka, Japonia", harvest: "2026-05", price: 79, caffeine: true, pop: 61, color: "#5E8C4A", notes: "umami, wodorosty, gęsta", brew: "55°C, 2 min" },
  { id: 3, name: "Darjeeling First Flush", cat: "Czarna", origin: "Darjeeling, Indie", harvest: "2026-03", price: 62, caffeine: true, pop: 84, color: "#B7652E", badge: "Nowy zbiór", notes: "muskat, kwiaty, lekka cierpkość", brew: "90°C, 3 min" },
  { id: 4, name: "Assam Halmari", cat: "Czarna", origin: "Assam, Indie", harvest: "2025-10", price: 36, caffeine: true, pop: 90, color: "#7B3A22", notes: "słód, kakao, z mlekiem lub bez", brew: "95°C, 4 min" },
  { id: 5, name: "Dong Ding Oolong", cat: "Oolong", origin: "Nantou, Tajwan", harvest: "2026-04", price: 68, caffeine: true, pop: 72, color: "#C08A3E", notes: "pieczony orzech, miód, kwiaty", brew: "90°C, 1 min" },
  { id: 6, name: "Alishan High Mountain", cat: "Oolong", origin: "Chiayi, Tajwan", harvest: "2026-04", price: 75, caffeine: true, pop: 55, color: "#9BAE5A", notes: "liliowe kwiaty, kremowa", brew: "90°C, 1 min" },
  { id: 7, name: "Mięta z Podkarpacia", cat: "Zioła", origin: "Krosno, Polska", harvest: "2026-07", price: 22, caffeine: false, pop: 88, color: "#3E9C7C", notes: "chłodząca, świeża", brew: "100°C, 5 min" },
  { id: 8, name: "Rumianek i melisa", cat: "Zioła", origin: "Lubelskie, Polska", harvest: "2026-06", price: 24, caffeine: false, pop: 76, color: "#D9B44A", badge: "Na wieczór", notes: "miód, jabłko, łagodna", brew: "100°C, 6 min" },
  { id: 9, name: "Rooibos z pomarańczą", cat: "Zioła", origin: "Cederberg, RPA", harvest: "2026-02", price: 28, caffeine: false, pop: 80, color: "#C4512F", notes: "karmel, skórka pomarańczy", brew: "100°C, 6 min" },
  { id: 10, name: "Matcha ceremonialna", cat: "Zielona", origin: "Uji, Japonia", harvest: "2026-05", price: 79, caffeine: true, pop: 93, color: "#6FA85A", badge: "Bestseller", notes: "słodka trawa, kremowa, bez goryczy", brew: "80°C, ubić 30 s" },
  { id: 11, name: "Lapsang Souchong", cat: "Czarna", origin: "Fujian, Chiny", harvest: "2025-09", price: 41, caffeine: true, pop: 40, color: "#4A2E24", notes: "dym z sosny, wędzona", brew: "95°C, 3 min" },
  { id: 12, name: "Biała Bai Mu Dan", cat: "Biała", origin: "Fujian, Chiny", harvest: "2026-04", price: 48, caffeine: true, pop: 58, color: "#C9B98E", notes: "brzoskwinia, siano, delikatna", brew: "80°C, 3 min" }
];
const SIZES = [{ g: 50, k: 1 }, { g: 100, k: 1.85 }, { g: 250, k: 4.2 }];
const FREE = 120, SHIP = { inpost: 12.99, kurier: 16.99, odbior: 0 };
const zl = n => n.toFixed(2).replace(".", ",") + " zł";
const $ = s => document.querySelector(s);
const months = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
const harvest = h => `${months[+h.slice(5) - 1]} ${h.slice(0, 4)}`;

/* ---------- cart (persisted) ---------- */
let cart = [];
try { cart = JSON.parse(localStorage.getItem("zielnik-cart")) || []; } catch { cart = []; }
const save = () => { try { localStorage.setItem("zielnik-cart", JSON.stringify(cart)); } catch {} };
const lineKey = (id, g) => `${id}-${g}`;
const unit = (p, g) => Math.round(p.price * SIZES.find(s => s.g === g).k * 100) / 100;
const subtotal = () => cart.reduce((s, l) => s + unit(PRODUCTS.find(p => p.id === l.id), l.g) * l.qty, 0);

function add(id, g = 50) {
  const k = lineKey(id, g), l = cart.find(x => lineKey(x.id, x.g) === k);
  l ? l.qty++ : cart.push({ id, g, qty: 1 });
  save(); renderCart();
  const c = $("#count"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
}

/* ---------- filters ---------- */
const cats = [...new Set(PRODUCTS.map(p => p.cat))];
$("#cats").innerHTML = cats.map(c => `<label class="cat"><input type="checkbox" value="${c}"> ${c}<span>${PRODUCTS.filter(p => p.cat === c).length}</span></label>`).join("");

function filtered() {
  const q = $("#q").value.trim().toLowerCase();
  const sel = [...document.querySelectorAll("#cats input:checked")].map(i => i.value);
  const max = +$("#max").value;
  const caf = document.querySelector("[name=caf]:checked").value;
  let list = PRODUCTS.filter(p =>
    (!sel.length || sel.includes(p.cat)) && p.price <= max &&
    (caf === "all" || (caf === "yes") === p.caffeine) &&
    (!q || (p.name + p.cat + p.origin + p.notes).toLowerCase().includes(q)));
  const s = $("#sort").value;
  list.sort(s === "asc" ? (a, b) => a.price - b.price : s === "desc" ? (a, b) => b.price - a.price : s === "new" ? (a, b) => b.harvest.localeCompare(a.harvest) : (a, b) => b.pop - a.pop);
  return list;
}
function renderGrid() {
  $("#max-out").textContent = `${$("#max").value} zł`;
  const list = filtered();
  const n = list.length;
  $("#found").textContent = n === 1 ? "1 herbata" : `${n} ${n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "herbaty" : "herbat"}`;
  $("#grid").innerHTML = n ? list.map(p => `
    <li class="card">
      <button class="tin" data-open="${p.id}" aria-label="Szczegóły: ${p.name}">${p.badge ? `<span class="badge">${p.badge}</span>` : ""}<span class="can" style="--c:${p.color}"><b>${p.name}</b></span></button>
      <h3>${p.name}</h3>
      <p class="meta">${p.cat} · ${p.origin}</p>
      <div class="row"><span class="price">od ${zl(p.price)}</span><button class="add" data-add="${p.id}">Do koszyka</button></div>
    </li>`).join("") : `<li class="none">Nie mamy herbaty spełniającej te kryteria. Zmień filtry albo <button class="link" type="button" onclick="document.getElementById('reset').click()">wyczyść je</button>.</li>`;
}
["#q", "#max", "#sort"].forEach(s => $(s).addEventListener("input", renderGrid));
document.querySelector(".filters").addEventListener("change", renderGrid);
$("#reset").addEventListener("click", () => {
  document.querySelectorAll("#cats input").forEach(i => (i.checked = false));
  $("#max").value = 80; document.querySelector("[name=caf][value=all]").checked = true; $("#q").value = ""; renderGrid();
});
$("#grid").addEventListener("click", e => {
  const a = e.target.closest("[data-add]"), o = e.target.closest("[data-open]");
  if (a) { add(+a.dataset.add); a.textContent = "Dodano ✓"; a.classList.add("ok"); setTimeout(() => { a.textContent = "Do koszyka"; a.classList.remove("ok"); }, 1200); }
  if (o) openProduct(+o.dataset.open);
});

/* ---------- product dialog ---------- */
function openProduct(id) {
  const p = PRODUCTS.find(x => x.id === id), d = $("#product");
  d.innerHTML = `<div class="p-wrap">
    <div class="tin"><span class="can" style="--c:${p.color}"><b>${p.name}</b></span></div>
    <div class="p-body">
      <button class="x p-close" aria-label="Zamknij">×</button>
      <h2 id="p-title">${p.name}</h2>
      <dl><dt>Pochodzenie</dt><dd>${p.origin}</dd><dt>Zbiór</dt><dd>${harvest(p.harvest)}</dd><dt>W smaku</dt><dd>${p.notes}</dd><dt>Parzenie</dt><dd>${p.brew}</dd><dt>Kofeina</dt><dd>${p.caffeine ? "tak" : "nie"}</dd></dl>
      <fieldset><legend>Opakowanie</legend><div class="sizes">${SIZES.map((s, i) => `<label><input type="radio" name="size" value="${s.g}" ${i ? "" : "checked"}><span>${s.g} g · ${zl(unit(p, s.g))}</span></label>`).join("")}</div></fieldset>
      <button class="btn" id="p-add">Dodaj do koszyka</button>
    </div></div>`;
  d.showModal();
  d.querySelector(".p-close").onclick = () => d.close();
  d.querySelector("#p-add").onclick = () => { add(p.id, +d.querySelector("[name=size]:checked").value); d.close(); openCart(); };
}
$("#product").addEventListener("click", e => { if (e.target.id === "product") e.target.close(); });

/* ---------- drawer ---------- */
const drawer = $("#drawer"), bg = $("#drawer-bg");
let lastFocus;
function openCart() { lastFocus = document.activeElement; drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); bg.hidden = false; $("#close-cart").focus(); }
function closeCart() { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); bg.hidden = true; lastFocus?.focus(); }
$("#open-cart").onclick = openCart; $("#close-cart").onclick = closeCart; bg.onclick = closeCart;
document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("open")) closeCart(); });

function renderCart() {
  const qty = cart.reduce((s, l) => s + l.qty, 0), sub = subtotal();
  $("#count").textContent = qty;
  const left = FREE - sub;
  $("#ship").innerHTML = `${left > 0 ? `Brakuje <b>${zl(left)}</b> do darmowej dostawy.` : `<b>Masz darmową dostawę.</b>`}<div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="${FREE}" aria-valuenow="${Math.min(FREE, sub).toFixed(0)}" aria-label="Postęp do darmowej dostawy"><i style="--w:${Math.min(100, sub / FREE * 100)}%"></i></div>`;
  $("#lines").innerHTML = cart.length ? cart.map(l => {
    const p = PRODUCTS.find(x => x.id === l.id);
    return `<li class="line"><span class="mini" style="--c:${p.color}"></span>
      <div><h3>${p.name}</h3><small>${l.g} g · ${zl(unit(p, l.g))}</small>
        <div class="stepper"><button data-d="-1" data-k="${lineKey(l.id, l.g)}" aria-label="Mniej">−</button><span>${l.qty}</span><button data-d="1" data-k="${lineKey(l.id, l.g)}" aria-label="Więcej">+</button><button class="rm" data-rm="${lineKey(l.id, l.g)}">Usuń</button></div></div>
      <strong class="price">${zl(unit(p, l.g) * l.qty)}</strong></li>`;
  }).join("") : `<li class="empty-cart">Koszyk jest pusty. Zacznij od bestsellera: Sencha Asamushi.</li>`;
  $("#drawer-foot").innerHTML = cart.length ? `<div class="tot"><span>Suma</span><span>${zl(sub)}</span></div><button class="btn" id="to-checkout">Przejdź do dostawy</button>` : "";
  const t = $("#to-checkout"); if (t) t.onclick = openCheckout;
}
$("#lines").addEventListener("click", e => {
  const b = e.target.closest("[data-k],[data-rm]"); if (!b) return;
  const k = b.dataset.k || b.dataset.rm, l = cart.find(x => lineKey(x.id, x.g) === k);
  if (b.dataset.rm) cart = cart.filter(x => x !== l); else { l.qty += +b.dataset.d; if (l.qty < 1) cart = cart.filter(x => x !== l); }
  save(); renderCart();
});

/* ---------- checkout ---------- */
const co = $("#checkout"), cf = $("#co-form");
function coSum() {
  const sub = subtotal(), m = cf.ship.value, ship = sub >= FREE ? 0 : SHIP[m];
  $("#locker-wrap").hidden = m !== "inpost";
  $("#co-sum").innerHTML = `<span>Produkty</span><span>${zl(sub)}</span><span>Dostawa</span><span>${ship ? zl(ship) : "0,00 zł"}</span><span class="t">Do zapłaty</span><span class="t">${zl(sub + ship)}</span>`;
  return sub + ship;
}
function openCheckout() { closeCart(); cf.hidden = false; $("#thanks").hidden = true; coSum(); co.showModal(); }
cf.addEventListener("change", coSum);
$("#co-close").onclick = () => co.close();
cf.addEventListener("submit", e => {
  e.preventDefault();
  const err = $("#co-err");
  cf.querySelectorAll("[aria-invalid]").forEach(i => i.removeAttribute("aria-invalid"));
  const locker = cf.locker;
  locker.required = cf.ship.value === "inpost";
  const bad = [...cf.querySelectorAll("input[required], input[pattern]")].filter(i => !i.closest("[hidden]") && !i.checkValidity());
  if (bad.length) { bad.forEach(i => i.setAttribute("aria-invalid", "true")); err.textContent = "Sprawdź imię, adres e-mail i kod paczkomatu (np. KRA01M)."; bad[0].focus(); return; }
  err.textContent = "";
  const total = coSum(), nr = "ZL-" + Math.floor(100000 + Math.random() * 899999);
  $("#thanks").innerHTML = `<h2>Dziękujemy za zamówienie</h2><p>Numer zamówienia: <b>${nr}</b>. Kwota: <b>${zl(total)}</b>. Potwierdzenie wyślemy na ${cf.email.value}. Paczka wyjdzie od nas jutro do 14:00.</p><button class="btn" type="button" id="close-thanks">Wróć do sklepu</button>`;
  cart = []; save(); renderCart();
  cf.hidden = true; $("#thanks").hidden = false; $("#thanks").focus();
  $("#close-thanks").onclick = () => co.close();
});

renderGrid(); renderCart();
