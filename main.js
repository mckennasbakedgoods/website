/* Mckenna's Baked Goods — interactions
   Progressive enhancement: the page is fully usable without this file. */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Floating nav: solidify after scrolling ---------- */
  const nav = document.querySelector(".nav");
  if (nav && "IntersectionObserver" in window) {
    const sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none";
    document.body.prepend(sentinel);
    new IntersectionObserver(
      ([e]) => nav.classList.toggle("scrolled", !e.isIntersecting),
      { threshold: 0 }
    ).observe(sentinel);
  }

  /* ---------- Mobile overlay menu ---------- */
  const burger = document.getElementById("burger");
  const overlay = document.getElementById("navOverlay");
  if (burger && overlay) {
    const setOpen = (open) => {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.style.overflow = open ? "hidden" : "";
      if (open) {
        overlay.hidden = false;
        requestAnimationFrame(() => overlay.classList.add("open"));
      } else {
        overlay.classList.remove("open");
        overlay.hidden = true;
      }
    };
    burger.addEventListener("click", () => setOpen(burger.getAttribute("aria-expanded") !== "true"));
    overlay.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") { setOpen(false); burger.focus(); }
    });
    window.matchMedia("(min-width: 721px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- Scroll reveals (blur-fade up) ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Graceful fallback for missing photos ---------- */
  const markMissing = (img) => {
    img.style.visibility = "hidden";
    const host = img.closest("figure, .bezel-core, .g-item");
    if (host) {
      host.style.background = "linear-gradient(135deg, var(--bg-2), var(--blush))";
      host.style.minHeight = "200px";
    }
  };
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => markMissing(img));
    if (img.complete && img.naturalWidth === 0) markMissing(img);
  });

  /* ---------- Order form: async submit with feedback ---------- */
  const form = document.querySelector(".order-form");
  if (form) {
    const status = document.getElementById("formStatus");
    const submitBtn = form.querySelector('button[type="submit"]');
    const ENDPOINT = "https://formsubmit.co/ajax/mckennasbakedgoods@gmail.com";
    const showStatus = (msg, ok) => {
      if (!status) return;
      status.textContent = msg;
      status.className = "form-status " + (ok ? "is-ok" : "is-err");
      status.hidden = false;
    };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.querySelector(".hp")?.value) {
        form.innerHTML = '<div class="order-success"><h3>Thank you!</h3><p>Your request is in.</p></div>';
        return;
      }
      const data = {};
      new FormData(form).forEach((v, k) => { if (k !== "_honey") data[k] = v; });
      submitBtn.setAttribute("aria-busy", "true");
      if (status) status.hidden = true;
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok && String(body.success) === "true") {
          form.innerHTML =
            '<div class="order-success"><h3>Thank you, your request is in!</h3>' +
            "<p>Mckenna will get back to you soon to confirm the details. Talk soon. 💛</p></div>";
        } else {
          submitBtn.removeAttribute("aria-busy");
          showStatus("Hmm, that didn't send. Please email mckennasbakedgoods@gmail.com or DM @mckennas.baked.goods and I'll get right back to you.", false);
        }
      } catch (err) {
        submitBtn.removeAttribute("aria-busy");
        showStatus("Looks like your connection dropped. Please try again, or email mckennasbakedgoods@gmail.com.", false);
      }
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
