/* Mckenna's Baked Goods - "Loud Little Bakery"
   Live order box + playful niceties.
   Progressive enhancement: the form still posts natively without JS,
   and all content is visible with JS disabled. */
(function () {
  "use strict";

  document.documentElement.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return "$" + n.toFixed(2); };

  /* ---------- order state ---------- */
  var lines = new Map();      // id -> { name, qty, price, spec }
  var lineEls = new Map();
  var listEl = $("#boxItems");
  var emptyEl = $("#boxEmpty");
  var titleEl = $("#boxTitle");
  var hidden = $("#orderHidden");
  var totalEl = $("#boxTotal");
  var countEl = $("#boxCount");
  var boxCard = $(".box-card");
  var announceEl = $("#boxAnnounce");
  var barEl = $("#orderBar"), barCount = $("#orderBarCount"), barTotal = $("#orderBarTotal");
  var lastTotal = 0, boxOnScreen = false;
  function announce(msg) { if (announceEl) { announceEl.textContent = ""; announceEl.textContent = msg; } }
  function syncBar() { if (barEl) barEl.classList.toggle("is-shown", lines.size > 0 && !boxOnScreen); }
  function flashBox() { if (!boxCard || reduce) return; boxCard.classList.remove("arrive"); void boxCard.offsetWidth; boxCard.classList.add("arrive"); }
  function flyToBox(fromEl, label) {
    if (reduce || !fromEl) return;
    var target = $("#boxBtn"); if (!target) return;
    var a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
    var el = document.createElement("div"); el.className = "fly"; el.textContent = label;
    el.style.left = (a.left + a.width / 2) + "px"; el.style.top = (a.top + a.height / 2) + "px";
    el.style.transform = "translate(-50%,-50%)";
    document.body.appendChild(el);
    requestAnimationFrame(function () {
      var dx = (b.left + b.width / 2) - (a.left + a.width / 2);
      var dy = (b.top + b.height / 2) - (a.top + a.height / 2);
      el.style.transform = "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(.35)";
      el.style.opacity = "0";
    });
    setTimeout(function () { el.remove(); }, 580);
  }

  var DELIVERY_FEE = 10;
  function isDelivery() {
    var r = document.querySelector('input[name="fulfillment"]:checked');
    return !!r && /delivery/i.test(r.value);
  }
  function summary() {
    var out = [];
    lines.forEach(function (l) {
      var nm = (l.spec ? l.name + " (" + l.spec + ")" : l.name) + (l.gf ? " [gluten-free]" : "");
      out.push(nm + " - " + l.qty + " - " + money(l.price));
    });
    if (lines.size > 0 && isDelivery()) out.push("Local delivery - " + money(DELIVERY_FEE));
    return out.join("\n");
  }

  function updateMeta() {
    var n = lines.size, itemsTotal = 0;
    lines.forEach(function (l) { itemsTotal += l.price; });
    var deliv = (n > 0 && isDelivery()) ? DELIVERY_FEE : 0;
    var total = itemsTotal + deliv;
    if (emptyEl) emptyEl.hidden = n > 0;
    if (titleEl) titleEl.innerHTML = n > 0 ? "Looking<br>good!" : "Empty<br>for now";
    if (totalEl) {
      totalEl.textContent = money(total);
      if (n > 0 && !reduce) { totalEl.classList.remove("bump"); void totalEl.offsetWidth; totalEl.classList.add("bump"); }
    }
    var totalField = $("#totalField"); if (totalField) totalField.value = money(total);
    var delivNote = $("#boxDeliv"); if (delivNote) delivNote.hidden = !deliv;
    if (hidden) hidden.value = summary();
    lastTotal = total;
    if (boxCard) boxCard.classList.toggle("has-items", n > 0);
    if (countEl) {
      countEl.textContent = String(n);
      if (n > 0 && !reduce) { countEl.classList.remove("bump"); void countEl.offsetWidth; countEl.classList.add("bump"); }
    }
    if (barCount) barCount.textContent = String(n);
    if (barTotal) barTotal.textContent = money(total);
    syncBar();
  }

  function makeLi(id, l) {
    var li = document.createElement("li");
    if (!reduce) li.className = "new";
    var name = document.createElement("span");
    name.className = "bi-name";
    name.textContent = l.name;
    if (l.spec) { var s = document.createElement("small"); s.textContent = l.spec; name.appendChild(s); }
    var gf = document.createElement("button");
    gf.type = "button"; gf.className = "bi-gf";
    gf.setAttribute("aria-pressed", l.gf ? "true" : "false");
    gf.textContent = (l.gf ? "✓ " : "+ ") + "gluten-free";
    gf.setAttribute("aria-label", (l.gf ? "Remove gluten-free from " : "Make gluten-free: ") + l.name + ", " + l.qty);
    gf.addEventListener("click", function () {
      var cur = lines.get(id); if (!cur) return;
      cur.gf = !cur.gf;
      gf.setAttribute("aria-pressed", cur.gf ? "true" : "false");
      gf.textContent = (cur.gf ? "✓ " : "+ ") + "gluten-free";
      updateMeta();
      announce(cur.name + (cur.gf ? " set to gluten-free." : " no longer gluten-free."));
    });
    name.appendChild(gf);
    var qty = document.createElement("span"); qty.className = "bi-qty"; qty.textContent = l.qty;
    var pr = document.createElement("span"); pr.className = "bi-price"; pr.textContent = money(l.price);
    var rm = document.createElement("button");
    rm.type = "button"; rm.className = "bi-rm"; rm.setAttribute("aria-label", "Remove " + l.name);
    rm.innerHTML = '<svg class="ic"><use href="#i-x"></use></svg>';
    rm.addEventListener("click", function () { removeLine(id, true); });
    li.appendChild(name); li.appendChild(qty); li.appendChild(pr); li.appendChild(rm);
    return li;
  }

  function addLine(id, l) {
    var existed = lines.has(id);
    if (existed) {
      lines.set(id, l);
      var old = lineEls.get(id);
      if (old) { var fresh = makeLi(id, l); listEl.replaceChild(fresh, old); lineEls.set(id, fresh); }
    } else {
      lines.set(id, l);
      var li = makeLi(id, l);
      listEl.appendChild(li);
      lineEls.set(id, li);
    }
    updateMeta();
    announce((existed ? "Updated " : "Added ") + l.name + ", " + l.qty + ". " + lines.size + " in your box, " + money(lastTotal) + ".");
  }

  function removeLine(id, fromUi) {
    var removed = lines.get(id);
    var li = lineEls.get(id), focusTarget = null;
    if (fromUi && li) {
      var btns = $$(".bi-rm", listEl);
      var i = btns.indexOf(li.querySelector(".bi-rm"));
      focusTarget = btns[i + 1] || btns[i - 1] || $("#f-name");
    }
    lines.delete(id);
    if (li) { li.remove(); lineEls.delete(id); }
    var b = $$(".add").filter(function (x) { return (x.dataset.flavor + "|" + x.dataset.qty) === id; })[0];
    if (b) b.setAttribute("aria-pressed", "false");
    if (id === "cake") resetCake();
    updateMeta();
    announce(lines.size ? "Removed " + (removed ? removed.name : "item") + ". " + lines.size + " in your box, " + money(lastTotal) + "." : "Your box is empty.");
    if (focusTarget) focusTarget.focus();
  }

  /* ---------- muffins ---------- */
  $$(".add").forEach(function (btn) {
    btn.setAttribute("aria-label", "Add " + btn.dataset.qty + " " + btn.dataset.flavor + ", " + money(parseFloat(btn.dataset.price)));
    btn.addEventListener("click", function () {
      var id = btn.dataset.flavor + "|" + btn.dataset.qty;
      var on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!on));
      if (on) removeLine(id);
      else {
        var price = parseFloat(btn.dataset.price);
        addLine(id, { name: btn.dataset.flavor, qty: btn.dataset.qty, price: price });
        flyToBox(btn, "+" + money(price));
      }
    });
  });

  /* ---------- build-a-cake ---------- */
  var cake = { base: null, filling: null, frosting: null };
  var cakePreview = $("#cakePreview");
  var cakeAdd = $("#cakeAdd");
  function complete() { return cake.base && cake.filling && cake.frosting; }
  function cakeSpec() { return cake.base + " · " + cake.filling + " · " + cake.frosting; }
  function resetCake() {
    cake.base = cake.filling = cake.frosting = null;
    $$(".chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
    refreshCake();
  }
  function refreshCake() {
    if (cakeAdd) {
      cakeAdd.disabled = !complete();
      cakeAdd.firstChild.textContent = lines.has("cake") ? "Update cake " : "Add this cake ";
    }
    if (!cakePreview) return;
    if (complete()) { cakePreview.textContent = cakeSpec(); cakePreview.classList.add("ready"); }
    else {
      var have = [cake.base, cake.filling, cake.frosting].filter(Boolean);
      cakePreview.textContent = have.length ? have.join(" · ") + " …" : "Pick a base, filling, and frosting.";
      cakePreview.classList.remove("ready");
    }
  }
  function pushCake() { var p = lines.get("cake"); addLine("cake", { name: '6" Cake', qty: "1", price: 60, spec: cakeSpec(), gf: p ? p.gf : false }); }
  var CAKE_CHEERS = ["Mmm, great choice.", "Ooh, excellent taste.", "That's going to be gorgeous.", "Yes, chef.", "Oh, she's a beauty."];
  function cakeCheer() {
    if (!cakePreview) return;
    cakePreview.textContent = CAKE_CHEERS[Math.floor(Math.random() * CAKE_CHEERS.length)];
    cakePreview.classList.add("ready");
    clearTimeout(cakePreview._cheer);
    cakePreview._cheer = setTimeout(refreshCake, 2200);
  }

  $$(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var g = chip.dataset.group, on = chip.getAttribute("aria-pressed") === "true";
      $$('.chip[data-group="' + g + '"]').forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
      cake[g] = on ? null : chip.dataset.val;
      if (!on) chip.setAttribute("aria-pressed", "true");
      refreshCake();
      if (lines.has("cake") && complete()) pushCake();
    });
  });
  if (cakeAdd) cakeAdd.addEventListener("click", function () {
    if (complete()) { pushCake(); refreshCake(); flyToBox(cakeAdd, "+$60"); cakeCheer(); }
  });

  /* ---------- nav scroll-spy ---------- */
  var navLinks = $$(".nav-links a");
  var map = {};
  navLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
  var secs = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if (secs.length && "IntersectionObserver" in window) {
    var state = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { state[e.target.id] = e.isIntersecting; });
      var mid = window.innerHeight / 2, best = null, bd = Infinity;
      secs.forEach(function (s) {
        if (state[s.id]) {
          var r = s.getBoundingClientRect();
          var dist = Math.abs((r.top + r.bottom) / 2 - mid);
          if (dist < bd) { bd = dist; best = s.id; }
        }
      });
      navLinks.forEach(function (a) {
        var on = map[best] === a;
        a.classList.toggle("active", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    }, { rootMargin: "-20% 0px -45% 0px", threshold: 0 });
    secs.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- order bar + CTA flash + min date ---------- */
  if (barEl && "IntersectionObserver" in window) {
    var orderSec = $("#order");
    if (orderSec) new IntersectionObserver(function (es) { boxOnScreen = es[0].isIntersecting; syncBar(); }, { rootMargin: "0px 0px -25% 0px" }).observe(orderSec);
  }
  $$('a[href="#order"]').forEach(function (a) { a.addEventListener("click", flashBox); });
  var dateField = $("#f-date");
  if (dateField) { var dmin = new Date(); dmin.setDate(dmin.getDate() + 2); dateField.min = dmin.toISOString().slice(0, 10); }

  /* ---------- scroll reveal ---------- */
  if (!reduce && "IntersectionObserver" in window) {
    var solo = [".hero-inner", ".bakes-main", ".box-card", ".gal-head", ".story-photo", ".story-copy", ".how-head", ".foot-cta"];
    solo.forEach(function (sel) { var el = $(sel); if (el) el.classList.add("reveal"); });
    $$(".collage .ph").forEach(function (el, i) { el.classList.add("reveal"); el.style.transitionDelay = (i % 5) * 70 + "ms"; });
    $$(".steps .step").forEach(function (el, i) { el.classList.add("reveal"); el.style.transitionDelay = i * 80 + "ms"; });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0.05 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
    // safety net: never leave content hidden if the observer misfires
    var revealAll = function () { $$(".reveal").forEach(function (el) { el.classList.add("is-in"); }); };
    setTimeout(revealAll, 1200);
    window.addEventListener("load", revealAll);
  }

  /* ---------- gracefully hide any missing photo ---------- */
  $$("img").forEach(function (img) {
    var fail = function () { var fig = img.closest("figure, li"); if (fig) fig.style.visibility = "hidden"; else img.style.visibility = "hidden"; };
    img.addEventListener("error", fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  /* ---------- pickup / delivery (recalc total when it changes) ---------- */
  $$('input[name="fulfillment"]').forEach(function (r) { r.addEventListener("change", updateMeta); });

  /* ---------- form submit (Formsubmit AJAX) ---------- */
  var form = $("#orderForm");
  if (form) {
    var status = $("#formStatus");
    var submitBtn = form.querySelector('button[type="submit"]');
    var ENDPOINT = "https://formsubmit.co/ajax/mckennasbakedgoods@gmail.com";
    var done = function () {
      form.innerHTML = '<div class="box-done"><h3 tabindex="-1">Order sent!</h3><p>Thank you! I\'ll get back to you soon to confirm the details and the total.</p></div>';
      var h = form.querySelector("h3"); if (h) h.focus();
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector(".hp") && form.querySelector(".hp").value) { done(); return; }
      if (hidden) hidden.value = summary();
      var data = {};
      new FormData(form).forEach(function (v, k) { if (k !== "_honey") data[k] = v; });
      submitBtn.setAttribute("aria-busy", "true");
      if (status) { status.textContent = ""; status.className = "box-status"; }
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (res.ok && String(body.success) === "true") done();
          else throw new Error("send-failed");
        });
      }).catch(function () {
        submitBtn.removeAttribute("aria-busy");
        if (status) { status.textContent = "That didn't send. Please email mckennasbakedgoods@gmail.com and I'll get right back to you."; status.className = "box-status is-err"; }
      });
    });
  }

  var year = $("#year"); if (year) year.textContent = String(new Date().getFullYear());
  updateMeta();
})();
