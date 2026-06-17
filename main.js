/* Mckenna's Baked Goods - order logic + niceties.
   Progressive enhancement: the form still posts natively without this file. */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const lines = new Map();      // id -> label
  const lineEls = new Map();    // id -> <li>
  const listEl = $("#ticketLines");
  const emptyEl = $("#orderEmpty");
  const hidden = $("#orderHidden");
  const badges = [$("#orderBadge"), $("#orderBadgeFab")].filter(Boolean);

  const summary = () => Array.from(lines.values()).join("\n");

  const updateMeta = () => {
    const n = lines.size;
    if (emptyEl) emptyEl.hidden = n > 0;
    if (hidden) hidden.value = summary();
    badges.forEach((b) => {
      b.textContent = String(n);
      if (n > 0 && !reduce) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
    });
  };

  const makeLi = (id, label) => {
    const li = document.createElement("li");
    if (!reduce) li.className = "new";
    const span = document.createElement("span"); span.className = "ol-label"; span.textContent = label;
    const rm = document.createElement("button");
    rm.type = "button"; rm.className = "ol-rm"; rm.setAttribute("aria-label", "Remove " + label);
    rm.innerHTML = '<svg class="ic"><use href="#i-x"/></svg>';
    rm.addEventListener("click", () => removeLine(id, true));
    li.append(span, rm);
    return li;
  };

  const addLine = (id, label) => {
    if (lines.has(id)) { lines.set(id, label); const li = lineEls.get(id); if (li) li.querySelector(".ol-label").textContent = label; }
    else { lines.set(id, label); const li = makeLi(id, label); listEl.appendChild(li); lineEls.set(id, li); }
    updateMeta();
  };

  const removeLine = (id, fromUi) => {
    const li = lineEls.get(id);
    let focusTarget = null;
    if (fromUi && li) {
      const btns = $$(".ol-rm", listEl);
      const i = btns.indexOf(li.querySelector(".ol-rm"));
      focusTarget = btns[i + 1] || btns[i - 1] || $("#orderBtn");
    }
    lines.delete(id);
    if (li) { li.remove(); lineEls.delete(id); }
    const btn = $$(".add").find((b) => (b.dataset.flavor + "|" + b.dataset.qty) === id);
    if (btn) btn.setAttribute("aria-pressed", "false");
    if (id === "cake") resetCake();
    updateMeta();
    if (focusTarget) focusTarget.focus();
  };

  /* muffins */
  $$(".add").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.flavor + "|" + btn.dataset.qty;
      const on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!on));
      if (on) removeLine(id);
      else addLine(id, btn.dataset.qty + " " + btn.dataset.flavor);
    });
  });

  /* cake */
  const cake = { base: null, filling: null, frosting: null };
  const cakePreview = $("#cakePreview");
  const cakeAdd = $("#cakeAdd");
  const complete = () => cake.base && cake.filling && cake.frosting;
  const cakeLabel = () => '6" cake: ' + cake.base + ", " + cake.filling + " filling, " + cake.frosting + " frosting";
  const resetCake = () => {
    cake.base = cake.filling = cake.frosting = null;
    $$(".chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
    refreshCakeUi();
  };
  const refreshCakeUi = () => {
    if (cakeAdd) { cakeAdd.disabled = !complete(); cakeAdd.firstChild.textContent = lines.has("cake") ? "Update cake " : "Add this cake "; }
    if (!cakePreview) return;
    if (complete()) { cakePreview.textContent = cakeLabel().replace('6" cake: ', ""); cakePreview.classList.add("ready"); }
    else {
      const have = [cake.base, cake.filling && cake.filling + " filling", cake.frosting && cake.frosting + " frosting"].filter(Boolean);
      cakePreview.textContent = have.length ? have.join(", ") + " (keep going)" : "Pick a base, filling, and frosting.";
      cakePreview.classList.remove("ready");
    }
  };
  $$(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const g = chip.dataset.group;
      const on = chip.getAttribute("aria-pressed") === "true";
      $$(`.chip[data-group="${g}"]`).forEach((c) => c.setAttribute("aria-pressed", "false"));
      cake[g] = on ? null : chip.dataset.val;
      if (!on) chip.setAttribute("aria-pressed", "true");
      refreshCakeUi();
      if (lines.has("cake") && complete()) addLine("cake", cakeLabel());
    });
  });
  if (cakeAdd) cakeAdd.addEventListener("click", () => { if (complete()) { addLine("cake", cakeLabel()); refreshCakeUi(); } });

  /* nav scroll-spy */
  const links = $$(".nav-links a");
  const map = {}; links.forEach((a) => { map[a.getAttribute("href").slice(1)] = a; });
  const secs = Object.keys(map).map((id) => document.getElementById(id)).filter(Boolean);
  if (secs.length && "IntersectionObserver" in window) {
    const state = {};
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => { state[e.target.id] = e.isIntersecting; });
      const mid = window.innerHeight / 2; let best = null, bestD = Infinity;
      secs.forEach((s) => { if (state[s.id]) { const r = s.getBoundingClientRect(); const d = Math.abs((r.top + r.bottom) / 2 - mid); if (d < bestD) { bestD = d; best = s.id; } } });
      links.forEach((a) => { const on = map[best] === a; a.classList.toggle("active", on); if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    }, { rootMargin: "-20% 0px -40% 0px", threshold: 0 });
    secs.forEach((s) => spy.observe(s));
  }

  /* missing photos: hide the whole figure */
  $$("img").forEach((img) => {
    const fail = () => { const fig = img.closest("figure"); if (fig) fig.style.display = "none"; else img.style.visibility = "hidden"; };
    img.addEventListener("error", fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  /* order form */
  const form = $(".order-form");
  if (form) {
    const status = $("#formStatus");
    const submitBtn = form.querySelector('button[type="submit"]');
    const ENDPOINT = "https://formsubmit.co/ajax/mckennasbakedgoods@gmail.com";
    const show = (msg, ok) => { if (status) { status.textContent = msg; status.className = "form-status " + (ok ? "is-ok" : "is-err"); } };
    const done = () => {
      form.innerHTML = '<div class="order-done"><h3 tabindex="-1">Order sent, thank you!</h3><p>I\'ll get back to you soon to confirm the details and payment.</p></div>';
      form.querySelector("h3").focus();
    };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.querySelector(".hp")?.value) { done(); return; }
      if (hidden) hidden.value = summary();
      const data = {}; new FormData(form).forEach((v, k) => { if (k !== "_honey") data[k] = v; });
      submitBtn.setAttribute("aria-busy", "true"); show("", true); status.className = "form-status";
      try {
        const res = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        const body = await res.json().catch(() => ({}));
        if (res.ok && String(body.success) === "true") done();
        else { submitBtn.removeAttribute("aria-busy"); show("That didn't send. Please email mckennasbakedgoods@gmail.com or DM @mckennas.baked.goods and I'll get right back to you.", false); }
      } catch (err) {
        submitBtn.removeAttribute("aria-busy"); show("Your connection seems to have dropped. Please try again, or email mckennasbakedgoods@gmail.com.", false);
      }
    });
  }

  const year = $("#year"); if (year) year.textContent = String(new Date().getFullYear());
  updateMeta();
})();
