/* Mckenna's Baked Goods — interactions
   Progressive enhancement: the page is fully usable without this file. */
(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  const toggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");

  if (toggle && mobileNav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mobileNav.hidden = !open;
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close after picking a destination.
    mobileNav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });

    // Close on Escape, return focus to the toggle.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    // Close if the viewport grows back to desktop.
    const desktop = window.matchMedia("(min-width: 721px)");
    desktop.addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- Scroll reveal (enhances already-visible content) ---------- */
  const reveals = document.querySelectorAll(".reveal");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reveals.length && "IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    reveals.forEach((el) => io.observe(el));
  } else {
    // No observer / reduced motion: show everything immediately.
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Graceful fallback for not-yet-added photos ---------- */
  const markMissing = (img) => {
    img.classList.add("img-missing");
    const host = img.closest("figure, .hero-figure, .story-figure, .g-item");
    if (host) host.classList.add("img-missing-host");
  };
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => markMissing(img));
    // Catch images that already failed before this deferred script ran.
    if (img.complete && img.naturalWidth === 0) markMissing(img);
  });

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
