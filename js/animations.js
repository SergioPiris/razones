const DiscoveryStorage = (() => {
  const KEY = "miranda_razones_descubiertas";

  function getDiscovered() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          love: Array.isArray(parsed.love) ? parsed.love : [],
          together: Array.isArray(parsed.together) ? parsed.together : [],
          lyrics: Array.isArray(parsed.lyrics) ? parsed.lyrics : []
        };
      }
    } catch (e) {}
    return { love: [], together: [], lyrics: [] };
  }

  function saveDiscovered(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function addDiscovered(catKey, text) {
    const data = getDiscovered();
    if (!data[catKey]) data[catKey] = [];
    if (!data[catKey].includes(text)) {
      data[catKey].push(text);
      saveDiscovered(data);
      return true;
    }
    return false;
  }

  return { getDiscovered, saveDiscovered, addDiscovered };
})();

window.DiscoveryStorage = DiscoveryStorage;

const JarAnimations = (() => {
  let isOpen = false;
  let autoCloseTimer = null;
  let currentActiveNote = null;

  function getRandomNote() {
    const discovered = DiscoveryStorage.getDiscovered();

    const lovePool = porQueTeQuiero.filter(t => !discovered.love.includes(t));
    const togetherPool = porQueQuieroEstarContigo.filter(t => !discovered.together.includes(t));
    const lyricsPool = letrasDeCancionesParaMiranda.filter(t => !discovered.lyrics.includes(t));

    const availableCategories = [];
    if (lovePool.length > 0) {
      availableCategories.push({ key: "love", label: "Por qué te quiero", pool: lovePool });
    }
    if (togetherPool.length > 0) {
      availableCategories.push({ key: "together", label: "Por qué quiero estar contigo", pool: togetherPool });
    }
    if (lyricsPool.length > 0) {
      availableCategories.push({ key: "lyrics", label: "Letras de canciones", pool: lyricsPool });
    }

    if (availableCategories.length === 0) {
      return {
        key: "all_completed",
        label: "¡Colección completa! ✨",
        text: "¡Has descubierto todas las razones de este tarro! Pero recuerda que mis razones para amarte nunca se terminan, Miranda. Cada día encuentro infinitas más. ❤️",
        isAllCompleted: true
      };
    }

    const cat = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    const text = cat.pool[Math.floor(Math.random() * cat.pool.length)];

    return {
      key: cat.key,
      label: cat.label,
      text: text,
      isAllCompleted: false
    };
  }

  function openJar() {
    if (isOpen) return;
    isOpen = true;

    const cork = document.getElementById("jar-cork");
    const paperOverlay = document.getElementById("paper-overlay");
    const paperText = document.getElementById("paper-text");
    const paperCategory = document.getElementById("paper-category");
    const paperWrapper = document.getElementById("paper-wrapper");
    const jarSVG = document.getElementById("jar-svg");

    const note = getRandomNote();
    currentActiveNote = note;
    paperText.textContent = note.text;
    paperCategory.textContent = note.label;

    const jarRect = jarSVG.getBoundingClientRect();
    const startX = jarRect.left + jarRect.width / 2 - window.innerWidth / 2;
    const startY = jarRect.top + jarRect.height / 2 - window.innerHeight / 2;

    gsap.set(paperWrapper, {
      xPercent: -50,
      yPercent: -50,
      x: startX,
      y: startY,
      scale: 0,
      rotation: -18,
      opacity: 0,
      display: "block"
    });

    gsap.set([paperText, paperCategory], { opacity: 0, y: 10 });

    const tl = gsap.timeline();

    tl.to(cork, {
      y: -60,
      rotation: 14,
      duration: 0.55,
      ease: "back.out(2.2)"
    });

    tl.to(paperWrapper, {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      duration: 0.85,
      ease: "power3.out"
    }, "-=0.15");

    tl.to(paperOverlay, {
      opacity: 1,
      pointerEvents: "all",
      duration: 0.4,
      ease: "power2.out"
    }, "-=0.5");

    tl.to(paperCategory, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out"
    }, "-=0.3");

    tl.to(paperText, {
      opacity: 1,
      y: 0,
      duration: 0.55,
      ease: "power2.out"
    }, "-=0.25");

    autoCloseTimer = setTimeout(closeJar, 60000);
  }

  function closeJar() {
    if (!isOpen) return;
    isOpen = false;

    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }

    const cork = document.getElementById("jar-cork");
    const paperOverlay = document.getElementById("paper-overlay");
    const paperText = document.getElementById("paper-text");
    const paperCategory = document.getElementById("paper-category");
    const paperWrapper = document.getElementById("paper-wrapper");
    const gallerySection = document.getElementById("gallery-section");

    const galleryRect = gallerySection.getBoundingClientRect();
    const targetX = galleryRect.left + galleryRect.width / 2 - window.innerWidth / 2;
    const targetY = galleryRect.top + galleryRect.height / 2 - window.innerHeight / 2;

    const noteToUnlock = currentActiveNote;
    currentActiveNote = null;

    const tl = gsap.timeline();

    tl.to([paperText, paperCategory], {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      stagger: 0.04
    });

    tl.to(paperOverlay, {
      opacity: 0,
      pointerEvents: "none",
      duration: 0.28,
      ease: "power2.in"
    }, "-=0.1");

    tl.to(paperWrapper, {
      keyframes: [
        { x: 55, y: -18, scale: 0.72, rotation: 7, opacity: 0.92, duration: 0.26, ease: "power1.in" },
        { x: targetX * 0.5, y: targetY * 0.35 + 75, scale: 0.35, rotation: 15, opacity: 0.5, duration: 0.3, ease: "power1.inOut" },
        { x: targetX, y: targetY, scale: 0.06, rotation: 26, opacity: 0, duration: 0.32, ease: "power2.in" }
      ],
      onComplete: () => {
        if (noteToUnlock && !noteToUnlock.isAllCompleted && typeof Gallery !== "undefined" && Gallery.unlockNote) {
          Gallery.unlockNote(noteToUnlock.key, noteToUnlock.text);
        }
      }
    }, "-=0.12");

    tl.set(paperWrapper, { display: "none" });

    tl.to(cork, {
      y: 0,
      rotation: 0,
      duration: 0.55,
      ease: "elastic.out(1, 0.55)"
    }, "-=0.52");
  }

  function toggleJar() {
    if (isOpen) {
      closeJar();
    } else {
      openJar();
    }
  }

  function init() {
    const jarGroup = document.getElementById("jar-group");
    const paperOverlay = document.getElementById("paper-overlay");
    const paperWrapper = document.getElementById("paper-wrapper");

    jarGroup.addEventListener("click", toggleJar);
    paperOverlay.addEventListener("click", closeJar);
    paperWrapper.addEventListener("click", closeJar);

    gsap.to("#jar-shine", {
      opacity: 0.28,
      duration: 2.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    gsap.to("#jar-group", {
      y: -6,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  return { init, openJar, closeJar, toggleJar };
})();
