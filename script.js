const intro = document.querySelector("#intro");
const slideshow = document.querySelector("#slideshow");
const enterButton = document.querySelector("#enterButton");
const slideImage = document.querySelector("#slideImage");
const nextSlideImage = document.querySelector("#nextSlideImage");
const slideCount = document.querySelector("#slideCount");
const progressBar = document.querySelector("#progressBar");
const petals = document.querySelector("#petals");
const slidePetals = document.querySelector("#slidePetals");
const previousButton = document.querySelector("#previousButton");
const nextButton = document.querySelector("#nextButton");
const backgroundMusic = document.querySelector("#backgroundMusic");
const soundButton = document.querySelector("#soundButton");

const slides = Array.from({ length: 12 }, (_, index) => `img/${index + 2}.png`);
const slideDuration = 5000;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let currentSlide = 0;
let slideTimer;
let petalTimer;
let activeSlideImage = slideImage;
let incomingSlideImage = nextSlideImage;
let transitionId = 0;
let musicMutedByUser = false;

slideImage.classList.add("is-active");

function updateSlide(nextIndex) {
  currentSlide = (nextIndex + slides.length) % slides.length;
  const nextImage = incomingSlideImage;
  const transition = ++transitionId;
  nextImage.src = slides[currentSlide];
  nextImage.alt = `Lời chúc ${currentSlide + 1} trên ${slides.length} nhân ngày Phụ nữ Việt Nam`;
  slideCount.textContent = `${String(currentSlide + 1).padStart(2, "0")} / ${slides.length}`;

  progressBar.style.animation = "none";
  void progressBar.offsetWidth;
  progressBar.style.animation = "";

  nextImage.decode().then(() => {
    if (transition !== transitionId) return;

    const previousImage = activeSlideImage;
    previousImage.classList.remove("is-active", "is-transitioning-in", "is-transitioning-out");
    nextImage.classList.remove("is-active", "is-transitioning-in", "is-transitioning-out");
    previousImage.alt = "";
    previousImage.setAttribute("aria-hidden", "true");
    nextImage.setAttribute("aria-hidden", "false");
    void nextImage.offsetWidth;
    previousImage.classList.add("is-transitioning-out");
    nextImage.classList.add("is-transitioning-in");
    activeSlideImage = nextImage;
    incomingSlideImage = previousImage;

    window.setTimeout(() => {
      if (transition !== transitionId) return;
      previousImage.classList.remove("is-transitioning-out");
      activeSlideImage.classList.remove("is-transitioning-in");
      activeSlideImage.classList.add("is-active");
    }, 1100);
  }).catch((error) => {
    if (transition === transitionId) {
      console.error(`Không thể tải ảnh ${slides[currentSlide]}.`, error);
    }
  });
}

function startAutoplay() {
  window.clearInterval(slideTimer);
  slideTimer = window.setInterval(() => updateSlide(currentSlide + 1), slideDuration);
}

function createPetal(container) {
  const petal = document.createElement("span");
  petal.className = "petal";
  petal.textContent = Math.random() > 0.5 ? "✿" : "❀";
  petal.style.setProperty("--left", `${Math.random() * 100}%`);
  petal.style.setProperty("--size", `${12 + Math.random() * 13}px`);
  petal.style.setProperty("--duration", `${5 + Math.random() * 5}s`);
  petal.style.setProperty("--delay", `${Math.random() * 0.5}s`);
  petal.style.setProperty("--drift", `${Math.random() * 140 - 70}px`);
  petal.style.setProperty("--petal-color", Math.random() > 0.5 ? "#e9a2a8" : "#f0c4bb");
  petal.addEventListener("animationend", () => petal.remove(), { once: true });
  container.append(petal);
}

function updateSoundButton(isPlaying, state = isPlaying ? "playing" : "muted") {
  soundButton.setAttribute("aria-pressed", String(isPlaying));
  soundButton.dataset.state = state;
  const label = isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền";
  soundButton.setAttribute("aria-label", label);
  soundButton.title = label;
}

async function setMusicEnabled(isEnabled) {
  if (!isEnabled) {
    musicMutedByUser = true;
    backgroundMusic.pause();
    updateSoundButton(false);
    return;
  }

  musicMutedByUser = false;
  try {
    await backgroundMusic.play();
    updateSoundButton(true);
  } catch (error) {
    updateSoundButton(false, error.name === "NotAllowedError" ? "blocked" : "error");
    if (error.name === "NotAllowedError") return;

    soundButton.title = "Không thể phát nhạc nền. Hãy kiểm tra tệp music/st.mp3.";
    console.error("Không thể phát nhạc nền.", error);
  }
}

function toggleMusic() {
  void setMusicEnabled(backgroundMusic.paused);
}

function enterSlideshow() {
  if (intro.classList.contains("is-leaving")) return;

  intro.classList.add("is-leaving");
  slideshow.classList.add("is-visible");
  slideshow.setAttribute("aria-hidden", "false");
  startAutoplay();
  window.clearInterval(petalTimer);
  if (!prefersReducedMotion.matches) {
    petalTimer = window.setInterval(() => createPetal(slidePetals), 420);
  }
  window.setTimeout(() => {
    intro.hidden = true;
    nextButton.focus({ preventScroll: true });
  }, 1000);
}

enterButton.addEventListener("click", enterSlideshow);
soundButton.addEventListener("click", toggleMusic);
backgroundMusic.addEventListener("play", () => updateSoundButton(true));
backgroundMusic.addEventListener("pause", () => {
  updateSoundButton(false, musicMutedByUser ? "muted" : "blocked");
});

document.addEventListener("pointerdown", (event) => {
  if (musicMutedByUser || event.target.closest("#soundButton")) return;
  void setMusicEnabled(true);
});

previousButton.addEventListener("click", () => {
  updateSlide(currentSlide - 1);
  startAutoplay();
});
nextButton.addEventListener("click", () => {
  updateSlide(currentSlide + 1);
  startAutoplay();
});

document.addEventListener("keydown", (event) => {
  if (!musicMutedByUser && backgroundMusic.paused) {
    void setMusicEnabled(true);
  }

  if (!slideshow.classList.contains("is-visible")) return;

  if (event.key === "ArrowLeft") {
    updateSlide(currentSlide - 1);
    startAutoplay();
  } else if (event.key === "ArrowRight") {
    updateSlide(currentSlide + 1);
    startAutoplay();
  }
});

if (!prefersReducedMotion.matches) {
  petalTimer = window.setInterval(() => createPetal(petals), 420);
}

void setMusicEnabled(true);
