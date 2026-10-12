const PASS_HASH =
  "946b1dd33317481ff748902d590a72ae826b3e67b52ae5d9f700653b092b2fb0";
const SESSION_KEY = "sf-aida-proposal";

const gate = document.getElementById("gate");
const deck = document.getElementById("deck");
const form = document.getElementById("gate-form");
const input = document.getElementById("pass");
const error = document.getElementById("gate-error");
const slides = [...document.querySelectorAll(".slide")];
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const homeBtn = document.getElementById("home");
const pageNum = document.getElementById("page-num");
const chapter = document.getElementById("chapter");
const progress = document.getElementById("progress-fill");

let index = 0;

function fa(n) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

async function sha256hex(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function play(slide) {
  slide.classList.remove("is-playing");
  void slide.offsetWidth;
  slide.classList.add("is-playing");
}

function unlock() {
  sessionStorage.setItem(SESSION_KEY, "1");
  gate.classList.add("is-gone");
  deck.classList.add("is-on");
  show(0);
  input.blur();
  window.setTimeout(() => {
    gate.style.display = "none";
  }, 480);
}

function show(i) {
  index = Math.max(0, Math.min(slides.length - 1, i));
  slides.forEach((slide, n) => {
    const on = n === index;
    slide.classList.toggle("is-active", on);
    slide.toggleAttribute("hidden", !on);
    if (!on) slide.classList.remove("is-playing");
  });
  const current = slides[index];
  current.scrollTop = 0;
  play(current);
  pageNum.textContent = `${fa(index + 1)} از ${fa(slides.length)}`;
  chapter.textContent = current.dataset.kicker || "";
  progress.style.width = `${((index + 1) / slides.length) * 100}%`;
  prevBtn.disabled = index === 0;
  homeBtn.disabled = index === 0;
  nextBtn.hidden = index === slides.length - 1;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  error.textContent = "";
  if (!window.crypto?.subtle) {
    error.textContent = "این صفحه را از آدرس محلی باز کنید، نه از فایل.";
    return;
  }
  const hash = await sha256hex(input.value.trim());
  if (hash === PASS_HASH) {
    unlock();
    return;
  }
  error.textContent = "رمز نادرست است.";
  input.select();
});

prevBtn.addEventListener("click", () => show(index - 1));
nextBtn.addEventListener("click", () => show(index + 1));
homeBtn.addEventListener("click", () => show(0));

document.addEventListener("keydown", (event) => {
  if (!deck.classList.contains("is-on")) return;
  if (event.target.closest("input, textarea, a")) return;
  if (event.key === "Home") {
    event.preventDefault();
    show(0);
  }
  if (event.key === "ArrowLeft" || event.key === "ArrowDown" || event.key === "PageDown") {
    show(index + 1);
  }
  if (event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "PageUp") {
    show(index - 1);
  }
});

if (sessionStorage.getItem(SESSION_KEY) === "1") {
  gate.style.display = "none";
  deck.classList.add("is-on");
  show(0);
}
