/* Book · behaviour — runs before deck.js.
   - .leaf-face[data-from]: filled with a copy of the selected element (the cover's opening swing).
   - .slide.spread: open-book slides. Moving between two of them turns a page: a .leaf (old page on the front,
     new page on the back) swings over the spine while a .turn-under copy holds the old page still on the other
     side; both are rebuilt on every turn (deck.js fires "deck:enter" just before .is-entering goes on).
   - .closes-book: the last slide; arriving from a spread, that spread is copied into .held and the leaf's front so
     the right half can swing shut over it.
   - .swap > .panel.step: burn-and-replace panels; each gets an .ember (the burning edge) injected here.
   - .page: gets its .folio (page number) here, so the page-turn copies carry it too.
   - .banner: gets two .roll ends that ride its edges while it unrolls (css/fx.css).
   - .motes: drifting gold specks over the whole stage. */
(() => {
  const deck = document.getElementById("deck");
  const TURN_MS = 1000; // keep in sync with --m-turn

  document.querySelectorAll(".leaf-face[data-from]").forEach((el) => {
    const src = document.querySelector(el.dataset.from);
    if (src) el.innerHTML = src.innerHTML;
  });

  // page numbers: slide k's spread carries pages 2(k-1) and 2(k-1)+1; the title spread counts but prints none
  const slides = [...deck.querySelectorAll(".slide")];
  document.querySelectorAll(".slide.spread").forEach((s) => {
    s.dataset.outMs ??= "0";
    s.dataset.inMs ??= String(TURN_MS + 1900);
    if (s.classList.contains("opens-cover")) return;
    const first = 2 * slides.indexOf(s);
    s.querySelectorAll(".half > .page").forEach((page) => {
      page.insertAdjacentHTML("beforeend", `<p class="folio">${first + (page.classList.contains("r") ? 1 : 0)}</p>`);
    });
  });

  const EDGE = "0,20 2.5,16.11 5,12.8 7.5,15.95 10,13.5 12.5,11.35 15,15.52 17.5,24.59 20,26.03 22.5,26.01 25,18.01 27.5,19.84 30,16.66 32.5,14.01 35,12.11 37.5,13.03 40,23.85 42.5,26.19 45,26.68 47.5,26.76 50,17.85 52.5,16.45 55,20.63 57.5,23.63 60,26.49 62.5,27.87 65,16.67 67.5,20.39 70,22.66 72.5,21.02 75,15.61 77.5,18.08 80,13.28 82.5,24.05 85,26.8 87.5,23.08 90,18.14 92.5,25.37 95,22.94 97.5,26.66 100,27.45";
  const EMBER =
    '<div class="ember" aria-hidden="true"><svg viewBox="0 0 100 40" preserveAspectRatio="none">' +
    `<polyline class="glow" points="${EDGE}"/><polyline class="core" points="${EDGE}"/></svg>` +
    "<i></i>".repeat(10) +
    "</div>";
  document.querySelectorAll(".swap:not(.erode) > .panel.step").forEach((p) => p.insertAdjacentHTML("beforeend", EMBER));
  document.querySelectorAll(".banner").forEach((b) =>
    b.insertAdjacentHTML("beforeend", '<i class="roll l" aria-hidden="true"></i><i class="roll r" aria-hidden="true"></i>'));

  // a copy of a page must not act like the real thing: no stepper for deck.js to find, no ids, no focus targets
  const copyOf = (el) => {
    const c = el.cloneNode(true);
    c.querySelectorAll(".stepper").forEach((s) => s.classList.remove("stepper"));
    c.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
    c.querySelectorAll("[data-id]").forEach((n) => n.removeAttribute("data-id"));
    return c.innerHTML;
  };

  deck.addEventListener("deck:enter", ({ detail: { from, to, back } }) => {
    to.querySelectorAll(".leaf.turn, .turn-under, .spine-out").forEach((el) => el.remove());
    if (to.classList.contains("closes-book")) {
      if (!back && from.classList.contains("spread")) {
        to.querySelector(".held").innerHTML = copyOf(from.querySelector(".half.l"));
        to.querySelector(".leaf-face.front").innerHTML = copyOf(from.querySelector(".half.r"));
      }
      return;
    }
    if (!from.classList.contains("spread") || !to.classList.contains("spread")) return;
    if (to.classList.contains("opens-cover") && !back) return;

    const book = to.querySelector(".book-open");
    const lift = back ? "l" : "r"; // the half that turns over
    const stay = back ? "r" : "l"; // the half that holds still until the leaf lands on it

    const under = document.createElement("div");
    under.className = `turn-under half ${stay}`;
    under.innerHTML = copyOf(from.querySelector(`.half.${stay}`));

    const leaf = document.createElement("div");
    leaf.className = `leaf turn${back ? " is-back" : ""}`;
    leaf.setAttribute("aria-hidden", "true");
    leaf.innerHTML =
      `<div class="leaf-face front ${lift}">${copyOf(from.querySelector(`.half.${lift}`))}</div>` +
      `<div class="leaf-face back ${stay}">${copyOf(to.querySelector(`.half.${stay}`))}</div>`;

    // what lies across the spine (banner, seal, thread, ribbon) would vanish with the old slide: a copy plays its
    // exit instead; a seal that reads the same on both spreads just stays put
    const sealOf = (s) => s.querySelector(".book-open > .seal")?.textContent;
    const keepSeal = sealOf(to) != null && sealOf(to) === sealOf(from);
    to.classList.toggle("keeps-seal", keepSeal);
    const outs = [...from.querySelectorAll(".book-open > :is(.banner, .seal, .thread, .ribbon)")]
      .filter((el) => !(keepSeal && el.classList.contains("seal")))
      .map((el) => {
        const c = el.cloneNode(true);
        c.classList.add("spine-out");
        c.setAttribute("aria-hidden", "true");
        return c;
      });

    book.append(under, leaf, ...outs);
    // copied .is-current panels carry visibility: visible, which outlives the hidden leaf, so drop the copies
    setTimeout(() => { under.remove(); leaf.remove(); outs.forEach((c) => c.remove()); }, TURN_MS);
  });

  // seeded so the specks sit in the same places every run
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const motes = document.createElement("div");
  motes.className = "motes";
  motes.setAttribute("aria-hidden", "true");
  for (let k = 0; k < 18; k++) {
    const i = document.createElement("i");
    i.style.cssText =
      `left:${(rand() * 100).toFixed(1)}%;top:${(rand() * 100).toFixed(1)}%;` +
      `--d:${(10 + rand() * 9).toFixed(1)}s;--delay:-${(rand() * 18).toFixed(1)}s;` +
      `--s:${(0.5 + rand() * 0.9).toFixed(2)};--dx:${(rand() * 60 - 30).toFixed(0)};--dy:${(-40 - rand() * 70).toFixed(0)}`;
    motes.append(i);
  }
  deck.append(motes);
})();
