/* Mckenna's Baked Goods - "The Recipe Card"
   The running order ticket is the spine. Progressive enhancement:
   the page is fully readable and orderable without this file. */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ===== order state ===== */
  const lines = new Map(); // id -> label
  const ticket = $("#ticket");
  const ticketLines = $("#ticketLines");
  const ticketCount = $("#ticketCount");
  const orderField = $("#f-order");
  let userEditedOrder = false;

  const setOpen = (open) => {
    if (!ticket) return;
    ticket.classList.toggle("open", open);
    const t = $("#ticketToggle");
    if (t) t.setAttribute("aria-expanded", String(open));
  };

  const syncForm = () => {
    if (!orderField || userEditedOrder) return;
    orderField.value = Array.from(lines.values()).join("\n");
  };

  const render = (writingId) => {
    if (!ticketLines) return;
    ticketLines.innerHTML = "";
    lines.forEach((label, id) => {
      const li = document.createElement("li");
      if (id === writingId && !reduce) li.className = "writing";
      const span = document.createElement("span");
      span.textContent = label;
      const rm = document.createElement("button");
      rm.type = "button";
      rm.setAttribute("aria-label", "Remove " + label);
      rm.textContent = "✕";
      rm.addEventListener("click", () => removeLine(id));
      li.append(span, rm);
      ticketLines.appendChild(li);
    });
    const n = lines.size;
    ticket.setAttribute("data-empty", n === 0 ? "true" : "false");
    if (ticketCount) ticketCount.textContent = n === 0 ? "start your order ✎" : n + (n === 1 ? " thing ✎" : " things ✎");
    if (n === 0) setOpen(false); else setOpen(true);
    syncForm();
  };

  const addLine = (id, label) => { lines.set(id, label); render(id); };
  const removeLine = (id) => {
    lines.delete(id);
    // reset any controls tied to this id
    const btn = $$('.add').find((b) => (b.dataset.flavor + "|" + b.dataset.qty) === id);
    if (btn) btn.setAttribute("aria-pressed", "false");
    if (id === "cake") clearCake();
    render();
  };

  /* ===== muffin add buttons ===== */
  $$(".add").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.flavor + "|" + btn.dataset.qty;
      const on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!on));
      if (on) removeLine(id);
      else addLine(id, btn.dataset.qty + " " + btn.dataset.flavor);
    });
  });

  /* ===== build-your-own cake ===== */
  const cake = { base: null, filling: null, frosting: null };
  const cakePreview = $("#cakePreview");
  const clearCake = () => {
    cake.base = cake.filling = cake.frosting = null;
    $$(".chip").forEach((c) => c.setAttribute("aria-checked", "false"));
    if (cakePreview) cakePreview.textContent = "pick a base, a filling, and a frosting";
  };
  const cakeLabel = () => {
    const parts = [];
    if (cake.base) parts.push(cake.base);
    if (cake.filling) parts.push(cake.filling + " filling");
    if (cake.frosting) parts.push(cake.frosting + " frosting");
    return parts.length ? "6″ cake: " + parts.join(", ") : "";
  };
  $$(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const group = chip.dataset.group;
      $$(`.chip[data-group="${group}"]`).forEach((c) => c.setAttribute("aria-checked", "false"));
      chip.setAttribute("aria-checked", "true");
      cake[group] = chip.dataset.val;
      const label = cakeLabel();
      if (cakePreview) cakePreview.textContent = label || "pick a base, a filling, and a frosting";
      if (label) addLine("cake", label);
    });
  });
  // cakeLabel uses an em dash glyph internally for the ticket; keep visible copy clean.

  /* ===== ticket toggle ===== */
  const tToggle = $("#ticketToggle");
  if (tToggle) tToggle.addEventListener("click", () => {
    if (lines.size === 0) return;
    setOpen(!ticket.classList.contains("open"));
  });

  /* ===== rail scroll-spy ===== */
  const tabs = $$(".rail-tab");
  const sections = ["home", "bakes", "cakes", "gallery", "mckenna", "order"]
    .map((id) => document.getElementById(id)).filter(Boolean);
  if (tabs.length && sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === e.target.id));
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    sections.forEach((s) => spy.observe(s));
  }

  /* ===== settle reveal ===== */
  const settlers = $$(".settle");
  if (settlers.length && "IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    settlers.forEach((el) => io.observe(el));
  } else {
    settlers.forEach((el) => el.classList.add("in"));
  }

  /* ===== missing-photo fallback ===== */
  $$("img").forEach((img) => {
    const fail = () => { img.style.visibility = "hidden"; const h = img.closest("figure, .card"); if (h) h.style.minHeight = "120px"; };
    img.addEventListener("error", fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  /* ===== order form ===== */
  const form = $(".slip-form");
  if (form) {
    if (orderField) orderField.addEventListener("input", () => { userEditedOrder = true; });
    const status = $("#formStatus");
    const submitBtn = form.querySelector('button[type="submit"]');
    const ENDPOINT = "https://formsubmit.co/ajax/mckennasbakedgoods@gmail.com";
    const show = (msg, ok) => { if (!status) return; status.textContent = msg; status.className = "form-status " + (ok ? "is-ok" : "is-err"); status.hidden = false; };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.querySelector(".hp")?.value) { form.innerHTML = '<div class="order-done"><h3>Thank you!</h3><p>Your order is in.</p></div>'; return; }
      const data = {};
      new FormData(form).forEach((v, k) => { if (k !== "_honey") data[k] = v; });
      submitBtn.setAttribute("aria-busy", "true");
      if (status) status.hidden = true;
      try {
        const res = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        const body = await res.json().catch(() => ({}));
        if (res.ok && String(body.success) === "true") {
          form.innerHTML = '<div class="order-done"><h3>Order’s in. Thank you!</h3><p>Mckenna will get back to you soon to confirm the details and payment. Talk soon. 💛</p></div>';
        } else {
          submitBtn.removeAttribute("aria-busy");
          show("Hmm, that didn’t send. Please email mckennasbakedgoods@gmail.com or DM @mckennas.baked.goods and I’ll get right back to you.", false);
        }
      } catch (err) {
        submitBtn.removeAttribute("aria-busy");
        show("Looks like your connection dropped. Please try again, or email mckennasbakedgoods@gmail.com.", false);
      }
    });
  }

  /* ===== footer year ===== */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
