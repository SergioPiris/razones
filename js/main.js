const Counters = (() => {
  const START_DATE = new Date("2026-09-19T00:00:00");

  function getTimeComponents(ms) {
    const totalSeconds = Math.floor(Math.abs(ms) / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const totalDays = Math.floor(totalHours / 24);
    const years = Math.floor(totalDays / 365.25);
    const remainingDaysAfterYears = Math.floor(totalDays - years * 365.25);
    const months = Math.floor(remainingDaysAfterYears / 30.44);
    const days = Math.floor(remainingDaysAfterYears - months * 30.44);
    return { years, months, days, hours, minutes, seconds, totalDays };
  }

  function getNextMonthly19() {
    const now = new Date();
    let target = new Date(now.getFullYear(), now.getMonth(), 19, 0, 0, 0);
    if (now >= target) {
      target = new Date(now.getFullYear(), now.getMonth() + 1, 19, 0, 0, 0);
    }
    return target;
  }

  function getNextAnniversary() {
    const now = new Date();
    let target = new Date(now.getFullYear(), 8, 19, 0, 0, 0);
    if (now >= target) {
      target = new Date(now.getFullYear() + 1, 8, 19, 0, 0, 0);
    }
    return target;
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    const now = new Date();

    const tTogether = getTimeComponents(now - START_DATE);
    const anios = tTogether.years;
    const meses = tTogether.months;

    const boxAnios = document.getElementById("box-anios");
    const sepAnios = document.getElementById("sep-anios");
    const boxMeses = document.getElementById("box-meses");
    const sepMeses = document.getElementById("sep-meses");

    if (anios === 0) {
      if (boxAnios) boxAnios.style.display = "none";
      if (sepAnios) sepAnios.style.display = "none";
    } else {
      if (boxAnios) boxAnios.style.display = "flex";
      if (sepAnios) sepAnios.style.display = "inline-block";
    }

    if (meses === 0) {
      if (boxMeses) boxMeses.style.display = "none";
      if (sepMeses) sepMeses.style.display = "none";
    } else {
      if (boxMeses) boxMeses.style.display = "flex";
      if (sepMeses) sepMeses.style.display = "inline-block";
    }

    document.getElementById("counter-years").textContent = pad(anios);
    document.getElementById("counter-months").textContent = pad(meses);
    document.getElementById("counter-days").textContent = pad(tTogether.days);
    document.getElementById("counter-hours").textContent = pad(tTogether.hours);
    document.getElementById("counter-minutes").textContent = pad(tTogether.minutes);
    document.getElementById("counter-seconds").textContent = pad(tTogether.seconds);

    const tMonthly = getTimeComponents(getNextMonthly19() - now);
    document.getElementById("monthly-days").textContent = pad(tMonthly.totalDays);
    document.getElementById("monthly-hours").textContent = pad(tMonthly.hours);
    document.getElementById("monthly-minutes").textContent = pad(tMonthly.minutes);
    document.getElementById("monthly-seconds").textContent = pad(tMonthly.seconds);

    const tAnni = getTimeComponents(getNextAnniversary() - now);
    document.getElementById("anni-days").textContent = pad(tAnni.totalDays);
    document.getElementById("anni-hours").textContent = pad(tAnni.hours);
    document.getElementById("anni-minutes").textContent = pad(tAnni.minutes);
    document.getElementById("anni-seconds").textContent = pad(tAnni.seconds);
  }

  function init() {
    tick();
    setInterval(tick, 1000);
  }

  return { init };
})();

const Carousel = (() => {
  let speed = 0.5;
  let track = null;
  let rafId = null;
  let currentY = 0;
  let halfHeight = 0;

  function buildItems() {
    track = document.getElementById("carousel-track");
    track.innerHTML = "";
    const doubled = [...fotosCarrusel, ...fotosCarrusel];
    doubled.forEach((src, i) => {
      const item = document.createElement("div");
      item.className = "polaroid-item";
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Foto ${(i % fotosCarrusel.length) + 1}`;
      img.loading = "lazy";
      const caption = document.createElement("div");
      caption.className = "polaroid-caption";
      caption.textContent = "♡";
      item.appendChild(img);
      item.appendChild(caption);
      track.appendChild(item);
    });
  }

  function animate() {
    currentY -= speed;
    if (halfHeight > 0 && Math.abs(currentY) >= halfHeight) {
      currentY = 0;
    }
    track.style.transform = `translateY(${currentY}px)`;
    rafId = requestAnimationFrame(animate);
  }

  function init() {
    buildItems();
    requestAnimationFrame(() => {
      halfHeight = track.scrollHeight / 2;
      animate();
    });

    const wrapper = document.getElementById("carousel-wrapper");
    wrapper.addEventListener("mouseenter", () => { speed = 0.08; });
    wrapper.addEventListener("mouseleave", () => { speed = 0.5; });
  }

  return { init };
})();

const Gallery = (() => {
  const PREVIEW_COUNT = 3;

  const categories = [
    {
      key: "love",
      dotClass: "love",
      emoji: "💜",
      label: "Por qué te quiero",
      allArray: null
    },
    {
      key: "together",
      dotClass: "together",
      emoji: "💙",
      label: "Por qué quiero estar contigo",
      allArray: null
    },
    {
      key: "lyrics",
      dotClass: "lyrics",
      emoji: "🎵",
      label: "Letras de canciones",
      allArray: null
    }
  ];

  let currentModalIndex = null;

  function createNoteCard(text, index) {
    const card = document.createElement("div");
    card.className = "note-card";
    const num = document.createElement("span");
    num.className = "note-number";
    num.textContent = `#${String(index + 1).padStart(2, "0")}`;
    const p = document.createElement("p");
    p.textContent = text;
    card.appendChild(num);
    card.appendChild(p);
    return card;
  }

  function getDiscoveredList(catKey) {
    if (typeof DiscoveryStorage !== "undefined") {
      const data = DiscoveryStorage.getDiscovered();
      return data[catKey] || [];
    }
    return [];
  }

  function renderCategoryCardContent(card, cat, index) {
    const discovered = getDiscoveredList(cat.key);
    const total = cat.allArray ? cat.allArray.length : 10;

    let countBadge = card.querySelector(".gallery-cat-card-count");
    if (!countBadge) {
      countBadge = document.createElement("span");
      countBadge.className = "gallery-cat-card-count";
      card.querySelector(".gallery-cat-card-header").appendChild(countBadge);
    }
    countBadge.textContent = `${discovered.length} / ${total}`;

    let previewContainer = card.querySelector(".gallery-preview-grid");
    if (!previewContainer) {
      previewContainer = document.createElement("div");
      previewContainer.className = "gallery-preview-grid";
      card.appendChild(previewContainer);
    }
    previewContainer.innerHTML = "";

    if (discovered.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "gallery-empty-msg";
      emptyDiv.innerHTML = `<span class="empty-icon">✨</span><p>Aún no has descubierto ninguna razón en esta categoría.<br>Abre el tarro para encontrar una ♡</p>`;
      previewContainer.appendChild(emptyDiv);
    } else {
      discovered.slice(0, PREVIEW_COUNT).forEach((text, i) => {
        previewContainer.appendChild(createNoteCard(text, i));
      });
    }

    let btn = card.querySelector(".gallery-see-all-btn");
    if (!btn) {
      btn = document.createElement("button");
      btn.className = "gallery-see-all-btn";
      btn.addEventListener("click", () => openModal(index));
      card.appendChild(btn);
    }
    btn.innerHTML = `Ver descubiertas <span class="btn-count">(${discovered.length})</span> <span class="btn-arrow">→</span>`;
  }

  function buildCategoryCard(cat, index) {
    const card = document.createElement("div");
    card.className = "gallery-cat-card";
    card.id = `cat-card-${cat.key}`;

    const header = document.createElement("div");
    header.className = "gallery-cat-card-header";
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");
    header.setAttribute("aria-label", `Abrir razones descubiertas de ${cat.label}`);
    header.addEventListener("click", () => openModal(index));
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(index);
      }
    });

    const dot = document.createElement("span");
    dot.className = "gallery-cat-dot " + cat.dotClass;

    const labelWrap = document.createElement("div");
    labelWrap.className = "gallery-cat-card-label-wrap";

    const emoji = document.createElement("span");
    emoji.className = "gallery-cat-card-emoji";
    emoji.textContent = cat.emoji;

    const label = document.createElement("span");
    label.className = "gallery-cat-card-label";
    label.textContent = cat.label;

    labelWrap.appendChild(emoji);
    labelWrap.appendChild(label);
    header.appendChild(dot);
    header.appendChild(labelWrap);
    card.appendChild(header);

    renderCategoryCardContent(card, cat, index);

    return card;
  }

  function openModal(catIndex) {
    currentModalIndex = catIndex;
    const cat = categories[catIndex];
    const discovered = getDiscoveredList(cat.key);
    const total = cat.allArray ? cat.allArray.length : 10;

    const modal = document.getElementById("gallery-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalDot = document.getElementById("modal-dot");
    const modalNotes = document.getElementById("modal-notes");
    const modalCount = document.getElementById("modal-count");

    modalTitle.textContent = cat.label;
    modalDot.className = "gallery-cat-dot " + cat.dotClass;
    modalCount.textContent = `${discovered.length} / ${total} descubiertas`;
    modalNotes.innerHTML = "";

    if (discovered.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "modal-empty-msg";
      emptyDiv.innerHTML = `<span class="empty-icon">✨</span><p>Aún no has descubierto ninguna razón en esta categoría.<br>¡Abre el tarro de cristal para comenzar a desbloquearlas! ♡</p>`;
      modalNotes.appendChild(emptyDiv);
    } else {
      discovered.forEach((text, i) => {
        const card = createNoteCard(text, i);
        modalNotes.appendChild(card);
      });
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    gsap.fromTo(modal.querySelector(".gallery-modal-box"),
      { opacity: 0, y: 35, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" }
    );
    gsap.fromTo(modal.querySelectorAll(".note-card"),
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out", delay: 0.18 }
    );
  }

  function closeModal() {
    currentModalIndex = null;
    const modal = document.getElementById("gallery-modal");
    const box = modal.querySelector(".gallery-modal-box");
    gsap.to(box, {
      opacity: 0,
      y: 25,
      scale: 0.96,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
        gsap.set(box, { clearProps: "all" });
      }
    });
  }

  function unlockNote(catKey, text) {
    if (typeof DiscoveryStorage !== "undefined") {
      DiscoveryStorage.addDiscovered(catKey, text);
    }

    const catIndex = categories.findIndex(c => c.key === catKey);
    if (catIndex !== -1) {
      const cat = categories[catIndex];
      const card = document.getElementById(`cat-card-${cat.key}`);
      if (card) {
        renderCategoryCardContent(card, cat, catIndex);
        gsap.fromTo(card,
          { scale: 0.96 },
          { scale: 1, duration: 0.4, ease: "back.out(2)" }
        );
      }

      if (currentModalIndex === catIndex) {
        const modal = document.getElementById("gallery-modal");
        if (modal.classList.contains("active")) {
          openModal(catIndex);
        }
      }
    }
  }

  function init() {
    categories[0].allArray = porQueTeQuiero;
    categories[1].allArray = porQueQuieroEstarContigo;
    categories[2].allArray = letrasDeCancionesParaMiranda;

    const container = document.getElementById("gallery-cats-container");
    container.innerHTML = "";
    categories.forEach((cat, i) => {
      container.appendChild(buildCategoryCard(cat, i));
    });

    const modal = document.getElementById("gallery-modal");
    document.getElementById("modal-close-btn").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
    });
  }

  return { init, unlockNote, openModal, closeModal };
})();

window.Gallery = Gallery;

document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined") {
    if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
    if (typeof MotionPathPlugin !== "undefined") gsap.registerPlugin(MotionPathPlugin);
  }

  Counters.init();
  Carousel.init();
  Gallery.init();
  JarAnimations.init();

  gsap.from(".main-title", {
    opacity: 0,
    y: -24,
    duration: 1,
    ease: "power3.out"
  });

  gsap.from([".header-eyebrow", ".subtitle", ".deco-ornament"], {
    opacity: 0,
    y: -12,
    duration: 0.8,
    stagger: 0.12,
    delay: 0.25,
    ease: "power2.out"
  });

  gsap.from(".glass-panel", {
    opacity: 0,
    y: 25,
    duration: 0.75,
    stagger: 0.1,
    delay: 0.45,
    ease: "power2.out"
  });
});
