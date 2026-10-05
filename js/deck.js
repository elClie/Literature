/* Deck engine — navigation, steppers, transition hooks (see css/fx.css) */
(() => {
  const deck = document.getElementById("deck");
  const slides = [...deck.querySelectorAll(".slide")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Blocks that get .fx-el + --stagger for the transition: each slide's direct children, plus anything
      marked data-fx. Don't nest them (animations stack) or give them their own CSS transform (the
      animation overrides it — wrap instead). */
  const FX_SEL = ":scope > *, [data-fx]";
  const OUT_MS = 360;
  const IN_MS = 700;
  const STAGGER_MS = 40;

  let index = 0;
  let locked = false;
  let enterTimer = 0;

  slides.forEach((s) => {
    s.querySelectorAll(FX_SEL).forEach((el, k) => {
      el.classList.add("fx-el");
      el.style.setProperty("--stagger", `${Math.min(k, 8) * STAGGER_MS}ms`);
    });
  });

  /** A .stepper walks its .step items before the deck moves on (-1 = nothing picked yet).
      A step's data-focus="id id" lights [data-id] elements on the slide (.is-focus) and dims the others (.is-dim). */
  const stepsOf = (stepper) => [...stepper.querySelectorAll(".step")];
  const idList = (s) => (s || "").split(/\s+/).filter(Boolean);

  function pick(stepper, i, { quiet = false } = {}) {
    const slide = stepper.closest(".slide");
    const steps = stepsOf(stepper);
    // .is-back: moving backwards (or landing on a slide) — step animations shouldn't replay
    stepper.classList.toggle("is-back", quiet || i < Number(stepper.dataset.at ?? -1));
    stepper.dataset.at = String(i);
    slide.dataset.at = String(i);
    stepper.classList.toggle("has-current", i >= 0);
    steps.forEach((el, k) => {
      el.classList.toggle("is-current", k === i);
      el.classList.toggle("is-on", k <= i);
    });
    const ids = idList(steps[i]?.dataset.focus);
    slide.querySelectorAll("[data-id]").forEach((el) => {
      const on = ids.includes(el.dataset.id);
      el.classList.toggle("is-focus", on);
      el.classList.toggle("is-dim", ids.length > 0 && !on);
    });
    // step data-burn="id" → .is-burnt on [data-id] (erosion-glow burns it away); stepping back restores it
    const burnt = steps.slice(0, i + 1).flatMap((s) => idList(s.dataset.burn));
    slide.querySelectorAll("[data-id]").forEach((el) => el.classList.toggle("is-burnt", burnt.includes(el.dataset.id)));
  }

  /** Entering backwards lands on the last step of a reveal stepper, so ← retraces exactly. */
  function resetSteps(slide, { atEnd = false } = {}) {
    const stepper = slide.querySelector(".stepper");
    if (!stepper) return;
    const toEnd = atEnd && stepper.hasAttribute("data-reveal");
    pick(stepper, toEnd ? stepsOf(stepper).length - 1 : -1, { quiet: true });
  }

  function step(dir) {
    const stepper = slides[index].querySelector(".stepper");
    if (!stepper || locked) return false;
    const i = Number(stepper.dataset.at ?? -1) + dir;
    if (i < -1 || i >= stepsOf(stepper).length) return false;
    pick(stepper, i);
    return true;
  }

  function paint(n, opts) {
    slides.forEach((s, i) => {
      s.classList.toggle("active", i === n);
      s.classList.remove("is-leaving", "is-entering");
    });
    resetSteps(slides[n], opts);
  }

  function go(n, { hash = true, instant = false } = {}) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === index) {
      paint(n);
      return;
    }
    if (locked) return;

    const back = n < index;
    const applyHash = () => {
      if (hash) history.replaceState(null, "", `#${index + 1}`);
    };

    if (instant || reduce) {
      index = n;
      paint(index, { atEnd: back });
      applyHash();
      return;
    }

    // Input is locked only while the old slide leaves; a press during the entrance cuts it short
    locked = true;
    const old = slides[index];
    const neu = slides[n];
    window.clearTimeout(enterTimer);
    old.classList.remove("is-entering");
    document.documentElement.style.setProperty("--dir", back ? "-1" : "1");
    old.classList.add("is-leaving");
    // a slide can hand over faster: data-out-ms="0" (the book's page turn starts at once)
    const outMs = old.dataset.outMs != null ? Number(old.dataset.outMs) : OUT_MS + 4 * STAGGER_MS;

    const swap = () => {
      old.classList.remove("active", "is-leaving");
      resetSteps(neu, { atEnd: back });
      deck.dispatchEvent(new CustomEvent("deck:enter", { detail: { from: old, to: neu, back } }));
      neu.classList.add("active", "is-entering");
      index = n;
      applyHash();
      locked = false;
      const inMs = Number(neu.dataset.inMs) || IN_MS; // a slide can ask for a longer entrance: data-in-ms="1600"
      enterTimer = window.setTimeout(() => neu.classList.remove("is-entering"), inMs + 8 * STAGGER_MS);
    };
    // swap in the same frame when there's nothing to wait for — a timer would paint one empty frame
    if (outMs > 0) window.setTimeout(swap, outMs);
    else swap();
  }

  function next() { if (!step(1)) go(index + 1); }
  function prev() { if (!step(-1)) go(index - 1); }

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      prev();
    } else if (e.key === "d" || e.key === "D" || e.key === "a" || e.key === "A") {
      e.preventDefault();
      go(index + (e.key.toLowerCase() === "d" ? 1 : -1), { instant: true });
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0);
    } else if (e.key === "End") {
      e.preventDefault();
      go(slides.length - 1);
    } else if (e.key === "f" || e.key === "F") {
      if (window.DeckApp?.toggleFullscreen) {
        window.DeckApp.toggleFullscreen();
      } else if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  });

  deck.addEventListener("click", (e) => {
    if (e.target.closest("a, button")) return;
    const item = e.target.closest(".slide.active .stepper:not([data-reveal]) .step");
    if (item && !locked) {
      const stepper = item.closest(".stepper");
      pick(stepper, stepsOf(stepper).indexOf(item));
      return;
    }
    const rect = deck.getBoundingClientRect();
    if (e.clientX - rect.left > rect.width * 0.28) next();
    else prev();
  });

  let touchX = null;
  deck.addEventListener("touchstart", (e) => {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  deck.addEventListener("touchend", (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    touchX = null;
  }, { passive: true });

  function readHash() {
    const fromHash = Number.parseInt(location.hash.replace("#", ""), 10);
    index = Number.isFinite(fromHash) && fromHash >= 1 ? Math.min(fromHash, slides.length) - 1 : 0;
    paint(index);
  }

  window.addEventListener("hashchange", readHash);
  readHash();
  deck.focus();
})();
